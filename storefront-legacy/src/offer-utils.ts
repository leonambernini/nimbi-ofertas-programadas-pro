import type {
  BannerAnimation,
  BannerButtonPosition,
  BannerModel,
  BannerSpacing,
  BannerTextAlign,
  CountdownItemsModel,
  CountdownPdpModel,
  StorefrontOffer,
} from "./types";

const BANNER_SPACING_PX: Record<BannerSpacing, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
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

export function isOfferLive(offer: StorefrontOffer, now = Date.now()): boolean {
  return msUntil(offer.endsAt, now) > 0;
}

export function formatCountdown(ms: number, showDays = true): string {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
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

export function offerProgressPercent(offer: StorefrontOffer, now = Date.now()) {
  const start = new Date(offer.startsAt).getTime();
  const end = new Date(offer.endsAt).getTime();
  if (!(end > start)) return 100;
  const ratio = (now - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
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

export function resolveBannerAnimation(offer: StorefrontOffer): BannerAnimation {
  const a = offer.bannerAnimation;
  if (a === "pulse" || a === "shine" || a === "slide" || a === "none") return a;
  return "none";
}

export function resolveBannerTextAlign(offer: StorefrontOffer): BannerTextAlign {
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
  if (n === 0 || n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n;
  return 0;
}

export function bannerSpacingCss(value: BannerSpacing): string {
  return `${BANNER_SPACING_PX[value]}px`;
}

export function bannerLabel(
  offer: StorefrontOffer,
  which: 1 | 2,
  fallback: string,
): string {
  if (which === 1) {
    const t1 =
      typeof offer.bannerText1 === "string" ? offer.bannerText1.trim() : "";
    if (t1) return t1;
    const legacy =
      typeof offer.bannerTitle === "string" ? offer.bannerTitle.trim() : "";
    return legacy || fallback;
  }
  const t2 =
    typeof offer.bannerText2 === "string" ? offer.bannerText2.trim() : "";
  return t2 || fallback;
}

export function isBannerLinkUrl(
  value: string | null | undefined,
): value is string {
  if (!value) return false;
  const url = value.trim();
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (url.startsWith("/") || url.startsWith("./") || url.startsWith("../")) {
    return true;
  }
  return false;
}

export function themeCssVars(theme: StorefrontOffer["theme"]): string {
  return [
    `--op-primary:${theme.primaryColor}`,
    `--op-secondary:${theme.secondaryColor}`,
    `--op-bg:${theme.backgroundColor}`,
    `--op-text:${theme.textColor}`,
    `--op-accent:${theme.accentColor}`,
    `--op-btn:${theme.buttonColor}`,
    `--op-on-primary:${theme.buttonTextColor}`,
    `--op-countdown-bg:${theme.countdownBg}`,
    `--op-countdown-text:${theme.countdownText}`,
    `--op-radius:${theme.borderRadius}px`,
    `--op-radius-sm:${Math.max(4, theme.borderRadius / 2)}px`,
  ].join(";");
}
