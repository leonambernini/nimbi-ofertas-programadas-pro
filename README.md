# Ofertas Pro

App Nuvemshop Enhanced Admin para criar **grupos de ofertas** com tabela de preços, ativação por cron, vitrine, banners e página dedicada.

- **Admin:** Next.js + [Nimbus](https://nimbus.nuvemshop.com.br/) + [Nexo](https://dev.nuvemshop.com.br/)
- **API:** Next.js Route Handlers + Prisma
- **DB / CDN:** Supabase (Postgres + Storage)
- **Host:** Vercel (cron diário no Hobby; use Supabase/cron externo p/ intervalos menores)
- **Assinatura:** [Billing nativo Nuvemshop](https://tiendanube.github.io/api-documentation/resources/billing)
- **Vitrine:** [NubeSDK](https://dev.nuvemshop.com.br/en/docs/applications/nube-sdk/getting-started) (pasta `nube-sdk/`)

Idiomas: **PT-BR** e **ES**. Multi-loja via OAuth2.

## Plano

Ver [PLAN.md](./PLAN.md).

## Setup local

1. Copie `.env.example` → `.env` e preencha as variáveis.
2. Crie o bucket `offers` no Supabase Storage (público para leitura).
3. `npm install`
4. `npm run db:push`
5. `npm run dev`

### Escopos sugeridos (Partner Portal)

- `write_products` — aplicar/restaurar preços promocionais
- `write_content` — página dedicada (`/pages`)
- `write_scripts` — NubeSDK
- `read_products` — implícito com write

### OAuth2 + Billing Nuvemshop

Guia: [docs/oauth-billing.md](./docs/oauth-billing.md)

| Campo | Valor |
|-------|-------|
| Redirect URI | `{APP_URL}/api/auth/nuvemshop/callback` |
| URL do app | `{APP_URL}/offers` |
| Store Redact | `{APP_URL}/api/v1/webhooks/redact/store` |
| Customer Redact | `{APP_URL}/api/v1/webhooks/redact/customers` |
| Customers Data Request | `{APP_URL}/api/v1/webhooks/redact/customers/data-request` |

Cron (Vercel Hobby): 1x/dia (`0 3 * * *` UTC) + `CRON_SECRET` em `/api/cron/offers` (ver `vercel.json`).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server |
| `npm run build` | Build Vercel |
| `npm run db:push` | Sync schema Prisma → Postgres |
| `npm run sdk:dev` | Dev do NubeSDK |
| `npm run sdk:build` | Build do bundle storefront |

## Rotas principais

| Rota | Função |
|------|--------|
| `/offers` | Listagem de grupos |
| `/offers/new` | Criar |
| `/offers/[id]` | Editar |
| `/subscription` | Planos / assinatura |
| `/api/v1/offers` | CRUD |
| `/api/v1/products` | Proxy produtos (+ variants) |
| `/api/v1/categories` | Proxy categorias |
| `/api/v1/storefront/offers` | Público p/ NubeSDK |
| `/api/cron/offers` | Ativação/desativação + preços |

## Slots NubeSDK usados

Documentação: [Storefront Slots](https://dev.nuvemshop.com.br/en/docs/applications/nube-sdk/slots/storefront-slots)

| Uso | Slots |
|-----|-------|
| Banner / barra cronômetro | `after_header`, `before_main_content` |
| Vitrine customizada | `before_section_products_sale`, `after_section_products_sale`, `before_section_products_featured`, `after_section_products_featured`, `before_main_content`, `after_header`, `before_footer` |
| Cronômetro em cards | `after_product_grid_item_price` |
| Cronômetro PDP | `after_product_detail_price` |

> Slots `before/after_section_products_*` só renderizam se a seção existir no layout da home do tema.
