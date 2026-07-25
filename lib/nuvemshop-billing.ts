/**
 * Billing nativo Nuvemshop.
 * Docs: https://tiendanube.github.io/api-documentation/resources/billing
 *
 * A Nuvemshop controla assinatura e período de testes automaticamente
 * na instalação do app. O app NÃO cria assinatura nem gerencia trial local.
 *
 * Fluxo do Ofertas Programadas Pro:
 * 1. Install → registra webhooks + sync da subscription (já criada pela NS)
 * 2. Webhook `subscription/updated` → re-sync (sem polling)
 * 3. Gate de acesso usa o status sincronizado (`active` | `trial`)
 *
 * concept_code = sempre `app-cost` (tipo de cobrança de apps parceiros)
 * service_id   = app_id
 * Business Unit (parceiro) NÃO entra nessa rota.
 */
import { SubscriptionStatus, type Store } from "@prisma/client";
import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import {
  NuvemshopApiError,
  nuvemshopRequest,
  type NuvemshopSubscription,
} from "@/lib/nuvemshop-client";
import { ensureStoreWebhooks } from "@/lib/webhooks";

const PARTNER_API_VERSION = process.env.NUVEMSHOP_API_VERSION ?? "2025-03";
const PARTNER_BASE = "https://api.tiendanube.com";

export type BillingPlan = {
  id: string;
  code: string;
  external_reference?: string;
  description?: string;
  default?: boolean;
};

export type SubscriptionSyncResult = {
  status: SubscriptionStatus;
  subscription: NuvemshopSubscription | null;
  hasAccess: boolean;
};

export type AccessReason =
  | "active"
  | "trial"
  | "bypass"
  | "suspended"
  | "no_subscription"
  | "cancelled"
  | "past_due";

export type AccessState = {
  hasAccess: boolean;
  reason: AccessReason;
};

async function partnerRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
  } = {},
): Promise<T> {
  const appId = env.nuvemshopClientId();
  const url = `${PARTNER_BASE}/${PARTNER_API_VERSION}/apps/${appId}${path}`;

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.nuvemshopClientSecret()}`,
      "Content-Type": "application/json",
      "User-Agent": "Ofertas Programadas Pro (ofertaspro@nuvemshop.com)",
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new NuvemshopApiError(response.status, text);
  }
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** POST /plans — Partner-Action (criar planos do app, uma vez). */
export async function createPlan(input: {
  code: string;
  external_reference?: string;
  description?: string;
}): Promise<BillingPlan> {
  return partnerRequest<BillingPlan>("/plans", {
    method: "POST",
    body: input,
  });
}

export async function updatePlan(
  planId: string,
  input: {
    code?: string;
    external_reference?: string;
    description?: string;
  },
): Promise<BillingPlan> {
  return partnerRequest<BillingPlan>(`/plans/${planId}`, {
    method: "PATCH",
    body: input,
  });
}

export async function deletePlan(planId: string): Promise<void> {
  await partnerRequest(`/plans/${planId}`, { method: "DELETE" });
}

/**
 * GET /concepts/{concept_code}/services/{service_id}/subscriptions
 * concept_code = `app-cost` (fixo)
 * service_id   = app_id
 */
export async function fetchSubscription(
  storeId: string,
  accessToken: string,
): Promise<NuvemshopSubscription | null> {
  const concept = env.nuvemshopBillingConceptCode();
  const serviceId = env.nuvemshopServiceId() || env.nuvemshopClientId();
  const path = `/concepts/${concept}/services/${serviceId}/subscriptions`;

  console.info("[billing] fetchSubscription request", {
    storeId,
    concept,
    serviceId,
    path,
  });

  if (!concept || !serviceId) {
    console.warn(
      "[billing] NUVEMSHOP_BILLING_CONCEPT_CODE ou SERVICE_ID ausente",
    );
    return null;
  }

  // Billing docs usam versão 2025-03 (não v1)
  const versions = ["2025-03", "v1"] as const;

  for (const version of versions) {
    const url = `https://api.tiendanube.com/${version}/${storeId}${path}`;
    console.info("[billing] fetchSubscription trying", { version, url });

    try {
      const subscription = await nuvemshopRequest<NuvemshopSubscription>(
        storeId,
        accessToken,
        path,
        { version },
      );
      console.info(
        "[billing] fetchSubscription OK",
        { version },
        JSON.stringify(subscription, null, 2),
      );
      return subscription;
    } catch (error) {
      if (error instanceof NuvemshopApiError) {
        // 404: tenta próxima versão da API
        if (error.status === 404) {
          console.warn("[billing] fetchSubscription 404", {
            storeId,
            version,
          });
          continue;
        }
        // 403 sem scope: comum em dev / token antigo — não quebra o admin
        if (error.status === 403) {
          console.warn(
            "[billing] sem permissão read_subscriptions (403). Em localhost isso é esperado se o token não tiver o scope; o app segue com acesso liberado quando billing não é enforced.",
            { storeId, version },
          );
          return null;
        }
        console.warn("[billing] fetchSubscription error", {
          storeId,
          version,
          status: error.status,
          body: error.responseBody.slice(0, 300),
        });
      } else {
        console.error("[billing] fetchSubscription unexpected", error);
      }
      throw error;
    }
  }

  console.warn(
    "[billing] subscription not found (404) — a Nuvemshop ainda não criou a assinatura para esta loja. Reinstale o app ou confirme no Partner Portal que o app está como pago/billing ativo.",
  );
  return null;
}

