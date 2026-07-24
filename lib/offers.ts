import type { OfferGroup, OfferItem, Prisma } from "@prisma/client";
import {
  DEFAULT_THEME,
  SHOWCASE_SLOTS,
  BANNER_SLOTS,
  normalizeBannerSlot,
} from "@/lib/offer-constants";
import {
  parseBannerAnimation,
  parseBannerButtonPosition,
  parseBannerModel,
  parseBannerSpacing,
  parseBannerTextAlign,
} from "@/lib/banner-models";
import {
  parseCountdownItemsModel,
  parseCountdownPdpModel,
} from "@/lib/countdown-models";
import {
  parseCountdownItemsSlot,
  parseCountdownPdpSlot,
} from "@/lib/countdown-slots";
import {
  emptySectionDisplay,
  parseSectionDisplayConfig,
  sectionDisplayToJson,
} from "@/lib/offer-display";
import type {
  ApiOfferGroup,
  ApiOfferItem,
  OfferGroupPayload,
  OfferTheme,
  StorefrontOffer,
} from "@/lib/types";

type OfferWithItems = OfferGroup & { items: OfferItem[] };

function toNumber(
  value: Prisma.Decimal | number | null | undefined,
): number | null {
  if (value == null) return null;
  return Number(value);
}

function normalizeHex(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value || typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) return trimmed;
  return fallback;
}

export function themeFromGroup(group: OfferGroup): OfferTheme {
  return {
    primaryColor: group.themePrimaryColor,
    secondaryColor: group.themeSecondaryColor,
    backgroundColor: group.themeBackgroundColor,
    textColor: group.themeTextColor,
    accentColor: group.themeAccentColor,
    buttonColor: group.themeButtonColor,
    buttonTextColor: group.themeButtonTextColor,
    countdownBg: group.themeCountdownBg,
    countdownText: group.themeCountdownText,
    borderRadius: group.themeBorderRadius,
  };
}

export function toApiOfferItem(item: OfferItem): ApiOfferItem {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    productName: item.productName,
    variantName: item.variantName,
    sku: item.sku,
    imageUrl: item.imageUrl,
    originalPrice: Number(item.originalPrice),
    originalPromotionalPrice: toNumber(item.originalPromotionalPrice),
    offerPrice: Number(item.offerPrice),
  };
}

