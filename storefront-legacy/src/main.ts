import { fetchStoreOffers } from "./api";
import {
  detectPageKind,
  resolveStoreId,
  shouldUseLegacy,
} from "./detect";
import { isOfferLive } from "./offer-utils";
import { clearAll, renderAll, tickAll } from "./render";
import type { StorefrontOffer } from "./types";

const LOG = "[ofertas-pro-legacy]";
const TICK_MS = 1000;
const OBSERVE_DEBOUNCE_MS = 250;

let cachedOffers: StorefrontOffer[] | null = null;
let accessAllowed = true;
let loadingPromise: Promise<StorefrontOffer[]> | null = null;
let started = false;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let observer: MutationObserver | null = null;

function needsTick(offers: StorefrontOffer[]): boolean {
  return offers.some(
    (o) =>
      isOfferLive(o) &&
      (o.enableBanner || o.showCountdownOnItems || o.showCountdownOnPdp),
  );
}

async function loadOffers(
  storeId: string,
  options: { force?: boolean } = {},
): Promise<StorefrontOffer[]> {
  if (!options.force && cachedOffers && accessAllowed) return cachedOffers;
  if (loadingPromise) return loadingPromise;

  const promise = fetchStoreOffers(storeId)
    .then(({ offers, access }) => {
      if (access && !access.allowed) {
        console.warn(`${LOG} storefront blocked by subscription`, access);
        accessAllowed = false;
        cachedOffers = [];
        return [];
      }
      accessAllowed = true;
      cachedOffers = offers;
      return offers;
    })
    .finally(() => {
      loadingPromise = null;
    });

  loadingPromise = promise;
  return promise;
}

function stopTicker(): void {
  if (tickTimer == null) return;
  clearInterval(tickTimer);
  tickTimer = null;
}

function syncTicker(): void {
  const offers = cachedOffers ?? [];
  if (!needsTick(offers)) {
    stopTicker();
    return;
  }
  if (tickTimer != null) return;

  tickTimer = setInterval(() => {
    const current = cachedOffers ?? [];
    if (!needsTick(current)) {
      stopTicker();
      tickAll(current);
      return;
    }
    tickAll(current);
  }, TICK_MS);
}

function mount(offers: StorefrontOffer[]): void {
  if (!accessAllowed) {
    clearAll();
    stopTicker();
    return;
  }

  if (!offers.length) {
    clearAll();
    stopTicker();
    console.info(`${LOG} no active offers`);
    return;
  }

  const stats = renderAll(offers);
  syncTicker();
  console.info(`${LOG} rendered`, {
    page: detectPageKind(),
    ...stats,
    offers: offers.length,
  });
}

function scheduleRemount(storeId: string): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void loadOffers(storeId).then(mount);
  }, OBSERVE_DEBOUNCE_MS);
}

function watchDom(storeId: string): void {
  if (observer || typeof MutationObserver === "undefined") return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      const nodes = [
        ...Array.from(mutation.addedNodes),
        ...Array.from(mutation.removedNodes),
      ];
      const relevant = nodes.some((node) => {
        if (!(node instanceof HTMLElement)) return false;
        if (
          node.classList?.contains("ofertas-pro-root") ||
          node.classList?.contains("ofertas-pro-cd") ||
          node.classList?.contains("ofertas-pro-banner") ||
          node.classList?.contains("ofertas-pro-img-host") ||
          node.closest?.(
            ".ofertas-pro-root, .ofertas-pro-cd, .ofertas-pro-img-host",
          )
        ) {
          return false;
        }
        return Boolean(
          node.matches?.(
            ".js-item-product, [data-product-id], .js-item-image, .js-product-image, .js-price-display",
          ) ||
            node.querySelector?.(
              ".js-item-product, [data-product-id], .js-item-image, .js-price-display",
            ),
        );
      });
      if (relevant) {
        scheduleRemount(storeId);
        return;
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function bindNavigation(storeId: string): void {
  const onNav = () => {
    void loadOffers(storeId, { force: true }).then(mount);
  };

  window.addEventListener("popstate", onNav);
  const originalPush = history.pushState.bind(history);
  const originalReplace = history.replaceState.bind(history);
  history.pushState = function (...args) {
    originalPush(...args);
    onNav();
  };
  history.replaceState = function (...args) {
    originalReplace(...args);
    onNav();
  };
}

function boot(): void {
  if (started) return;
  started = true;

  console.info(`${LOG} boot`, {
    href: typeof location !== "undefined" ? location.href : "",
  });

  if (!shouldUseLegacy()) return;

  const storeId = resolveStoreId();
  if (!storeId) {
    console.error(`${LOG} store id unavailable (LS.store.id / ?store=)`);
    return;
  }

  console.info(`${LOG} store`, storeId, "page", detectPageKind());

  void loadOffers(storeId)
    .then((offers) => {
      mount(offers);
      watchDom(storeId);
      bindNavigation(storeId);
    })
    .catch((error) => {
      console.error(`${LOG} boot failed`, error);
    });
}

(function bootstrap() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
