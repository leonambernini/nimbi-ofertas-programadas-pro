import { env } from "@/lib/env";

const BASE_URL = "https://api.tiendanube.com";

type ApiVersion = "v1" | "unstable" | "2025-03";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  version?: ApiVersion;
  query?: Record<string, string | number | boolean | undefined>;
};

export class NuvemshopApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super(`Nuvemshop API error ${status}: ${responseBody}`);
    this.name = "NuvemshopApiError";
  }
}

const lastRequestAtByStore = new Map<string, number>();

async function throttle(storeId: string): Promise<void> {
  const minIntervalMs = env.nuvemshopApiRateLimitMs();
  const last = lastRequestAtByStore.get(storeId) ?? 0;
  const elapsed = Date.now() - last;
  if (elapsed < minIntervalMs) {
    await new Promise((resolve) =>
      setTimeout(resolve, minIntervalMs - elapsed),
    );
  }
  lastRequestAtByStore.set(storeId, Date.now());
}

export async function nuvemshopRequest<T>(
  storeId: string,
  accessToken: string,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, version = "v1", query } = options;

  const url = new URL(`${BASE_URL}/${version}/${storeId}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  await throttle(storeId);

  const response = await fetch(url, {
    method,
    headers: {
      Authentication: `bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "Ofertas Pro (ofertaspro@nuvemshop.com)",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    console.error("[nuvemshop] request failed", {
      method,
      url: url.toString(),
      status: response.status,
      bodyPreview: text.slice(0, 500),
    });
    throw new NuvemshopApiError(response.status, text);
  }

  if (method !== "GET") {
    console.info("[nuvemshop] request ok", {
      method,
      url: url.toString(),
      status: response.status,
      bodyPreview: text.slice(0, 300),
    });
  }

  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type NuvemshopStore = {
  id: number;
  name: string | Record<string, string>;
  email?: string;
  original_domain?: string;
  main_language?: string;
  country?: string;
  main_currency?: string;
};

/** Nome/campo i18n da API → string (pt → es → en → primeiro valor). */
export function localizeField(
  value: string | Record<string, string> | null | undefined,
  language = "pt",
): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  return (
    value[language] ??
    value.pt ??
    value.es ??
    value.en ??
    Object.values(value)[0] ??
    null
  );
}

export type NuvemshopVariant = {
  id: number;
  product_id?: number;
  price?: string | number | null;
  promotional_price?: string | number | null;
  sku?: string | null;
  values?: Array<string | Record<string, string>>;
  image_id?: number | null;
};

export type NuvemshopProduct = {
  id: number;
  name: Record<string, string> | string;
  images?: Array<{ id: number; src: string; position: number }>;
  published?: boolean;
  variants?: NuvemshopVariant[];
  categories?: Array<number | { id: number }>;
};

export type NuvemshopCategory = {
  id: number;
  name: Record<string, string> | string;
  parent?: number | null;
};

export type NuvemshopPage = {
  id: number;
  name?: string | Record<string, string>;
  title?: string | Record<string, string>;
  handle?: string | Record<string, string>;
  content?: string | Record<string, string>;
  published?: boolean;
};

export async function fetchStore(
  storeId: string,
  accessToken: string,
): Promise<NuvemshopStore> {
  return nuvemshopRequest<NuvemshopStore>(storeId, accessToken, "/store");
}

export async function listProducts(
  storeId: string,
  accessToken: string,
  query?: {
    q?: string;
    ids?: number[];
    category_id?: number;
    page?: number;
    per_page?: number;
  },
): Promise<NuvemshopProduct[]> {
  return nuvemshopRequest<NuvemshopProduct[]>(
    storeId,
    accessToken,
    "/products",
    {
      query: {
        q: query?.q,
        ids: query?.ids?.length ? query.ids.join(",") : undefined,
        category_id: query?.category_id,
        page: query?.page ?? 1,
        per_page: query?.per_page ?? 50,
      },
    },
  );
}

export async function listCategories(
  storeId: string,
  accessToken: string,
  query?: { page?: number; per_page?: number },
): Promise<NuvemshopCategory[]> {
  return nuvemshopRequest<NuvemshopCategory[]>(
    storeId,
    accessToken,
    "/categories",
    {
      query: {
        page: query?.page ?? 1,
        per_page: query?.per_page ?? 200,
      },
    },
  );
}

export async function patchStockPrice(
  storeId: string,
  accessToken: string,
  payload: Array<{
    id: number;
    variants: Array<{
      id: number;
      price?: string | number;
      promotional_price?: string | number | null;
    }>;
  }>,
): Promise<unknown> {
  return nuvemshopRequest(storeId, accessToken, "/products/stock-price", {
    method: "PATCH",
    body: payload,
  });
}

