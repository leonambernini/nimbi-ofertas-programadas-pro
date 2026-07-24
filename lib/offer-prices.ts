import type { OfferGroup, OfferItem } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  NuvemshopApiError,
  patchProductVariants,
} from "@/lib/nuvemshop-client";

type OfferWithItems = OfferGroup & { items: OfferItem[] };

type PriceItemLike = {
  productId: number;
  variantId: number;
  /** Aceita number/string/Decimal do Prisma. */
  offerPrice: unknown;
  originalPromotionalPrice?: unknown;
};

type VariantPricePatch = {
  id: number;
  promotional_price: string | null;
};

function groupByProduct(
  items: PriceItemLike[],
  mapVariant: (item: PriceItemLike) => VariantPricePatch,
): Array<{ productId: number; variants: VariantPricePatch[] }> {
  const byProduct = new Map<number, VariantPricePatch[]>();

  for (const item of items) {
    const list = byProduct.get(item.productId) ?? [];
    list.push(mapVariant(item));
    byProduct.set(item.productId, list);
  }

  return [...byProduct.entries()].map(([productId, variants]) => ({
    productId,
    variants,
  }));
}

function toApplyGroups(items: PriceItemLike[]) {
  return groupByProduct(items, (item) => ({
    id: item.variantId,
    promotional_price: Number(item.offerPrice).toFixed(2),
  }));
}

function toRestoreGroups(items: PriceItemLike[]) {
  return groupByProduct(items, (item) => ({
    id: item.variantId,
    promotional_price:
      item.originalPromotionalPrice == null
        ? null
        : Number(item.originalPromotionalPrice).toFixed(2),
  }));
}

async function sendVariantPatches(
  storeId: string,
  accessToken: string,
  groups: Array<{ productId: number; variants: VariantPricePatch[] }>,
  action: "apply" | "restore",
) {
  const errors: string[] = [];

  console.info(`[offer-prices] ${action} start`, {
    storeId,
    productCount: groups.length,
    variantCount: groups.reduce((sum, g) => sum + g.variants.length, 0),
  });

  for (const group of groups) {
    try {
      console.info(`[offer-prices] ${action} product`, {
        storeId,
        productId: group.productId,
        variants: group.variants,
      });

      const response = await patchProductVariants(
        storeId,
        accessToken,
        group.productId,
        group.variants,
      );

      console.info(`[offer-prices] ${action} product ok`, {
        storeId,
        productId: group.productId,
        responsePreview: Array.isArray(response)
          ? response.slice(0, 2)
          : response,
      });
    } catch (err) {
      const message =
        err instanceof NuvemshopApiError
          ? `${err.status}: ${err.responseBody}`
          : err instanceof Error
            ? err.message
            : String(err);
      errors.push(`product ${group.productId}: ${message}`);
      console.error(`[offer-prices] ${action} product failed`, {
        storeId,
        productId: group.productId,
        variants: group.variants,
        message,
      });
    }
  }

  console.info(`[offer-prices] ${action} done`, {
    storeId,
    ok: errors.length === 0,
    errorCount: errors.length,
    errors,
  });

  return errors;
}

