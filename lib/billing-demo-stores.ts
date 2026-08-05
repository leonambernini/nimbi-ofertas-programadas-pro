import whitelist from "@/lib/billing-demo-stores.json";

/**
 * Lojas demo / homologação: ignoram sync e validação de billing.
 * Edite `billing-demo-stores.json` para incluir/remover store_ids.
 */
const DEMO_STORE_IDS = new Set(
  (whitelist.storeIds ?? []).map((id) => String(id)),
);

export function isBillingDemoStore(storeId: string | number): boolean {
  return DEMO_STORE_IDS.has(String(storeId));
}
