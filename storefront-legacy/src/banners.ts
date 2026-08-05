import {
  bannerLabel,
  bannerSpacingCss,
  formatCountdown,
  isBannerLinkUrl,
  isOfferLive,
  msUntil,
  resolveBannerAnimation,
  resolveBannerButtonPosition,
  resolveBannerModel,
  resolveBannerSpacing,
  resolveBannerTextAlign,
  themeCssVars,
} from "./offer-utils";
import type { BannerSlot, StorefrontOffer } from "./types";

const BANNER_ATTR = "data-ofertas-pro-banner";
const BANNER_SLOT_ATTR = "data-ofertas-pro-banner-slot";

const BANNER_SLOTS: BannerSlot[] = [
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

function findAnchor(slot: BannerSlot): {
  el: Element | null;
  where: "beforebegin" | "afterend" | "afterbegin" | "beforeend";
} {
  const header =
    document.querySelector("header, .js-header, #header, .header") ||
    document.querySelector(".js-head-main, .head-main");
  const main =
    document.querySelector("main, #main, .main-content, #content, .js-main-content") ||
    document.body;
  const footer = document.querySelector("footer, #footer, .js-footer, .footer");

  const sale =
    document.querySelector(
      '[data-section="products_sale"], .js-section-products-sale, #section-products-sale, .home-product-slider',
    ) || null;
  const featured =
    document.querySelector(
      '[data-section="products_featured"], .js-section-products-featured, #section-products-featured',
    ) || null;
  const newest =
    document.querySelector(
      '[data-section="products_new"], .js-section-products-new, #section-products-new',
    ) || null;

  switch (slot) {
    case "after_header":
      return { el: header, where: "afterend" };
    case "before_main_content":
      return { el: main, where: "beforebegin" };
    case "before_footer":
      return { el: footer || main, where: footer ? "beforebegin" : "beforeend" };
    case "before_section_products_sale":
      return { el: sale, where: "beforebegin" };
    case "after_section_products_sale":
      return { el: sale, where: "afterend" };
    case "before_section_products_featured":
      return { el: featured, where: "beforebegin" };
    case "after_section_products_featured":
      return { el: featured, where: "afterend" };
    case "before_section_products_new":
      return { el: newest, where: "beforebegin" };
    case "after_section_products_new":
      return { el: newest, where: "afterend" };
    default:
      return { el: main, where: "beforebegin" };
  }
}

function mountNode(slot: BannerSlot, node: HTMLElement): boolean {
  const existing = document.querySelector<HTMLElement>(
    `[${BANNER_SLOT_ATTR}="${slot}"]`,
  );
  if (existing) {
    existing.replaceWith(node);
    return true;
  }

  const { el, where } = findAnchor(slot);
  if (!el) return false;

  try {
    el.insertAdjacentElement(where, node);
    return true;
  } catch {
    // beforebegin on body-less edge cases
    if (el.parentElement) {
      if (where === "beforebegin") {
        el.parentElement.insertBefore(node, el);
        return true;
      }
      if (where === "afterend") {
        el.parentElement.insertBefore(node, el.nextSibling);
        return true;
      }
    }
    return false;
  }
}

function buildImageBanner(offer: StorefrontOffer): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "ofertas-pro-root ofertas-pro-banner__img";
  wrap.setAttribute(BANNER_ATTR, offer.id);
  wrap.style.cssText = [
    `margin-top:${bannerSpacingCss(resolveBannerSpacing(offer.bannerSpacingTop))}`,
    `margin-bottom:${bannerSpacingCss(resolveBannerSpacing(offer.bannerSpacingBottom))}`,
    themeCssVars(offer.theme),
  ].join(";");

  const img = document.createElement("img");
  img.src = offer.bannerImageUrl || "";
  img.alt = bannerLabel(offer, 1, offer.name || "Oferta");
  img.loading = "lazy";

  const linkUrl = offer.bannerLinkUrl?.trim() || "";
  if (isBannerLinkUrl(linkUrl)) {
    const a = document.createElement("a");
    a.href = linkUrl;
    a.appendChild(img);
    wrap.appendChild(a);
  } else {
    wrap.appendChild(img);
  }
  return wrap;
}

