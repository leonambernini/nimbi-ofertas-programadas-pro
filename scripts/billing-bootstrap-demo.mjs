/**
 * Bootstrap de billing em loja demo/teste (Nuvemshop).
 *
 * Uso:
 *   npm run billing:bootstrap-demo -- --store=3790898
 *   npm run billing:bootstrap-demo -- --store=3790898 --amount=0
 *   npm run billing:bootstrap-demo -- --store=3790898 --host=br
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

function pickHost() {
  const hostArg = arg("host", "auto");
  if (hostArg === "br") return "https://api.nuvemshop.com.br";
  if (hostArg === "tn") return "https://api.tiendanube.com";
  // BR default se AUTH_HOST=nuvemshop
  if ((process.env.NUVEMSHOP_AUTH_HOST || "").toLowerCase() === "nuvemshop") {
    return "https://api.nuvemshop.com.br";
  }
  return "https://api.tiendanube.com";
}

async function request(label, url, { method = "GET", headers, body }) {
  console.log(`\n→ ${label} ${method} ${url}`);
  if (body) console.log("  body:", JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  console.log(`  status: ${res.status}`);
  console.log(`  response: ${text || "(empty)"}`);
  return {
    ok: res.ok,
    status: res.status,
    data: text ? safeJson(text) : null,
    text,
  };
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function main() {
  const appId = required("NUVEMSHOP_CLIENT_ID");
  const clientSecret = required("NUVEMSHOP_CLIENT_SECRET");
  const concept = process.env.NUVEMSHOP_BILLING_CONCEPT_CODE || "app-cost";
  const serviceId = process.env.NUVEMSHOP_SERVICE_ID || appId;
  const planExternal =
    process.env.BILLING_PLAN_EXTERNAL_REF || "ofertas-pro-mensal";
  const amountCurrency = process.env.BILLING_AMOUNT_CURRENCY || "BRL";
  const amountValue = Number(
    arg("amount", process.env.BILLING_AMOUNT_VALUE || "19.90"),
  );
  const encryptionKey = required("TOKEN_ENCRYPTION_KEY");
  const base = pickHost();
  const versions = arg("version")
    ? [arg("version")]
    : ["2025-03", "v1", "unstable"];

  const storeId =
    arg("store") ||
    process.env.DEV_STORE_ID ||
    process.env.BILLING_BOOTSTRAP_STORE_ID;
  if (!storeId) {
    throw new Error(
      "Informe a loja: --store=3790898 ou DEV_STORE_ID no .env",
    );
  }

  console.log("=== Billing bootstrap (loja demo) ===");
  console.log({
    storeId,
    appId,
    serviceId,
    concept,
    planExternal,
    amountCurrency,
    amountValue,
    base,
    versions,
  });

  const prisma = new PrismaClient();
  try {
    const store = await prisma.store.findUnique({ where: { storeId } });
    if (!store || store.uninstalledAt) {
      throw new Error(
        `Loja ${storeId} não encontrada/instalada no banco. Instale o app primeiro.`,
      );
    }
    const accessToken = decryptToken(store.accessToken, encryptionKey);

    const partnerHeaders = {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/json",
      "User-Agent": "Ofertas Pro billing-bootstrap (ofertaspro@nuvemshop.com)",
    };
    const storeHeaders = {
      Authentication: `bearer ${accessToken}`,
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "Ofertas Pro billing-bootstrap (ofertaspro@nuvemshop.com)",
    };

    // 1) Plano Partner-Action
    let planId = process.env.BILLING_PLAN_ID || arg("plan");
    if (!planId || flag("create-plan")) {
      const planRes = await request(
        "PARTNER",
        `${base}/2025-03/apps/${appId}/plans`,
        {
          method: "POST",
          headers: partnerHeaders,
          body: {
            code: amountCurrency,
            external_reference: `${planExternal}-${Date.now()}`,
            description: "Ofertas Pro — plano mensal (demo bootstrap)",
          },
        },
      );
      if (!planRes.ok) {
        throw new Error("Falha ao criar plano Partner-Action");
      }
      planId = planRes.data.id;
      console.log("\n  Salve no .env: BILLING_PLAN_ID=" + planId);
    } else {
      console.log("\n[1] Usando plano existente:", planId);
    }

    const bodies = [
      {
        name: "plan_id + amount",
        body: {
          plan_id: planId,
          amount_currency: amountCurrency,
          amount_value: amountValue,
        },
      },
      {
        name: "plan_external_id + amount",
        body: {
          plan_external_id: planExternal,
          amount_currency: amountCurrency,
          amount_value: amountValue,
        },
      },
      {
        name: "plan_id only",
        body: { plan_id: planId },
      },
      {
        name: "amount 0 (trial)",
        body: {
          plan_id: planId,
          amount_currency: amountCurrency,
          amount_value: 0,
        },
      },
    ];

    let success = null;

    for (const version of versions) {
      const subPath = `/concepts/${concept}/services/${serviceId}/subscriptions`;
      const url = `${base}/${version}/${storeId}${subPath}`;

      // GET
      const getRes = await request("STORE GET", url, {
        method: "GET",
        headers: storeHeaders,
      });
      if (getRes.ok) {
        console.log("\nSubscription já existe — tentando PATCH...");
        const patchRes = await request("STORE PATCH", url, {
          method: "PATCH",
          headers: storeHeaders,
          body: bodies[0].body,
        });
        if (patchRes.ok) {
          success = { version, method: "PATCH", data: patchRes.data };
          break;
        }
      }

      // POST com variantes de body
      for (const variant of bodies) {
        const postRes = await request(
          `STORE POST (${variant.name})`,
          url,
          {
            method: "POST",
            headers: storeHeaders,
            body: variant.body,
          },
        );
        if (postRes.ok) {
          success = {
            version,
            method: "POST",
            variant: variant.name,
            data: postRes.data,
          };
          break;
        }
      }
      if (success) break;

      // Variante citada pelo suporte: POST /{store}/plans
      await request("STORE POST /plans", `${base}/${version}/${storeId}/plans`, {
        method: "POST",
        headers: storeHeaders,
        body: {
          code: amountCurrency,
          external_reference: `${planExternal}-store-${version}`,
          description: "Ofertas Pro store-scoped plan",
        },
      });
    }

    if (!success) {
      console.error(`
✗ Nenhuma variante criou a subscription.

O que isso indica (suporte Nuvemshop):
- Loja demo ainda sem SubscriptionConcept associado
- Pode faltar plano/preço padrão no Partner Portal
- Ou o POST de criação ainda não está habilitado para este app/loja

Encaminhe este log à My / suporte Partner com:
- app_id=${appId}
- store_id=${storeId}
- plan_id=${planId}
- concept=${concept}
- host=${base}
`);
      process.exit(1);
    }

    console.log("\n=== OK ===");
    console.log(JSON.stringify(success, null, 2));
    console.log("\nAbra /subscription no admin para sincronizar.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("\n✗ Falhou:", err.message);
  process.exit(1);
});
