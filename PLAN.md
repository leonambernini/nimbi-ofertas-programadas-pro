# Ofertas Programadas Pro — Plano de Ação

App Enhanced Admin (Nimbus + Nexo) + API (Next.js) + Storefront (NubeSDK), multi-loja, PT-BR/ES, assinatura nativa Nuvemshop. Hospedagem: **Vercel** + **Supabase** (Postgres + Storage CDN).

Baseado no padrão do **Selos Pro**.

---

## Arquitetura

```
Partner Portal / Admin iframe
        |
        |-- OAuth2 --> /api/auth/* --> upsert Store (token)
        |
        +-- Nexo JWT --> Admin UI (Nimbus)
                              |
                              v
                       /api/v1/* (Next.js)
                              |
              +---------------+---------------+
              v               v               v
        Supabase PG    API Nuvemshop   Supabase Storage
        (offers)       (products/pages (banners CDN)
                        /stock-price)
                              |
                              v
                       NubeSDK (vitrine)
                              |
                       Vercel Cron (5 min)
                       /api/cron/offers
```

---

## Domínio — Grupo de Ofertas

Cada grupo contém:

- Produtos (manual ou por categoria) → linhas por variação na tabela
- Preços: original + original promocional + preço oferta
- Preenchimento: `%` | desconto fixo | manual
- `startsAt` / `endsAt`
- `autoApplyPrices`: no início aplica `promotional_price`; no fim restaura
- Vitrine customizada (slot NubeSDK)
- Página dedicada (API Pages / `write_content`)
- Banner (imagem ou barra com cronômetro)
- Cronômetro em grid/PDP
- Tema de cores (vitrine, página, cronômetros)

Status derivado: `draft` | `scheduled` | `active` | `ended` | `disabled`

---

## Checklist

### Parte 1 — Fundação ✅
- [x] Scaffold a partir do Selos Pro
- [x] Schema `Store`, `OfferGroup`, `OfferItem`, `OfferCronLog`
- [x] OAuth2 + auth Nexo + billing
- [x] i18n PT-BR / ES

### Parte 2 — Admin ✅ (base)
- [x] Listagem de grupos
- [x] Form: datas, seleção, tabela, tema, vitrine/banner/página
- [x] Toggle enabled / delete
- [ ] SideModal de produtos mais polido (hoje busca + categorias inline)
- [ ] Preview visual do tema/banner

### Parte 3 — APIs ✅ (base)
- [x] CRUD `/api/v1/offers`
- [x] Products com variants + categories
- [x] Storefront `/api/v1/storefront/offers`
- [x] Cron `/api/cron/offers` + `vercel.json`
- [x] Apply/restore via `PATCH /products/stock-price`
- [x] Sync página dedicada

### Parte 4 — NubeSDK ✅ (base)
- [x] Banner imagem / barra cronômetro
- [x] Vitrine em slots de seção / main / footer
- [x] Countdown grid + PDP
- [ ] Refresh periódico do countdown (hoje recalcula no location:updated)
- [ ] Cards da vitrine com imagem/nome via dados da página

---

## Modelo de dados

| Tabela | Campos principais |
|--------|-------------------|
| `stores` | store_id, access_token, subscription_status… |
| `offer_groups` | datas, auto_apply, theme, banner, showcase, page, status |
| `offer_items` | product/variant, original_price, original_promotional_price, offer_price |
| `offer_cron_logs` | action, success, message |
