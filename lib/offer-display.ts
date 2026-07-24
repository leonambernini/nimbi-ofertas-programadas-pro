import type { Prisma } from "@prisma/client";
import type { OfferSectionDisplayConfig, OfferSectionLayout } from "@/lib/types";

export const DEFAULT_SECTION_DISPLAY: OfferSectionDisplayConfig = {
  title: null,
  subtitle: null,
  textTop: null,
  textBottom: null,
  bannerTopUrl: null,
  bannerBottomUrl: null,
  layout: "grid",
  itemsPerRow: 4,
};

export const SECTION_LAYOUTS: OfferSectionLayout[] = ["grid", "carousel"];
export const ITEMS_PER_ROW_OPTIONS = [2, 3, 4] as const;

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asLayout(value: unknown): OfferSectionLayout {
  return value === "carousel" ? "carousel" : "grid";
}

function asItemsPerRow(value: unknown): number {
  const n = Number(value);
  if (n === 2 || n === 3 || n === 4) return n;
  return DEFAULT_SECTION_DISPLAY.itemsPerRow;
}

export function parseSectionDisplayConfig(
  input: unknown,
): OfferSectionDisplayConfig {
  const raw =
    input && typeof input === "object" && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};

  return {
    title: asNullableString(raw.title),
    subtitle: asNullableString(raw.subtitle),
    textTop: asNullableString(raw.textTop),
    textBottom: asNullableString(raw.textBottom),
    bannerTopUrl: asNullableString(raw.bannerTopUrl),
    bannerBottomUrl: asNullableString(raw.bannerBottomUrl),
    layout: asLayout(raw.layout),
    itemsPerRow: asItemsPerRow(raw.itemsPerRow),
  };
}

export function sectionDisplayToJson(
  config: OfferSectionDisplayConfig,
): Prisma.InputJsonValue {
  return {
    title: config.title,
    subtitle: config.subtitle,
    textTop: config.textTop,
    textBottom: config.textBottom,
    bannerTopUrl: config.bannerTopUrl,
    bannerBottomUrl: config.bannerBottomUrl,
    layout: config.layout,
    itemsPerRow: config.itemsPerRow,
  };
}

export function emptySectionDisplay(): OfferSectionDisplayConfig {
  return { ...DEFAULT_SECTION_DISPLAY };
}
