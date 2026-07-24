import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * OAuth2 Nuvemshop — authorization_code.
 * Docs: https://tiendanube.github.io/api-documentation/authentication
 *
 * - Tokens não expiram (só invalidam com novo token ou desinstalação).
 * - `user_id` = store_id da loja.
 * - Domínios equivalentes: tiendanube.com ↔ nuvemshop.com.br
 */

export type OAuthTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  user_id?: number | string;
  store_id?: number | string;
};

const STATE_COOKIE = "ofertas_oauth_state";
const STATE_MAX_AGE = 60 * 10; // 10 minutos (code expira em 5)

export function oauthAuthorizeBaseUrl(): string {
  // BR: nuvemshop.com.br | LATAM: tiendanube.com (equivalentes na doc)
  return process.env.NUVEMSHOP_AUTH_HOST === "nuvemshop"
    ? "https://www.nuvemshop.com.br"
    : "https://www.tiendanube.com";
}

export function createOAuthState(): string {
  return randomBytes(24).toString("hex");
}

export function stateCookieHeader(state: string): string {
  const secure = env.appUrl().startsWith("https") ? "; Secure" : "";
  return `${STATE_COOKIE}=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${STATE_MAX_AGE}${secure}`;
}

export function clearStateCookieHeader(): string {
  return `${STATE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readStateFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${STATE_COOKIE}=`));
  return match ? match.slice(STATE_COOKIE.length + 1) : null;
}

export function buildAuthorizeUrl(state: string): string {
  const clientId = env.nuvemshopClientId();
  const url = new URL(
    `${oauthAuthorizeBaseUrl()}/apps/${clientId}/authorize`,
  );
  url.searchParams.set("state", state);
  return url.toString();
}

export async function exchangeAuthorizationCode(
  code: string,
): Promise<OAuthTokenResponse> {
  const response = await fetch(
    `${oauthAuthorizeBaseUrl()}/apps/authorize/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Body JSON — nunca query string (erro comum na doc)
      body: JSON.stringify({
        client_id: env.nuvemshopClientId(),
        client_secret: env.nuvemshopClientSecret(),
        grant_type: "authorization_code",
        code,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`token_exchange_failed: ${response.status} ${body}`);
  }

  return (await response.json()) as OAuthTokenResponse;
}

/** Extrai store_id do token (`user_id` ou `store_id`, conforme doc). */
export function storeIdFromToken(token: OAuthTokenResponse): string {
  const raw = token.user_id ?? token.store_id;
  if (raw === undefined || raw === null || raw === "") {
    throw new Error("missing_store_id_in_token");
  }
  return String(raw);
}

/** Hash opcional para logs sem vazar o code/token. */
export function shortHash(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 8);
}

/**
 * URL do app no Admin Enhanced:
 * https://{dominio-da-loja}/admin/apps/{app_id}
 */
export function buildEnhancedAdminUrl(storeDomain: string | null | undefined): string {
  const appId = env.nuvemshopClientId();
  if (!storeDomain) {
    return new URL("/offers", env.appUrl()).toString();
  }
  const host = storeDomain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return `https://${host}/admin/apps/${appId}`;
}
