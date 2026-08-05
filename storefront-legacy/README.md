# Ofertas Programadas Pro — Storefront Legacy (JS puro)

Fallback para lojas/temas **sem NubeSDK**. Injeta banners e cronômetros no DOM e consome a mesma API do bundle oficial.

```
GET {OFERTAS_API_BASE}/api/v1/storefront/offers?store_id={LS.store.id}
```

- Scripts API: https://tiendanube.github.io/api-documentation/resources/script  
- NubeSDK (caminho moderno): https://dev.nuvemshop.com.br/docs/applications/nube-sdk/overview

## Quando roda

| Condição | Comportamento |
| --- | --- |
| Tema com hosts de slot NubeSDK | **Não** monta |
| Tema antigo / sem slots | Monta no DOM |
| `?ofertas_legacy=1` ou `window.__OFERTAS_PRO_FORCE_LEGACY__ = true` | Força legacy |
| `?ofertas_legacy=0` ou `window.__OFERTAS_PRO_LEGACY_DISABLED__ = true` | Desliga |

## O que faz

- Banner imagem ou barra com cronômetro (`after_header`, `before_main_content`, footer, seções)
- Cronômetro em cards (cantos da imagem / antes-depois do nome ou preço)
- Cronômetro na PDP (imagem, nome, preço, pagamentos, comprar)
- Tick a cada 1s enquanto houver oferta viva
- `MutationObserver` + navegação SPA (`pushState` / `popstate`)
- Vitrine customizada **desativada** (igual ao NubeSDK atual)

## Desenvolvimento

```bash
cd storefront-legacy
npm install
OFERTAS_API_BASE=http://localhost:3000 npm run dev
```

Serve em `http://localhost:3903/main.min.js`.

## Build de produção

```bash
OFERTAS_API_BASE=https://seu-app.vercel.app npm run build
```

Artefatos:

- `dist/main.min.js`
- `../public/storefront/ofertas-legacy.min.js` → `/storefront/ofertas-legacy.min.js`

## Partner Portal / Scripts API

1. Cadastre  
   `https://seu-app.vercel.app/storefront/ofertas-legacy.min.js`
2. Escopo `write_scripts`
3. Associe à loja no install se for non-autoinstallable
4. Em lojas com NubeSDK, use só o bundle oficial — o legacy se auto-desliga

## Notas

- IIFE isolada — não depende de jQuery
- Temas muito customizados podem precisar de ajuste nos selectors
- Não use em checkout
