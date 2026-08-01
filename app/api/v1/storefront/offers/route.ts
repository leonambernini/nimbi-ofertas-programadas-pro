import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAccessState } from "@/lib/nuvemshop-billing";
import { reconcileStoreOfferPrices } from "@/lib/offer-reconcile";
import { toStorefrontOffer } from "@/lib/offers";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: CORS_HEADERS,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Endpoint público para o NubeSDK buscar ofertas ativas da loja.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get("store_id");
  const productIdParam = url.searchParams.get("product_id");

  if (!storeId) {
    return json({ error: "store_id_required" }, 400);
  }

  const store = await prisma.store.findUnique({ where: { storeId } });
  if (!store || store.uninstalledAt) {
    return json({
      offers: [],
      access: { allowed: false, reason: "no_subscription" },
    });
  }

  const access = getAccessState(store);
  if (!access.hasAccess) {
    return json({
      offers: [],
      access: { allowed: false, reason: access.reason },
    });
  }

  const now = new Date();
  const productId = productIdParam ? Number(productIdParam) : null;

  /**
   * Se há campanhas com preços ainda aplicados fora da janela,
   * restaura em background (rede de segurança se o cron atrasar).
   */
  const pendingRestore = await prisma.offerGroup.count({
    where: {
      storeId,
      autoApplyPrices: true,
      OR: [
        { pricesApplied: true, endsAt: { lte: now } },
        { pricesApplied: true, enabled: false },
        { pricesApplied: true, status: { in: ["ended", "disabled"] } },
      ],
    },
  });
  if (pendingRestore > 0) {
    void reconcileStoreOfferPrices({ storeId }).catch((err) =>
      console.warn("[storefront] reconcile prices failed", err),
    );
  }

  const offers = await prisma.offerGroup.findMany({
    where: {
      storeId,
      enabled: true,
      status: "active",
      startsAt: { lte: now },
      /** Inclusivo com deriveStatus: no horário de término a oferta já encerra. */
      endsAt: { gt: now },
      ...(productId != null && !Number.isNaN(productId)
        ? { items: { some: { productId } } }
        : {}),
    },
    include: { items: true },
    orderBy: { endsAt: "asc" },
  });

  return json({
    offers: offers.map(toStorefrontOffer),
    access: { allowed: true, reason: access.reason },
  });
}
