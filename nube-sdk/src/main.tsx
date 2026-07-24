import type { NubeSDK, NubeSDKState } from "@tiendanube/nube-sdk-types";
import {
  CountdownItems,
  CountdownPdp,
  OfferBanner,
} from "./components/OfferWidgets";
import { fetchStoreOffers } from "./lib/api";
import {
  GRID_COUNTDOWN_SLOTS,
  PDP_COUNTDOWN_SLOTS,
  resolveItemsSlot,
  resolvePdpSlot,
} from "./lib/offer-styles";
import {
  msUntil,
  offerIncludesProduct,
  type BannerSlot,
  type ShowcaseSlot,
  type StorefrontOffer,
} from "./lib/types";

const LOG = "[ofertas-pro]";
const TICK_MS = 1000;

console.log(`${LOG} script evaluated`, {
  href: typeof location !== "undefined" ? location.href : "(worker)",
});

type ProductLike = { id: number };

let cachedOffers: StorefrontOffer[] | null = null;
let loadingPromise: Promise<StorefrontOffer[]> | null = null;
let accessAllowed = true;
let tickTimer: ReturnType<typeof setInterval> | null = null;
let nubeRef: NubeSDK | null = null;

function isOfferLive(offer: StorefrontOffer) {
  return msUntil(offer.endsAt) > 0;
}

function needsCountdownTick(offers: StorefrontOffer[]) {
  return offers.some(
    (o) =>
      isOfferLive(o) &&
      (o.enableBanner || o.showCountdownOnItems || o.showCountdownOnPdp),
  );
}

