import type {
  BannerSlot,
  PriceFillMode,
  ShowcaseSlot,
} from "@/lib/types";

export const DEFAULT_THEME = {
  primaryColor: "#E11D48",
  secondaryColor: "#FEF2F2",
  backgroundColor: "#FFFFFF",
  textColor: "#111827",
  accentColor: "#E11D48",
  buttonColor: "#E11D48",
  buttonTextColor: "#FFFFFF",
  countdownBg: "#111827",
  countdownText: "#FFFFFF",
  borderRadius: 8,
} as const;

export const SHOWCASE_SLOTS: ShowcaseSlot[] = [
  "before_main_content",
  "after_header",
  "before_section_products_sale",
  "after_section_products_sale",
  "before_section_products_featured",
  "after_section_products_featured",
  "before_footer",
];

export const BANNER_SLOTS: BannerSlot[] = [
  "before_main_content",
  "after_header",
  "before_footer",
  "before_section_products_sale",
  "after_section_products_sale",
  "before_section_products_new",
  "after_section_products_new",
  "before_section_products_featured",
  "after_section_products_featured",
];

/** Slots antigos mantidos no enum do Prisma — não oferecidos na UI. */
export const RETIRED_BANNER_SLOTS = ["drawer_left", "drawer_right"] as const;

export function normalizeBannerSlot(value: unknown): BannerSlot {
  if (
    typeof value === "string" &&
    (BANNER_SLOTS as readonly string[]).includes(value)
  ) {
    return value as BannerSlot;
  }
  return "after_header";
}

export const FILL_MODES: PriceFillMode[] = ["percent", "fixed", "manual"];

/**
 * Slots NubeSDK usados pelo Ofertas Pro.
 * Fonte: https://dev.nuvemshop.com.br/en/docs/applications/nube-sdk/slots/storefront-slots
 *
 * - Banner: before_main_content, after_header, before_footer, seções home
 * - Vitrine customizada: before/after section sale|featured, before_main_content, before_footer
 * - Cronômetro em card: after_product_grid_item_price, product_grid_item_image_*
 * - Cronômetro PDP: after_product_detail_price, before_product_detail_add_to_cart
 *
 * Observação: before/after_section_products_* só renderizam se a seção
 * correspondente existir no layout da home do tema.
 */
export { COUNTDOWN_ITEMS_SLOTS, COUNTDOWN_PDP_SLOTS } from "@/lib/countdown-slots";

export const NUBE_SLOT_NOTES = {
  banner: BANNER_SLOTS,
  showcase: SHOWCASE_SLOTS,
  gridCountdown: [
    "product_grid_item_image_top_left",
    "product_grid_item_image_top_right",
    "product_grid_item_image_bottom_left",
    "product_grid_item_image_bottom_right",
    "before_product_grid_item_name",
    "after_product_grid_item_name",
    "before_product_grid_item_price",
    "after_product_grid_item_price",
  ],
  pdpCountdown: [
    "product_detail_image_top_left",
    "product_detail_image_top_right",
    "product_detail_image_bottom_left",
    "product_detail_image_bottom_right",
    "before_product_detail_name",
    "after_product_detail_name",
    "before_product_detail_price",
    "after_product_detail_price",
    "before_product_detail_payment_options",
    "after_product_detail_payment_options",
    "before_product_detail_add_to_cart",
    "after_product_detail_add_to_cart",
  ],
} as const;
