export type ShowcaseSlot =
  | "before_main_content"
  | "after_header"
  | "before_section_products_sale"
  | "after_section_products_sale"
  | "before_section_products_featured"
  | "after_section_products_featured"
  | "before_footer";

export type BannerSlot =
  | "before_main_content"
  | "after_header"
  | "before_footer"
  | "before_section_products_sale"
  | "after_section_products_sale"
  | "before_section_products_new"
  | "after_section_products_new"
  | "before_section_products_featured"
  | "after_section_products_featured";

export type BannerType = "image" | "countdown_bar";

export type BannerModel = "solid" | "strip" | "soft" | "urgent";

export type BannerAnimation = "none" | "pulse" | "shine" | "slide";

export type BannerTextAlign = "left" | "center" | "right";

export type BannerButtonPosition = "before" | "after" | "full";

/** Escala 0–5 (como mt/mb): 0, 5px, 10px, 15px, 20px, 25px */
export type BannerSpacing = 0 | 1 | 2 | 3 | 4 | 5;

const BANNER_SPACING_PX: Record<BannerSpacing, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
};

export type CountdownItemsModel =
  | "badge"
  | "bar"
  | "flash"
  | "inline"
  | "hero";

export type CountdownPdpModel =
  | "urgency_box"
  | "inline"
  | "progress"
  | "floating"
  | "banner";

export type CountdownItemsSlot =
  | "product_grid_item_image_top_left"
  | "product_grid_item_image_top_right"
  | "product_grid_item_image_bottom_left"
  | "product_grid_item_image_bottom_right"
  | "before_product_grid_item_name"
  | "after_product_grid_item_name"
  | "before_product_grid_item_price"
  | "after_product_grid_item_price";

export type CountdownPdpSlot =
  | "product_detail_image_top_left"
  | "product_detail_image_top_right"
  | "product_detail_image_bottom_left"
  | "product_detail_image_bottom_right"
  | "before_product_detail_name"
  | "after_product_detail_name"
  | "before_product_detail_price"
  | "after_product_detail_price"
  | "before_product_detail_payment_options"
  | "after_product_detail_payment_options"
  | "before_product_detail_add_to_cart"
  | "after_product_detail_add_to_cart";

export type OfferSectionLayout = "grid" | "carousel";

export type OfferSectionDisplayConfig = {
  title: string | null;
  subtitle: string | null;
  textTop: string | null;
  textBottom: string | null;
  bannerTopUrl: string | null;
  bannerBottomUrl: string | null;
  layout: OfferSectionLayout;
  itemsPerRow: number;
};

export type OfferTheme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  countdownBg: string;
  countdownText: string;
  borderRadius: number;
};

export type StorefrontOffer = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  productIds: number[];
  enableShowcase: boolean;
  showcaseSlot: ShowcaseSlot;
  showcaseConfig: OfferSectionDisplayConfig;
  enableBanner: boolean;
  bannerType: BannerType;
  bannerSlot: BannerSlot;
  bannerImageUrl: string | null;
  bannerLinkUrl: string | null;
  bannerTitle: string | null;
  bannerModel: BannerModel;
  bannerText1: string | null;
  bannerText2: string | null;
  bannerShowButton: boolean;
  bannerButtonText: string | null;
  bannerButtonPosition: BannerButtonPosition;
  bannerContainer: boolean;
  bannerTextAlign: BannerTextAlign;
  bannerSpacingTop: BannerSpacing;
  bannerSpacingBottom: BannerSpacing;
  bannerAnimation: BannerAnimation;
  dedicatedPageHandle: string | null;
  pageConfig: OfferSectionDisplayConfig;
  showCountdownOnItems: boolean;
  showCountdownOnPdp: boolean;
  showDaysOnCountdown: boolean;
  countdownItemsModel: CountdownItemsModel;
  countdownItemsSlot: CountdownItemsSlot;
  countdownPdpModel: CountdownPdpModel;
  countdownPdpSlot: CountdownPdpSlot;
  countdownText1: string | null;
  countdownText2: string | null;
  theme: OfferTheme;
  items: Array<{
    productId: number;
    variantId: number;
    productName: string | null;
    imageUrl: string | null;
    offerPrice: number;
    originalPrice: number;
  }>;
};

export function offerIncludesProduct(
  offer: StorefrontOffer,
  productId: number,
): boolean {
  return offer.productIds.includes(Number(productId));
}