async function loadOffers(
  storeId: number,
  options: { force?: boolean } = {},
): Promise<StorefrontOffer[]> {
  if (!options.force && cachedOffers && accessAllowed) return cachedOffers;
  if (loadingPromise) return loadingPromise;

  const promise = fetchStoreOffers(storeId)
    .then(({ offers, access }) => {
      if (access && !access.allowed) {
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

function collectProductsFromSections(
  sections: Array<{ products?: ProductLike[] }> | undefined,
): ProductLike[] {
  if (!sections?.length) return [];
  const map = new Map<number, ProductLike>();
  for (const section of sections) {
    for (const product of section.products ?? []) {
      if (product?.id != null) {
        map.set(Number(product.id), { id: Number(product.id) });
      }
    }
  }
  return [...map.values()];
}

function productsFromState(state: NubeSDKState): ProductLike[] {
  const page = state.location.page;

  if (page.type === "product") {
    const current = page.data?.product;
    const fromSections = collectProductsFromSections(page.data?.sections);
    const map = new Map<number, ProductLike>();
    if (current?.id != null) {
      map.set(Number(current.id), { id: Number(current.id) });
    }
    for (const p of fromSections) map.set(p.id, p);
    return [...map.values()];
  }

  if (page.type === "home") {
    return collectProductsFromSections(page.data?.sections);
  }

  const list = page.data?.products as ProductLike[] | undefined;
  return (list ?? []).map((p) => ({ id: Number(p.id) }));
}

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

/** Slots removidos da UI — limpar resíduos na loja. */
const RETIRED_BANNER_SLOTS = ["drawer_left", "drawer_right"] as const;
const SHOWCASE_SLOTS: ShowcaseSlot[] = [
  "before_main_content",
  "after_header",
  "before_section_products_sale",
  "after_section_products_sale",
  "before_section_products_featured",
  "after_section_products_featured",
  "before_footer",
];

function renderBanners(nube: NubeSDK, offers: StorefrontOffer[]) {
  for (const slot of RETIRED_BANNER_SLOTS) {
    nube.clearSlot(slot);
  }

  for (const slot of BANNER_SLOTS) {
    const list = offers.filter((o) => o.enableBanner && o.bannerSlot === slot);
    if (!list.length) {
      nube.clearSlot(slot);
      continue;
    }
    nube.render(
      slot,
      list.map((offer) => (
        <OfferBanner
          key={`b-${offer.id}`}
          keyId={`b-${offer.id}`}
          offer={offer}
        />
      )),
    );
  }
}

/** Vitrine desativada temporariamente — limpa slots e não renderiza. */
function renderShowcases(nube: NubeSDK, _offers: StorefrontOffer[]) {
  for (const slot of SHOWCASE_SLOTS) {
    // Não limpa slots que o banner também usa (renderBanners cuida).
    if ((BANNER_SLOTS as readonly string[]).includes(slot)) continue;
    nube.clearSlot(slot);
  }
}

function renderGridCountdowns(nube: NubeSDK, offers: StorefrontOffer[]) {
  const products = productsFromState(nube.getState());
  const active = offers.filter(
    (o) => o.showCountdownOnItems && isOfferLive(o),
  );

  for (const slot of GRID_COUNTDOWN_SLOTS) {
    const forSlot = active.filter((o) => resolveItemsSlot(o) === slot);

    if (!forSlot.length) {
      nube.clearSlot(slot);
      continue;
    }

    // Array concreto (não callback) para o tick atualizar o texto a cada segundo.
    const nodes = products.flatMap((product) => {
      const offer = forSlot.find((o) => offerIncludesProduct(o, product.id));
      if (!offer) return [];
      return [
        <CountdownItems key={product.id} keyId={product.id} offer={offer} />,
      ];
    });

    if (!nodes.length) {
      nube.clearSlot(slot);
      continue;
    }

    nube.render(slot, nodes);
  }
}

function renderPdpCountdown(nube: NubeSDK, offers: StorefrontOffer[]) {
  const state = nube.getState();
  const active = offers.filter((o) => o.showCountdownOnPdp && isOfferLive(o));

  for (const slot of PDP_COUNTDOWN_SLOTS) {
    const forSlot = active.filter((o) => resolvePdpSlot(o) === slot);

    if (!forSlot.length) {
      nube.clearSlot(slot);
      continue;
    }

    if (state.location.page.type !== "product") {
      nube.clearSlot(slot);
      continue;
    }

    const productId = Number(state.location.page.data?.product?.id);
    if (!productId) {
      nube.clearSlot(slot);
      continue;
    }

    const offer = forSlot.find((o) => offerIncludesProduct(o, productId));
    if (!offer) {
      nube.clearSlot(slot);
      continue;
    }

    nube.render(slot, [
      <CountdownPdp
        key={`pdp-${offer.id}`}
        keyId={`pdp-${offer.id}`}
        offer={offer}
      />,
    ]);
  }
}

/** Re-render dos slots de countdown (array concreto → texto atualiza a cada tick). */
function tickLiveUi(nube: NubeSDK, offers: StorefrontOffer[]) {
  renderBanners(nube, offers);
  renderGridCountdowns(nube, offers);
  renderPdpCountdown(nube, offers);
}

function stopTicker() {
  if (tickTimer == null) return;
  clearInterval(tickTimer);
  tickTimer = null;
}

function syncTicker(nube: NubeSDK) {
  const offers = cachedOffers ?? [];
  if (!needsCountdownTick(offers)) {
    stopTicker();
    return;
  }
  if (tickTimer != null) return;

  tickTimer = setInterval(() => {
    const current = cachedOffers ?? [];
    if (!needsCountdownTick(current)) {
      stopTicker();
      if (nubeRef) tickLiveUi(nubeRef, current);
      return;
    }
    tickLiveUi(nube, current);
  }, TICK_MS);
}

function mount(nube: NubeSDK, offers: StorefrontOffer[]) {
  renderBanners(nube, offers);
  renderShowcases(nube, offers);
  renderGridCountdowns(nube, offers);
  renderPdpCountdown(nube, offers);
  syncTicker(nube);
}

export function App(nube: NubeSDK) {
  nubeRef = nube;
  const storeId = nube.getState().store?.id;
  if (!storeId) {
    console.warn(`${LOG} missing store id`);
    return;
  }

  void loadOffers(Number(storeId)).then((offers) => {
    console.log(`${LOG} loaded offers`, offers.length);
    mount(nube, offers);
  });

  nube.on("location:updated", () => {
    void loadOffers(Number(storeId), { force: true }).then((offers) => {
      mount(nube, offers);
    });
  });
}
