import type { StorefrontOffer } from "./types";

declare const __OFERTAS_API_BASE__: string;

const API_BASE =
  typeof __OFERTAS_API_BASE__ !== "undefined"
    ? __OFERTAS_API_BASE__
    : "http://localhost:3000";

export type StorefrontAccess = {
  allowed: boolean;
  reason: string;
};

export async function fetchStoreOffers(storeId: number): Promise<{
  offers: StorefrontOffer[];
  access: StorefrontAccess | null;
}> {
  const url = `${API_BASE}/api/v1/storefront/offers?store_id=${storeId}`;
  console.log("[ofertas-pro] fetching offers", url);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[ofertas-pro] offers fetch failed", response.status);
      return { offers: [], access: null };
    }
    const data = (await response.json()) as {
      offers?: StorefrontOffer[];
      access?: StorefrontAccess;
    };
    return {
      offers: Array.isArray(data.offers) ? data.offers : [],
      access: data.access ?? null,
    };
  } catch (error) {
    console.error("[ofertas-pro] offers fetch error", error);
    return { offers: [], access: null };
  }
}
