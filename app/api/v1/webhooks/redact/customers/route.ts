import { apiJson } from "@/lib/api-http";
import { verifyWebhookSignature } from "@/lib/auth";

type CustomersRedactPayload = {
  store_id?: number;
  customer?: {
    id?: number;
    email?: string;
    phone?: string;
    identification?: string;
  };
  orders_to_redact?: number[];
};

/**
 * URL Webhook Customers Redact (Partner Portal / LGPD).
 * Docs: https://tiendanube.github.io/api-documentation/resources/webhook#customersredact
 *
 * Ofertas Programadas Pro não armazena dados de clientes finais — responde 200 (ack).
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request)) {
    return apiJson(request, { error: "invalid_signature" }, { status: 401 });
  }

  let payload: CustomersRedactPayload = {};
  try {
    payload = JSON.parse(rawBody) as CustomersRedactPayload;
  } catch {
    return apiJson(request, { error: "invalid_json" }, { status: 400 });
  }

  console.info("[webhooks/lgpd] customers/redact", {
    storeId: payload.store_id ?? null,
    customerId: payload.customer?.id ?? null,
  });

  return apiJson(request, { ok: true });
}
