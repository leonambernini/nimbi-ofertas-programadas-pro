import { NextResponse } from "next/server";
import { runOffersCron } from "@/lib/offer-cron";

/**
 * Cron Vercel: ativa/desativa ofertas e aplica/restaura preços.
 * Protegido por Authorization: Bearer CRON_SECRET
 */
export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "cron_secret_not_configured" },
      { status: 500 },
    );
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runOffersCron();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    console.error("[cron/offers]", err);
    return NextResponse.json({ error: "cron_failed" }, { status: 500 });
  }
}
