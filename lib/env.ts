function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  appUrl: () => process.env.APP_URL ?? "http://localhost:3000",
  databaseUrl: () => required("DATABASE_URL"),
  nuvemshopClientId: () => required("NUVEMSHOP_CLIENT_ID"),
  nuvemshopClientSecret: () => required("NUVEMSHOP_CLIENT_SECRET"),
  nuvemshopWebhookSecret: () => process.env.NUVEMSHOP_WEBHOOK_SECRET,
  /** service_id = app_id na maioria dos casos */
  nuvemshopServiceId: () =>
    process.env.NUVEMSHOP_SERVICE_ID ?? process.env.NUVEMSHOP_CLIENT_ID ?? "",
  /**
   * concept_code = tipo de cobrança na API de Billing.
   * Para mensalidade de apps parceiros: sempre `app-cost` (fixo da Nuvemshop).
   * URL: /concepts/{concept_code}/services/{service_id}/subscriptions
   * service_id = app_id | Business Unit NÃO entra nessa rota.
   */
  nuvemshopBillingConceptCode: () =>
    process.env.NUVEMSHOP_BILLING_CONCEPT_CODE?.trim() || "app-cost",
  /**
   * Gate de assinatura.
   * - BILLING_ENFORCE=false → sempre desliga
   * - BILLING_ENFORCE=true → sempre liga
   * - sem var: desligado em development (plano sandbox NS não gerencia assinatura);
   *   ligado em production
   */
  billingEnforced: () => {
    if (process.env.BILLING_ENFORCE === "false") return false;
    if (process.env.BILLING_ENFORCE === "true") return true;
    return process.env.NODE_ENV === "production";
  },
  billingPlanId: () => process.env.BILLING_PLAN_ID ?? "",
  billingPlanExternalRef: () =>
    process.env.BILLING_PLAN_EXTERNAL_REF ?? "ofertas-pro-mensal",
  billingAmountValue: () => Number(process.env.BILLING_AMOUNT_VALUE ?? 19.9),
  billingAmountCurrency: () => process.env.BILLING_AMOUNT_CURRENCY ?? "BRL",
  tokenEncryptionKey: () => required("TOKEN_ENCRYPTION_KEY"),
  supabaseUrl: () =>
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseServiceRoleKey: () =>
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    required("SUPABASE_SERVICE_ROLE_KEY"),
  supabaseStorageBucket: () => process.env.SUPABASE_STORAGE_BUCKET ?? "ofertas-pro",
  nuvemshopApiRateLimitMs: () =>
    Number(process.env.NUVEMSHOP_API_RATE_LIMIT_MS ?? 200),
  cronSecret: () => process.env.CRON_SECRET ?? "",
};