export function toApiOfferGroup(group: OfferWithItems): ApiOfferGroup {
  return {
    id: group.id,
    name: group.name,
    status: group.status,
    startsAt: group.startsAt.toISOString(),
    endsAt: group.endsAt.toISOString(),
    autoApplyPrices: group.autoApplyPrices,
    pricesApplied: group.pricesApplied,
    productSelectionType: group.productSelectionType,
    categoryIds: group.categoryIds,
    fillMode: group.fillMode,
    fillValue: toNumber(group.fillValue),
    enableShowcase: group.enableShowcase,
    showcaseSlot: group.showcaseSlot,
    showcaseConfig: parseSectionDisplayConfig(group.showcaseConfig),
    enableDedicatedPage: group.enableDedicatedPage,
    dedicatedPageId: group.dedicatedPageId,
    dedicatedPageHandle: group.dedicatedPageHandle,
    pageConfig: parseSectionDisplayConfig(group.pageConfig),
    enableBanner: group.enableBanner,
    bannerType: group.bannerType,
    bannerSlot: normalizeBannerSlot(group.bannerSlot),
    bannerImageUrl: group.bannerImageUrl,
    bannerLinkUrl: group.bannerLinkUrl,
    bannerTitle: group.bannerTitle,
    bannerModel: parseBannerModel(group.bannerModel),
    bannerText1: group.bannerText1 ?? null,
    bannerText2: group.bannerText2 ?? null,
    bannerShowButton: Boolean(group.bannerShowButton),
    bannerButtonText: group.bannerButtonText ?? null,
    bannerButtonPosition: parseBannerButtonPosition(group.bannerButtonPosition),
    bannerContainer: Boolean(group.bannerContainer),
    bannerTextAlign: parseBannerTextAlign(group.bannerTextAlign),
    bannerSpacingTop: parseBannerSpacing(group.bannerSpacingTop),
    bannerSpacingBottom: parseBannerSpacing(group.bannerSpacingBottom),
    bannerAnimation: parseBannerAnimation(group.bannerAnimation),
    showCountdownOnItems: group.showCountdownOnItems,
    showCountdownOnPdp: group.showCountdownOnPdp,
    showDaysOnCountdown: Boolean(group.showDaysOnCountdown),
    countdownItemsModel: parseCountdownItemsModel(group.countdownItemsModel),
    countdownItemsSlot: parseCountdownItemsSlot(
      group.countdownItemsSlot,
      parseCountdownItemsModel(group.countdownItemsModel),
    ),
    countdownPdpModel: parseCountdownPdpModel(group.countdownPdpModel),
    countdownPdpSlot: parseCountdownPdpSlot(
      group.countdownPdpSlot,
      parseCountdownPdpModel(group.countdownPdpModel),
    ),
    countdownText1: group.countdownText1 ?? null,
    countdownText2: group.countdownText2 ?? null,
    theme: themeFromGroup(group),
    enabled: group.enabled,
    items: group.items.map(toApiOfferItem),
    itemCount: group.items.length,
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export function toStorefrontOffer(group: OfferWithItems): StorefrontOffer {
  const productIds = [...new Set(group.items.map((i) => i.productId))];
  return {
    id: group.id,
    name: group.name,
    startsAt: group.startsAt.toISOString(),
    endsAt: group.endsAt.toISOString(),
    productIds,
    /** Vitrine e página extra desativadas temporariamente no storefront. */
    enableShowcase: false,
    showcaseSlot: group.showcaseSlot,
    showcaseConfig: parseSectionDisplayConfig(group.showcaseConfig),
    enableBanner: group.enableBanner,
    bannerType: group.bannerType,
    bannerSlot: normalizeBannerSlot(group.bannerSlot),
    bannerImageUrl: group.bannerImageUrl,
    bannerLinkUrl: group.bannerLinkUrl,
    bannerTitle: group.bannerTitle,
    bannerModel: parseBannerModel(group.bannerModel),
    bannerText1: group.bannerText1 ?? null,
    bannerText2: group.bannerText2 ?? null,
    bannerShowButton: Boolean(group.bannerShowButton),
    bannerButtonText: group.bannerButtonText ?? null,
    bannerButtonPosition: parseBannerButtonPosition(group.bannerButtonPosition),
    bannerContainer: Boolean(group.bannerContainer),
    bannerTextAlign: parseBannerTextAlign(group.bannerTextAlign),
    bannerSpacingTop: parseBannerSpacing(group.bannerSpacingTop),
    bannerSpacingBottom: parseBannerSpacing(group.bannerSpacingBottom),
    bannerAnimation: parseBannerAnimation(group.bannerAnimation),
    dedicatedPageHandle: null,
    pageConfig: parseSectionDisplayConfig(group.pageConfig),
    showCountdownOnItems: group.showCountdownOnItems,
    showCountdownOnPdp: group.showCountdownOnPdp,
    showDaysOnCountdown: Boolean(group.showDaysOnCountdown),
    countdownItemsModel: parseCountdownItemsModel(group.countdownItemsModel),
    countdownItemsSlot: parseCountdownItemsSlot(
      group.countdownItemsSlot,
      parseCountdownItemsModel(group.countdownItemsModel),
    ),
    countdownPdpModel: parseCountdownPdpModel(group.countdownPdpModel),
    countdownPdpSlot: parseCountdownPdpSlot(
      group.countdownPdpSlot,
      parseCountdownPdpModel(group.countdownPdpModel),
    ),
    countdownText1: group.countdownText1 ?? null,
    countdownText2: group.countdownText2 ?? null,
    theme: themeFromGroup(group),
    items: group.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      imageUrl: item.imageUrl,
      offerPrice: Number(item.offerPrice),
      originalPrice: Number(item.originalPrice),
    })),
  };
}

