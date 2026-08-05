import type { OfferGroup, OfferItem } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  NuvemshopApiError,
  listProducts,
  patchProductVariants,
} from "@/lib/nuvemshop-client";

type OfferWithItems = OfferGroup & { items: OfferItem[] };

type PriceItemLike = {
  productId: number;
  variantId: number;
  /** Aceita number/string/Decimal do Prisma. */
  offerPrice: unknown;
  originalPrice?: unknown;
  originalPromotionalPrice?: unknown;
};

type VariantPricePatch = {
  id: number;
  price?: string;
  promotional_price: string | null;
};

function moneyEq(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.005;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Preço promocional a restaurar na Nuvemshop.
 * Se o snapshot ficou igual ao preço da oferta (corrompido após apply),
 * limpa o promo (null) para voltar ao preço cheio.
 */
function resolveRestorePromotionalPrice(item: PriceItemLike): string | null {
  const original = toNullableNumber(item.originalPromotionalPrice);
  const offer = toNullableNumber(item.offerPrice);

  if (original == null) return null;
  if (offer != null && moneyEq(original, offer)) return null;
  return original.toFixed(2);
}

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

/**
 * Aplica preço da oferta:
 * - Sem promo inicial → só define promotional_price (DE price POR offer)
 * - Com promo inicial → price vira o promo antigo e promotional_price = offer
 *   (DE 90 POR 45 quando antes era DE 100 POR 90)
 */
function toApplyGroups(items: PriceItemLike[]) {
  return groupByProduct(items, (item) => {
    const originalPromo = toNullableNumber(item.originalPromotionalPrice);
    const patch: VariantPricePatch = {
      id: item.variantId,
      promotional_price: Number(item.offerPrice).toFixed(2),
    };
    if (originalPromo != null) {
      patch.price = originalPromo.toFixed(2);
    }
    return patch;
  });
}

/** Restaura price + promotional_price aos valores snapshot. */
function toRestoreGroups(items: PriceItemLike[]) {
  return groupByProduct(items, (item) => {
    const originalPrice = toNullableNumber(item.originalPrice);
    const patch: VariantPricePatch = {
      id: item.variantId,
      promotional_price: resolveRestorePromotionalPrice(item),
    };
    if (originalPrice != null) {
      patch.price = originalPrice.toFixed(2);
    }
    return patch;
  });
}

/**
 * Antes do 1º apply: lê o promo atual na NS e grava no item
 * (garante snapshot correto para o restore).
 * Não sobrescreve se a loja já estiver com o preço da oferta.
 */
async function refreshOriginalPromosFromStore(params: {
  storeId: string;
  accessToken: string;
  offerId: string;
  items: PriceItemLike[];
}): Promise<PriceItemLike[]> {
  const productIds = [...new Set(params.items.map((i) => i.productId))];
  if (!productIds.length) return params.items;

  const products = await listProducts(
    params.storeId,
    params.accessToken,
    { ids: productIds, per_page: Math.min(50, productIds.length) },
  );

  const promoByVariant = new Map<number, number | null>();
  const priceByVariant = new Map<number, number | null>();
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const variantId = Number(variant.id);
      promoByVariant.set(
        variantId,
        toNullableNumber(variant.promotional_price),
      );
      priceByVariant.set(variantId, toNullableNumber(variant.price));
    }
  }

  const next = params.items.map((item) => {
    if (!promoByVariant.has(item.variantId)) return item;

    const storePromo = promoByVariant.get(item.variantId) ?? null;
    const offer = toNullableNumber(item.offerPrice);

    /**
     * Se a loja já tem o promo da oferta, o snapshot “atual” está
     * corrompido — preserva o originalPromotionalPrice já gravado.
     */
    if (
      storePromo != null &&
      offer != null &&
      moneyEq(storePromo, offer)
    ) {
      return item;
    }

    return {
      ...item,
      originalPromotionalPrice: storePromo,
      originalPrice:
        toNullableNumber(item.originalPrice) ??
        priceByVariant.get(item.variantId) ??
        item.originalPrice,
    };
  });

  await Promise.all(
    next.map((item) =>
      prisma.offerItem.updateMany({
        where: {
          offerGroupId: params.offerId,
          productId: item.productId,
          variantId: item.variantId,
        },
        data: {
          originalPromotionalPrice: toNullableNumber(
            item.originalPromotionalPrice,
          ),
          ...(toNullableNumber(item.originalPrice) != null
            ? { originalPrice: toNullableNumber(item.originalPrice)! }
            : {}),
        },
      }),
    ),
  );

  console.info("[offer-prices] snapshot original promos from store", {
    offerId: params.offerId,
    count: next.length,
    sample: next.slice(0, 3).map((i) => ({
      variantId: i.variantId,
      originalPrice: i.originalPrice,
      originalPromotionalPrice: i.originalPromotionalPrice,
      offerPrice: i.offerPrice,
    })),
  });

  return next;
}

