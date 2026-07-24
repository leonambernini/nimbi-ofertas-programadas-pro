import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import {
  listPages,
  localizeField,
  NuvemshopApiError,
} from "@/lib/nuvemshop-client";
import type { ApiStorePage } from "@/lib/types";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  try {
    const pages = await listPages(session.storeId, session.accessToken, {
      all: true,
    });

    const mapped: ApiStorePage[] = pages.map((page) => ({
      id: page.id,
      title:
        localizeField(page.title ?? page.name, session.store.language) ??
        `Página ${page.id}`,
      handle:
        localizeField(page.handle, session.store.language) ??
        String(page.id),
      published: Boolean(page.published),
    }));

    return apiJson(request, mapped);
  } catch (error) {
    console.error("[pages]", error);
    if (error instanceof NuvemshopApiError && error.status === 403) {
      return apiJson(
        request,
        {
          error: "pages_forbidden",
          message:
            "Escopo read_content/write_content ausente. Reinstale o app com write_content.",
        },
        { status: 403 },
      );
    }
    return apiJson(request, { error: "pages_fetch_failed" }, { status: 502 });
  }
}
