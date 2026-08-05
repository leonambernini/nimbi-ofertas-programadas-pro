import { clearBanners, renderBanners, tickBanners } from "./banners";
import {
  clearCountdowns,
  renderGridCountdowns,
  renderPdpCountdown,
  tickCountdowns,
} from "./countdowns";
import { currentProductId, detectPageKind } from "./detect";
import { isOfferLive } from "./offer-utils";
import { ensureStylesInjected } from "./style";
import type { StorefrontOffer } from "./types";

export function clearAll(): void {
  clearBanners();
  clearCountdowns();
}

export function renderAll(offers: StorefrontOffer[]): {
  banners: number;
  grid: number;
  pdp: number;
} {
  ensureStylesInjected();
  const live = offers.filter((o) => isOfferLive(o));
  const page = detectPageKind();
  const productId = page === "product" ? currentProductId() : null;

  const banners = renderBanners(live);
  const grid = renderGridCountdowns(live);
  const pdp = renderPdpCountdown(live, productId);

  return { banners, grid, pdp };
}

export function tickAll(offers: StorefrontOffer[]): void {
  tickBanners(offers);
  tickCountdowns(offers);
}
