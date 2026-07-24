import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  createOAuthState,
  stateCookieHeader,
} from "@/lib/nuvemshop-oauth";

/**
 * Inicia OAuth2 authorization_code.
 * Partner Portal → Redirect URI:
 *   {APP_URL}/api/auth/nuvemshop/callback
 *
 * Docs: https://tiendanube.github.io/api-documentation/authentication
 */
export async function GET() {
  const state = createOAuthState();
  const response = NextResponse.redirect(buildAuthorizeUrl(state));
  response.headers.append("Set-Cookie", stateCookieHeader(state));
  return response;
}
