# Ofertas Programadas Pro — NubeSDK (storefront)

Bundle injetado na vitrine (tema compatível com NubeSDK).

Busca ofertas ativas em:

```
GET {OFERTAS_API_BASE}/api/v1/storefront/offers?store_id={store.id}
```

## Slots

Ver README do app e docs oficiais:
https://dev.nuvemshop.com.br/en/docs/applications/nube-sdk/slots/storefront-slots

## Dev

```bash
cd nube-sdk
npm install
OFERTAS_API_BASE=http://localhost:3000 npm run dev
```

## Build

```bash
OFERTAS_API_BASE=https://seu-app.vercel.app npm run build
```

Gera `dist/main.min.js` para cadastrar no Partner Portal / scripts da loja.
