import { resolveItemsModel, resolvePdpModel } from "./offer-utils";
import type {
  CountdownItemsModel,
  CountdownItemsSlot,
  CountdownPdpModel,
  CountdownPdpSlot,
  StorefrontOffer,
} from "./types";

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

function gridSlotForItemsModel(model: CountdownItemsModel): CountdownItemsSlot {
  if (model === "badge") return "product_grid_item_image_top_left";
  if (model === "flash") return "product_grid_item_image_bottom_left";
  return "after_product_grid_item_price";
}

function pdpSlotForModel(model: CountdownPdpModel): CountdownPdpSlot {
  if (model === "banner") return "before_product_detail_add_to_cart";
  if (model === "floating") return "product_detail_image_top_right";
  return "after_product_detail_price";
}

export function resolveItemsSlot(offer: StorefrontOffer): CountdownItemsSlot {
  const slot = offer.countdownItemsSlot;
  if (slot && (COUNTDOWN_ITEMS_SLOTS as readonly string[]).includes(slot)) {
    return slot;
  }
  return gridSlotForItemsModel(resolveItemsModel(offer));
}

export function resolvePdpSlot(offer: StorefrontOffer): CountdownPdpSlot {
  const slot = offer.countdownPdpSlot;
  if (slot && (COUNTDOWN_PDP_SLOTS as readonly string[]).includes(slot)) {
    return slot;
  }
  return pdpSlotForModel(resolvePdpModel(offer));
}

export function isImageSlot(slot: string): boolean {
  return (
    slot.includes("product_grid_item_image_") ||
    slot.includes("product_detail_image_")
  );
}

export function imageCorner(slot: string): "tl" | "tr" | "bl" | "br" {
  if (slot.endsWith("top_right")) return "tr";
  if (slot.endsWith("bottom_left")) return "bl";
  if (slot.endsWith("bottom_right")) return "br";
  return "tl";
}
