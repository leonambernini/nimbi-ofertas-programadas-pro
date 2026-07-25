# OAuth2 e Billing — Ofertas Programadas Pro

Referências oficiais:
- [Authentication](https://tiendanube.github.io/api-documentation/authentication)
- [Billing](https://tiendanube.github.io/api-documentation/resources/billing)
- [Partner-Action auth](https://tiendanube.github.io/api-documentation/guides/authentication-for-partner-actions)

## OAuth2 (authorization_code)

```
Lojista → /apps/{app_id}/authorize?state=...
       → autoriza scopes
       → {APP_URL}/api/auth/nuvemshop/callback?code=...&state=...
       → POST /apps/authorize/token (body JSON)
       → upsert Store + provisionBillingOnInstall
       → redirect https://{dominio}/admin/apps/{app_id} (Enhanced)
```

### URLs no Partner Portal

| Campo | Valor |
|-------|-------|
| Redirect URI | `{APP_URL}/api/auth/nuvemshop/callback` |
| URL do app | `{APP_URL}/offers` |
| Preferences | `{APP_URL}/offers` |
| Store Redact | `{APP_URL}/api/v1/webhooks/redact/store` |
| Customer Redact | `{APP_URL}/api/v1/webhooks/redact/customers` |
| Customers Data Request | `{APP_URL}/api/v1/webhooks/redact/customers/data-request` |

Escopos sugeridos: `write_products`, `write_content`, `write_scripts`.

## Billing nativo (controlado pela Nuvemshop)

Conforme suporte Nuvemshop:

- A **assinatura e o período de testes** são criados/gerenciados **automaticamente** na instalação do app.
- O app **não** deve criar a assinatura manualmente nem controlar trial local.
- A plataforma calcula a primeira cobrança (com trial) e atualiza `next_execution`.
- Prefira o webhook `subscription/updated` em vez de polling.

### Entidades / parâmetros da rota

`/concepts/{concept_code}/services/{service_id}/subscriptions`

| Parâmetro | Valor |
|-----------|--------|
| `concept_code` | Sempre `app-cost` (tipo de cobrança de mensalidade de apps parceiros) |
| `service_id` | `app_id` do aplicativo |
| Business Unit | ID do parceiro — **não** entra nessa rota |

### O que o Ofertas Programadas Pro faz

1. **Install** → registra webhooks + `syncStoreSubscription` (lê o que a NS já criou)
2. **Webhook** `subscription/updated` → re-sync
3. **Gate** admin/storefront → libera se status local `active` ou `trial`
4. Página `/subscription` → só exibe status (sem botão de ativar cobrança)

### Endpoints

| Ação | Auth | Path |
|------|------|------|
| Criar plano (uma vez) | Partner-Action | `POST /apps/{app_id}/plans` |
| Ler assinatura | Store token | `GET /concepts/app-cost/services/{app_id}/subscriptions` |
| Atualizar plano (opcional) | Store token | `PATCH` mesmo path |

### Env

```env
NUVEMSHOP_BILLING_CONCEPT_CODE=app-cost
NUVEMSHOP_SERVICE_ID=36829   # = app_id

# Plano já criado (referência; a NS associa na instalação)
BILLING_PLAN_ID=45a6c062-4f47-4a45-a2d2-cb1252a416a6
BILLING_PLAN_EXTERNAL_REF=ofertas-pro-mensal

# Gate de pagamento: true=ATIVA | false=DESATIVA
# Alias: PAYMENT_VALIDATION=true|false
BILLING_ENFORCE=false
```

### Loja demo / teste (404 SubscriptionConcept)

Em lojas demo a subscription pode **não** nascer sozinha. Bootstrap manual:

```bash
# usa BILLING_PLAN_ID do .env + loja do banco
npm run billing:bootstrap-demo -- --store=3790898

# ou força valor
npm run billing:bootstrap-demo -- --store=3790898 --amount=19.90
```

O script:
1. Garante o plano (Partner-Action ou `BILLING_PLAN_ID`)
2. `POST /2025-03/{store_id}/concepts/app-cost/services/{app_id}/subscriptions`
