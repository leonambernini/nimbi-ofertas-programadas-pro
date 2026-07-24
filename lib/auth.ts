/**
 * Autenticação das APIs do painel Enhanced Admin:
 * - Admin API → session token do Nexo (JWT HS256 com Client Secret)
 * - Webhooks → HMAC-SHA256 no body raw
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { decodeJwt, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { apiJson } from "@/lib/api-http";
import { decryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import type { Store } from "@prisma/client";

export type AdminSession = {
  storeId: string;
  store: Store;
  accessToken: string;
};

function unauthorized(request: Request, error: string): NextResponse {
  return apiJson(request, { error }, { status: 401, logContext: { authError: error } });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

/**
 * Valida JWT do Nexo e carrega a loja no banco (multi-tenant).
 * Em desenvolvimento sem token, usa DEV_STORE_ID se configurado.
 */
export async function requireAdminSession(
  request: Request,
): Promise<AdminSession | NextResponse> {
  const token = bearerToken(request);

  if (!token) {
    if (process.env.NODE_ENV === "development") {
      const devStoreId = process.env.DEV_STORE_ID;
      if (devStoreId) {
        const store = await prisma.store.findUnique({
          where: { storeId: devStoreId },
        });
        if (store && !store.uninstalledAt) {
          return {
            storeId: store.storeId,
            store,
            accessToken: decryptToken(store.accessToken),
          };
        }
      }
      return unauthorized(request, "missing_token");
    }
    return unauthorized(request, "missing_token");
  }

  try {
    const secret = new TextEncoder().encode(env.nuvemshopClientSecret());
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const storeId = String(payload.storeId ?? payload.store_id ?? "");
    if (!storeId) {
      return unauthorized(request, "missing_store");
    }

    const store = await prisma.store.findUnique({ where: { storeId } });
    if (!store || store.uninstalledAt) {
      return unauthorized(request, "store_not_installed");
    }

    return {
      storeId: store.storeId,
      store,
      accessToken: decryptToken(store.accessToken),
    };
  } catch (error) {
    let claims: unknown = null;
    try {
      claims = decodeJwt(token);
    } catch {
      // ignore
    }
    if (process.env.NODE_ENV === "development") {
      console.warn("[auth] invalid_token", {
        reason: error instanceof Error ? error.message : String(error),
        claims,
      });
    }
    return unauthorized(request, "invalid_token");
  }
}

export function isAdminSession(
  value: AdminSession | NextResponse,
): value is AdminSession {
  return !(value instanceof NextResponse);
}

export function verifyWebhookSignature(
  rawBody: string,
  request: Request,
): boolean {
  const signature =
    request.headers.get("x-linkedstore-hmac-sha256") ??
    request.headers.get("x-linkedstore-auth");
  if (!signature) return false;

  const secrets = [
    env.nuvemshopClientSecret(),
    process.env.NUVEMSHOP_WEBHOOK_SECRET,
  ].filter((secret): secret is string => Boolean(secret));

  return secrets.some((secret) => {
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    return safeEqual(signature, expected);
  });
}
