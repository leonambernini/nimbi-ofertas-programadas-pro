import { apiJson } from "@/lib/api-http";
import { verifyWebhookSignature } from "@/lib/auth";

type DataRequestPayload = {
  store_id?: number;
  customer?: {
    id?: number;
    email?: string;
    phone?: string;
    identification?: string;
  };
  orders_requested?: number[];
  checkouts_requested?: number[];
  drafts_orders_requested?: number[];
  data_request?: { id?: number };
};

/**
 * URL Webhook Customers Data Request (Partner Portal / LGPD).
 * Docs: https://tiendanube.github.io/api-documentation/resources/webhook#customersdata_request
 *
 * Selos Pro não armazena dados de clientes finais — responde 200 (ack).
 * Se no futuro houver PII, enviar o relatório ao lojista da store_id.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request)) {
    return apiJson(request, { error: "invalid_signature" }, { status: 401 });
  }

  let payload: DataRequestPayload = {};
  try {
    payload = JSON.parse(rawBody) as DataRequestPayload;
  } catch {
    return apiJson(request, { error: "invalid_json" }, { status: 400 });
  }

  console.info("[webhooks/lgpd] customers/data_request", {
    storeId: payload.store_id ?? null,
    dataRequestId: payload.data_request?.id ?? null,
    customerId: payload.customer?.id ?? null,
  });

  return apiJson(request, { ok: true });
}
