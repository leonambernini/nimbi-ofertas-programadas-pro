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
   * Validações de pagamento / gate de assinatura.
   * Aceita `BILLING_ENFORCE` ou alias `PAYMENT_VALIDATION`.
   * - false → desliga (libera admin + storefront sem checar assinatura)
   * - true → liga (bloqueia sem trial/active)
   * - sem var: desligado em development; ligado em production
   */
  billingEnforced: () => {
    const raw =
      process.env.BILLING_ENFORCE ?? process.env.PAYMENT_VALIDATION;
    if (raw === "false" || raw === "0") return false;
    if (raw === "true" || raw === "1") return true;
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
  /**
   * User-Agent exigido pela API Nuvemshop: nome do app + e-mail válido do parceiro.
   * Docs: Autenticação da API.
   */
  nuvemshopUserAgent: () => {
    const name =
      process.env.NUVEMSHOP_USER_AGENT_NAME?.trim() ||
      "Ofertas Programadas Pro";
    const email =
      process.env.NUVEMSHOP_USER_AGENT_EMAIL?.trim() ||
      "leonamb19+nimbi@gmail.com";
    const appId =
      process.env.NUVEMSHOP_CLIENT_ID?.trim() ||
      process.env.NEXT_PUBLIC_NUVEMSHOP_CLIENT_ID?.trim() ||
      "";
    return appId ? `${name}/${appId} (${email})` : `${name} (${email})`;
  },
};
