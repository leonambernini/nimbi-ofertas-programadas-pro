const GRID_ITEM_SELECTORS = [
  ".js-item-product[data-product-id]",
  ".js-product-container[data-product-id]",
  "[data-product-id].js-item-product",
  ".item[data-product-id]",
  "article[data-product-id]",
].join(",");

const GRID_IMAGE_SELECTORS = [
  ".js-item-image",
  ".js-product-image",
  ".item-image",
  ".product-item-image",
  "a.js-item-link",
].join(",");

const GRID_NAME_SELECTORS = ".js-item-name, .item-name, .js-product-name, h2 a, .product-title";
const GRID_PRICE_SELECTORS =
  ".js-price-display, .js-item-price, .item-price, .js-product-price, .price-display, .price";

const PDP_IMAGE_SELECTORS = [
  "#product-slider .js-product-slide:not(.swiper-slide-duplicate) .js-product-slide-img",
  ".js-product-image",
  "#single-product .js-product-image",
  ".js-product-slide-img",
  ".product-image",
].join(",");

const PDP_NAME_SELECTORS =
  "#single-product .js-product-name, .js-product-name, h1.product-name, .product-title, h1[itemprop='name']";
const PDP_PRICE_SELECTORS =
  "#single-product .js-price-display, .js-price-display, .js-product-price, .price-container, [itemprop='price']";
const PDP_PAYMENT_SELECTORS =
  ".js-product-payments, .js-installments-container, .product-payments, .installments";
const PDP_CART_SELECTORS =
  ".js-product-form .js-addtocart, .js-addtocart, form[action*='cart'] .btn, #product_form .btn-add-to-cart, .js-product-buy-button";

export type GridProductNode = {
  productId: number;
  root: HTMLElement;
  imageHost: HTMLElement | null;
  nameEl: HTMLElement | null;
  priceEl: HTMLElement | null;
};

function parseProductId(value: string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function ensureRelative(el: HTMLElement): void {
  const pos = window.getComputedStyle(el).position;
  if (pos === "static") el.style.position = "relative";
}

function resolveImageHost(imageEl: Element): HTMLElement | null {
  if (!(imageEl instanceof HTMLElement)) return null;
  const wrapper = imageEl.closest<HTMLElement>(
    ".js-item-image, .js-product-image, .item-image, .js-image-container, .product-image, .js-product-slide, figure, .image",
  );
  if (wrapper) return wrapper;
  if (imageEl.tagName === "IMG") {
    return imageEl.parentElement instanceof HTMLElement
      ? imageEl.parentElement
      : imageEl;
  }
  return imageEl;
}

export function collectGridProducts(): GridProductNode[] {
  const items = Array.from(document.querySelectorAll(GRID_ITEM_SELECTORS));
  const result: GridProductNode[] = [];
  const seen = new Set<number>();

  for (const item of items) {
    if (!(item instanceof HTMLElement)) continue;
    const productId = parseProductId(item.getAttribute("data-product-id"));
    if (productId == null || seen.has(productId)) continue;
    seen.add(productId);

    const imgCandidate =
      item.querySelector(GRID_IMAGE_SELECTORS) || item.querySelector("img");
    const imageHost = imgCandidate ? resolveImageHost(imgCandidate) : null;
    if (imageHost) ensureRelative(imageHost);

    result.push({
      productId,
      root: item,
      imageHost,
      nameEl: item.querySelector<HTMLElement>(GRID_NAME_SELECTORS),
      priceEl: item.querySelector<HTMLElement>(GRID_PRICE_SELECTORS),
    });
  }

  return result;
}

export function collectPdpAnchors(productId: number): {
  productId: number;
  imageHosts: HTMLElement[];
  nameEl: HTMLElement | null;
  priceEl: HTMLElement | null;
  paymentEl: HTMLElement | null;
  cartEl: HTMLElement | null;
} {
  const imageHosts: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  for (const node of Array.from(document.querySelectorAll(PDP_IMAGE_SELECTORS))) {
    const host = resolveImageHost(node);
    if (!host || seen.has(host)) continue;
    const rect = host.getBoundingClientRect();
    if (rect.width > 0 && rect.width < 80) continue;
    ensureRelative(host);
    seen.add(host);
    imageHosts.push(host);
  }

  return {
    productId,
    imageHosts,
    nameEl: document.querySelector<HTMLElement>(PDP_NAME_SELECTORS),
    priceEl: document.querySelector<HTMLElement>(PDP_PRICE_SELECTORS),
    paymentEl: document.querySelector<HTMLElement>(PDP_PAYMENT_SELECTORS),
    cartEl: document.querySelector<HTMLElement>(PDP_CART_SELECTORS),
  };
}

export function insertAround(
  anchor: HTMLElement | null,
  node: HTMLElement,
  where: "before" | "after",
): boolean {
  if (!anchor || !anchor.parentNode) return false;
  if (where === "before") {
    anchor.parentNode.insertBefore(node, anchor);
  } else {
    anchor.parentNode.insertBefore(node, anchor.nextSibling);
  }
  return true;
}
