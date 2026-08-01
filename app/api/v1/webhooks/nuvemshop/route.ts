import { SubscriptionStatus } from "@prisma/client";
import { apiJson } from "@/lib/api-http";
import { verifyWebhookSignature } from "@/lib/auth";
import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { syncStoreSubscription } from "@/lib/nuvemshop-billing";

type WebhookPayload = {
  store_id?: number;
  event?: string;
  id?: number | string;
};

/**
 * Webhooks da plataforma.
 * - app/uninstalled | app/suspended | app/resumed
 * - subscription/updated → re-sync billing
 *
 * Docs Billing: configure listener para subscription/updated.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, request)) {
    return apiJson(request, { error: "invalid_signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return apiJson(request, { error: "invalid_json" }, { status: 400 });
  }

  const storeId = String(payload.store_id ?? "");
  if (!storeId) {
    return apiJson(request, { error: "missing_store" }, { status: 400 });
  }

  const event =
    payload.event ?? request.headers.get("x-linkedstore-event") ?? "";

  try {
    switch (event) {
      case "app/uninstalled":
        await prisma.store.updateMany({
          where: { storeId },
          data: { uninstalledAt: new Date() },
        });
        break;

      case "app/suspended":
        await prisma.store.updateMany({
          where: { storeId },
          data: { subscriptionStatus: SubscriptionStatus.suspended },
        });
        break;

      case "app/resumed":
        await prisma.store.updateMany({
          where: { storeId },
          data: { subscriptionStatus: SubscriptionStatus.active },
        });
        // Reconsulta assinatura para refletir plano/next_execution atualizados
        await safeSync(storeId);
        break;

      case "subscription/updated":
        await safeSync(storeId);
        break;

      default:
        break;
    }
  } catch (error) {
    console.error("[webhooks]", event, error);
  }

  return apiJson(request, { ok: true });
}

async function safeSync(storeId: string) {
  const store = await prisma.store.findUnique({ where: { storeId } });
  if (!store || store.uninstalledAt) return;
  try {
    await syncStoreSubscription(storeId, decryptToken(store.accessToken), {
      force: true,
    });
  } catch (error) {
    console.warn("[webhooks] subscription sync failed", storeId, error);
  }
}
