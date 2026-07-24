import type { OfferGroup, OfferItem } from "@prisma/client";
import { deriveStatus } from "@/lib/offers";

export type PriceSyncItem = {
  productId: number;
  variantId: number;
  offerPrice: number;
  originalPromotionalPrice: number | null;
};

type PreviousSnapshot = {
  enabled: boolean;
  status: OfferGroup["status"];
  autoApplyPrices: boolean;
  pricesApplied: boolean;
  startsAt: Date;
  endsAt: Date;
  items: Array<{
    productId: number;
    variantId: number;
    offerPrice: number;
    originalPromotionalPrice: number | null;
  }>;
};

type NextSnapshot = {
  enabled: boolean;
  autoApplyPrices: boolean;
  startsAt: Date;
  endsAt: Date;
  items: PriceSyncItem[];
};

export type OfferPriceSyncPlan = {
  nextStatus: OfferGroup["status"];
  reasons: string[];
  /** Itens do estado anterior a restaurar (originais). */
  restoreItems: PreviousSnapshot["items"];
  /** Itens do novo estado a aplicar (preço oferta). */
  applyItems: PriceSyncItem[];
  /** Se true, após o sync bem-sucedido `pricesApplied` deve ficar true. */
  pricesShouldBeApplied: boolean;
  needsRestore: boolean;
  needsApply: boolean;
};

function moneyKey(value: number): string {
  return Number(value).toFixed(2);
}

function toNumber(value: unknown): number {
  return Number(value);
}

export function snapshotFromOffer(
  offer: OfferGroup & { items: OfferItem[] },
): PreviousSnapshot {
  return {
    enabled: offer.enabled,
    status: offer.status,
    autoApplyPrices: offer.autoApplyPrices,
    pricesApplied: offer.pricesApplied,
    startsAt: offer.startsAt,
    endsAt: offer.endsAt,
    items: offer.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      offerPrice: toNumber(item.offerPrice),
      originalPromotionalPrice:
        item.originalPromotionalPrice == null
          ? null
          : toNumber(item.originalPromotionalPrice),
    })),
  };
}

/**
 * Decide se precisa restaurar/aplicar preços na Nuvemshop.
 * Evita PATCH em produtos quando só mudaram configs de exibição/textos.
 */
export function buildOfferPriceSyncPlan(params: {
  previous: PreviousSnapshot | null;
  next: NextSnapshot;
}): OfferPriceSyncPlan {
  const nextStatus = deriveStatus({
    enabled: params.next.enabled,
    startsAt: params.next.startsAt,
    endsAt: params.next.endsAt,
  });

  const previous = params.previous;
  const pricesApplied = Boolean(previous?.pricesApplied);
  const prevStatus = previous?.status ?? "draft";
  const prevAuto = Boolean(previous?.autoApplyPrices);
  const nextAuto = Boolean(params.next.autoApplyPrices);

  const prevByVariant = new Map(
    (previous?.items ?? []).map((item) => [item.variantId, item]),
  );
  const nextByVariant = new Map(
    params.next.items.map((item) => [item.variantId, item]),
  );

  const removed = (previous?.items ?? []).filter(
    (item) => !nextByVariant.has(item.variantId),
  );
  const added = params.next.items.filter(
    (item) => !prevByVariant.has(item.variantId),
  );
  const priceChanged = params.next.items.filter((item) => {
    const prev = prevByVariant.get(item.variantId);
    if (!prev) return false;
    return moneyKey(prev.offerPrice) !== moneyKey(item.offerPrice);
  });

  const reasons: string[] = [];
  let restoreItems: PreviousSnapshot["items"] = [];
  let applyItems: PriceSyncItem[] = [];

  const leftActiveWindow =
    pricesApplied && (nextStatus !== "active" || !nextAuto);
  const enteredActiveWindow =
    nextAuto &&
    nextStatus === "active" &&
    (!pricesApplied || prevStatus !== "active" || !prevAuto);
  const catalogChangedWhileLive =
    pricesApplied &&
    nextAuto &&
    nextStatus === "active" &&
    (removed.length > 0 || added.length > 0 || priceChanged.length > 0);

  if (leftActiveWindow) {
    restoreItems = previous?.items ?? [];
    reasons.push(
      nextStatus !== "active"
        ? "left_active_window"
        : "auto_apply_disabled",
    );
  } else if (pricesApplied && removed.length > 0) {
    restoreItems = removed;
    reasons.push("items_removed");
  }

  if (nextAuto && nextStatus === "active") {
    if (enteredActiveWindow) {
      applyItems = params.next.items;
      reasons.push(
        !previous
          ? "create_active"
          : !pricesApplied
            ? "enter_active_apply"
            : !prevAuto
              ? "auto_apply_enabled"
              : "reactivated",
      );
    } else if (catalogChangedWhileLive) {
      const byVariant = new Map<number, PriceSyncItem>();
      for (const item of [...added, ...priceChanged]) {
        byVariant.set(item.variantId, item);
      }
      applyItems = [...byVariant.values()];
      if (added.length) reasons.push("items_added");
      if (priceChanged.length) reasons.push("prices_changed");
    }
  }

  const pricesShouldBeApplied =
    nextAuto &&
    nextStatus === "active" &&
    (pricesApplied || applyItems.length > 0) &&
    !leftActiveWindow;

  return {
    nextStatus,
    reasons: [...new Set(reasons)],
    restoreItems,
    applyItems,
    pricesShouldBeApplied,
    needsRestore: restoreItems.length > 0,
    needsApply: applyItems.length > 0,
  };
}

/** Helper para o admin decidir se mostra o modal de aplicar preços. */
export function shouldConfirmApplyPrices(params: {
  previous: PreviousSnapshot | null;
  next: NextSnapshot;
}): boolean {
  return buildOfferPriceSyncPlan(params).needsApply;
}
