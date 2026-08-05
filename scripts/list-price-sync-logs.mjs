/**
 * Lista logs de sincronização de preços (ofertas.offer_cron_logs) de uma loja.
 *
 * Uso:
 *   # Exibe no console (JSON)
 *   npm run logs:list -- --store=8036520
 *
 *   # Salva em arquivo
 *   npm run logs:list -- --store=8036520 --out=./tmp/logs-8036520.json
 *
 *   # Filtros opcionais
 *   npm run logs:list -- --store=8036520 --action=restore --success=false
 *   npm run logs:list -- --store=8036520 --limit=50
 *   npm run logs:list -- --store=8036520 --offer=clxxxxxxxx
 *
 *   # Resumo amigável no console (sem dump JSON completo)
 *   npm run logs:list -- --store=8036520 --summary
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACTIONS = new Set(["apply", "restore", "activate", "deactivate"]);

function arg(name, fallback = "") {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function usage() {
  console.log(`
Uso:
  npm run logs:list -- --store=<storeId> [--out=arquivo.json] [--limit=N]
                       [--action=apply|restore|activate|deactivate]
                       [--success=true|false] [--offer=<offerGroupId>]
                       [--summary]

Exemplos:
  npm run logs:list -- --store=8036520
  npm run logs:list -- --store=8036520 --out=./tmp/logs.json
  npm run logs:list -- --store=8036520 --action=restore --summary
`);
}

async function main() {
  const storeId = arg("store").trim();
  if (!storeId) {
    usage();
    process.exit(1);
  }

  const outPath = arg("out").trim();
  const offerId = arg("offer").trim();
  const actionParam = arg("action").trim();
  const successParam = arg("success").trim().toLowerCase();
  const limitRaw = arg("limit").trim();
  const summaryOnly = flag("summary");

  const action =
    actionParam && ACTIONS.has(actionParam) ? actionParam : undefined;

  let success;
  if (successParam === "true") success = true;
  else if (successParam === "false") success = false;

  const take = limitRaw
    ? Math.max(1, Math.min(10_000, Number(limitRaw) || 1000))
    : undefined;

  const where = {
    offerGroup: { storeId },
    ...(action ? { action } : {}),
    ...(success !== undefined ? { success } : {}),
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
            startsAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    }),
  ]);

  const logs = rows.map((row) => ({
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
      startsAt: row.offerGroup.startsAt.toISOString(),
      endsAt: row.offerGroup.endsAt.toISOString(),
    },
  }));

  const payload = {
    storeId,
    generatedAt: new Date().toISOString(),
    filters: {
      action: action ?? null,
      success: success ?? null,
      offerId: offerId || null,
      limit: take ?? null,
    },
    total,
    returned: logs.length,
    logs,
  };

  console.log("[logs:list] resumo", {
    storeId,
    total,
    returned: logs.length,
    action: action ?? "all",
    success: success ?? "all",
    offerId: offerId || null,
  });

  if (summaryOnly) {
    for (const log of logs) {
      console.log(
        [
          log.createdAt,
          log.action.padEnd(10),
          log.success ? "ok" : "FAIL",
          log.offer.name,
          (log.message ?? "").slice(0, 80),
        ].join(" | "),
      );
    }
  }

  if (outPath) {
    const absolute = path.resolve(outPath);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.log(`[logs:list] salvo em ${absolute}`);
  } else if (!summaryOnly) {
    console.log(JSON.stringify(payload, null, 2));
  }
}

main()
  .catch((err) => {
    console.error("[logs:list] erro:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