function buildCountdownBanner(offer: StorefrontOffer): HTMLElement {
  const model = resolveBannerModel(offer);
  const animation = resolveBannerAnimation(offer);
  const textAlign = resolveBannerTextAlign(offer);
  const buttonPosition = resolveBannerButtonPosition(offer);
  const text1 = bannerLabel(offer, 1, "Oferta por tempo limitado");
  const countdown = formatCountdown(
    msUntil(offer.endsAt),
    Boolean(offer.showDaysOnCountdown),
  );
  const buttonText =
    typeof offer.bannerButtonText === "string"
      ? offer.bannerButtonText.trim()
      : "";
  const buttonUrl = offer.bannerLinkUrl?.trim() || "";
  const linkEnabled =
    Boolean(offer.bannerShowButton) && isBannerLinkUrl(buttonUrl);
  const isFullLink = linkEnabled && buttonPosition === "full";
  const showPill = linkEnabled && buttonPosition !== "full" && Boolean(buttonText);

  const frame = document.createElement("div");
  frame.className = "ofertas-pro-root";
  frame.setAttribute(BANNER_ATTR, offer.id);
  frame.style.cssText = [
    `margin-top:${bannerSpacingCss(resolveBannerSpacing(offer.bannerSpacingTop))}`,
    `margin-bottom:${bannerSpacingCss(resolveBannerSpacing(offer.bannerSpacingBottom))}`,
  ].join(";");

  const outer = document.createElement("div");
  outer.className = [
    "ofertas-pro-banner",
    animation !== "none" ? `ofertas-pro-banner--${animation}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const baseBg =
    model === "strip"
      ? "var(--op-countdown-bg)"
      : model === "soft"
        ? "var(--op-secondary)"
        : "var(--op-primary)";
  const color =
    model === "strip"
      ? "var(--op-countdown-text)"
      : model === "soft"
        ? "var(--op-text)"
        : "var(--op-on-primary)";

  const styles: string[] = [
    themeCssVars(offer.theme),
    `background:${baseBg}`,
    `color:${color}`,
  ];
  if (offer.bannerContainer) {
    styles.push("max-width:1200px", "margin-left:auto", "margin-right:auto");
  }
  if (model === "soft" || model === "solid" || model === "urgent") {
    styles.push("border-radius:var(--op-radius)");
  }
  if (model === "urgent" && animation !== "shine") {
    styles.push(
      "background-image:linear-gradient(90deg,#9F1239 0%,var(--op-primary) 100%)",
    );
  }
  if (animation === "shine") {
    styles.push(
      `background-image:linear-gradient(110deg,${baseBg} 0%,${baseBg} 40%,rgba(255,255,255,.22) 50%,${baseBg} 60%,${baseBg} 100%)`,
      "background-size:200% 100%",
    );
  }
  outer.style.cssText = styles.join(";");

  if (isFullLink) {
    const full = document.createElement("a");
    full.className = "ofertas-pro-banner__full-link";
    full.href = buttonUrl;
    full.setAttribute("aria-label", text1);
    outer.appendChild(full);
  }

  const inner = document.createElement("div");
  inner.className = "ofertas-pro-banner__inner";
  inner.style.justifyContent =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
        ? "flex-end"
        : "center";

  const makeBtn = () => {
    const a = document.createElement("a");
    a.className = "ofertas-pro-banner__btn";
    a.href = buttonUrl;
    a.textContent = buttonText;
    a.style.cssText =
      model === "urgent"
        ? "background:rgba(255,255,255,.95);color:var(--op-primary);"
        : "background:var(--op-btn);color:var(--op-on-primary);";
    if (buttonPosition === "after" && textAlign === "left") {
      a.style.marginLeft = "auto";
    }
    if (buttonPosition === "before" && textAlign === "right") {
      a.style.marginRight = "auto";
    }
    return a;
  };

  if (showPill && buttonPosition === "before") inner.appendChild(makeBtn());

  const label = document.createElement("div");
  label.className =
    model === "strip" || model === "urgent"
      ? "ofertas-pro-banner__label ofertas-pro-banner__label--caps"
      : "ofertas-pro-banner__label";
  label.style.color =
    model === "strip" || model === "soft"
      ? "var(--op-primary)"
      : "var(--op-on-primary)";
  label.textContent = text1;
  inner.appendChild(label);

  const time = document.createElement("div");
  time.className = [
    "ofertas-pro-banner__time",
    model === "strip" ? "ofertas-pro-banner__time--large" : "",
    model === "urgent" ? "ofertas-pro-banner__time--urgent" : "",
  ]
    .filter(Boolean)
    .join(" ");
  time.setAttribute("data-op-countdown", "1");
  if (model !== "strip" && model !== "urgent") {
    time.style.background =
      model === "soft" ? "transparent" : "var(--op-countdown-bg)";
    time.style.color =
      model === "soft" ? "var(--op-primary)" : "var(--op-countdown-text)";
  } else if (model === "strip") {
    time.style.color = "var(--op-countdown-text)";
  } else {
    time.style.color = "var(--op-on-primary)";
  }
  time.textContent = countdown;
  inner.appendChild(time);

  if (showPill && buttonPosition === "after") inner.appendChild(makeBtn());

  outer.appendChild(inner);
  frame.appendChild(outer);
  return frame;
}

function buildBanner(offer: StorefrontOffer): HTMLElement | null {
  if (!offer.enableBanner || !isOfferLive(offer)) return null;

  if (offer.bannerType === "image" && offer.bannerImageUrl) {
    return buildImageBanner(offer);
  }

  // countdown_bar (default) + image sem URL caem no banner de cronômetro
  return buildCountdownBanner(offer);
}

export function clearBanners(): void {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(`[${BANNER_ATTR}]`),
  )) {
    el.remove();
  }
}

export function renderBanners(offers: StorefrontOffer[]): number {
  let count = 0;

  for (const slot of BANNER_SLOTS) {
    const list = offers.filter(
      (o) => o.enableBanner && o.bannerSlot === slot && isOfferLive(o),
    );
    const existing = document.querySelector<HTMLElement>(
      `[${BANNER_SLOT_ATTR}="${slot}"]`,
    );

    if (!list.length) {
      existing?.remove();
      continue;
    }

    // Um banner por slot (primeiro da lista), como prioridade simples
    const offer = list[0];
    const node = buildBanner(offer);
    if (!node) {
      existing?.remove();
      continue;
    }
    node.setAttribute(BANNER_SLOT_ATTR, slot);
    if (mountNode(slot, node)) count += 1;
  }

  return count;
}

/** Atualiza apenas textos de countdown nos banners já montados. */
export function tickBanners(offers: StorefrontOffer[]): void {
  for (const el of Array.from(
    document.querySelectorAll<HTMLElement>(`[${BANNER_ATTR}]`),
  )) {
    const id = el.getAttribute(BANNER_ATTR);
    const offer = offers.find((o) => o.id === id);
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
  }
}
