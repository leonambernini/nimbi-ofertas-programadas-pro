import type { PriceFillMode } from "@/lib/types";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calcula preço promocional a partir do preço original.
 * - percent: desconto percentual (ex.: 20 = 20% off)
 * - fixed: desconto fixo em valor absoluto
 * - manual: não altera (retorna o próprio offerPrice informado)
 */
export function computeOfferPrice(
  originalPrice: number,
  mode: PriceFillMode,
  fillValue: number | null | undefined,
  manualOfferPrice?: number | null,
): number {
  const base = Number(originalPrice);
  if (!Number.isFinite(base) || base < 0) return 0;

  if (mode === "manual") {
    const manual = Number(manualOfferPrice ?? base);
    return roundMoney(Math.max(0, manual));
  }

  const value = Number(fillValue ?? 0);
  if (!Number.isFinite(value) || value < 0) {
    return roundMoney(base);
  }

  if (mode === "percent") {
    const pct = Math.min(100, value);
    return roundMoney(Math.max(0, base * (1 - pct / 100)));
  }

  // fixed
  return roundMoney(Math.max(0, base - value));
}

export function discountPercent(
  originalPrice: number,
  offerPrice: number,
): number {
  if (!originalPrice || originalPrice <= 0) return 0;
  return roundMoney(((originalPrice - offerPrice) / originalPrice) * 100);
}
