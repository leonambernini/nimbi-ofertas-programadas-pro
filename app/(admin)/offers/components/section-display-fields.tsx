"use client";

import dynamic from "next/dynamic";
import {
  Box,
  FileUploader,
  Label,
  Select,
  Text,
  Thumbnail,
} from "@nimbus-ds/components";
import { FormField } from "@nimbus-ds/patterns";
import {
  ITEMS_PER_ROW_OPTIONS,
  SECTION_LAYOUTS,
} from "@/lib/offer-display";
import { useLocale } from "@/lib/i18n/locale-context";
import type { OfferSectionDisplayConfig } from "@/lib/types";

const Editor = dynamic(() => import("@nimbus-ds/editor"), { ssr: false });

const EDITOR_MODULES = [
  "bold",
  "italic",
  "link",
  "unorderedList",
  "orderedList",
  "header",
  "history",
  "clearFormating",
  "divider",
] as const;

type Props = {
  value: OfferSectionDisplayConfig;
  uploading?: boolean;
  onChange: (next: OfferSectionDisplayConfig) => void;
  onUploadBanner: (
    which: "bannerTopUrl" | "bannerBottomUrl",
    file: File | null,
  ) => void;
};

function fieldValue(event: { target: EventTarget }): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

type FileUploaderChangeEvent = {
  target: EventTarget & { files?: FileList | null };
};

/** Lexical/HTML vazio → null; mantém HTML rico quando há texto. */
function normalizeEditorHtml(html: string): string | null {
  const trimmed = html.trim();
  if (!trimmed) return null;
  const plain = trimmed
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length ? trimmed : null;
}

export function SectionDisplayFields({
  value,
  uploading,
  onChange,
  onUploadBanner,
}: Props) {
  const { dict } = useLocale();
  const f = dict.form;

  const patch = (partial: Partial<OfferSectionDisplayConfig>) => {
    onChange({ ...value, ...partial });
  };

  return (
    <Box display="flex" flexDirection="column" gap="3">
      <FormField label={f.sectionTitle}>
        <FormField.Input
          value={value.title ?? ""}
          onChange={(e) => patch({ title: fieldValue(e) || null })}
          placeholder={f.sectionTitlePlaceholder}
        />
      </FormField>
      <FormField label={f.sectionSubtitle}>
        <FormField.Input
          value={value.subtitle ?? ""}
          onChange={(e) => patch({ subtitle: fieldValue(e) || null })}
          placeholder={f.sectionSubtitlePlaceholder}
        />
      </FormField>

      <Box display="flex" flexDirection="column" gap="2">
        <Label>{f.sectionTextTop}</Label>
        <Editor
          parser="html"
          value={value.textTop ?? ""}
          placeholder={f.sectionTextTopPlaceholder}
          renderModules={[...EDITOR_MODULES]}
          onChange={(data) => patch({ textTop: normalizeEditorHtml(data) })}
        />
      </Box>

      <Box display="flex" flexDirection="column" gap="2">
        <Label>{f.sectionTextBottom}</Label>
        <Editor
          parser="html"
          value={value.textBottom ?? ""}
          placeholder={f.sectionTextBottomPlaceholder}
          renderModules={[...EDITOR_MODULES]}
          onChange={(data) => patch({ textBottom: normalizeEditorHtml(data) })}
        />
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="3">
        <Box display="flex" flexDirection="column" gap="2">
          <Label>{f.sectionBannerTop}</Label>
          <FileUploader
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            placeholder={uploading ? "..." : f.uploadImage}
            height="100px"
            disabled={uploading}
            onChange={(event: FileUploaderChangeEvent) => {
              onUploadBanner(
                "bannerTopUrl",
                event.target.files?.[0] ?? null,
              );
            }}
          />
          {value.bannerTopUrl ? (
            <Thumbnail
              src={value.bannerTopUrl}
              alt={f.sectionBannerTop}
              width="100%"
            />
          ) : null}
        </Box>
        <Box display="flex" flexDirection="column" gap="2">
          <Label>{f.sectionBannerBottom}</Label>
          <FileUploader
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            placeholder={uploading ? "..." : f.uploadImage}
            height="100px"
            disabled={uploading}
            onChange={(event: FileUploaderChangeEvent) => {
              onUploadBanner(
                "bannerBottomUrl",
                event.target.files?.[0] ?? null,
              );
            }}
          />
          {value.bannerBottomUrl ? (
            <Thumbnail
              src={value.bannerBottomUrl}
              alt={f.sectionBannerBottom}
              width="100%"
            />
          ) : null}
        </Box>
      </Box>

      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="3">
        <Box display="flex" flexDirection="column" gap="2">
          <Label>{f.sectionLayout}</Label>
          <Select
            id={`section-layout-${value.layout}`}
            name="section-layout"
            value={value.layout}
            onChange={(e) =>
              patch({
                layout: e.target.value === "carousel" ? "carousel" : "grid",
              })
            }>
            {SECTION_LAYOUTS.map((layout) => (
              <Select.Option
                key={layout}
                label={
                  layout === "carousel"
                    ? f.sectionLayoutCarousel
                    : f.sectionLayoutGrid
                }
                value={layout}
              />
            ))}
          </Select>
        </Box>
        <Box display="flex" flexDirection="column" gap="2">
          <Label>{f.sectionItemsPerRow}</Label>
          <Select
            id={`section-cols-${value.itemsPerRow}`}
            name="section-items-per-row"
            value={String(value.itemsPerRow)}
            onChange={(e) => patch({ itemsPerRow: Number(e.target.value) })}>
            {ITEMS_PER_ROW_OPTIONS.map((n) => (
              <Select.Option key={n} label={String(n)} value={String(n)} />
            ))}
          </Select>
          <Text fontSize="caption" color="neutral-textLow">
            {f.sectionItemsPerRowHelp}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
