import { apiJson } from "@/lib/api-http";
import { verifyWebhookSignature } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteStoreOfferImages } from "@/lib/supabase-storage";

/**
 * URL Webhook Store Redact (Partner Portal).
 * Docs Authentication → URLs → URL Webhook Store Redact
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request)) {
    return apiJson(request, { error: "invalid_signature" }, { status: 401 });
  }

  let payload: { store_id?: number };
  try {
    payload = JSON.parse(rawBody) as { store_id?: number };
  } catch {
    return apiJson(request, { error: "invalid_json" }, { status: 400 });
  }

  const storeId = String(payload.store_id ?? "");
  if (!storeId) {
    return apiJson(request, { error: "missing_store" }, { status: 400 });
  }

  // Cascade apaga offer_groups + offer_items
  await prisma.store.deleteMany({ where: { storeId } });
  await deleteStoreOfferImages(storeId);
  console.info("[webhooks/lgpd] store/redact", { storeId });

  return apiJson(request, { ok: true });
}
