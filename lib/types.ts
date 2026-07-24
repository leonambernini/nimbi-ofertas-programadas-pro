import type {
  BannerAnimation,
  BannerButtonPosition,
  BannerModel,
  BannerSpacing,
  BannerTextAlign,
} from "@/lib/banner-models";
import type {
  CountdownItemsModel,
  CountdownPdpModel,
} from "@/lib/countdown-models";
import type {
  CountdownItemsSlot,
  CountdownPdpSlot,
} from "@/lib/countdown-slots";

export type {
  BannerAnimation,
  BannerButtonPosition,
  BannerModel,
  BannerSpacing,
  BannerTextAlign,
};
export type { CountdownItemsModel, CountdownPdpModel };
export type { CountdownItemsSlot, CountdownPdpSlot };

export type OfferStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "ended"
  | "disabled";

export type ProductSelectionType = "manual" | "category";

export type PriceFillMode = "percent" | "fixed" | "manual";

export type BannerType = "image" | "countdown_bar";

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

/** Layout da vitrine / página extra no storefront (NubeSDK: grid CSS ou SideScroll). */
export type OfferSectionLayout = "grid" | "carousel";

/** Conteúdo e layout compartilhados entre vitrine e página dedicada. */
export type OfferSectionDisplayConfig = {
  title: string | null;
  subtitle: string | null;
  textTop: string | null;
  textBottom: string | null;
  bannerTopUrl: string | null;
  bannerBottomUrl: string | null;
  layout: OfferSectionLayout;
  /** Colunas no desktop (grid). Carousel usa como largura relativa do card. */
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

export type ApiOfferItem = {
  id?: string;
  productId: number;
  variantId: number;
  productName: string | null;
  variantName: string | null;
  sku: string | null;
  imageUrl: string | null;
  originalPrice: number;
  originalPromotionalPrice: number | null;
  offerPrice: number;
};

export type ApiOfferGroup = {
  id: string;
  name: string;
  status: OfferStatus;
  startsAt: string;
  endsAt: string;
  autoApplyPrices: boolean;
  pricesApplied: boolean;
  productSelectionType: ProductSelectionType;
  categoryIds: number[];
  fillMode: PriceFillMode;
  fillValue: number | null;
  enableShowcase: boolean;
  showcaseSlot: ShowcaseSlot;
  showcaseConfig: OfferSectionDisplayConfig;
  enableDedicatedPage: boolean;
  dedicatedPageId: number | null;
  dedicatedPageHandle: string | null;
  pageConfig: OfferSectionDisplayConfig;
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
  enabled: boolean;
  items: ApiOfferItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OfferGroupPayload = {
  name: string;
  startsAt: string;
  endsAt: string;
  autoApplyPrices: boolean;
  productSelectionType: ProductSelectionType;
  categoryIds: number[];
  fillMode: PriceFillMode;
  fillValue?: number | null;
  enableShowcase: boolean;
  showcaseSlot: ShowcaseSlot;
  showcaseConfig?: OfferSectionDisplayConfig;
  enableDedicatedPage: boolean;
  dedicatedPageId?: number | null;
  dedicatedPageHandle?: string | null;
  pageConfig?: OfferSectionDisplayConfig;
  enableBanner: boolean;
  bannerType: BannerType;
  bannerSlot: BannerSlot;
  bannerImageUrl?: string | null;
  bannerLinkUrl?: string | null;
  bannerTitle?: string | null;
  bannerModel?: BannerModel;
  bannerText1?: string | null;
  bannerText2?: string | null;
  bannerShowButton?: boolean;
  bannerButtonText?: string | null;
  bannerButtonPosition?: BannerButtonPosition;
  bannerContainer?: boolean;
  bannerTextAlign?: BannerTextAlign;
  bannerSpacingTop?: BannerSpacing;
  bannerSpacingBottom?: BannerSpacing;
  bannerAnimation?: BannerAnimation;
  showCountdownOnItems: boolean;
  showCountdownOnPdp: boolean;
  showDaysOnCountdown?: boolean;
  countdownItemsModel?: CountdownItemsModel;
  countdownItemsSlot?: CountdownItemsSlot;
  countdownPdpModel?: CountdownPdpModel;
  countdownPdpSlot?: CountdownPdpSlot;
  countdownText1?: string | null;
  countdownText2?: string | null;
  theme: OfferTheme;
  enabled: boolean;
  items: ApiOfferItem[];
  /** Quando true e a oferta estiver ativa, aplica preços na loja ao salvar. */
  applyPricesNow?: boolean;
};

export type ApiProduct = {
  id: number;
  name: string;
  imageUrl: string | null;
  published: boolean;
  variants?: ApiProductVariant[];
};

export type ApiProductVariant = {
  id: number;
  productId: number;
  name: string;
  sku: string | null;
  price: number;
  promotionalPrice: number | null;
  imageUrl: string | null;
};

export type ApiCategory = {
  id: number;
  name: string;
  parentId: number | null;
};

export type ApiStorePage = {
  id: number;
  title: string;
  handle: string;
  published: boolean;
};

export type SubscriptionInfo = {
  status: string;
  planCode: string | null;
  planId: string | null;
  amountValue: number | null;
  amountCurrency: string | null;
  nextExecution: string | null;
  lastExecution: string | null;
  description: string | null;
  recurringFrequency?: string | null;
  recurringInterval?: number | null;
  hasAccess?: boolean;
};

/** Payload público consumido pelo NubeSDK. */
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
