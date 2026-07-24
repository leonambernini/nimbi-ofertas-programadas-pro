import {
  applyOfferPrices,
  restoreOfferPrices,
} from "@/lib/offer-prices";
import {
  buildOfferPriceSyncPlan,
  snapshotFromOffer,
  type OfferPriceSyncPlan,
  type PriceSyncItem,
} from "@/lib/offer-price-sync";
import type { OfferGroup, OfferItem } from "@prisma/client";

type OfferWithItems = OfferGroup & { items: OfferItem[] };

export type PriceSyncOnSaveResult = {
  applied: boolean;
  restored: boolean;
  ok: boolean;
  errors: string[];
  plan: OfferPriceSyncPlan;
};

export function buildSavePricePlan(params: {
  previous: OfferWithItems | null;
  next: {
    enabled: boolean;
    autoApplyPrices: boolean;
    startsAt: Date;
    endsAt: Date;
    items: PriceSyncItem[];
  };
}): OfferPriceSyncPlan {
  return buildOfferPriceSyncPlan({
    previous: params.previous ? snapshotFromOffer(params.previous) : null,
    next: params.next,
  });
}

/** Restaura preços do plano (chamar ANTES de apagar/recriar itens). */
export async function restorePricesForPlan(params: {
  storeId: string;
  accessToken: string;
  previous: OfferWithItems;
  plan: OfferPriceSyncPlan;
}): Promise<{ restored: boolean; ok: boolean; errors: string[] }> {
  if (!params.plan.needsRestore) {
    return { restored: false, ok: true, errors: [] };
  }

  const fullRestore =
    params.plan.restoreItems.length === params.previous.items.length;

  console.info("[offer-apply-on-save] restore for plan", {
    offerId: params.previous.id,
    fullRestore,
    count: params.plan.restoreItems.length,
    reasons: params.plan.reasons,
  });

  const result = await restoreOfferPrices({
    storeId: params.storeId,
    accessToken: params.accessToken,
    offer: params.previous,
    items: params.plan.restoreItems,
    updateFlag: fullRestore,
    force: true,
  });

  return {
    restored: true,
    ok: result.ok,
    errors: result.errors,
  };
}

/** Aplica preços do plano (chamar DEPOIS de persistir os novos itens). */
export async function applyPricesForPlan(params: {
  storeId: string;
  accessToken: string;
  offer: OfferWithItems;
  plan: OfferPriceSyncPlan;
  applyPricesNow?: boolean;
}): Promise<{ applied: boolean; ok: boolean; errors: string[] }> {
  if (!params.plan.needsApply) {
    return { applied: false, ok: true, errors: [] };
  }
  if (!params.applyPricesNow) {
    console.info("[offer-apply-on-save] skip apply — not confirmed", {
      offerId: params.offer.id,
    });
    return { applied: false, ok: true, errors: [] };
  }

  console.info("[offer-apply-on-save] apply for plan", {
    offerId: params.offer.id,
    count: params.plan.applyItems.length,
    reasons: params.plan.reasons,
  });

  const result = await applyOfferPrices({
    storeId: params.storeId,
    accessToken: params.accessToken,
    offer: {
      ...params.offer,
      autoApplyPrices: true,
      pricesApplied: false,
    },
    items: params.plan.applyItems,
    force: true,
    updateFlag: true,
  });

  return {
    applied: true,
    ok: result.ok,
    errors: result.errors,
  };
}

/** @deprecated prefer buildSavePricePlan + restore/apply for plan */
export async function maybeApplyPricesOnSave(params: {
  storeId: string;
  accessToken: string;
  offer: OfferWithItems;
  applyPricesNow?: boolean;
}): Promise<{ applied: boolean; ok: boolean; errors: string[] }> {
  const plan = buildSavePricePlan({
    previous: null,
    next: {
      enabled: params.offer.enabled,
      autoApplyPrices: params.offer.autoApplyPrices,
      startsAt: params.offer.startsAt,
      endsAt: params.offer.endsAt,
      items: params.offer.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        offerPrice: Number(item.offerPrice),
        originalPromotionalPrice:
          item.originalPromotionalPrice == null
            ? null
            : Number(item.originalPromotionalPrice),
      })),
    },
  });

  return applyPricesForPlan({
    storeId: params.storeId,
    accessToken: params.accessToken,
    offer: params.offer,
    plan,
    applyPricesNow: params.applyPricesNow,
  });
}

export function planNeedsApplyConfirm(params: {
  previous: OfferWithItems | null;
  next: {
    enabled: boolean;
    autoApplyPrices: boolean;
    startsAt: Date;
    endsAt: Date;
    items: PriceSyncItem[];
  };
}): boolean {
  return buildSavePricePlan(params).needsApply;
}