/**
 * PATCH opcional (ex.: troca de plano). Não usar para "criar" assinatura —
 * a NS cria na instalação.
 */
export async function updateSubscription(
  storeId: string,
  accessToken: string,
  input: {
    amount_currency?: string;
    amount_value?: number;
    plan_id?: string;
    plan_external_id?: string;
  },
): Promise<NuvemshopSubscription> {
  const concept = env.nuvemshopBillingConceptCode();
  const serviceId = env.nuvemshopServiceId() || env.nuvemshopClientId();
  if (!concept || !serviceId) {
    throw new Error("billing_not_configured");
  }

  return nuvemshopRequest<NuvemshopSubscription>(
    storeId,
    accessToken,
    `/concepts/${concept}/services/${serviceId}/subscriptions`,
    { method: "PATCH", body: input },
  );
}

/**
 * Mapeia a subscription da Nuvemshop → status local.
 * amount_value === 0 costuma indicar período de testes / free days da NS.
 */
export function mapSubscriptionStatus(
  subscription: NuvemshopSubscription | null,
  current: SubscriptionStatus,
): SubscriptionStatus {
  if (current === "suspended") return "suspended";
  if (!subscription) return "none";
  if (Number(subscription.amount_value ?? 0) === 0) return "trial";
  return "active";
}

export function getAccessState(
  store: Pick<Store, "subscriptionStatus">,
): AccessState {
  if (!env.billingEnforced()) {
    return { hasAccess: true, reason: "bypass" };
  }

  switch (store.subscriptionStatus) {
    case "active":
      return { hasAccess: true, reason: "active" };
    case "trial":
      return { hasAccess: true, reason: "trial" };
    case "suspended":
      return { hasAccess: false, reason: "suspended" };
    case "cancelled":
      return { hasAccess: false, reason: "cancelled" };
    case "past_due":
      return { hasAccess: false, reason: "past_due" };
    default:
      return { hasAccess: false, reason: "no_subscription" };
  }
}

export function hasActiveAccess(
  store: Pick<Store, "subscriptionStatus">,
): boolean {
  return getAccessState(store).hasAccess;
}

/**
 * Na instalação: só registra webhooks e sincroniza a subscription
 * que a Nuvemshop já criou automaticamente.
 */
export async function provisionBillingOnInstall(
  storeId: string,
  accessToken: string,
): Promise<void> {
  try {
    await ensureStoreWebhooks(storeId, accessToken);
  } catch (error) {
    console.warn("[billing] webhooks on install failed", error);
  }

  try {
    await syncStoreSubscription(storeId, accessToken);
  } catch (error) {
    console.warn("[billing] sync on install failed", error);
  }
}

/**
 * Busca a assinatura na API Nuvemshop e persiste cache local.
 * Preferir webhook `subscription/updated` para manter atualizado.
 */
export async function syncStoreSubscription(
  storeId: string,
  accessToken?: string,
): Promise<SubscriptionSyncResult> {
  const store = await prisma.store.findUnique({ where: { storeId } });
  if (!store || store.uninstalledAt) {
    return {
      status: "none",
      subscription: null,
      hasAccess: false,
    };
  }

  const token = accessToken ?? decryptToken(store.accessToken);
  let subscription: NuvemshopSubscription | null = null;

  try {
    subscription = await fetchSubscription(storeId, token);
  } catch (error) {
    const message =
      error instanceof NuvemshopApiError
        ? `${error.status}: ${error.responseBody.slice(0, 200)}`
        : error instanceof Error
          ? error.message
          : String(error);
    console.warn("[billing] fetch subscription failed", { storeId, message });
  }

  const status = mapSubscriptionStatus(subscription, store.subscriptionStatus);
  const hasAccess = hasActiveAccess({ subscriptionStatus: status });

  console.info("[billing] syncStoreSubscription result", {
    storeId,
    previousStatus: store.subscriptionStatus,
    mappedStatus: status,
    hasAccess,
    billingEnforced: env.billingEnforced(),
    foundSubscription: Boolean(subscription),
    amount_value: subscription?.amount_value ?? null,
    amount_currency: subscription?.amount_currency ?? null,
    next_execution: subscription?.next_execution ?? null,
    plan: subscription?.plan ?? null,
  });

  await prisma.store.update({
    where: { storeId },
    data: {
      subscriptionStatus: status,
      planCode: subscription?.plan?.code ?? store.planCode,
      planId: subscription?.plan?.id ?? store.planId,
      nextExecution: subscription?.next_execution
        ? new Date(subscription.next_execution)
        : null,
    },
  });

  return {
    status,
    subscription,
    hasAccess,
  };
}
