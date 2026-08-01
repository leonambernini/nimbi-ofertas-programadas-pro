import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { syncStoreSubscription } from "@/lib/nuvemshop-billing";
import { reconcileStoreOfferPrices } from "@/lib/offer-reconcile";

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const billing = await syncStoreSubscription(
    session.storeId,
    session.accessToken,
  );

  /** Rede de segurança: restaura preços de campanhas já encerradas/desativadas. */
  void reconcileStoreOfferPrices({
    storeId: session.storeId,
    accessToken: session.accessToken,
  }).catch((err) => console.warn("[me] reconcile prices failed", err));

  return apiJson(request, {
    storeId: session.store.storeId,
    storeName: session.store.storeName,
    /** Idioma do UI vem do Nexo `getStoreInfo`; este campo é só fallback/cache. */
    language: session.store.language,
    country: session.store.country,
    subscriptionStatus: billing.status,
    nextExecution: billing.subscription?.next_execution ?? null,
    hasAccess: billing.hasAccess,
    blocked: !billing.hasAccess,
  });
}
