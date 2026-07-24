import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import {
  listProducts,
  localizeField,
  parseMoney,
} from "@/lib/nuvemshop-client";
import type { ApiProduct } from "@/lib/types";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? undefined;
  const idsParam = url.searchParams.get("ids");
  const categoryIdParam = url.searchParams.get("category_id");
  const ids = idsParam
    ? idsParam
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id))
    : undefined;
  const categoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
  const page = Number(url.searchParams.get("page") ?? 1);
  const includeVariants = url.searchParams.get("variants") === "1";

  try {
    const products = await listProducts(
      session.storeId,
      session.accessToken,
      {
        q,
        ids,
        category_id:
          categoryId != null && !Number.isNaN(categoryId)
            ? categoryId
            : undefined,
        page,
        per_page: ids?.length ? ids.length : 50,
      },
    );

    const mapped: ApiProduct[] = products.map((product) => {
      const imageById = new Map(
        (product.images ?? []).map((img) => [img.id, img.src]),
      );
      return {
        id: product.id,
        name: localizeField(product.name, session.store.language) ?? "",
        imageUrl: product.images?.[0]?.src ?? null,
        published: Boolean(product.published),
        variants: includeVariants
          ? (product.variants ?? []).map((variant) => {
              const values = (variant.values ?? [])
                .map((v) =>
                  typeof v === "string"
                    ? v
                    : localizeField(v, session.store.language) ?? "",
                )
                .filter(Boolean)
                .join(" / ");
              return {
                id: variant.id,
                productId: product.id,
                name: values || "Única",
                sku: variant.sku ?? null,
                price: parseMoney(variant.price),
                promotionalPrice:
                  variant.promotional_price == null ||
                  variant.promotional_price === ""
                    ? null
                    : parseMoney(variant.promotional_price),
                imageUrl:
                  (variant.image_id != null
                    ? imageById.get(variant.image_id)
                    : null) ??
                  product.images?.[0]?.src ??
                  null,
              };
            })
          : undefined,
      };
    });

    return apiJson(request, mapped);
  } catch (error) {
    console.error("[products]", error);
    return apiJson(request, { error: "products_fetch_failed" }, { status: 502 });
  }
}
