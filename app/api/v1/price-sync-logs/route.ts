import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { OfferCronAction, Prisma } from "@prisma/client";

const ACTIONS: OfferCronAction[] = [
  "apply",
  "restore",
  "activate",
  "deactivate",
];

function parseDayBoundary(
  value: string | null,
  endOfDay: boolean,
): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(
    `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number(searchParams.get("pageSize") ?? 20) || 20),
  );
  const actionParam = searchParams.get("action");
  const successParam = searchParams.get("success"); // true|false|all
  const offerId = searchParams.get("offerId");
  const q = (searchParams.get("q") ?? "").trim();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const action =
    actionParam && ACTIONS.includes(actionParam as OfferCronAction)
      ? (actionParam as OfferCronAction)
      : undefined;

  const fromDate = parseDayBoundary(fromParam, false);
  const toDate = parseDayBoundary(toParam, true);

  let offerGroupIds: string[] | undefined;
  if (offerId) {
    offerGroupIds = [offerId];
  } else if (q) {
    /**
     * Busca case-insensitive via ILIKE (raw).
     * `mode: "insensitive"` do Prisma falha em algumas collations do PG.
     */
    const matched = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM ofertas.offer_groups
      WHERE store_id = ${session.storeId}
        AND name ILIKE ${`%${q}%`}
    `;
    offerGroupIds = matched.map((row) => row.id);
    if (offerGroupIds.length === 0) {
      return apiJson(request, {
        page,
        pageSize,
        total: 0,
        totalPages: 1,
        logs: [],
      });
    }
  }

  const createdAtFilter: Prisma.DateTimeFilter | undefined =
    fromDate || toDate
      ? {
          ...(fromDate ? { gte: fromDate } : {}),
          ...(toDate ? { lte: toDate } : {}),
        }
      : undefined;

  const where: Prisma.OfferCronLogWhereInput = {
    offerGroup: { storeId: session.storeId },
    ...(action ? { action } : {}),
    ...(successParam === "true" ? { success: true } : {}),
    ...(successParam === "false" ? { success: false } : {}),
    ...(offerGroupIds ? { offerGroupId: { in: offerGroupIds } } : {}),
    ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.offerCronLog.count({ where }),
    prisma.offerCronLog.findMany({
      where,
      include: {
        offerGroup: {
          select: {
            id: true,
            name: true,
            status: true,
            enabled: true,
            pricesApplied: true,
            autoApplyPrices: true,
            endsAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return apiJson(request, {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    logs: rows.map((row) => ({
      id: row.id,
      action: row.action,
      success: row.success,
      message: row.message,
      details: row.details,
      createdAt: row.createdAt.toISOString(),
      offer: {
        id: row.offerGroup.id,
        name: row.offerGroup.name,
        status: row.offerGroup.status,
        enabled: row.offerGroup.enabled,
        pricesApplied: row.offerGroup.pricesApplied,
        autoApplyPrices: row.offerGroup.autoApplyPrices,
        endsAt: row.offerGroup.endsAt.toISOString(),
      },
    })),
  });
}
