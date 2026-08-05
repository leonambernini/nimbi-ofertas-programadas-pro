/**
 * Limpa a tabela de logs de sincronização de preços (ofertas.offer_cron_logs).
 *
 * Uso:
 *   # Conta quantos logs seriam apagados (dry-run)
 *   npm run logs:clear -- --all
 *
 *   # Apaga todos
 *   npm run logs:clear -- --all --yes
 *
 *   # Apaga só de uma loja
 *   npm run logs:clear -- --store=8036520 --yes
 *
 *   # Apaga logs com mais de N dias
 *   npm run logs:clear -- --older-than-days=7 --yes
 *
 *   # Combinações
 *   npm run logs:clear -- --store=8036520 --older-than-days=1 --yes
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  npm run logs:clear -- --all [--yes]
  npm run logs:clear -- --store=<storeId> [--yes]
  npm run logs:clear -- --older-than-days=<n> [--yes]
  npm run logs:clear -- --store=<storeId> --older-than-days=<n> [--yes]

Sem --yes apenas mostra a contagem (dry-run).
`);
}

async function main() {
  const all = flag("all");
  const storeId = arg("store").trim();
  const olderThanDaysRaw = arg("older-than-days").trim();
  const confirm = flag("yes");

  if (!all && !storeId && !olderThanDaysRaw) {
    usage();
    process.exit(1);
  }

  let olderThan = null;
  if (olderThanDaysRaw) {
    const days = Number(olderThanDaysRaw);
    if (!Number.isFinite(days) || days <= 0) {
      throw new Error("--older-than-days deve ser um número > 0");
    }
    olderThan = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  }

  /** @type {import("@prisma/client").Prisma.OfferCronLogWhereInput} */
  const where = {};

  if (storeId) {
    where.offerGroup = { storeId };
  }

  if (olderThan) {
    where.createdAt = { lt: olderThan };
  }

  // --all sem filtros = apaga tudo; com store/older-than restringe
  if (!all && !storeId && !olderThan) {
    usage();
    process.exit(1);
  }

  const total = await prisma.offerCronLog.count({ where });

  console.log("[logs:clear] filtros", {
    all,
    storeId: storeId || null,
    olderThan: olderThan?.toISOString() ?? null,
    matching: total,
  });

  if (total === 0) {
    console.log("[logs:clear] nada para apagar.");
    return;
  }

  if (!confirm) {
    console.log(
      `[logs:clear] dry-run: ${total} registro(s). Rode de novo com --yes para apagar.`,
    );
    return;
  }

  const result = await prisma.offerCronLog.deleteMany({ where });
  console.log(`[logs:clear] apagados: ${result.count}`);
}

main()
  .catch((err) => {
    console.error("[logs:clear] erro:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
