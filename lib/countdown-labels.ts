/** Defaults dos textos dos modelos — usados quando o lojista deixa o campo vazio. */
export const DEFAULT_COUNTDOWN_TEXT_1 = "A oferta expira em";
export const DEFAULT_COUNTDOWN_TEXT_2 = "Aproveite agora";

export function resolveCountdownText(
  value: string | null | undefined,
  fallback: string,
): string {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed || fallback;
}
