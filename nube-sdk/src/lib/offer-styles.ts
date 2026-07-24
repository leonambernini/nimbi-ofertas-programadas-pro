import type { NubeComponentStyle } from "@tiendanube/nube-sdk-types";
import { StyleSheet } from "@tiendanube/nube-sdk-ui";
import type {
  CountdownItemsModel,
  CountdownItemsSlot,
  CountdownPdpModel,
  CountdownPdpSlot,
  OfferTheme,
  StorefrontOffer,
} from "./types";

export const MONO_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

/** CSS custom properties da oferta — usar com styled() via var(--op-*). */
export function offerThemeVars(theme: OfferTheme): NubeComponentStyle {
  return {
    "--op-primary": theme.primaryColor,
    "--op-secondary": theme.secondaryColor,
    "--op-bg": theme.backgroundColor,
    "--op-text": theme.textColor,
    "--op-accent": theme.accentColor,
    "--op-btn": theme.buttonColor,
    "--op-on-primary": theme.buttonTextColor,
    "--op-countdown-bg": theme.countdownBg,
    "--op-countdown-text": theme.countdownText,
    "--op-radius": `${theme.borderRadius}px`,
    "--op-radius-sm": `${Math.max(4, theme.borderRadius / 2)}px`,
    "--op-radius-lg": `${Math.max(12, theme.borderRadius)}px`,
    "--op-flash-border": `${theme.accentColor}66`,
    "--op-soft-border": `${theme.primaryColor}33`,
  } as NubeComponentStyle;
}

export function progressFillStyle(progress: number): NubeComponentStyle {
  return StyleSheet.create({
    fill: {
      height: "100%",
      width: `${Math.max(4, progress)}%`,
      backgroundColor: "var(--op-primary)",
      borderRadius: "999px",
    },
  }).fill;
}

export const COUNTDOWN_ITEMS_SLOTS = [
  "product_grid_item_image_top_left",
  "product_grid_item_image_top_right",
  "product_grid_item_image_bottom_left",
  "product_grid_item_image_bottom_right",
  "before_product_grid_item_name",
  "after_product_grid_item_name",
  "before_product_grid_item_price",
  "after_product_grid_item_price",
] as const;

export const COUNTDOWN_PDP_SLOTS = [
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
] as const;

/** Slot de vitrine por modelo de countdown (itens). */
export function gridSlotForItemsModel(
  model: CountdownItemsModel,
): CountdownItemsSlot {
  if (model === "badge") return "product_grid_item_image_top_left";
  if (model === "flash") return "product_grid_item_image_bottom_left";
  return "after_product_grid_item_price";
}

/** Slot de PDP por modelo de countdown. */
export function pdpSlotForModel(model: CountdownPdpModel): CountdownPdpSlot {
  if (model === "banner") return "before_product_detail_add_to_cart";
  if (model === "floating") return "product_detail_image_top_right";
  return "after_product_detail_price";
}

export function resolveItemsSlot(offer: StorefrontOffer): CountdownItemsSlot {
  const slot = offer.countdownItemsSlot;
  if (
    slot &&
    (COUNTDOWN_ITEMS_SLOTS as readonly string[]).includes(slot)
  ) {
    return slot;
  }
  return gridSlotForItemsModel(offer.countdownItemsModel);
}

export function resolvePdpSlot(offer: StorefrontOffer): CountdownPdpSlot {
  const slot = offer.countdownPdpSlot;
  if (slot && (COUNTDOWN_PDP_SLOTS as readonly string[]).includes(slot)) {
    return slot;
  }
  return pdpSlotForModel(offer.countdownPdpModel);
}

/** Todos os slots possíveis — usados para clear/render no mount. */
export const GRID_COUNTDOWN_SLOTS = COUNTDOWN_ITEMS_SLOTS;
export const PDP_COUNTDOWN_SLOTS = COUNTDOWN_PDP_SLOTS;