/**
 * Atualiza variantes de um produto (inclui promotional_price).
 * stock-price NÃO aceita promotional_price — use este endpoint.
 */
export async function patchProductVariants(
  storeId: string,
  accessToken: string,
  productId: number,
  variants: Array<{
    id: number;
    price?: string | number | null;
    promotional_price?: string | number | null;
  }>,
): Promise<unknown> {
  console.info("[nuvemshop] PATCH variants", {
    storeId,
    productId,
    variantCount: variants.length,
    sample: variants.slice(0, 3),
  });
  return nuvemshopRequest(
    storeId,
    accessToken,
    `/products/${productId}/variants`,
    {
      method: "PATCH",
      body: variants,
    },
  );
}

/** Pages API exists only since API version 2025-03. */
const PAGES_API_VERSION = "2025-03" as const;

function pageLocaleKey(language?: string | null): string {
  const lang = (language || "pt").toLowerCase();
  if (lang.includes("_")) return lang;
  if (lang.startsWith("pt")) return "pt_BR";
  if (lang.startsWith("es")) return "es_AR";
  if (lang.startsWith("en")) return "en_US";
  return "pt_BR";
}

export async function listPages(
  storeId: string,
  accessToken: string,
  query?: { page?: number; per_page?: number; all?: boolean },
): Promise<NuvemshopPage[]> {
  // API 2025-03: per_page must be < 20
  const perPage = Math.min(Math.max(query?.per_page ?? 19, 1), 19);
  const fetchPage = async (page: number) => {
    const response = await nuvemshopRequest<
      | NuvemshopPage[]
      | {
          pages?: {
            results?: NuvemshopPage[];
            lastPage?: number;
            last_page?: number;
          };
          results?: NuvemshopPage[];
        }
    >(storeId, accessToken, "/pages", {
      version: PAGES_API_VERSION,
      query: {
        page,
        per_page: perPage,
      },
    });

    if (Array.isArray(response)) {
      return { results: response, lastPage: 1 };
    }
    const results =
      response?.pages?.results ?? response?.results ?? [];
    const lastPage =
      response?.pages?.lastPage ?? response?.pages?.last_page ?? 1;
    return { results, lastPage };
  };

  if (!query?.all) {
    const { results } = await fetchPage(query?.page ?? 1);
    return results;
  }

  const collected: NuvemshopPage[] = [];
  let page = 1;
  let lastPage = 1;
  do {
    const batch = await fetchPage(page);
    collected.push(...batch.results);
    lastPage = batch.lastPage;
    page += 1;
  } while (page <= lastPage && page <= 50);

  return collected;
}

export async function createPage(
  storeId: string,
  accessToken: string,
  body: {
    title: string;
    content: string;
    handle?: string;
    published?: boolean;
    language?: string | null;
  },
): Promise<NuvemshopPage> {
  const locale = pageLocaleKey(body.language);
  return nuvemshopRequest<NuvemshopPage>(storeId, accessToken, "/pages", {
    method: "POST",
    version: PAGES_API_VERSION,
    body: {
      page: {
        publish: body.published ?? true,
        i18n: {
          [locale]: {
            title: body.title,
            content: body.content,
            seo_handle: body.handle,
            seo_title: body.title,
            seo_description: "",
          },
        },
      },
    },
  });
}

export async function updatePage(
  storeId: string,
  accessToken: string,
  pageId: number,
  body: {
    title?: string;
    content?: string;
    handle?: string;
    published?: boolean;
  },
): Promise<NuvemshopPage> {
  return nuvemshopRequest<NuvemshopPage>(
    storeId,
    accessToken,
    `/pages/${pageId}`,
    {
      method: "PUT",
      version: PAGES_API_VERSION,
      body: {
        title: body.title,
        content: body.content,
        handle: body.handle,
        published: body.published,
      },
    },
  );
}

export async function deletePage(
  storeId: string,
  accessToken: string,
  pageId: number,
): Promise<void> {
  await nuvemshopRequest(storeId, accessToken, `/pages/${pageId}`, {
    method: "DELETE",
    version: PAGES_API_VERSION,
  });
}

export function parseMoney(value: string | number | null | undefined): number {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export type NuvemshopSubscription = {
  external_reference?: string;
  description?: string;
  recurring_frequency?: string;
  recurring_interval?: number;
  amount_currency?: string;
  amount_value?: number;
  concept_code?: string;
  store_id?: number;
  next_execution?: string;
  last_execution?: string;
  plan?: { id: string; code: string };
};

/** Billing helpers ficam em `lib/nuvemshop-billing.ts`. */
