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
export type BannerSpacing = 0 | 1 | 2 | 3 | 4 | 5;

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
};

export type StorefrontAccess = {
  allowed: boolean;
  reason: string;
};

export type PageKind = "product" | "listing" | "other";