export function msUntil(endsAt: string, now = Date.now()): number {
  return Math.max(0, new Date(endsAt).getTime() - now);
}

export function formatCountdown(ms: number, showDays = true): string {
  const { days, hours, minutes, seconds } = countdownParts(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  const totalHours = Math.floor(ms / 3600000);
  if (showDays && days > 0) {
    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  if (showDays) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function countdownParts(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

/** Progresso 0–100 da oferta com base em startsAt/endsAt. */
export function offerProgressPercent(offer: StorefrontOffer, now = Date.now()) {
  const start = new Date(offer.startsAt).getTime();
  const end = new Date(offer.endsAt).getTime();
  if (!(end > start)) return 100;
  const ratio = (now - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function resolveSectionConfig(
  offer: StorefrontOffer,
): OfferSectionDisplayConfig {
  const raw = offer.showcaseConfig;
  return {
    title: raw?.title ?? null,
    subtitle: raw?.subtitle ?? null,
    textTop: raw?.textTop ?? null,
    textBottom: raw?.textBottom ?? null,
    bannerTopUrl: raw?.bannerTopUrl ?? null,
    bannerBottomUrl: raw?.bannerBottomUrl ?? null,
    layout: raw?.layout === "carousel" ? "carousel" : "grid",
    itemsPerRow:
      raw?.itemsPerRow === 2 || raw?.itemsPerRow === 3 || raw?.itemsPerRow === 4
        ? raw.itemsPerRow
        : 4,
  };
}

/** NubeSDK Text não renderiza HTML — extrai texto do Editor. */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function resolveItemsModel(offer: StorefrontOffer): CountdownItemsModel {
  const m = offer.countdownItemsModel;
  if (
    m === "badge" ||
    m === "bar" ||
    m === "flash" ||
    m === "inline" ||
    m === "hero"
  ) {
    return m;
  }
  return "badge";
}

export function resolvePdpModel(offer: StorefrontOffer): CountdownPdpModel {
  const m = offer.countdownPdpModel;
  if (
    m === "urgency_box" ||
    m === "inline" ||
    m === "progress" ||
    m === "floating" ||
    m === "banner"
  ) {
    return m;
  }
  return "urgency_box";
}

/** Texto customizado do lojista, ou fallback do modelo. */
export function countdownLabel(
  offer: StorefrontOffer,
  which: 1 | 2,
  fallback: string,
): string {
  const raw = which === 1 ? offer.countdownText1 : offer.countdownText2;
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed || fallback;
}

export function resolveBannerModel(offer: StorefrontOffer): BannerModel {
  const m = offer.bannerModel;
  if (m === "strip" || m === "soft" || m === "urgent" || m === "solid") {
    return m;
  }
  return "solid";
}

export function resolveBannerAnimation(
  offer: StorefrontOffer,
): BannerAnimation {
  const a = offer.bannerAnimation;
  if (a === "pulse" || a === "shine" || a === "slide" || a === "none") {
    return a;
  }
  return "none";
}

export function resolveBannerTextAlign(
  offer: StorefrontOffer,
): BannerTextAlign {
  const a = offer.bannerTextAlign;
  if (a === "left" || a === "center" || a === "right") return a;
  return "center";
}

export function resolveBannerButtonPosition(
  offer: StorefrontOffer,
): BannerButtonPosition {
  const p = offer.bannerButtonPosition;
  if (p === "before" || p === "after" || p === "full") return p;
  return "after";
}

export function resolveBannerSpacing(value: unknown): BannerSpacing {
  const n = Number(value);
  if (n === 0 || n === 1 || n === 2 || n === 3 || n === 4 || n === 5) {
    return n;
  }
  return 0;
}

export function bannerSpacingCss(value: BannerSpacing): string {
  return `${BANNER_SPACING_PX[value]}px`;
}

/** Textos do banner de loja (text1 / text2), com fallback para bannerTitle legado. */
export function bannerLabel(
  offer: StorefrontOffer,
  which: 1 | 2,
  fallback: string,
): string {
  if (which === 1) {
    const t1 = typeof offer.bannerText1 === "string" ? offer.bannerText1.trim() : "";
    if (t1) return t1;
    const legacy =
      typeof offer.bannerTitle === "string" ? offer.bannerTitle.trim() : "";
    return legacy || fallback;
  }
  const t2 = typeof offer.bannerText2 === "string" ? offer.bannerText2.trim() : "";
  return t2 || fallback;
}
