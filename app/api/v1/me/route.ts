import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { syncStoreSubscription } from "@/lib/nuvemshop-billing";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const billing = await syncStoreSubscription(
    session.storeId,
    session.accessToken,
  );

  return apiJson(request, {
    storeId: session.store.storeId,
    storeName: session.store.storeName,
    language: session.store.language,
    subscriptionStatus: billing.status,
    nextExecution: billing.subscription?.next_execution ?? null,
    hasAccess: billing.hasAccess,
    blocked: !billing.hasAccess,
  });
}
