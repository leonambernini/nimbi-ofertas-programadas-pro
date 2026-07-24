import type { CountdownItemsModel, CountdownPdpModel } from "@/lib/countdown-models";

/** Slots de grid disponíveis para cronômetro nos cards. */
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

export type CountdownItemsSlot = (typeof COUNTDOWN_ITEMS_SLOTS)[number];

/** Slots de PDP disponíveis para cronômetro. */
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

export type CountdownPdpSlot = (typeof COUNTDOWN_PDP_SLOTS)[number];

export function defaultCountdownItemsSlot(
  model: CountdownItemsModel,
): CountdownItemsSlot {
  if (model === "badge") return "product_grid_item_image_top_left";
  if (model === "flash") return "product_grid_item_image_bottom_left";
  return "after_product_grid_item_price";
}

export function defaultCountdownPdpSlot(
  model: CountdownPdpModel,
): CountdownPdpSlot {
  if (model === "banner") return "before_product_detail_add_to_cart";
  if (model === "floating") return "product_detail_image_top_right";
  return "after_product_detail_price";
}

export function parseCountdownItemsSlot(
  value: unknown,
  model: CountdownItemsModel,
): CountdownItemsSlot {
  if (
    typeof value === "string" &&
    (COUNTDOWN_ITEMS_SLOTS as readonly string[]).includes(value)
  ) {
    return value as CountdownItemsSlot;
  }
  return defaultCountdownItemsSlot(model);
}

export function parseCountdownPdpSlot(
  value: unknown,
  model: CountdownPdpModel,
): CountdownPdpSlot {
  if (
    typeof value === "string" &&
    (COUNTDOWN_PDP_SLOTS as readonly string[]).includes(value)
  ) {
    return value as CountdownPdpSlot;
  }
  return defaultCountdownPdpSlot(model);
}
