import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { applyOfferPrices, restoreOfferPrices } from "@/lib/offer-prices";
import { deriveStatus } from "@/lib/offers";

/**
 * Cron de ativação/desativação de grupos de oferta.
 * - scheduled → active quando now >= startsAt
 * - active → ended quando now > endsAt
 * - aplica/restaura preços se autoApplyPrices
 * - página dedicada: desativada temporariamente
 */
export async function runOffersCron(now = new Date()) {
  const offers = await prisma.offerGroup.findMany({
    where: {
      enabled: true,
      OR: [
        { status: { in: ["scheduled", "active"] } },
        {
          status: "ended",
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
  };

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

    const nextStatus = deriveStatus({
      enabled: offer.enabled,
      startsAt: offer.startsAt,
      endsAt: offer.endsAt,
      now,
    });

    if (offer.status !== nextStatus) {
      await prisma.offerGroup.update({
        where: { id: offer.id },
        data: { status: nextStatus },
      });

      await prisma.offerCronLog.create({
        data: {
          offerGroupId: offer.id,
          action: nextStatus === "active" ? "activate" : "deactivate",
          success: true,
          message: `${offer.status} → ${nextStatus}`,
        },
      });

      if (nextStatus === "active") summary.activated += 1;
      if (nextStatus === "ended" || nextStatus === "disabled") {
        summary.deactivated += 1;
      }

      offer.status = nextStatus;
    }

    try {
      if (nextStatus === "active" && offer.autoApplyPrices && !offer.pricesApplied) {
        const result = await applyOfferPrices({
          storeId: offer.storeId,
          accessToken,
          offer,
        });
        if (result.ok) summary.applyOk += 1;
        else summary.errors.push(...result.errors.map((e) => `apply:${offer.id}:${e}`));
      }

      if (
        (nextStatus === "ended" || nextStatus === "disabled") &&
        offer.pricesApplied
      ) {
        const result = await restoreOfferPrices({
          storeId: offer.storeId,
          accessToken,
          offer,
        });
        if (result.ok) summary.restoreOk += 1;
        else summary.errors.push(...result.errors.map((e) => `restore:${offer.id}:${e}`));
      }

      // Página extra desativada temporariamente — não sincroniza.

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      summary.errors.push(`${offer.id}:${message}`);
      console.error("[cron] offer failed", offer.id, err);
    }
  }

  return summary;
}
