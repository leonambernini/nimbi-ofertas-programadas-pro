/** Modelos visuais e opções do banner de loja (barra com cronômetro). */

export type BannerModel = "solid" | "strip" | "soft" | "urgent";

export type BannerAnimation = "none" | "pulse" | "shine" | "slide";

/** Alinhamento do conteúdo (textos + cronômetro) dentro do banner. */
export type BannerTextAlign = "left" | "center" | "right";

/**
 * Posição do botão/CTA:
 * - before / after: botão com texto
 * - full: banner inteiro clicável (só link, sem texto de botão)
 */
export type BannerButtonPosition = "before" | "after" | "full";

export const BANNER_MODELS: BannerModel[] = [
  "solid",
  "strip",
  "soft",
  "urgent",
];

export const BANNER_ANIMATIONS: BannerAnimation[] = [
  "none",
  "pulse",
  "shine",
  "slide",
];

export const BANNER_TEXT_ALIGNS: BannerTextAlign[] = [
  "left",
  "center",
  "right",
];

export const BANNER_BUTTON_POSITIONS: BannerButtonPosition[] = [
  "before",
  "after",
  "full",
];

/**
 * Escala de espaçamento (níveis 0–5, como `mt-*` / `mb-*` do Bootstrap).
 * CSS aplicado em px: 0, 5, 10, 15, 20, 25.
 */
export type BannerSpacing = 0 | 1 | 2 | 3 | 4 | 5;

export const BANNER_SPACINGS: BannerSpacing[] = [0, 1, 2, 3, 4, 5];

/** Valores em px aplicados no storefront. */
export const BANNER_SPACING_PX: Record<BannerSpacing, number> = {
  0: 0,
  1: 5,
  2: 10,
  3: 15,
  4: 20,
  5: 25,
};

export const DEFAULT_BANNER_MODEL: BannerModel = "solid";
export const DEFAULT_BANNER_ANIMATION: BannerAnimation = "none";
export const DEFAULT_BANNER_TEXT_ALIGN: BannerTextAlign = "center";
export const DEFAULT_BANNER_BUTTON_POSITION: BannerButtonPosition = "after";
export const DEFAULT_BANNER_SPACING: BannerSpacing = 0;

export function parseBannerModel(value: unknown): BannerModel {
  if (
    typeof value === "string" &&
    BANNER_MODELS.includes(value as BannerModel)
  ) {
    return value as BannerModel;
  }
  return DEFAULT_BANNER_MODEL;
}

export function parseBannerAnimation(value: unknown): BannerAnimation {
  if (
    typeof value === "string" &&
    BANNER_ANIMATIONS.includes(value as BannerAnimation)
  ) {
    return value as BannerAnimation;
  }
  return DEFAULT_BANNER_ANIMATION;
}

export function parseBannerTextAlign(value: unknown): BannerTextAlign {
  if (
    typeof value === "string" &&
    BANNER_TEXT_ALIGNS.includes(value as BannerTextAlign)
  ) {
    return value as BannerTextAlign;
  }
  return DEFAULT_BANNER_TEXT_ALIGN;
}

export function parseBannerButtonPosition(
  value: unknown,
): BannerButtonPosition {
  if (
    typeof value === "string" &&
    BANNER_BUTTON_POSITIONS.includes(value as BannerButtonPosition)
  ) {
    return value as BannerButtonPosition;
  }
  return DEFAULT_BANNER_BUTTON_POSITION;
}

export function parseBannerSpacing(value: unknown): BannerSpacing {
  const n = typeof value === "string" ? Number(value) : Number(value);
  if (BANNER_SPACINGS.includes(n as BannerSpacing)) {
    return n as BannerSpacing;
  }
  return DEFAULT_BANNER_SPACING;
}

export function bannerSpacingCss(value: BannerSpacing): string {
  return `${BANNER_SPACING_PX[value]}px`;
}
