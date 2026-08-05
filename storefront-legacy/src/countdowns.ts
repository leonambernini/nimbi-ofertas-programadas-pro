import {
  countdownLabel,
  formatCountdown,
  isOfferLive,
  msUntil,
  offerIncludesProduct,
  offerProgressPercent,
  resolveItemsModel,
  resolvePdpModel,
  themeCssVars,
} from "./offer-utils";
import {
  collectGridProducts,
  collectPdpAnchors,
  insertAround,
} from "./products";
import { imageCorner, isImageSlot, resolveItemsSlot, resolvePdpSlot } from "./slots";
import type { StorefrontOffer } from "./types";

const CD_ATTR = "data-ofertas-pro-cd";
const CD_OFFER_ATTR = "data-ofertas-pro-cd-offer";
const IMG_HOST_ATTR = "data-ofertas-pro-img-host";

function ensureImageOverlay(imageHost: HTMLElement, productId: number): HTMLElement {
  let host = imageHost.querySelector<HTMLElement>(
    `[${IMG_HOST_ATTR}="${productId}"]`,
  );
  if (!host) {
    host = document.createElement("div");
    host.className = "ofertas-pro-img-host";
    host.setAttribute(IMG_HOST_ATTR, String(productId));
    imageHost.appendChild(host);
  }
  return host;
}

function buildCountdownEl(
  offer: StorefrontOffer,
  kind: "items" | "pdp",
  productId: number,
): HTMLElement {
  const model =
    kind === "items" ? resolveItemsModel(offer) : resolvePdpModel(offer);
  const slot = kind === "items" ? resolveItemsSlot(offer) : resolvePdpSlot(offer);
  const label = countdownLabel(offer, 1, "Termina em");
  const time = formatCountdown(
    msUntil(offer.endsAt),
    Boolean(offer.showDaysOnCountdown),
  );
  const progress = offerProgressPercent(offer);

  const el = document.createElement("div");
  el.setAttribute(CD_ATTR, kind);
  el.setAttribute(CD_OFFER_ATTR, offer.id);
  el.setAttribute("data-product-id", String(productId));
  el.style.cssText = themeCssVars(offer.theme);

  if (isImageSlot(slot)) {
    const corner = imageCorner(slot);
    const cornerClass =
      corner === "tr"
        ? "ofertas-pro-cd--tr"
        : corner === "bl"
          ? "ofertas-pro-cd--bl"
          : corner === "br"
            ? "ofertas-pro-cd--br"
            : "ofertas-pro-cd--tl";

    const variant =
      model === "flash"
        ? "ofertas-pro-cd--flash"
        : model === "floating"
          ? "ofertas-pro-cd--floating"
          : "ofertas-pro-cd--badge";

    el.className = `ofertas-pro-cd ${variant} ${cornerClass}`;
    el.innerHTML = `<span class="ofertas-pro-cd__time" data-op-countdown="1">${time}</span>`;
    return el;
  }

  const blockClass =
    model === "bar"
      ? "ofertas-pro-cd--bar"
      : model === "hero"
        ? "ofertas-pro-cd--hero"
        : model === "progress"
          ? "ofertas-pro-cd--progress"
          : model === "banner"
            ? "ofertas-pro-cd--banner"
            : model === "urgency_box"
              ? "ofertas-pro-cd--urgency"
              : "ofertas-pro-cd--inline";

  el.className = `ofertas-pro-cd ${blockClass}`;
  const showProgress = model === "progress" || model === "bar" || model === "banner";
  el.innerHTML = [
    `<span class="ofertas-pro-cd__label">${escapeHtml(label)}</span>`,
    `<span class="ofertas-pro-cd__time" data-op-countdown="1">${time}</span>`,
    showProgress
      ? `<div class="ofertas-pro-cd__track"><div class="ofertas-pro-cd__fill" style="width:${Math.max(4, progress)}%"></div></div>`
      : "",
  ].join("");

  return el;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function placeGridCountdown(
  product: ReturnType<typeof collectGridProducts>[number],
  offer: StorefrontOffer,
): boolean {
  const slot = resolveItemsSlot(offer);
  const node = buildCountdownEl(offer, "items", product.productId);

  // Remove previous for this product
  product.root
    .querySelectorAll<HTMLElement>(`[${CD_ATTR}="items"][data-product-id="${product.productId}"]`)
    .forEach((el) => el.remove());

  if (isImageSlot(slot)) {
    if (!product.imageHost) return false;
    const overlay = ensureImageOverlay(product.imageHost, product.productId);
    overlay.querySelectorAll(`[${CD_ATTR}]`).forEach((el) => el.remove());
    overlay.appendChild(node);
    return true;
  }

  if (slot.includes("_name")) {
    const where = slot.startsWith("before_") ? "before" : "after";
    return insertAround(product.nameEl, node, where);
  }

  if (slot.includes("_price")) {
    const where = slot.startsWith("before_") ? "before" : "after";
    return insertAround(product.priceEl, node, where);
  }

  return false;
}

function placePdpCountdown(
  productId: number,
  offer: StorefrontOffer,
): boolean {
  const anchors = collectPdpAnchors(productId);
  const slot = resolvePdpSlot(offer);
  const node = buildCountdownEl(offer, "pdp", productId);

  document
    .querySelectorAll<HTMLElement>(`[${CD_ATTR}="pdp"]`)
    .forEach((el) => el.remove());

  if (isImageSlot(slot)) {
    const host = anchors.imageHosts[0];
    if (!host) return false;
    const overlay = ensureImageOverlay(host, productId);
    overlay.querySelectorAll(`[${CD_ATTR}]`).forEach((el) => el.remove());
    overlay.appendChild(node);
    return true;
  }

  if (slot.includes("_name")) {
    return insertAround(
      anchors.nameEl,
      node,
      slot.startsWith("before_") ? "before" : "after",
    );
  }
  if (slot.includes("_price")) {
    return insertAround(
      anchors.priceEl,
      node,
      slot.startsWith("before_") ? "before" : "after",
    );
  }
  if (slot.includes("payment_options")) {
    return insertAround(
      anchors.paymentEl || anchors.priceEl,
      node,
      slot.startsWith("before_") ? "before" : "after",
    );
  }
  if (slot.includes("add_to_cart")) {
    return insertAround(
      anchors.cartEl || anchors.priceEl,
      node,
      slot.startsWith("before_") ? "before" : "after",
    );
  }

  return false;
}

export function clearCountdowns(): void {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(`[${CD_ATTR}]`),
  )) {
    el.remove();
  }
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(`[${IMG_HOST_ATTR}]`),
  )) {
    if (!el.children.length) el.remove();
  }
}

