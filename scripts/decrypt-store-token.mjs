/**
 * Descriptografa o access_token de uma loja no banco.
 *
 * Uso:
 *   npm run token:decrypt -- --store=3790898
 *   npm run token:decrypt -- --store=3790898 --raw
 */

import { createDecipheriv, createHash } from "node:crypto";
import { PrismaClient } from "@prisma/client";

function arg(name, fallback = "") {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
}

function flag(name) {
  return process.argv.includes(`--${name}`);
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

function decryptToken(payload, encryptionKey) {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error("Invalid encrypted token format");
  }
  const key = createHash("sha256").update(encryptionKey).digest();
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}

async function main() {
  const encryptionKey = required("TOKEN_ENCRYPTION_KEY");
  const storeId =
    arg("store") ||
    process.env.DEV_STORE_ID ||
    process.env.BILLING_BOOTSTRAP_STORE_ID;

  if (!storeId) {
    throw new Error("Informe a loja: --store=3790898");
  }

  const prisma = new PrismaClient();
  try {
    const store = await prisma.store.findUnique({ where: { storeId } });
    if (!store) {
      throw new Error(`Loja ${storeId} não encontrada no banco.`);
    }

    const accessToken = decryptToken(store.accessToken, encryptionKey);

    if (flag("raw")) {
      process.stdout.write(accessToken);
      return;
    }

    console.log("=== Access token ===");
    console.log({
      storeId: store.storeId,
      storeName: store.storeName,
      domain: store.domain,
      uninstalledAt: store.uninstalledAt,
    });
    console.log("\naccess_token:");
    console.log(accessToken);
    console.log(
      "\n⚠️  Token sensível — não compartilhe em chat/PR/logs públicos.",
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("✗", err.message);
  process.exit(1);
});