function parseTheme(input: Partial<OfferTheme> | undefined): OfferTheme {
  return {
    primaryColor: normalizeHex(input?.primaryColor, DEFAULT_THEME.primaryColor),
    secondaryColor: normalizeHex(
      input?.secondaryColor,
      DEFAULT_THEME.secondaryColor,
    ),
    backgroundColor: normalizeHex(
      input?.backgroundColor,
      DEFAULT_THEME.backgroundColor,
    ),
    textColor: normalizeHex(input?.textColor, DEFAULT_THEME.textColor),
    accentColor: normalizeHex(input?.accentColor, DEFAULT_THEME.accentColor),
    buttonColor: normalizeHex(input?.buttonColor, DEFAULT_THEME.buttonColor),
    buttonTextColor: normalizeHex(
      input?.buttonTextColor,
      DEFAULT_THEME.buttonTextColor,
    ),
    countdownBg: normalizeHex(input?.countdownBg, DEFAULT_THEME.countdownBg),
    countdownText: normalizeHex(
      input?.countdownText,
      DEFAULT_THEME.countdownText,
    ),
    borderRadius: Math.min(
      48,
      Math.max(0, Number(input?.borderRadius ?? DEFAULT_THEME.borderRadius)),
    ),
  };
}

export function validateOfferPayload(
  body: unknown,
): { ok: true; data: OfferGroupPayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "invalid_body" };
  }

  const data = body as Partial<OfferGroupPayload>;

  if (!data.name?.trim()) {
    return { ok: false, error: "name_required" };
  }

  const startsAt = data.startsAt ? new Date(data.startsAt) : null;
  const endsAt = data.endsAt ? new Date(data.endsAt) : null;
  if (!startsAt || Number.isNaN(startsAt.getTime())) {
    return { ok: false, error: "invalid_starts_at" };
  }
  if (!endsAt || Number.isNaN(endsAt.getTime())) {
    return { ok: false, error: "invalid_ends_at" };
  }
  if (endsAt <= startsAt) {
    return { ok: false, error: "ends_before_starts" };
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    return { ok: false, error: "items_required" };
  }

  const items: ApiOfferItem[] = [];
  for (const raw of data.items) {
    const productId = Number(raw.productId);
    const variantId = Number(raw.variantId);
    const originalPrice = Number(raw.originalPrice);
    const offerPrice = Number(raw.offerPrice);
    if (
      !Number.isFinite(productId) ||
      !Number.isFinite(variantId) ||
      !Number.isFinite(originalPrice) ||
      !Number.isFinite(offerPrice)
    ) {
      return { ok: false, error: "invalid_item" };
    }
    items.push({
      productId,
      variantId,
      productName: raw.productName ?? null,
      variantName: raw.variantName ?? null,
      sku: raw.sku ?? null,
      imageUrl: raw.imageUrl ?? null,
      originalPrice,
      originalPromotionalPrice:
        raw.originalPromotionalPrice == null
          ? null
          : Number(raw.originalPromotionalPrice),
      offerPrice,
    });
  }

  const showcaseSlot = data.showcaseSlot ?? "before_section_products_sale";
  if (!SHOWCASE_SLOTS.includes(showcaseSlot)) {
    return { ok: false, error: "invalid_showcase_slot" };
  }

  const bannerSlot = data.bannerSlot ?? "after_header";
  if (!BANNER_SLOTS.includes(bannerSlot)) {
    return { ok: false, error: "invalid_banner_slot" };
  }

  return {
    ok: true,
    data: {
      name: data.name.trim(),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      autoApplyPrices: Boolean(data.autoApplyPrices),
      productSelectionType:
        data.productSelectionType === "category" ? "category" : "manual",
      categoryIds: Array.isArray(data.categoryIds)
        ? data.categoryIds.map(Number).filter((id) => !Number.isNaN(id))
        : [],
      fillMode:
        data.fillMode === "percent" || data.fillMode === "fixed"
          ? data.fillMode
          : "manual",
      fillValue:
        data.fillValue == null || data.fillValue === undefined
          ? null
          : Number(data.fillValue),
      enableShowcase: false,
      showcaseSlot,
      showcaseConfig: parseSectionDisplayConfig(
        data.showcaseConfig ?? emptySectionDisplay(),
      ),
      enableDedicatedPage: false,
      dedicatedPageId:
        data.dedicatedPageId == null || data.dedicatedPageId === undefined
          ? null
          : Number(data.dedicatedPageId),
      dedicatedPageHandle: data.dedicatedPageHandle ?? null,
      pageConfig: parseSectionDisplayConfig(
        data.pageConfig ?? emptySectionDisplay(),
      ),
      enableBanner: Boolean(data.enableBanner),
      bannerType: "countdown_bar",
      bannerSlot,
      bannerImageUrl: data.bannerImageUrl ?? null,
      bannerLinkUrl: data.bannerLinkUrl ?? null,
      bannerTitle: data.bannerTitle ?? null,
      bannerModel: parseBannerModel(data.bannerModel),
      bannerText1:
        typeof data.bannerText1 === "string"
          ? data.bannerText1.trim() || null
          : null,
      bannerText2:
        typeof data.bannerText2 === "string"
          ? data.bannerText2.trim() || null
          : null,
      bannerShowButton: Boolean(data.bannerShowButton),
      bannerButtonText:
        typeof data.bannerButtonText === "string"
          ? data.bannerButtonText.trim() || null
          : null,
      bannerButtonPosition: parseBannerButtonPosition(
        data.bannerButtonPosition,
      ),
      bannerContainer: Boolean(data.bannerContainer),
      bannerTextAlign: parseBannerTextAlign(data.bannerTextAlign),
      bannerSpacingTop: parseBannerSpacing(data.bannerSpacingTop),
      bannerSpacingBottom: parseBannerSpacing(data.bannerSpacingBottom),
      bannerAnimation: parseBannerAnimation(data.bannerAnimation),
      showCountdownOnItems: data.showCountdownOnItems !== false,
      showCountdownOnPdp: data.showCountdownOnPdp !== false,
      showDaysOnCountdown: Boolean(data.showDaysOnCountdown),
      countdownItemsModel: parseCountdownItemsModel(data.countdownItemsModel),
      countdownItemsSlot: parseCountdownItemsSlot(
        data.countdownItemsSlot,
        parseCountdownItemsModel(data.countdownItemsModel),
      ),
      countdownPdpModel: parseCountdownPdpModel(data.countdownPdpModel),
      countdownPdpSlot: parseCountdownPdpSlot(
        data.countdownPdpSlot,
        parseCountdownPdpModel(data.countdownPdpModel),
      ),
      countdownText1:
        typeof data.countdownText1 === "string"
          ? data.countdownText1.trim() || null
          : null,
      countdownText2:
        typeof data.countdownText2 === "string"
          ? data.countdownText2.trim() || null
          : null,
      theme: parseTheme(data.theme),
      enabled: data.enabled !== false,
      items,
    },
  };
}

export function prismaThemeData(theme: OfferTheme) {
  return {
    themePrimaryColor: theme.primaryColor,
    themeSecondaryColor: theme.secondaryColor,
    themeBackgroundColor: theme.backgroundColor,
    themeTextColor: theme.textColor,
    themeAccentColor: theme.accentColor,
    themeButtonColor: theme.buttonColor,
    themeButtonTextColor: theme.buttonTextColor,
    themeCountdownBg: theme.countdownBg,
    themeCountdownText: theme.countdownText,
    themeBorderRadius: theme.borderRadius,
  };
}

export function prismaSectionDisplayData(payload: OfferGroupPayload) {
  return {
    showcaseConfig: sectionDisplayToJson(
      parseSectionDisplayConfig(payload.showcaseConfig),
    ),
    pageConfig: sectionDisplayToJson(
      parseSectionDisplayConfig(payload.pageConfig),
    ),
  };
}

export function deriveStatus(params: {
  enabled: boolean;
  startsAt: Date;
  endsAt: Date;
  now?: Date;
}): OfferGroup["status"] {
  if (!params.enabled) return "disabled";
  const now = params.now ?? new Date();
  if (now < params.startsAt) return "scheduled";
  if (now > params.endsAt) return "ended";
  return "active";
}
