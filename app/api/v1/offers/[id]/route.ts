import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  applyPricesForPlan,
  buildSavePricePlan,
  restorePricesForPlan,
} from "@/lib/offer-apply-on-save";
import { syncDedicatedPage } from "@/lib/offer-pages";
import { applyOfferPrices, restoreOfferPrices } from "@/lib/offer-prices";
import {
  deriveStatus,
  prismaSectionDisplayData,
  prismaThemeData,
  toApiOfferGroup,
  validateOfferPayload,
} from "@/lib/offers";
import { deleteOfferImage } from "@/lib/supabase-storage";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedOffer(storeId: string, id: string) {
  return prisma.offerGroup.findFirst({
    where: { id, storeId },
    include: { items: true },
  });
}

export async function GET(request: Request, context: RouteContext) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const offer = await getOwnedOffer(session.storeId, id);
  if (!offer) {
    return apiJson(request, { error: "not_found" }, { status: 404 });
  }

  return apiJson(request, { offer: toApiOfferGroup(offer) });
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const existing = await getOwnedOffer(session.storeId, id);
  if (!existing) {
    return apiJson(request, { error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const validated = validateOfferPayload(body);
  if (!validated.ok) {
    return apiJson(request, { error: validated.error }, { status: 400 });
  }

  const { data } = validated;
  const applyPricesNow = Boolean(
    (body as { applyPricesNow?: boolean } | null)?.applyPricesNow,
  );
  const startsAt = new Date(data.startsAt);
  const endsAt = new Date(data.endsAt);
  const previousBanner = existing.bannerImageUrl;

  const plan = buildSavePricePlan({
    previous: existing,
    next: {
      enabled: data.enabled,
      autoApplyPrices: data.autoApplyPrices,
      startsAt,
      endsAt,
      items: data.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        offerPrice: item.offerPrice,
        originalPromotionalPrice: item.originalPromotionalPrice,
      })),
    },
  });
  const status = plan.nextStatus;

  try {
    const restoreResult = await restorePricesForPlan({
      storeId: session.storeId,
      accessToken: session.accessToken,
      previous: existing,
      plan,
    });
    if (!restoreResult.ok) {
      return apiJson(
        request,
        {
          error: "restore_failed_before_update",
          errors: restoreResult.errors,
        },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error("[offers] restore before update failed", err);
    return apiJson(
      request,
      { error: "restore_failed_before_update" },
      { status: 502 },
    );
  }

  const fullRestore =
    plan.needsRestore &&
    plan.restoreItems.length === existing.items.length;

  /** Mantém flag se a oferta continua “live” e não vamos reaplicar tudo agora. */
  const pricesAppliedAfterSave = fullRestore
    ? false
    : plan.pricesShouldBeApplied
      ? plan.needsApply && applyPricesNow
        ? false
        : existing.pricesApplied
      : false;

  let offer = await prisma.$transaction(async (tx) => {
    await tx.offerItem.deleteMany({ where: { offerGroupId: id } });
    return tx.offerGroup.update({
      where: { id },
      data: {
        name: data.name,
        status,
        startsAt,
        endsAt,
        autoApplyPrices: data.autoApplyPrices,
        productSelectionType: data.productSelectionType,
        categoryIds: data.categoryIds,
        fillMode: data.fillMode,
        fillValue: data.fillValue,
        enableShowcase: data.enableShowcase,
        showcaseSlot: data.showcaseSlot,
        enableDedicatedPage: data.enableDedicatedPage,
        dedicatedPageId: data.dedicatedPageId ?? null,
        dedicatedPageHandle: data.dedicatedPageHandle ?? null,
        ...prismaSectionDisplayData(data),
        enableBanner: data.enableBanner,
        bannerType: data.bannerType,
        bannerSlot: data.bannerSlot,
        bannerImageUrl: data.bannerImageUrl,
        bannerLinkUrl: data.bannerLinkUrl,
        bannerTitle: data.bannerTitle,
        bannerModel: data.bannerModel,
        bannerText1: data.bannerText1,
        bannerText2: data.bannerText2,
        bannerShowButton: data.bannerShowButton,
        bannerButtonText: data.bannerButtonText,
        bannerButtonPosition: data.bannerButtonPosition,
        bannerContainer: data.bannerContainer,
        bannerTextAlign: data.bannerTextAlign,
        bannerSpacingTop: data.bannerSpacingTop,
        bannerSpacingBottom: data.bannerSpacingBottom,
        bannerAnimation: data.bannerAnimation,
        showCountdownOnItems: data.showCountdownOnItems,
        showCountdownOnPdp: data.showCountdownOnPdp,
        showDaysOnCountdown: data.showDaysOnCountdown,
        countdownItemsModel: data.countdownItemsModel,
        countdownItemsSlot: data.countdownItemsSlot,
        countdownPdpModel: data.countdownPdpModel,
        countdownPdpSlot: data.countdownPdpSlot,
        countdownText1: data.countdownText1,
        countdownText2: data.countdownText2,
        ...prismaThemeData(data.theme),
        enabled: data.enabled,
        pricesApplied: pricesAppliedAfterSave,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.sku,
            imageUrl: item.imageUrl,
            originalPrice: item.originalPrice,
            originalPromotionalPrice: item.originalPromotionalPrice,
            offerPrice: item.offerPrice,
          })),
        },
      },
      include: { items: true },
    });
  });

  if (previousBanner && previousBanner !== (data.bannerImageUrl ?? null)) {
    await deleteOfferImage({
      storeId: session.storeId,
      publicUrl: previousBanner,
    });
  }

  const applyResult = await applyPricesForPlan({
    storeId: session.storeId,
    accessToken: session.accessToken,
    offer,
    plan,
    applyPricesNow,
  });

  if (applyResult.applied || applyResult.errors.length) {
    const refreshed = await getOwnedOffer(session.storeId, id);
    if (refreshed) offer = refreshed;
  }

  return apiJson(request, {
    offer: toApiOfferGroup(offer),
    pricesAppliedNow: applyResult.applied,
    pricesApplyOk: applyResult.ok,
    pricesApplyErrors: applyResult.errors,
    priceSyncReasons: plan.reasons,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const existing = await getOwnedOffer(session.storeId, id);
  if (!existing) {
    return apiJson(request, { error: "not_found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as {
    enabled?: boolean;
  } | null;

  if (typeof body?.enabled !== "boolean") {
    return apiJson(request, { error: "invalid_body" }, { status: 400 });
  }

  const status = deriveStatus({
    enabled: body.enabled,
    startsAt: existing.startsAt,
    endsAt: existing.endsAt,
  });

  let pricesRestored = false;
  let pricesAppliedNow = false;
  let pricesOk = true;
  let pricesErrors: string[] = [];

  if (
    (status === "disabled" || status === "ended") &&
    existing.pricesApplied
  ) {
    try {
      const result = await restoreOfferPrices({
        storeId: session.storeId,
        accessToken: session.accessToken,
        offer: existing,
      });
      pricesRestored = true;
      pricesOk = result.ok;
      pricesErrors = result.errors;
      if (!result.ok) {
        return apiJson(
          request,
          { error: "restore_failed_on_toggle", errors: result.errors },
          { status: 502 },
        );
      }
    } catch (err) {
      console.error("[offers] restore on toggle failed", err);
      return apiJson(
        request,
        { error: "restore_failed_on_toggle" },
        { status: 502 },
      );
    }
  }

  let offer = await prisma.offerGroup.update({
    where: { id },
    data: { enabled: body.enabled, status },
    include: { items: true },
  });

  if (status === "active" && offer.autoApplyPrices && !offer.pricesApplied) {
    try {
      const result = await applyOfferPrices({
        storeId: session.storeId,
        accessToken: session.accessToken,
        offer,
      });
      pricesAppliedNow = result.ok;
      pricesOk = result.ok;
      pricesErrors = result.errors;
      const refreshed = await getOwnedOffer(session.storeId, id);
      if (refreshed) offer = refreshed;
    } catch (err) {
      console.error("[offers] apply on toggle failed", err);
      pricesOk = false;
      pricesErrors = ["apply_failed_on_toggle"];
    }
  }

  return apiJson(request, {
    offer: toApiOfferGroup(offer),
    pricesRestored,
    pricesAppliedNow,
    pricesOk,
    pricesErrors,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const existing = await getOwnedOffer(session.storeId, id);
  if (!existing) {
    return apiJson(request, { error: "not_found" }, { status: 404 });
  }

  if (existing.pricesApplied) {
    try {
      await restoreOfferPrices({
        storeId: session.storeId,
        accessToken: session.accessToken,
        offer: existing,
      });
    } catch (err) {
      console.error("[offers] restore before delete failed", err);
      return apiJson(
        request,
        { error: "restore_failed_before_delete" },
        { status: 502 },
      );
    }
  }

  if (existing.enableDedicatedPage && existing.dedicatedPageId) {
    try {
      await syncDedicatedPage({
        storeId: session.storeId,
        accessToken: session.accessToken,
        offer: { ...existing, enableDedicatedPage: false },
      });
    } catch (err) {
      console.warn("[offers] page cleanup failed", err);
    }
  }

  await prisma.offerGroup.delete({ where: { id } });

  await deleteOfferImage({
    storeId: session.storeId,
    publicUrl: existing.bannerImageUrl,
  });

  return apiJson(request, { ok: true });
}
