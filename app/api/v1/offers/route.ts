import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  applyPricesForPlan,
  buildSavePricePlan,
} from "@/lib/offer-apply-on-save";
import {
  prismaSectionDisplayData,
  prismaThemeData,
  toApiOfferGroup,
  validateOfferPayload,
} from "@/lib/offers";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const offers = await prisma.offerGroup.findMany({
    where: { storeId: session.storeId },
    include: { items: true },
    orderBy: { updatedAt: "desc" },
  });

  return apiJson(request, offers.map(toApiOfferGroup));
}

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

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
  const plan = buildSavePricePlan({
    previous: null,
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

  let offer = await prisma.offerGroup.create({
    data: {
      storeId: session.storeId,
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

  const applyResult = await applyPricesForPlan({
    storeId: session.storeId,
    accessToken: session.accessToken,
    offer,
    plan,
    applyPricesNow,
  });

  if (applyResult.applied) {
    offer = await prisma.offerGroup.findUniqueOrThrow({
      where: { id: offer.id },
      include: { items: true },
    });
  }

  return apiJson(
    request,
    {
      offer: toApiOfferGroup(offer),
      pricesAppliedNow: applyResult.applied,
      pricesApplyOk: applyResult.ok,
      pricesApplyErrors: applyResult.errors,
      priceSyncReasons: plan.reasons,
    },
    { status: 201 },
  );
}