const PATCH_MAX_ATTEMPTS = 3;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryablePatchError(err: unknown): boolean {
  if (err instanceof NuvemshopApiError) {
    return err.status === 429 || err.status >= 500;
  }
  return true; // rede / timeout
}

async function patchProductVariantsWithRetry(
  storeId: string,
  accessToken: string,
  productId: number,
  variants: VariantPricePatch[],
  action: "apply" | "restore",
): Promise<{ response: unknown; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= PATCH_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await patchProductVariants(
        storeId,
        accessToken,
        productId,
        variants,
      );
      if (attempt > 1) {
        console.info(`[offer-prices] ${action} product ok after retry`, {
          storeId,
          productId,
          attempt,
        });
      }
      return { response, attempts: attempt };
    } catch (err) {
      lastError = err;
      const retryable = isRetryablePatchError(err);
      console.warn(`[offer-prices] ${action} product attempt failed`, {
        storeId,
        productId,
        attempt,
        retryable,
        message:
          err instanceof NuvemshopApiError
            ? `${err.status}: ${err.responseBody.slice(0, 200)}`
            : err instanceof Error
              ? err.message
              : String(err),
      });
      if (!retryable || attempt === PATCH_MAX_ATTEMPTS) break;
      await sleep(400 * attempt);
    }
  }
  throw lastError;
}

async function sendVariantPatches(
  storeId: string,
  accessToken: string,
  groups: Array<{ productId: number; variants: VariantPricePatch[] }>,
  action: "apply" | "restore",
) {
  const errors: string[] = [];
  const attemptsByProduct: Record<string, number> = {};

  console.info(`[offer-prices] ${action} start`, {
    storeId,
    productCount: groups.length,
    variantCount: groups.reduce((sum, g) => sum + g.variants.length, 0),
    maxAttempts: PATCH_MAX_ATTEMPTS,
  });

  for (const group of groups) {
    try {
      console.info(`[offer-prices] ${action} product`, {
        storeId,
        productId: group.productId,
        variants: group.variants,
      });

      const { response, attempts } = await patchProductVariantsWithRetry(
        storeId,
        accessToken,
        group.productId,
        group.variants,
        action,
      );
      attemptsByProduct[String(group.productId)] = attempts;

      console.info(`[offer-prices] ${action} product ok`, {
        storeId,
        productId: group.productId,
        attempts,
        responsePreview: Array.isArray(response)
          ? response.slice(0, 2)
          : response,
      });
    } catch (err) {
      attemptsByProduct[String(group.productId)] = PATCH_MAX_ATTEMPTS;
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
        attempts: PATCH_MAX_ATTEMPTS,
      });
    }
  }

  console.info(`[offer-prices] ${action} done`, {
    storeId,
    ok: errors.length === 0,
    errorCount: errors.length,
    errors,
    attemptsByProduct,
  });

  return { errors, attemptsByProduct };
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

  /** Snapshot do promo atual na loja só no 1º apply (nunca com preços já aplicados). */
  let itemsToApply = items;
  if (!params.offer.pricesApplied) {
    try {
      itemsToApply = await refreshOriginalPromosFromStore({
        storeId: params.storeId,
        accessToken: params.accessToken,
        offerId: params.offer.id,
        items,
      });
    } catch (err) {
      console.warn("[offer-prices] snapshot original promos failed", err);
    }
  }

  const groups = toApplyGroups(itemsToApply);
  const { errors, attemptsByProduct } = await sendVariantPatches(
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
        attemptsByProduct,
        maxAttempts: PATCH_MAX_ATTEMPTS,
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
    // Sem log: não houve chamada à API nem erro.
    return { ok: true, errors: [] };
  }

  if (!items.length) {
    console.info("[offer-prices] skip restore — no items", {
      offerId: params.offer.id,
    });
    return { ok: true, errors: [] };
  }

  const groups = toRestoreGroups(items);
  console.info("[offer-prices] restore payload", {
    offerId: params.offer.id,
    sample: groups.slice(0, 2),
    clearedAsNull: groups
      .flatMap((g) => g.variants)
      .filter((v) => v.promotional_price == null).length,
  });

  const { errors, attemptsByProduct } = await sendVariantPatches(
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
        attemptsByProduct,
        maxAttempts: PATCH_MAX_ATTEMPTS,
        subset: Boolean(params.items?.length),
        force: Boolean(params.force),
        endpoint: "PATCH /products/{id}/variants",
        sample: groups.slice(0, 2),
      },
    },
  });

  return { ok: errors.length === 0, errors };
}
