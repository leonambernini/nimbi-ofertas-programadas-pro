import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { restoreOfferPrices } from "@/lib/offer-prices";
import { deriveStatus } from "@/lib/offers";

const reconciling = new Set<string>();

/**
 * Restaura preços de ofertas que já não deveriam estar ativas
 * (ended / disabled / fora da janela) mas ainda têm preços na loja.
 *
 * Usado como rede de segurança além do cron (admin `/me`, storefront).
 */
export async function reconcileStoreOfferPrices(params: {
  storeId: string;
  accessToken?: string;
}): Promise<{ restored: number; errors: string[] }> {
  if (reconciling.has(params.storeId)) {
    return { restored: 0, errors: [] };
  }
  reconciling.add(params.storeId);

  try {
    const store = await prisma.store.findUnique({
      where: { storeId: params.storeId },
    });
    if (!store || store.uninstalledAt) {
      return { restored: 0, errors: [] };
    }

    let accessToken = params.accessToken;
    if (!accessToken) {
      try {
        accessToken = decryptToken(store.accessToken);
      } catch {
        return { restored: 0, errors: ["decrypt_failed"] };
      }
    }

    const now = new Date();
    const candidates = await prisma.offerGroup.findMany({
      where: {
        storeId: params.storeId,
        autoApplyPrices: true,
        items: { some: {} },
        OR: [
          { pricesApplied: true },
          {
            enabled: true,
            status: { in: ["active", "ended"] },
            endsAt: { lte: now },
          },
          { enabled: false, status: "disabled" },
        ],
      },
      include: { items: true },
    });

    let restored = 0;
    const errors: string[] = [];

    for (const offer of candidates) {
      const nextStatus = deriveStatus({
        enabled: offer.enabled,
        startsAt: offer.startsAt,
        endsAt: offer.endsAt,
        now,
      });
      const shouldBeLive = nextStatus === "active";
      if (shouldBeLive) continue;

      const needsRestore =
        offer.pricesApplied ||
        offer.status === "active" ||
        nextStatus === "ended" ||
        nextStatus === "disabled";

      if (!needsRestore || !offer.items.length) continue;

      if (offer.status !== nextStatus) {
        await prisma.offerGroup.update({
          where: { id: offer.id },
          data: { status: nextStatus },
        });
      }

      try {
        const result = await restoreOfferPrices({
          storeId: params.storeId,
          accessToken,
          offer: { ...offer, status: nextStatus },
          force: true,
        });
        if (result.ok) restored += 1;
        else errors.push(...result.errors.map((e) => `${offer.id}:${e}`));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${offer.id}:${message}`);
      }
    }

    if (restored > 0 || errors.length > 0) {
      console.info("[offer-reconcile] done", {
        storeId: params.storeId,
        candidates: candidates.length,
        restored,
        errors,
      });
    }

    return { restored, errors };
  } finally {
    reconciling.delete(params.storeId);
  }
}