export function renderGridCountdowns(offers: StorefrontOffer[]): number {
  const active = offers.filter((o) => o.showCountdownOnItems && isOfferLive(o));
  if (!active.length) {
    document
      .querySelectorAll<HTMLElement>(`[${CD_ATTR}="items"]`)
      .forEach((el) => el.remove());
    return 0;
  }

  let count = 0;
  for (const product of collectGridProducts()) {
    const offer = active.find((o) =>
      offerIncludesProduct(o, product.productId),
    );
    if (!offer) continue;
    if (placeGridCountdown(product, offer)) count += 1;
  }
  return count;
}

export function renderPdpCountdown(
  offers: StorefrontOffer[],
  productId: number | null,
): number {
  if (productId == null) {
    document
      .querySelectorAll<HTMLElement>(`[${CD_ATTR}="pdp"]`)
      .forEach((el) => el.remove());
    return 0;
  }

  const active = offers.filter((o) => o.showCountdownOnPdp && isOfferLive(o));
  const offer = active.find((o) => offerIncludesProduct(o, productId));
  if (!offer) {
    document
      .querySelectorAll<HTMLElement>(`[${CD_ATTR}="pdp"]`)
      .forEach((el) => el.remove());
    return 0;
  }

  return placePdpCountdown(productId, offer) ? 1 : 0;
}

export function tickCountdowns(offers: StorefrontOffer[]): void {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(`[${CD_ATTR}]`),
  )) {
    const offerId = el.getAttribute(CD_OFFER_ATTR);
    const offer = offers.find((o) => o.id === offerId);
    if (!offer || !isOfferLive(offer)) {
      el.remove();
      continue;
    }
    const time = el.querySelector<HTMLElement>("[data-op-countdown]");
    if (time) {
      time.textContent = formatCountdown(
        msUntil(offer.endsAt),
        Boolean(offer.showDaysOnCountdown),
      );
    }
    const fill = el.querySelector<HTMLElement>(".ofertas-pro-cd__fill");
    if (fill) {
      fill.style.width = `${Math.max(4, offerProgressPercent(offer))}%`;
    }
  }
}
