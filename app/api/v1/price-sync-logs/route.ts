import { apiJson } from "@/lib/api-http";
import { isAdminSession, requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { OfferCronAction } from "@prisma/client";

const ACTIONS: OfferCronAction[] = [
  "apply",
  "restore",
  "activate",
  "deactivate",
];

export async function GET(request: Request) {
  const session = await requireAdminSession(request);
  if (!isAdminSession(session)) return session;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(
    50,
    Math.max(1, Number(searchParams.get("pageSize") ?? 30) || 30),
  );
  const actionParam = searchParams.get("action");
  const successParam = searchParams.get("success"); // true|false|all
  const offerId = searchParams.get("offerId");

  const action =
    actionParam && ACTIONS.includes(actionParam as OfferCronAction)
      ? (actionParam as OfferCronAction)
      : undefined;

  const where = {
    offerGroup: { storeId: session.storeId },
    ...(action ? { action } : {}),
    ...(successParam === "true" ? { success: true } : {}),
    ...(successParam === "false" ? { success: false } : {}),
    ...(offerId ? { offerGroupId: offerId } : {}),
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
