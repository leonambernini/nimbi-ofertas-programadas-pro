"use client";

import { getSessionToken } from "@tiendanube/nexo";
import { getNexoClient } from "@/lib/nexo";
import type {
  ApiCategory,
  ApiOfferGroup,
  ApiProduct,
  ApiStorePage,
  OfferGroupPayload,
  SubscriptionInfo,
} from "@/lib/types";

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code?: string,
    message?: string,
  ) {
    super(message ?? code ?? `HTTP ${status}`);
    this.name = "AdminApiError";
  }
}

async function sessionToken(): Promise<string | null> {
  try {
    const token = await Promise.race<string | null>([
      getSessionToken(getNexoClient()),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    return token || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await sessionToken();

  const response = await fetch(`/api/v1${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw new AdminApiError(response.status, body?.error, body?.message);
  }

  return body as T;
}

export type ListOffersParams = {
  q?: string;
  enabled?: "all" | "active" | "inactive";
  status?: string;
  date?: string;
  sortBy?: "status" | "enabled" | "startsAt";
  page?: number;
  pageSize?: number;
};

export type ListOffersResponse = {
  offers: ApiOfferGroup[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function listOffers(
  params: ListOffersParams = {},
): Promise<ListOffersResponse> {
  const search = new URLSearchParams();
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.enabled && params.enabled !== "all") {
    search.set("enabled", params.enabled);
  }
  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }
  if (params.date) search.set("date", params.date);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const query = search.toString();
  return request<ListOffersResponse>(
    query ? `/offers?${query}` : "/offers",
  );
}

export async function getOffer(id: string): Promise<ApiOfferGroup> {
  const { offer } = await request<{ offer: ApiOfferGroup }>(`/offers/${id}`);
  return offer;
}

export async function createOffer(
  payload: OfferGroupPayload,
): Promise<{
  offer: ApiOfferGroup;
  pricesAppliedNow?: boolean;
  pricesApplyOk?: boolean;
}> {
  return request("/offers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOffer(
  id: string,
  payload: OfferGroupPayload,
): Promise<{
  offer: ApiOfferGroup;
  pricesAppliedNow?: boolean;
  pricesApplyOk?: boolean;
}> {
  return request(`/offers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function patchOffer(
  id: string,
  payload: Partial<Pick<OfferGroupPayload, "enabled">>,
): Promise<ApiOfferGroup> {
  const { offer } = await request<{ offer: ApiOfferGroup }>(`/offers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return offer;
}

export function deleteOffer(id: string): Promise<{ ok: true }> {
  return request(`/offers/${id}`, { method: "DELETE" });
}

export function listProducts(params?: {
  q?: string;
  page?: number;
  ids?: number[];
  categoryId?: number;
  variants?: boolean;
}): Promise<ApiProduct[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.ids?.length) search.set("ids", params.ids.join(","));
  if (params?.categoryId) search.set("category_id", String(params.categoryId));
  if (params?.variants) search.set("variants", "1");
  search.set("page", String(params?.page ?? 1));
  return request<ApiProduct[]>(`/products?${search.toString()}`);
}

export function listCategories(): Promise<ApiCategory[]> {
  return request<ApiCategory[]>("/categories");
}

export function listStorePages(): Promise<ApiStorePage[]> {
  return request<ApiStorePage[]>("/pages");
}

export async function uploadOfferImage(
  file: File,
  replaceUrl?: string | null,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  if (replaceUrl) form.append("replaceUrl", replaceUrl);
  const { url } = await request<{ url: string }>("/uploads", {
    method: "POST",
    body: form,
  });
  return url;
}

export function getSubscription(): Promise<SubscriptionInfo> {
  return request<SubscriptionInfo>("/subscription");
}

export function getMe(): Promise<{
  storeId: string;
  storeName: string | null;
  language: string;
  subscriptionStatus: string;
  nextExecution: string | null;
  hasAccess: boolean;
  blocked: boolean;
}> {
  return request("/me");
}

export function ensureWebhooks(): Promise<{ ok?: boolean }> {
  return request("/webhooks/ensure", { method: "POST" });
}
