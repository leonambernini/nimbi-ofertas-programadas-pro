import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import {
  listCategories,
  localizeField,
} from "@/lib/nuvemshop-client";
import type { ApiCategory } from "@/lib/types";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  try {
    const categories = await listCategories(
      session.storeId,
      session.accessToken,
      { page: 1, per_page: 200 },
    );

    const mapped: ApiCategory[] = categories.map((category) => ({
      id: category.id,
      name: localizeField(category.name, session.store.language) ?? "",
      parentId: category.parent ?? null,
    }));

    return apiJson(request, mapped);
  } catch (error) {
    console.error("[categories]", error);
    return apiJson(
      request,
      { error: "categories_fetch_failed" },
      { status: 502 },
    );
  }
}
