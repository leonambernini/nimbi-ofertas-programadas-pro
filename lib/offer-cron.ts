import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { applyOfferPrices, restoreOfferPrices } from "@/lib/offer-prices";
import { deriveStatus } from "@/lib/offers";

/** Janela para reconciliar ofertas ended cujo flag pricesApplied se perdeu. */
const RESTORE_GRACE_MS = 48 * 60 * 60 * 1000;

/**
 * Cron de ativação/desativação de grupos de oferta.
 * - scheduled → active quando now >= startsAt
 * - active → ended quando now >= endsAt
 * - aplica/restaura preços se autoApplyPrices
 */
export async function runOffersCron(now = new Date()) {
  const graceStart = new Date(now.getTime() - RESTORE_GRACE_MS);

  const offers = await prisma.offerGroup.findMany({
    where: {
      OR: [
        {
          enabled: true,
          status: { in: ["scheduled", "active"] },
        },
        /** Preços ainda aplicados na loja. */
        { pricesApplied: true },
        /**
         * Rede de segurança (48h): oferta já ended/disabled na janela recente
         * com auto-apply — cobre o caso do flag pricesApplied ter sido
         * limpo sem restaurar na Nuvemshop.
         */
        {
          autoApplyPrices: true,
          status: { in: ["ended", "disabled"] },
          endsAt: { lte: now, gte: graceStart },
        },
        /** Desativada manualmente com preços ainda na loja. */
        {
          enabled: false,
          autoApplyPrices: true,
          pricesApplied: true,
        },
      ],
    },
    include: {
      items: true,
      store: true,
    },
  });

  const summary = {
    scanned: offers.length,
    activated: 0,
    deactivated: 0,
    applyOk: 0,
    restoreOk: 0,
    errors: [] as string[],
    now: now.toISOString(),
  };

  console.info("[cron] runOffersCron start", {
    now: summary.now,
    scanned: summary.scanned,
    offers: offers.map((o) => ({
      id: o.id,
      name: o.name,
      status: o.status,
      enabled: o.enabled,
      pricesApplied: o.pricesApplied,
      autoApplyPrices: o.autoApplyPrices,
      startsAt: o.startsAt.toISOString(),
      endsAt: o.endsAt.toISOString(),
    })),
  });

  for (const offer of offers) {
    if (offer.store.uninstalledAt) continue;

    let accessToken: string;
    try {
      accessToken = decryptToken(offer.store.accessToken);
    } catch (err) {
      summary.errors.push(`decrypt:${offer.id}`);
      console.error("[cron] decrypt failed", offer.storeId, err);
      continue;
    }

    const previousStatus = offer.status;
    const nextStatus = deriveStatus({
      enabled: offer.enabled,
      startsAt: offer.startsAt,
      endsAt: offer.endsAt,
      now,
    });

    const shouldBeLive = nextStatus === "active";
    /**
     * Restaura se:
     * - flag pricesApplied ainda true, ou
     * - estava active e a janela acabou (transição), ou
     * - ended recente com auto-apply (grace de reconciliação)
     */
    const shouldRestore =
      !shouldBeLive &&
      offer.autoApplyPrices &&
      offer.items.length > 0 &&
      (offer.pricesApplied ||
        previousStatus === "active" ||
        (previousStatus === "ended" &&
          offer.endsAt >= graceStart &&
          offer.endsAt <= now));

    console.info("[cron] offer evaluate", {
      id: offer.id,
      from: previousStatus,
      to: nextStatus,
      shouldBeLive,
      shouldRestore,
      pricesApplied: offer.pricesApplied,
      endsAt: offer.endsAt.toISOString(),
      now: now.toISOString(),
    });

    if (previousStatus !== nextStatus) {
      await prisma.offerGroup.update({
        where: { id: offer.id },
        data: { status: nextStatus },
      });

      await prisma.offerCronLog.create({
        data: {
          offerGroupId: offer.id,
          action: nextStatus === "active" ? "activate" : "deactivate",
          success: true,
          message: `${previousStatus} → ${nextStatus}`,
          details: {
            now: now.toISOString(),
            startsAt: offer.startsAt.toISOString(),
            endsAt: offer.endsAt.toISOString(),
          },
        },
      });

      if (nextStatus === "active") summary.activated += 1;
      if (nextStatus === "ended" || nextStatus === "disabled") {
        summary.deactivated += 1;
      }

      offer.status = nextStatus;
    }

    try {
      if (shouldBeLive && offer.autoApplyPrices && !offer.pricesApplied) {
        const result = await applyOfferPrices({
          storeId: offer.storeId,
          accessToken,
          offer: { ...offer, status: nextStatus },
        });
        if (result.ok) {
          summary.applyOk += 1;
          offer.pricesApplied = true;
        } else {
          summary.errors.push(
            ...result.errors.map((e) => `apply:${offer.id}:${e}`),
          );
        }
      }

      if (shouldRestore) {
        const result = await restoreOfferPrices({
          storeId: offer.storeId,
          accessToken,
          offer: { ...offer, status: nextStatus },
          force: true,
        });
        if (result.ok) {
          summary.restoreOk += 1;
          offer.pricesApplied = false;
        } else {
          summary.errors.push(
            ...result.errors.map((e) => `restore:${offer.id}:${e}`),
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.errors.push(`${offer.id}:${message}`);
      console.error("[cron] offer failed", offer.id, err);
    }
  }

  console.info("[cron] runOffersCron done", summary);
  return summary;
}
