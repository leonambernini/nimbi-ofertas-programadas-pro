# Ofertas Programadas Pro — Comandos de produção

**App URL:** https://nimbi-ofertas-programadas-pro.vercel.app

## URLs importantes

| Recurso | URL |
|---------|-----|
| Admin (Enhanced) | https://nimbi-ofertas-programadas-pro.vercel.app/offers |
| Assinatura | https://nimbi-ofertas-programadas-pro.vercel.app/subscription |
| OAuth authorize | https://nimbi-ofertas-programadas-pro.vercel.app/api/auth/nuvemshop/authorize |
| OAuth callback | https://nimbi-ofertas-programadas-pro.vercel.app/api/auth/nuvemshop/callback |
| Cron ofertas | https://nimbi-ofertas-programadas-pro.vercel.app/api/cron/offers |
| API storefront | https://nimbi-ofertas-programadas-pro.vercel.app/api/v1/storefront/offers?store_id={STORE_ID} |
| Legacy JS (temas antigos) | https://nimbi-ofertas-programadas-pro.vercel.app/storefront/ofertas-legacy.min.js |

## Pré-requisitos

```bash
cd "apps/Ofertas Pro"
npm install
```

Confirme no `.env` / Vercel:

- `APP_URL=https://nimbi-ofertas-programadas-pro.vercel.app`
- `DATABASE_URL`, Supabase, `NUVEMSHOP_*`, `TOKEN_ENCRYPTION_KEY`, `CRON_SECRET`, billing

## Build storefront — NubeSDK (temas modernos)

Gera `nube-sdk/dist/main.min.js` com a API de produção embutida.

```bash
cd "apps/Ofertas Pro"
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app npm run sdk:build
```

Artefato: `nube-sdk/dist/main.min.js`  
→ cadastrar no Partner Portal como script **NubeSDK**.

## Build storefront — Legacy (temas antigos)

Gera o JS puro e copia para `public/` (servido pelo Next/Vercel).

```bash
cd "apps/Ofertas Pro"
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app npm run legacy:build
```

Artefatos:

- `storefront-legacy/dist/main.min.js`
- `public/storefront/ofertas-legacy.min.js`

URL pública:

```
https://nimbi-ofertas-programadas-pro.vercel.app/storefront/ofertas-legacy.min.js
```

→ cadastrar no Partner Portal como **Script** (Scripts API / `write_scripts`).

> O `npm run build` da Vercel já executa `legacy:build` (usa `APP_URL` / `VERCEL_URL` se `OFERTAS_API_BASE` não estiver setado).  
> O bundle **NubeSDK** continua manual (`sdk:build`) e precisa ser republicado no Partner Portal quando mudar.

## Build completo do app (local, espelhando Vercel)

```bash
cd "apps/Ofertas Pro"
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app npm run build
```

## Deploy Vercel

```bash
cd "apps/Ofertas Pro"
vercel --prod
```

Garanta na Vercel:

```
APP_URL=https://nimbi-ofertas-programadas-pro.vercel.app
```

Opcional (explícito para o legacy no build):

```
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app
```

## Cron externo (cron-job.org)

| Campo | Valor |
|-------|--------|
| URL | `https://nimbi-ofertas-programadas-pro.vercel.app/api/cron/offers` |
| Método | `GET` |
| Schedule | `*/5 * * * *` (ou o intervalo desejado) |
| Header | `Authorization: Bearer {CRON_SECRET}` |

## Partner Portal — checklist

1. **URL do app:** `https://nimbi-ofertas-programadas-pro.vercel.app/offers`
2. **Redirect URI:** `https://nimbi-ofertas-programadas-pro.vercel.app/api/auth/nuvemshop/callback`
3. **NubeSDK script:** upload/URL de `nube-sdk/dist/main.min.js` (build com `OFERTAS_API_BASE` de produção)
4. **Legacy script:** `https://nimbi-ofertas-programadas-pro.vercel.app/storefront/ofertas-legacy.min.js`
5. Escopos: `write_products`, `write_content`, `write_scripts`

## Smoke test rápido

```bash
# API storefront (troque STORE_ID)
curl -s "https://nimbi-ofertas-programadas-pro.vercel.app/api/v1/storefront/offers?store_id=STORE_ID" | head

# Legacy JS acessível
curl -sI "https://nimbi-ofertas-programadas-pro.vercel.app/storefront/ofertas-legacy.min.js" | head

# Cron (requer secret)
curl -sI -H "Authorization: Bearer $CRON_SECRET" \
  "https://nimbi-ofertas-programadas-pro.vercel.app/api/cron/offers"
```

Na loja antiga (sem NubeSDK): abra o console e confirme log `[ofertas-pro-legacy] boot`.  
Force: `?ofertas_legacy=1` ou `window.__OFERTAS_PRO_FORCE_LEGACY__ = true`.

## Fluxo típico após mudança no storefront

```bash
cd "apps/Ofertas Pro"

# 1) Bundles com API de produção
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app npm run sdk:build
OFERTAS_API_BASE=https://nimbi-ofertas-programadas-pro.vercel.app npm run legacy:build

# 2) Deploy do app (serve o legacy em /storefront/...)
#    (git push / vercel --prod)

# 3) Se o NubeSDK mudou → republicar main.min.js no Partner Portal
```
