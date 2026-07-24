"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Input,
  Label,
  Select,
  Table,
  Text,
  Thumbnail,
} from "@nimbus-ds/components";
import { SideModal } from "@nimbus-ds/patterns";
import { t } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { computeOfferPrice } from "@/lib/pricing";
import type { ApiOfferItem, PriceFillMode } from "@/lib/types";

type ProductGroup = {
  id: string;
  productId: number;
  name: string;
  imageUrl: string | null;
  variants: ApiOfferItem[];
};

function groupItems(items: ApiOfferItem[]): ProductGroup[] {
  const map = new Map<number, ProductGroup>();
  for (const item of items) {
    const current = map.get(item.productId);
    if (current) {
      current.variants.push(item);
    } else {
      map.set(item.productId, {
        id: String(item.productId),
        productId: item.productId,
        name: item.productName ?? `Produto ${item.productId}`,
        imageUrl: item.imageUrl,
        variants: [item],
      });
    }
  }
  return [...map.values()];
}

function fieldValue(event: { target: EventTarget }): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

export function PriceConfigSideModal({
  open,
  items,
  fillMode: initialFillMode,
  fillValue: initialFillValue,
  onClose,
  onApply,
}: {
  open: boolean;
  items: ApiOfferItem[];
  fillMode: PriceFillMode;
  fillValue: string;
  onClose: () => void;
  onApply: (payload: {
    items: ApiOfferItem[];
    fillMode: PriceFillMode;
    fillValue: string;
  }) => void;
}) {
  const { dict } = useLocale();
  const [draftItems, setDraftItems] = useState<ApiOfferItem[]>(items);
  const [fillMode, setFillMode] = useState<PriceFillMode>(initialFillMode);
  const [fillValue, setFillValue] = useState(initialFillValue);

  useEffect(() => {
    if (!open) return;
    setDraftItems(items);
    setFillMode(initialFillMode);
    setFillValue(initialFillValue);
  }, [open, items, initialFillMode, initialFillValue]);

  const groups = useMemo(() => groupItems(draftItems), [draftItems]);

  const updateVariantPrice = (
    productId: number,
    variantId: number,
    offerPrice: number,
  ) => {
    setDraftItems((current) =>
      current.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, offerPrice }
          : item,
      ),
    );
  };

  const applyFillToTable = () => {
    const value = Number(fillValue);
    setDraftItems((current) =>
      current.map((item) => ({
        ...item,
        offerPrice: computeOfferPrice(
          item.originalPrice,
          fillMode,
          value,
          item.offerPrice,
        ),
      })),
    );
  };

  const resetToOriginal = () => {
    setDraftItems((current) =>
      current.map((item) => ({
        ...item,
        offerPrice: item.originalPrice,
      })),
    );
    setFillMode("manual");
  };

  const applyChanges = () => {
    onApply({ items: draftItems, fillMode, fillValue });
    onClose();
  };

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="820px"
      title={dict.form.configurePricesTitle}
      titleAction={
        <Button appearance="primary" onClick={applyChanges}>
          {dict.form.configurePricesApply}
        </Button>
      }
      paddingHeader="base"
      paddingBody="none"
      paddingFooter="base"
      {...({ closeOnOutsidePress: false } as Record<string, unknown>)}
      footer={{
        primaryAction: {
          children: dict.form.cancel,
          appearance: "transparent",
          onClick: onClose,
        },
        secondaryAction: {
          children: dict.form.configurePricesApply,
          appearance: "primary",
          onClick: applyChanges,
        },
      }}>
      <Box display="flex" flexDirection="column" gap="4" paddingX="4" paddingBottom="4">
        <Text fontSize="caption" color="neutral-textLow">
          {dict.form.configurePricesHelp}
        </Text>

        <Box
          display="flex"
          alignItems="flex-end"
          gap="2"
          flexWrap="wrap">
          <Box>
            <Label>{dict.form.fillMode}</Label>
            <Select
              id="price-fill-mode"
              name="price-fill-mode"
              value={fillMode}
              onChange={(e) => setFillMode(e.target.value as PriceFillMode)}>
              <Select.Option label={dict.form.fillPercent} value="percent" />
              <Select.Option label={dict.form.fillFixed} value="fixed" />
              <Select.Option label={dict.form.fillManual} value="manual" />
            </Select>
          </Box>
          {fillMode !== "manual" ? (
            <Box>
              <Label>{dict.form.fillValue}</Label>
              <Input
                type="number"
                value={fillValue}
                onChange={(e) => setFillValue(fieldValue(e))}
              />
            </Box>
          ) : null}
          <Button appearance="neutral" onClick={applyFillToTable}>
            {dict.form.applyFill}
          </Button>
          <Button appearance="transparent" onClick={resetToOriginal}>
            {dict.form.resetOriginalPrices}
          </Button>
        </Box>

        <Text>
          {t(dict.form.productsSelected, { count: groups.length })}
        </Text>

        <Box display="flex" flexDirection="column" gap="4" overflow="auto" maxHeight="calc(100vh - 260px)">
          {groups.map((group) => (
            <Box
              key={group.id}
              display="flex"
              flexDirection="column"
              gap="3"
              borderWidth="1"
              borderStyle="solid"
              borderColor="neutral-interactive"
              borderRadius="2"
              padding="3">
              <Box display="flex" alignItems="center" gap="3">
                {group.imageUrl ? (
                  <Thumbnail
                    src={group.imageUrl}
                    alt={group.name}
                    width="48px"
                  />
                ) : null}
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="medium">{group.name}</Text>
                  <Text fontSize="caption" color="neutral-textLow">
                    {t(dict.form.skuCount, { count: group.variants.length })}
                  </Text>
                </Box>
              </Box>

              <Box overflow="auto">
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell as="th">{dict.form.colVariant}</Table.Cell>
                      <Table.Cell as="th">SKU</Table.Cell>
                      <Table.Cell as="th">{dict.form.colOriginal}</Table.Cell>
                      <Table.Cell as="th">{dict.form.colOffer}</Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {group.variants.map((variant) => (
                      <Table.Row
                        key={`${variant.productId}-${variant.variantId}`}>
                        <Table.Cell>{variant.variantName || "—"}</Table.Cell>
                        <Table.Cell>{variant.sku || "—"}</Table.Cell>
                        <Table.Cell>
                          {variant.originalPrice.toFixed(2)}
                        </Table.Cell>
                        <Table.Cell>
                          <Input
                            type="number"
                            value={String(variant.offerPrice)}
                            onChange={(e) =>
                              updateVariantPrice(
                                variant.productId,
                                variant.variantId,
                                Number(fieldValue(e)),
                              )
                            }
                          />
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </SideModal>
  );
}
