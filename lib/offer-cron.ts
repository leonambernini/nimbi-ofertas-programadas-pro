import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { applyOfferPrices, restoreOfferPrices } from "@/lib/offer-prices";
import { deriveStatus } from "@/lib/offers";

/**
 * Cron de ativação/desativação de grupos de oferta.
 * - scheduled → active quando now >= startsAt
 * - active → ended quando now >= endsAt
 * - aplica/restaura preços se autoApplyPrices
 *
 * Importante: restore só roda quando `pricesApplied=true`.
 * Não há loop de “grace” reprocessando ofertas ended a cada minuto.
 */
export async function runOffersCron(now = new Date()) {
  const offers = await prisma.offerGroup.findMany({
    where: {
      OR: [
        {
          enabled: true,
          status: { in: ["scheduled", "active"] },
        },
        /** Preços ainda aplicados na loja — precisa restaurar. */
        { pricesApplied: true },
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
    /** Só restaura se ainda houver preços promocionais marcados como aplicados. */
    const shouldRestore =
      !shouldBeLive &&
      offer.autoApplyPrices &&
      offer.pricesApplied &&
      offer.items.length > 0;

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

      await prisma.offerCronLog.create({
        data: {
          offerGroupId: offer.id,
          action: shouldRestore ? "restore" : "apply",
          success: false,
          message: message.slice(0, 1000),
          details: {
            bug: true,
            now: now.toISOString(),
            pricesApplied: offer.pricesApplied,
            status: nextStatus,
          },
        },
      });
    }
  }

  console.info("[cron] runOffersCron done", summary);
  return summary;
}
