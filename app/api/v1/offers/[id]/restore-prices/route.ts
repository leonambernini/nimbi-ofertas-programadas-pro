import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { restoreOfferPrices } from "@/lib/offer-prices";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * Retentativa manual de restore de preços (painel de logs).
 */
export async function POST(request: Request, context: RouteContext) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { id } = await context.params;
  const offer = await prisma.offerGroup.findFirst({
    where: { id, storeId: session.storeId },
    include: { items: true },
  });

  if (!offer) {
    return apiJson(request, { error: "not_found" }, { status: 404 });
  }

  if (!offer.items.length) {
    return apiJson(request, { error: "no_items" }, { status: 400 });
  }

  try {
    const result = await restoreOfferPrices({
      storeId: session.storeId,
      accessToken: session.accessToken,
      offer,
      force: true,
    });

    const refreshed = await prisma.offerGroup.findFirst({
      where: { id, storeId: session.storeId },
      include: { items: true },
    });

    return apiJson(request, {
      ok: result.ok,
      errors: result.errors,
      pricesApplied: refreshed?.pricesApplied ?? offer.pricesApplied,
    });
  } catch (err) {
    console.error("[offers] manual restore failed", err);
    return apiJson(
      request,
      { error: "restore_failed", message: String(err) },
      { status: 502 },
    );
  }
}