export async function applyOfferPrices(params: {
  storeId: string;
  accessToken: string;
  offer: OfferWithItems;
  /** Reaplica mesmo se pricesApplied já for true (ex.: salvar oferta ativa). */
  force?: boolean;
  /** Se informado, aplica só este subconjunto de itens. */
  items?: PriceItemLike[];
  /** Atualiza `pricesApplied` no fim (default true). */
  updateFlag?: boolean;
}): Promise<{ ok: boolean; errors: string[] }> {
  const items: PriceItemLike[] = params.items?.length
    ? params.items
    : params.offer.items;
  const updateFlag = params.updateFlag !== false;

  console.info("[offer-prices] applyOfferPrices called", {
    offerId: params.offer.id,
    storeId: params.storeId,
    status: params.offer.status,
    autoApplyPrices: params.offer.autoApplyPrices,
    pricesApplied: params.offer.pricesApplied,
    force: Boolean(params.force),
    itemCount: items.length,
    subset: Boolean(params.items?.length),
  });

  if (!params.offer.autoApplyPrices) {
    console.info("[offer-prices] skip apply — autoApplyPrices=false", {
      offerId: params.offer.id,
    });
    return { ok: true, errors: [] };
  }
  if (params.offer.pricesApplied && !params.force && !params.items) {
    console.info("[offer-prices] skip apply — already applied", {
      offerId: params.offer.id,
    });
    return { ok: true, errors: [] };
  }

  if (!items.length) {
    console.warn("[offer-prices] skip apply — no items", {
      offerId: params.offer.id,
    });
    return { ok: false, errors: ["no_items"] };
  }

  const groups = toApplyGroups(items);
  const errors = await sendVariantPatches(
    params.storeId,
    params.accessToken,
    groups,
    "apply",
  );

  if (updateFlag) {
    await prisma.offerGroup.update({
      where: { id: params.offer.id },
      data: { pricesApplied: errors.length === 0 },
    });
  }

  await prisma.offerCronLog.create({
    data: {
      offerGroupId: params.offer.id,
      action: "apply",
      success: errors.length === 0,
      message: errors.length
        ? errors.join(" | ").slice(0, 1000)
        : params.force || params.items
          ? "reapplied"
          : "applied",
      details: {
        itemCount: items.length,
        productCount: groups.length,
        errors,
        force: Boolean(params.force),
        subset: Boolean(params.items?.length),
        endpoint: "PATCH /products/{id}/variants",
        sample: groups.slice(0, 2),
      },
    },
  });

  return { ok: errors.length === 0, errors };
}

export async function restoreOfferPrices(params: {
  storeId: string;
  accessToken: string;
  offer: OfferWithItems;
  /** Se informado, restaura só este subconjunto. */
  items?: PriceItemLike[];
  /**
   * Se false, não altera `pricesApplied` (ex.: removeu produtos de oferta ainda ativa).
   * Default: true (restauração completa).
   */
  updateFlag?: boolean;
  /** Permite restaurar itens mesmo quando o flag do grupo já foi limpo. */
  force?: boolean;
}): Promise<{ ok: boolean; errors: string[] }> {
  const items: PriceItemLike[] = params.items?.length
    ? params.items
    : params.offer.items;
  const updateFlag = params.updateFlag !== false;

  console.info("[offer-prices] restoreOfferPrices called", {
    offerId: params.offer.id,
    storeId: params.storeId,
    pricesApplied: params.offer.pricesApplied,
    itemCount: items.length,
    subset: Boolean(params.items?.length),
    updateFlag,
  });

  if (!params.offer.pricesApplied && !params.force && !params.items) {
    console.info("[offer-prices] skip restore — prices not applied", {
      offerId: params.offer.id,
    });
    return { ok: true, errors: [] };
  }

  if (!items.length) {
    return { ok: true, errors: [] };
  }

  const groups = toRestoreGroups(items);
  const errors = await sendVariantPatches(
    params.storeId,
    params.accessToken,
    groups,
    "restore",
  );

  if (updateFlag) {
    await prisma.offerGroup.update({
      where: { id: params.offer.id },
      data: { pricesApplied: errors.length === 0 ? false : true },
    });
  }

  await prisma.offerCronLog.create({
    data: {
      offerGroupId: params.offer.id,
      action: "restore",
      success: errors.length === 0,
      message: errors.length ? errors.join(" | ").slice(0, 1000) : "restored",
      details: {
        itemCount: items.length,
        productCount: groups.length,
        errors,
        subset: Boolean(params.items?.length),
        endpoint: "PATCH /products/{id}/variants",
        sample: groups.slice(0, 2),
      },
    },
  });

  return { ok: errors.length === 0, errors };
}
