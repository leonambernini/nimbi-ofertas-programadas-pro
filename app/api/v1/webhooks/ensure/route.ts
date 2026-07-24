import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { ensureStoreWebhooks } from "@/lib/webhooks";

export async function POST(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  try {
    const result = await ensureStoreWebhooks(
      session.storeId,
      session.accessToken,
    );
    return apiJson(request, result);
  } catch (error) {
    console.error("[webhooks/ensure]", error);
    return apiJson(request, { error: "webhook_ensure_failed" }, { status: 502 });
  }
}
