import { NextResponse } from "next/server";

export function apiJson(
  _request: Request,
  body: unknown,
  init?: { status?: number; logContext?: Record<string, unknown> },
): NextResponse {
  if (init?.logContext && process.env.NODE_ENV === "development") {
    console.warn("[api]", init.logContext);
  }
  return NextResponse.json(body, { status: init?.status ?? 200 });
}
