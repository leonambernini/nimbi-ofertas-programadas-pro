import type { OfferGroup, OfferItem } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseSectionDisplayConfig } from "@/lib/offer-display";
import { createPage, updatePage } from "@/lib/nuvemshop-client";
import { themeFromGroup } from "@/lib/offers";

type OfferWithItems = OfferGroup & { items: OfferItem[] };

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPageHtml(offer: OfferWithItems): string {
  const theme = themeFromGroup(offer);
  const config = parseSectionDisplayConfig(offer.pageConfig);
  const title = config.title || offer.name;
  const subtitle =
    config.subtitle ||
    `Oferta válida até ${offer.endsAt.toLocaleString("pt-BR")}`;
  const cols = config.itemsPerRow || 4;

  const products = new Map<number, OfferItem>();
  for (const item of offer.items) {
    if (!products.has(item.productId)) products.set(item.productId, item);
  }

  const cards = [...products.values()]
    .map((item) => {
      const name = item.productName ?? `Produto ${item.productId}`;
      const img = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(name)}" style="width:100%;height:220px;object-fit:cover;border-radius:${theme.borderRadius}px;" />`
        : "";
      const cardStyle =
        config.layout === "carousel"
          ? `flex:0 0 calc((100% - ${(cols - 1) * 16}px) / ${cols});min-width:220px;scroll-snap-align:start;`
          : "";
      return `
        <a href="/produtos/${item.productId}" style="display:block;text-decoration:none;color:${theme.textColor};background:${theme.backgroundColor};border:1px solid ${theme.secondaryColor};border-radius:${theme.borderRadius}px;overflow:hidden;${cardStyle}">
          ${img}
          <div style="padding:12px;">
            <div style="font-weight:600;margin-bottom:8px;">${escapeHtml(name)}</div>
            <div>
              <span style="text-decoration:line-through;opacity:.6;margin-right:8px;">R$ ${Number(item.originalPrice).toFixed(2)}</span>
              <span style="color:${theme.accentColor};font-weight:700;">R$ ${Number(item.offerPrice).toFixed(2)}</span>
            </div>
          </div>
        </a>`;
    })
    .join("\n");

  const bannerTop = config.bannerTopUrl
    ? `<img src="${escapeHtml(config.bannerTopUrl)}" alt="" style="width:100%;display:block;border-radius:${theme.borderRadius}px;margin-bottom:16px;object-fit:cover;max-height:320px;" />`
    : "";
  const bannerBottom = config.bannerBottomUrl
    ? `<img src="${escapeHtml(config.bannerBottomUrl)}" alt="" style="width:100%;display:block;border-radius:${theme.borderRadius}px;margin-top:16px;object-fit:cover;max-height:240px;" />`
    : "";
  // textTop/textBottom vêm do Editor Nimbus (HTML)
  const textTop = config.textTop
    ? `<div style="margin:0 0 16px;line-height:1.5;" class="ofertas-pro-richtext">${config.textTop}</div>`
    : "";
  const textBottom = config.textBottom
    ? `<div style="margin:16px 0 0;line-height:1.5;" class="ofertas-pro-richtext">${config.textBottom}</div>`
    : "";

  const productsWrap =
    config.layout === "carousel"
      ? `<div style="display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px;">${cards}</div>`
      : `<div style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:16px;">${cards}</div>`;

  return `
<div style="font-family:system-ui,sans-serif;max-width:1100px;margin:0 auto;padding:24px;color:${theme.textColor};">
  ${bannerTop}
  <div style="background:${theme.primaryColor};color:${theme.buttonTextColor};padding:24px;border-radius:${theme.borderRadius}px;margin-bottom:24px;">
    <h1 style="margin:0 0 8px;">${escapeHtml(title)}</h1>
    <p style="margin:0;opacity:.9;">${escapeHtml(subtitle)}</p>
  </div>
  ${textTop}
  ${productsWrap}
  ${textBottom}
  ${bannerBottom}
</div>`.trim();
}

/**
 * Sincroniza conteúdo da página dedicada.
 * Se dedicatedPageId estiver setado, atualiza essa página.
 * Se não, cria uma nova.
 * Ao desativar, apenas desvincula (não apaga páginas da loja).
 */
export async function syncDedicatedPage(params: {
  storeId: string;
  accessToken: string;
  offer: OfferWithItems;
}): Promise<{ pageId: number | null; handle: string | null }> {
  const { storeId, accessToken, offer } = params;

  if (!offer.enableDedicatedPage) {
    if (offer.dedicatedPageId || offer.dedicatedPageHandle) {
      await prisma.offerGroup.update({
        where: { id: offer.id },
        data: { dedicatedPageId: null, dedicatedPageHandle: null },
      });
    }
    return { pageId: null, handle: null };
  }

  const config = parseSectionDisplayConfig(offer.pageConfig);
  const pageTitle = config.title || offer.name;
  const handle =
    offer.dedicatedPageHandle ||
    slugify(pageTitle) ||
    `oferta-${offer.id.slice(-6)}`;
  const content = buildPageHtml(offer);
  const published = offer.status === "active";

  if (offer.dedicatedPageId) {
    const page = await updatePage(storeId, accessToken, offer.dedicatedPageId, {
      title: pageTitle,
      content,
      handle,
      published,
    });
    await prisma.offerGroup.update({
      where: { id: offer.id },
      data: {
        dedicatedPageId: page.id,
        dedicatedPageHandle: handle,
      },
    });
    return { pageId: page.id, handle };
  }

  const page = await createPage(storeId, accessToken, {
    title: pageTitle,
    content,
    handle,
    published,
  });

  await prisma.offerGroup.update({
    where: { id: offer.id },
    data: {
      dedicatedPageId: page.id,
      dedicatedPageHandle: handle,
    },
  });

  return { pageId: page.id, handle };
}
