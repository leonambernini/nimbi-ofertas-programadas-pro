import { env } from "@/lib/env";
import { nuvemshopRequest } from "@/lib/nuvemshop-client";

export const WEBHOOK_EVENTS = [
  "app/uninstalled",
  "app/suspended",
  "app/resumed",
  "subscription/updated",
] as const;

type Webhook = { id: number; event: string; url: string };

/**
 * Registra webhooks da loja apontando para o app.
 * Em localhost a API Nuvemshop rejeita a URL — nesse caso só loga e segue.
 */
export async function ensureStoreWebhooks(
  storeId: string,
  accessToken: string,
): Promise<{ ok: boolean; skipped?: boolean; events: string[] }> {
  const origin = env.appUrl().replace(/\/$/, "");
  const targetUrl = `${origin}/api/v1/webhooks/nuvemshop`;
  const isLocal =
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.startsWith("http://");

  if (isLocal) {
    console.warn(
      "[webhooks] skip register — APP_URL must be HTTPS público",
      targetUrl,
    );
    return { ok: true, skipped: true, events: [...WEBHOOK_EVENTS] };
  }

  const existing = await nuvemshopRequest<Webhook[]>(
    storeId,
    accessToken,
    "/webhooks",
  );

  for (const event of WEBHOOK_EVENTS) {
    const already = existing.find(
      (hook) => hook.event === event && hook.url === targetUrl,
    );
    if (already) continue;

    await nuvemshopRequest(storeId, accessToken, "/webhooks", {
      method: "POST",
      body: { event, url: targetUrl },
    });
  }

  return { ok: true, events: [...WEBHOOK_EVENTS] };
}
