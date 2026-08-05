import type { PageKind } from "./types";

type LsLike = {
  store?: { id?: string | number };
  product?: { id?: string | number };
  category?: { id?: string | number };
};

declare global {
  interface Window {
    LS?: LsLike;
    __OFERTAS_PRO_FORCE_LEGACY__?: boolean;
    __OFERTAS_PRO_LEGACY_DISABLED__?: boolean;
  }
}

const LOG = "[ofertas-pro-legacy]";

export function shouldUseLegacy(): boolean {
  if (typeof window === "undefined") return false;

  if (window.__OFERTAS_PRO_LEGACY_DISABLED__) {
    console.info(`${LOG} disabled via __OFERTAS_PRO_LEGACY_DISABLED__`);
    return false;
  }

  if (window.__OFERTAS_PRO_FORCE_LEGACY__) {
    console.info(`${LOG} forced via __OFERTAS_PRO_FORCE_LEGACY__`);
    return true;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("ofertas_legacy") === "0") return false;
  if (params.get("ofertas_legacy") === "1") return true;

  const slotHint = document.querySelector(
    [
      '[data-slot*="product_grid_item_image"]',
      '[data-nube-slot*="product_grid_item_image"]',
      '[id*="product_grid_item_image"]',
      '[class*="product_grid_item_image"]',
      '[data-slot*="after_header"]',
      '[data-nube-slot*="after_header"]',
      '[data-slot*="before_main_content"]',
      '[data-nube-slot*="before_main_content"]',
    ].join(","),
  );

  if (slotHint) {
    console.info(`${LOG} NubeSDK slot host detected — skipping legacy`);
    return false;
  }

  return true;
}

export function resolveStoreId(): string | null {
  const fromLs = window.LS?.store?.id;
  if (fromLs != null && String(fromLs).trim()) return String(fromLs);

  try {
    const scripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>("script[src*='store=']"),
    );
    for (const script of scripts) {
      const match = (script.src || "").match(/[?&]store=(\d+)/);
      if (match?.[1]) return match[1];
    }
  } catch {
    // ignore
  }

  const fromQuery = new URLSearchParams(window.location.search).get("store");
  return fromQuery || null;
}

export function detectPageKind(): PageKind {
  if (window.LS?.product?.id != null) return "product";

  const path = window.location.pathname.toLowerCase();
  if (
    path.includes("/productos/") ||
    path.includes("/products/") ||
    path.includes("/produto/") ||
    document.body?.classList.contains("template-product") ||
    document.getElementById("single-product")
  ) {
    return "product";
  }

  if (
    window.LS?.category?.id != null ||
    path.includes("/categorias/") ||
    path.includes("/categories/") ||
    path.includes("/search") ||
    path.includes("/busca") ||
    document.querySelector(".js-item-product, [data-product-id]")
  ) {
    return "listing";
  }

  return "other";
}

export function currentProductId(): number | null {
  const id = window.LS?.product?.id;
  if (id == null) return null;
  const n = Number(id);
  return Number.isFinite(n) ? n : null;
}
