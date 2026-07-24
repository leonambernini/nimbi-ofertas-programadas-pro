import { NextResponse } from "next/server";
import { encryptToken } from "@/lib/crypto";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { provisionBillingOnInstall } from "@/lib/nuvemshop-billing";
import { fetchStore, localizeField } from "@/lib/nuvemshop-client";
import {
  buildEnhancedAdminUrl,
  clearStateCookieHeader,
  exchangeAuthorizationCode,
  readStateFromCookie,
  shortHash,
  storeIdFromToken,
} from "@/lib/nuvemshop-oauth";

function errorRedirect(reason: string) {
  const response = NextResponse.redirect(
    new URL(`/install-error?reason=${reason}`, env.appUrl()),
  );
  response.headers.append("Set-Cookie", clearStateCookieHeader());
  return response;
}

/**
 * Callback OAuth2:
 * 1. Valida `state` (CSRF)
 * 2. Troca `code` → access_token (body JSON)
 * 3. Upsert da loja (user_id = store_id)
 * 4. Provisiona billing: webhooks + trial 7 dias + vincula plano
 *
 * Docs:
 * - https://tiendanube.github.io/api-documentation/authentication
 * - https://tiendanube.github.io/api-documentation/resources/billing
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return errorRedirect("oauth_denied");
  if (!code) return errorRedirect("missing_code");

  // CSRF: só exige `state` quando a instalação partiu da nossa rota
  // /api/auth/nuvemshop/authorize (cookie setado).
  // Instalação pelo Admin/Partner Portal da Nuvemshop vem só com `code`
  // (sem state) — fluxo oficial da plataforma, permitido.
  const expectedState = readStateFromCookie(request.headers.get("cookie"));
  if (expectedState) {
    if (!state || state !== expectedState) {
      console.warn("[oauth] invalid_state", {
        hasState: Boolean(state),
        hasCookie: true,
      });
      return errorRedirect("invalid_state");
    }
  } else if (state) {
    // State na URL sem cookie correspondente (ex.: cookie bloqueado) — segue
    // com o code; o code é single-use e expira em 5 min.
    console.warn("[oauth] state_without_cookie — continuing with code");
  }

  try {
    const tokenJson = await exchangeAuthorizationCode(code);
    const storeId = storeIdFromToken(tokenJson);
    const accessToken = tokenJson.access_token;

    console.info("[oauth] installed", {
      storeId,
      scope: tokenJson.scope,
      codeHash: shortHash(code),
    });

    let storeMeta: Awaited<ReturnType<typeof fetchStore>> | null = null;
    try {
      storeMeta = await fetchStore(storeId, accessToken);
    } catch (err) {
      console.warn("[oauth] could not fetch store meta", err);
    }

    const language = storeMeta?.main_language ?? "pt";
    const storeName = localizeField(storeMeta?.name, language);

    await prisma.store.upsert({
      where: { storeId },
      create: {
        storeId,
        accessToken: encryptToken(accessToken),
        storeName,
        email: storeMeta?.email ?? null,
        domain: storeMeta?.original_domain ?? null,
        language,
        country: storeMeta?.country ?? null,
        currency: storeMeta?.main_currency ?? null,
        uninstalledAt: null,
      },
      update: {
        accessToken: encryptToken(accessToken),
        storeName: storeName ?? undefined,
        email: storeMeta?.email ?? undefined,
        domain: storeMeta?.original_domain ?? undefined,
        language: storeMeta?.main_language ?? undefined,
        country: storeMeta?.country ?? undefined,
        currency: storeMeta?.main_currency ?? undefined,
        uninstalledAt: null,
        installedAt: new Date(),
      },
    });

    // Webhooks + trial local + plano Nuvemshop (amount 0 até ativar)
    try {
      await provisionBillingOnInstall(storeId, accessToken);
    } catch (err) {
      console.warn("[oauth] billing provision skipped", err);
    }

    // Após instalar, abre o app no Admin Enhanced da loja
    // (ex.: https://loja.lojavirtualnuvem.com.br/admin/apps/{app_id})
    const enhancedUrl = buildEnhancedAdminUrl(storeMeta?.original_domain);
    console.info("[oauth] redirect_enhanced", { enhancedUrl });

    const response = NextResponse.redirect(enhancedUrl);
    response.headers.append("Set-Cookie", clearStateCookieHeader());
    return response;
  } catch (err) {
    console.error("[oauth] unexpected error", err);
    return errorRedirect("unexpected");
  }
}
