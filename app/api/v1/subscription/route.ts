import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import {
  hasActiveAccess,
  syncStoreSubscription,
} from "@/lib/nuvemshop-billing";
import type { SubscriptionInfo } from "@/lib/types";

function toInfo(
  status: string,
  subscription: Awaited<
    ReturnType<typeof syncStoreSubscription>
  >["subscription"],
  extras: {
    planCode: string | null;
    planId: string | null;
    currency: string | null;
    nextExecution: Date | null;
    hasAccess: boolean;
  },
): SubscriptionInfo {
  return {
    status,
    planCode: subscription?.plan?.code ?? extras.planCode,
    planId: subscription?.plan?.id ?? extras.planId,
    amountValue: subscription?.amount_value ?? null,
    amountCurrency:
      subscription?.amount_currency ?? extras.currency ?? null,
    nextExecution:
      subscription?.next_execution ??
      extras.nextExecution?.toISOString() ??
      null,
    lastExecution: subscription?.last_execution ?? null,
    description: subscription?.description ?? null,
    recurringFrequency: subscription?.recurring_frequency ?? null,
    recurringInterval: subscription?.recurring_interval ?? null,
    hasAccess: extras.hasAccess,
  };
}

/** GET — sincroniza assinatura gerenciada pela Nuvemshop. */
export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  try {
    const result = await syncStoreSubscription(
      session.storeId,
      session.accessToken,
      { force: true },
    );

    return apiJson(
      request,
      toInfo(result.status, result.subscription, {
        planCode: session.store.planCode,
        planId: session.store.planId,
        currency: session.store.currency,
        nextExecution: session.store.nextExecution,
        hasAccess: result.hasAccess,
      }),
    );
  } catch (error) {
    console.error("[subscription] GET", error);
    return apiJson(
      request,
      toInfo(session.store.subscriptionStatus, null, {
        planCode: session.store.planCode,
        planId: session.store.planId,
        currency: session.store.currency,
        nextExecution: session.store.nextExecution,
        hasAccess: hasActiveAccess(session.store),
      }),
    );
  }
}
