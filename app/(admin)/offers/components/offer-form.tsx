"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  Icon,
  IconButton,
  Input,
  Label,
  Link,
  Modal,
  Select,
  Text,
  Title,
  Toggle,
  useToast,
} from "@nimbus-ds/components";
import { ArrowLeftIcon, PlusCircleIcon } from "@nimbus-ds/icons";
import { FormField, Page, ProductDataList } from "@nimbus-ds/patterns";
import { createOffer, listProducts, updateOffer } from "@/lib/admin-api";
import {
  BANNER_SLOTS,
  DEFAULT_THEME,
  normalizeBannerSlot,
} from "@/lib/offer-constants";
import {
  BANNER_BUTTON_POSITIONS,
  BANNER_SPACINGS,
  BANNER_TEXT_ALIGNS,
  DEFAULT_BANNER_ANIMATION,
  DEFAULT_BANNER_BUTTON_POSITION,
  DEFAULT_BANNER_MODEL,
  DEFAULT_BANNER_SPACING,
  DEFAULT_BANNER_TEXT_ALIGN,
  type BannerAnimation,
  type BannerButtonPosition,
  type BannerModel,
  type BannerSpacing,
  type BannerTextAlign,
} from "@/lib/banner-models";
import {
  DEFAULT_COUNTDOWN_ITEMS_MODEL,
  DEFAULT_COUNTDOWN_PDP_MODEL,
} from "@/lib/countdown-models";
import {
  COUNTDOWN_ITEMS_SLOTS,
  COUNTDOWN_PDP_SLOTS,
  defaultCountdownItemsSlot,
  defaultCountdownPdpSlot,
  type CountdownItemsSlot,
  type CountdownPdpSlot,
} from "@/lib/countdown-slots";
import { emptySectionDisplay } from "@/lib/offer-display";
import { useLocale } from "@/lib/i18n/locale-context";
import { t } from "@/lib/i18n/dictionaries";
import { shouldConfirmApplyPrices } from "@/lib/offer-price-sync";
import type {
  ApiOfferGroup,
  ApiOfferItem,
  ApiProduct,
  CountdownItemsModel,
  CountdownPdpModel,
  OfferGroupPayload,
  OfferSectionDisplayConfig,
  PriceFillMode,
  ShowcaseSlot,
  BannerSlot,
} from "@/lib/types";
import { BannerAnimationPicker } from "./banner-animation-picker";
import { BannerModelPicker } from "./banner-model-picker";
import { CountdownDaysPicker } from "./countdown-days-picker";
import { CountdownModelPicker } from "./countdown-model-picker";
import { CountdownPreview } from "./countdown-preview";
import { PriceConfigSideModal } from "./price-config-side-modal";
import { ProductSideModal, type SelectedProduct } from "./product-side-modal";

function fieldValue(event: { target: EventTarget }): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value;
}

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultDates() {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { start, end };
}

function FormCard({
  title,
  headerAction,
  children,
}: {
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card padding="base">
      <Card.Header>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="3"
          width="100%">
          <Title as="h4">{title}</Title>
          {headerAction ? (
            <Box display="flex" alignItems="center" gap="2">
              {headerAction}
            </Box>
          ) : null}
        </Box>
      </Card.Header>
      <Card.Body>
        <Box display="flex" flexDirection="column" gap="3">
          {children}
        </Box>
      </Card.Body>
    </Card>
  );
}

type ProductGroup = {
  id: string;
  productId: number;
  name: string;
  imageUrl: string | null;
  variants: ApiOfferItem[];
};

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPriceRange(values: number[]) {
  if (!values.length) return "—";
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (Math.abs(min - max) < 0.005) return formatMoney(min);
  return `${formatMoney(min)} – ${formatMoney(max)}`;
}

function hasNoDiscountChanges(items: ApiOfferItem[]) {
  if (!items.length) return true;
  return items.every(
    (item) =>
      Math.abs(Number(item.offerPrice) - Number(item.originalPrice)) < 0.005,
  );
}

type Props = {
  mode: "create" | "edit";
  initial?: ApiOfferGroup;
};

export function OfferForm({ mode, initial }: Props) {
  const router = useRouter();
  const { addToast } = useToast();
  const { dict } = useLocale();
  const defaults = defaultDates();

  const [name, setName] = useState(initial?.name ?? "");
  const [startsAt, setStartsAt] = useState(
    initial?.startsAt
      ? toLocalInputValue(initial.startsAt)
      : toLocalInputValue(defaults.start.toISOString()),
  );
  const [endsAt, setEndsAt] = useState(
    initial?.endsAt
      ? toLocalInputValue(initial.endsAt)
      : toLocalInputValue(defaults.end.toISOString()),
  );
  const [autoApplyPrices, setAutoApplyPrices] = useState(
    initial?.autoApplyPrices ?? false,
  );
  const [fillMode, setFillMode] = useState<PriceFillMode>(
    initial?.fillMode ?? "manual",
  );
  const [fillValue, setFillValue] = useState(String(initial?.fillValue ?? 10));
  const [items, setItems] = useState<ApiOfferItem[]>(initial?.items ?? []);
  const [showcaseSlot] = useState<ShowcaseSlot>(
    initial?.showcaseSlot ?? "before_section_products_sale",
  );
  const [showcaseConfig] = useState<OfferSectionDisplayConfig>(
    initial?.showcaseConfig ?? emptySectionDisplay(),
  );
  const [dedicatedPageId] = useState<number | null>(
    initial?.dedicatedPageId ?? null,
  );
  const [dedicatedPageHandle] = useState<string | null>(
    initial?.dedicatedPageHandle ?? null,
  );
  const [pageConfig] = useState<OfferSectionDisplayConfig>(
    initial?.pageConfig ?? emptySectionDisplay(),
  );
  const [enableBanner, setEnableBanner] = useState(
    initial?.enableBanner ?? false,
  );
  const [bannerSlot, setBannerSlot] = useState<BannerSlot>(
    normalizeBannerSlot(initial?.bannerSlot),
  );
  const [bannerImageUrl] = useState(initial?.bannerImageUrl ?? "");
  const [bannerModel, setBannerModel] = useState<BannerModel>(
    initial?.bannerModel ?? DEFAULT_BANNER_MODEL,
  );
  const [bannerText1, setBannerText1] = useState(
    initial?.bannerText1 ?? initial?.bannerTitle ?? "",
  );
  const [bannerText2, setBannerText2] = useState(initial?.bannerText2 ?? "");
  const [bannerShowButton, setBannerShowButton] = useState(
    initial?.bannerShowButton ?? false,
  );
  const [bannerButtonText, setBannerButtonText] = useState(
    initial?.bannerButtonText ?? "",
  );
  const [bannerButtonPosition, setBannerButtonPosition] =
    useState<BannerButtonPosition>(
      initial?.bannerButtonPosition ?? DEFAULT_BANNER_BUTTON_POSITION,
    );
  const [bannerLinkUrl, setBannerLinkUrl] = useState(
    initial?.bannerLinkUrl ?? "",
  );
  const [bannerContainer, setBannerContainer] = useState(
    initial?.bannerContainer ?? false,
  );
  const [bannerTextAlign, setBannerTextAlign] = useState<BannerTextAlign>(
    initial?.bannerTextAlign ?? DEFAULT_BANNER_TEXT_ALIGN,
  );
  const [bannerSpacingTop, setBannerSpacingTop] = useState<BannerSpacing>(
    initial?.bannerSpacingTop ?? DEFAULT_BANNER_SPACING,
  );
  const [bannerSpacingBottom, setBannerSpacingBottom] =
    useState<BannerSpacing>(
      initial?.bannerSpacingBottom ?? DEFAULT_BANNER_SPACING,
    );
  const [bannerAnimation, setBannerAnimation] = useState<BannerAnimation>(
    initial?.bannerAnimation ?? DEFAULT_BANNER_ANIMATION,
  );
  const [showCountdownOnItems, setShowCountdownOnItems] = useState(
    initial?.showCountdownOnItems ?? true,
  );
  const [showCountdownOnPdp, setShowCountdownOnPdp] = useState(
    initial?.showCountdownOnPdp ?? true,
  );
  const [showDaysOnCountdown, setShowDaysOnCountdown] = useState(
    initial?.showDaysOnCountdown ?? false,
  );
  const [countdownText1, setCountdownText1] = useState(
    initial?.countdownText1 ?? "",
  );
  const [countdownText2, setCountdownText2] = useState(
    initial?.countdownText2 ?? "",
  );
  const [countdownItemsModel, setCountdownItemsModel] =
    useState<CountdownItemsModel>(
      initial?.countdownItemsModel ?? DEFAULT_COUNTDOWN_ITEMS_MODEL,
    );
  const [countdownItemsSlot, setCountdownItemsSlot] =
    useState<CountdownItemsSlot>(
      initial?.countdownItemsSlot ??
        defaultCountdownItemsSlot(
          initial?.countdownItemsModel ?? DEFAULT_COUNTDOWN_ITEMS_MODEL,
        ),
    );
  const [countdownPdpModel, setCountdownPdpModel] = useState<CountdownPdpModel>(
    initial?.countdownPdpModel ?? DEFAULT_COUNTDOWN_PDP_MODEL,
  );
  const [countdownPdpSlot, setCountdownPdpSlot] = useState<CountdownPdpSlot>(
    initial?.countdownPdpSlot ??
      defaultCountdownPdpSlot(
        initial?.countdownPdpModel ?? DEFAULT_COUNTDOWN_PDP_MODEL,
      ),
  );
  const [theme, setTheme] = useState(initial?.theme ?? { ...DEFAULT_THEME });
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [confirmNoDiscountOpen, setConfirmNoDiscountOpen] = useState(false);
  const [confirmApplyNowOpen, setConfirmApplyNowOpen] = useState(false);

  const productIds = useMemo(
    () => [...new Set(items.map((item) => item.productId))],
    [items],
  );

  const productGroups = useMemo<ProductGroup[]>(() => {
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
  }, [items]);

  const replaceItemsFromProducts = (products: ApiProduct[]) => {
    const next: ApiOfferItem[] = [];
    const existingByKey = new Map(
      items.map((item) => [`${item.productId}:${item.variantId}`, item]),
    );

    for (const product of products) {
      const variants = product.variants?.length
        ? product.variants
        : [
            {
              id: product.id,
              productId: product.id,
              name: "Única",
              sku: null as string | null,
              price: 0,
              promotionalPrice: null as number | null,
              imageUrl: product.imageUrl,
            },
          ];

      for (const variant of variants) {
        const key = `${product.id}:${variant.id}`;
        const previous = existingByKey.get(key);
        const originalPrice = variant.price;
        next.push({
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantName: variant.name,
          sku: variant.sku,
          imageUrl: variant.imageUrl ?? product.imageUrl,
          originalPrice,
          /**
           * Nunca sobrescrever o snapshot com o promo atual da loja:
           * depois do apply, o promo da NS já é o preço da oferta — isso
           * quebraria o restore (restauraria o mesmo valor).
           */
          originalPromotionalPrice:
            previous?.originalPromotionalPrice !== undefined
              ? previous.originalPromotionalPrice
              : variant.promotionalPrice,
          offerPrice: previous?.offerPrice ?? originalPrice,
        });
      }
    }
    setItems(next);
  };

  const handleApplyProducts = async (selected: SelectedProduct[]) => {
    setLoadingProducts(true);
    try {
      const ids = selected.map((p) => p.id);
      const withVariants = selected.some((p) => p.variants?.length)
        ? selected.map(
            (p) =>
              ({
                id: p.id,
                name: p.name,
                imageUrl: p.imageUrl,
                published: true,
                variants: p.variants,
              }) as ApiProduct,
          )
        : await listProducts({ ids, variants: true, page: 1 });

      const byId = new Map(withVariants.map((p) => [p.id, p]));
      for (const selectedProduct of selected) {
        const current = byId.get(selectedProduct.id);
        if (!current?.variants?.length && selectedProduct.variants?.length) {
          byId.set(selectedProduct.id, {
            id: selectedProduct.id,
            name: selectedProduct.name,
            imageUrl: selectedProduct.imageUrl,
            published: true,
            variants: selectedProduct.variants,
          });
        } else if (!current) {
          byId.set(selectedProduct.id, {
            id: selectedProduct.id,
            name: selectedProduct.name,
            imageUrl: selectedProduct.imageUrl,
            published: true,
            variants: selectedProduct.variants,
          });
        }
      }

      replaceItemsFromProducts([...byId.values()]);
    } catch {
      addToast({
        id: "products-error",
        type: "danger",
        text: dict.home.error,
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const removeProduct = (productId: number) => {
    setItems((current) =>
      current.filter((item) => item.productId !== productId),
    );
  };

  const buildPayload = (): OfferGroupPayload | null => {
    if (!name.trim()) {
      addToast({
        id: "name-required",
        type: "danger",
        text: dict.form.nameRequired,
      });
      return null;
    }
    if (!items.length) {
      addToast({
        id: "items-required",
        type: "danger",
        text: dict.form.itemsRequired,
      });
      return null;
    }
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (!(end > start)) {
      addToast({
        id: "dates-invalid",
        type: "danger",
        text: dict.form.datesInvalid,
      });
      return null;
    }

    return {
      name: name.trim(),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      autoApplyPrices,
      productSelectionType: "manual",
      categoryIds: [],
      fillMode,
      fillValue: fillMode === "manual" ? null : Number(fillValue),
      enableShowcase: false,
      showcaseSlot,
      showcaseConfig,
      enableDedicatedPage: false,
      dedicatedPageId,
      dedicatedPageHandle,
      pageConfig,
      enableBanner,
      bannerType: "countdown_bar",
      bannerSlot,
      bannerImageUrl: bannerImageUrl || null,
      bannerLinkUrl: bannerShowButton ? bannerLinkUrl.trim() || null : null,
      bannerTitle: bannerText1.trim() || null,
      bannerModel,
      bannerText1: bannerText1.trim() || null,
      bannerText2: bannerText2.trim() || null,
      bannerShowButton,
      bannerButtonText:
        bannerShowButton && bannerButtonPosition !== "full"
          ? bannerButtonText.trim() || null
          : null,
      bannerButtonPosition,
      bannerContainer,
      bannerTextAlign,
      bannerSpacingTop,
      bannerSpacingBottom,
      bannerAnimation,
      showCountdownOnItems,
      showCountdownOnPdp,
      showDaysOnCountdown,
      countdownItemsModel,
      countdownItemsSlot,
      countdownPdpModel,
      countdownPdpSlot,
      countdownText1: countdownText1.trim() || null,
      countdownText2: countdownText2.trim() || null,
      theme,
      enabled,
      items,
    };
  };

  const willApplyPricesImmediately = (payload: OfferGroupPayload) => {
    return shouldConfirmApplyPrices({
      previous: initial
        ? {
            enabled: initial.enabled,
            status: initial.status,
            autoApplyPrices: initial.autoApplyPrices,
            pricesApplied: initial.pricesApplied,
            startsAt: new Date(initial.startsAt),
            endsAt: new Date(initial.endsAt),
            items: initial.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              offerPrice: item.offerPrice,
              originalPromotionalPrice: item.originalPromotionalPrice,
            })),
          }
        : null,
      next: {
        enabled: payload.enabled,
        autoApplyPrices: payload.autoApplyPrices,
        startsAt: new Date(payload.startsAt),
        endsAt: new Date(payload.endsAt),
        items: payload.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          offerPrice: item.offerPrice,
          originalPromotionalPrice: item.originalPromotionalPrice,
        })),
      },
    });
  };

  const continueSaveFlow = async (payload: OfferGroupPayload) => {
    if (willApplyPricesImmediately(payload)) {
      setConfirmApplyNowOpen(true);
      return;
    }
    await persistOffer(payload, false);
  };

  const handleSave = async () => {
    const payload = buildPayload();
    if (!payload) return;

    if (autoApplyPrices && hasNoDiscountChanges(items)) {
      setConfirmNoDiscountOpen(true);
      return;
    }

    await continueSaveFlow(payload);
  };

  const persistOffer = async (
    payload: OfferGroupPayload,
    applyPricesNow: boolean,
  ) => {
    setSaving(true);
    try {
      const body = { ...payload, applyPricesNow };
      const result =
        mode === "create"
          ? await createOffer(body)
          : initial
            ? await updateOffer(initial.id, body)
            : null;

      if (!result) return;

      if (result.pricesAppliedNow) {
        addToast({
          id: "offer-saved-prices",
          type: result.pricesApplyOk === false ? "danger" : "success",
          text:
            result.pricesApplyOk === false
              ? dict.form.pricesApplyErrorToast
              : dict.form.pricesAppliedToast,
        });
      } else {
        addToast({
          id: "offer-saved",
          type: "success",
          text: dict.home.saved,
        });
      }
      router.push("/offers");
    } catch {
      addToast({
        id: "offer-save-error",
        type: "danger",
        text: dict.home.error,
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmSaveWithoutDiscount = async () => {
    setConfirmNoDiscountOpen(false);
    const payload = buildPayload();
    if (!payload) return;
    await continueSaveFlow(payload);
  };

  const confirmApplyPricesNow = async () => {
    setConfirmApplyNowOpen(false);
    const payload = buildPayload();
    if (!payload) return;
    await persistOffer(payload, true);
  };

  const openSelectionModal = () => {
    setProductModalOpen(true);
  };

  return (
    <Page maxWidth="920px">
      <Page.Header
        title={mode === "create" ? dict.form.createTitle : dict.form.editTitle}
        subtitle={mode === "edit" ? dict.form.editSubtitle : undefined}
        buttonStack={
          <IconButton
            source={<ArrowLeftIcon />}
            onClick={() => router.push("/offers")}
          />
        }
      />
      <Page.Body>
        <Box display="flex" flexDirection="column" gap="4">
          <FormCard
            title={dict.form.generalSection}
            headerAction={
              <Toggle
                name="enabled"
                active={enabled}
                onChange={() => setEnabled((v) => !v)}
                label={dict.form.enableOnSave}
              />
            }>
            <FormField
              label={dict.form.referenceName}
              helpText={dict.form.referenceHelp}>
              <FormField.Input
                value={name}
                onChange={(e) => setName(fieldValue(e))}
                placeholder={dict.form.referenceName}
              />
            </FormField>
          </FormCard>

          <FormCard title={dict.form.periodSection}>
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap="4">
              <FormField label={dict.form.startsAt}>
                <FormField.Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(fieldValue(e))}
                />
              </FormField>
              <FormField label={dict.form.endsAt}>
                <FormField.Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(fieldValue(e))}
                />
              </FormField>
            </Box>
            <Text fontSize="caption" color="neutral-textLow">
              {dict.form.periodScheduleHelp}
            </Text>
            <Checkbox
              name="auto-apply-prices"
              label={dict.form.autoApplyPrices}
              checked={autoApplyPrices}
              onChange={() => {
                setAutoApplyPrices((v) => {
                  const next = !v;
                  if (!next) setPriceModalOpen(false);
                  return next;
                });
              }}
            />
            <Alert appearance="neutral" title={dict.form.autoApplyAlertTitle}>
              {dict.form.autoApplyAlertBody}
            </Alert>
          </FormCard>

          <Card padding="none">
            <Card.Header>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                paddingX="4"
                paddingTop="4">
                <Title as="h4">{dict.form.productsSection}</Title>
                <Button
                  appearance="neutral"
                  disabled={!autoApplyPrices || productGroups.length === 0}
                  onClick={() => setPriceModalOpen(true)}>
                  {dict.form.configurePrices}
                </Button>
              </Box>
            </Card.Header>
            <Card.Body padding="none">
              <ProductDataList margin="none">
                <ProductDataList.Section
                  description={
                    productGroups.length === 0
                      ? dict.form.previewNoProducts
                      : t(dict.form.productsSelected, {
                          count: productIds.length,
                        })
                  }
                  link={
                    <Link
                      as="button"
                      appearance="primary"
                      textDecoration="none"
                      onClick={openSelectionModal}
                      disabled={loadingProducts}>
                      <Box display="flex" alignItems="center" gap="1">
                        <Icon
                          source={<PlusCircleIcon />}
                          color="primary-interactive"
                        />
                        {dict.form.selectProducts}
                      </Box>
                    </Link>
                  }>
                  {productGroups.length > 0 ? (
                    <ProductDataList.Products
                      items={productGroups.map((group) => ({
                        id: group.id,
                        name: group.name,
                        imageUrl: group.imageUrl,
                        productId: group.productId,
                        variants: group.variants,
                      }))}
                      sortable={false}
                      onReorder={() => undefined}
                      renderItem={(item) => {
                        const de = formatPriceRange(
                          item.variants.map((v) => Number(v.originalPrice)),
                        );
                        const por = formatPriceRange(
                          item.variants.map((v) => Number(v.offerPrice)),
                        );
                        const hasDiscount = item.variants.some(
                          (v) =>
                            Number(v.offerPrice) <
                            Number(v.originalPrice) - 0.005,
                        );
                        return (
                          <ProductDataList.Item
                            id={item.id}
                            title={item.name}
                            imageUrl={item.imageUrl ?? undefined}
                            imageAlt={item.name}
                            onRemove={() => removeProduct(Number(item.id))}
                            withDivider>
                            <Box display="flex" flexDirection="column" gap="1">
                              <Text fontSize="caption" color="neutral-textLow">
                                {t(dict.form.skuCount, {
                                  count: item.variants.length,
                                })}
                              </Text>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap="2"
                                flexWrap="wrap">
                                <Text
                                  fontSize="caption"
                                  color="neutral-textLow"
                                  textDecoration={
                                    hasDiscount ? "line-through" : undefined
                                  }>
                                  {dict.form.priceFrom} {de}
                                </Text>
                                <Text
                                  fontSize="caption"
                                  color={
                                    hasDiscount
                                      ? "primary-textLow"
                                      : "neutral-textLow"
                                  }
                                  fontWeight={
                                    hasDiscount ? "medium" : undefined
                                  }>
                                  {dict.form.priceTo} {por}
                                </Text>
                              </Box>
                            </Box>
                          </ProductDataList.Item>
                        );
                      }}
                    />
                  ) : null}
                </ProductDataList.Section>
              </ProductDataList>
            </Card.Body>
          </Card>

          <FormCard title={dict.form.displaySection}>
            <Box display="flex" flexDirection="column" gap="4">
              <Text fontSize="highlight">{dict.form.countdownSection}</Text>
              <Text fontSize="caption" color="neutral-textLow">
                {dict.form.countdownHelp}
              </Text>
              <CountdownDaysPicker
                value={showDaysOnCountdown}
                onChange={setShowDaysOnCountdown}
              />

              <Box
                width="100%"
                height="1px"
                backgroundColor="neutral-interactive"
                marginY="2"
              />

              {showCountdownOnItems || showCountdownOnPdp ? (
                <Box display="flex" flexDirection="column" gap="2">
                  <Alert
                    appearance="primary"
                    title={dict.form.countdownTextTitle}>
                    {dict.form.countdownTextHelp}
                  </Alert>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                    gap="3">
                    <FormField label={dict.form.countdownText1}>
                      <FormField.Input
                        name="countdown-text-1"
                        value={countdownText1}
                        placeholder={dict.form.countdownText1Placeholder}
                        onChange={(event) =>
                          setCountdownText1(fieldValue(event))
                        }
                      />
                    </FormField>
                    <FormField label={dict.form.countdownText2}>
                      <FormField.Input
                        name="countdown-text-2"
                        value={countdownText2}
                        placeholder={dict.form.countdownText2Placeholder}
                        onChange={(event) =>
                          setCountdownText2(fieldValue(event))
                        }
                      />
                    </FormField>
                  </Box>
                </Box>
              ) : null}
            </Box>
          </FormCard>

          <Card padding="base">
            <Card.Header>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="3"
                width="100%">
                <Title as="h4">{dict.form.bannerCardTitle}</Title>
                <Toggle
                  name="enable-banner"
                  active={enableBanner}
                  onChange={() => setEnableBanner((v) => !v)}
                  label={
                    enableBanner
                      ? dict.form.sectionActive
                      : dict.form.sectionInactive
                  }
                />
              </Box>
            </Card.Header>
            {enableBanner ? (
              <Card.Body>
                <Box display="flex" flexDirection="column" gap="3">
                  <Box display="flex" flexDirection="column" gap="1">
                    <Label>{dict.form.bannerSlot}</Label>
                    <Select
                      id="banner-slot"
                      name="banner-slot"
                      value={bannerSlot}
                      onChange={(e) =>
                        setBannerSlot(e.target.value as BannerSlot)
                      }>
                      {BANNER_SLOTS.map((slot) => (
                        <Select.Option
                          key={slot}
                          label={dict.slots[slot] ?? slot}
                          value={slot}
                        />
                      ))}
                    </Select>
                  </Box>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
                    gap="3">
                    <FormField label={dict.form.bannerText1}>
                      <FormField.Input
                        name="banner-text-1"
                        value={bannerText1}
                        placeholder={dict.form.bannerText1Placeholder}
                        onChange={(event) =>
                          setBannerText1(fieldValue(event))
                        }
                      />
                    </FormField>
                    <FormField label={dict.form.bannerText2}>
                      <FormField.Input
                        name="banner-text-2"
                        value={bannerText2}
                        placeholder={dict.form.bannerText2Placeholder}
                        onChange={(event) =>
                          setBannerText2(fieldValue(event))
                        }
                      />
                    </FormField>
                  </Box>
                  <Box
                    display="grid"
                    gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }}
                    gap="3">
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label>{dict.form.bannerTextAlign}</Label>
                      <Select
                        id="banner-text-align"
                        name="banner-text-align"
                        value={bannerTextAlign}
                        onChange={(e) =>
                          setBannerTextAlign(
                            fieldValue(e) as BannerTextAlign,
                          )
                        }>
                        {BANNER_TEXT_ALIGNS.map((align) => (
                          <Select.Option
                            key={align}
                            label={
                              dict.form[
                                `bannerTextAlign_${align}` as keyof typeof dict.form
                              ] as string
                            }
                            value={align}
                          />
                        ))}
                      </Select>
                    </Box>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label>{dict.form.bannerSpacingTop}</Label>
                      <Select
                        id="banner-spacing-top"
                        name="banner-spacing-top"
                        value={String(bannerSpacingTop)}
                        onChange={(e) =>
                          setBannerSpacingTop(
                            Number(fieldValue(e)) as BannerSpacing,
                          )
                        }>
                        {BANNER_SPACINGS.map((spacing) => (
                          <Select.Option
                            key={`spacing-top-${spacing}`}
                            label={
                              dict.form[
                                `bannerSpacing_${spacing}` as keyof typeof dict.form
                              ] as string
                            }
                            value={String(spacing)}
                          />
                        ))}
                      </Select>
                    </Box>
                    <Box display="flex" flexDirection="column" gap="1">
                      <Label>{dict.form.bannerSpacingBottom}</Label>
                      <Select
                        id="banner-spacing-bottom"
                        name="banner-spacing-bottom"
                        value={String(bannerSpacingBottom)}
                        onChange={(e) =>
                          setBannerSpacingBottom(
                            Number(fieldValue(e)) as BannerSpacing,
                          )
                        }>
                        {BANNER_SPACINGS.map((spacing) => (
                          <Select.Option
                            key={`spacing-bottom-${spacing}`}
                            label={
                              dict.form[
                                `bannerSpacing_${spacing}` as keyof typeof dict.form
                              ] as string
                            }
                            value={String(spacing)}
                          />
                        ))}
                      </Select>
                    </Box>
                  </Box>
                  <BannerAnimationPicker
                    value={bannerAnimation}
                    onChange={setBannerAnimation}
                  />
                  <Checkbox
                    name="banner-container"
                    label={dict.form.bannerContainer}
                    checked={bannerContainer}
                    onChange={() => setBannerContainer((v) => !v)}
                  />
                  <Checkbox
                    name="banner-show-button"
                    label={dict.form.bannerShowButton}
                    checked={bannerShowButton}
                    onChange={() => setBannerShowButton((v) => !v)}
                  />
                  {bannerShowButton ? (
                    <Box
                      display="grid"
                      gridTemplateColumns={{
                        xs: "1fr",
                        md:
                          bannerButtonPosition === "full"
                            ? "1fr 1fr"
                            : "1fr 1fr 1fr",
                      }}
                      gap="3"
                      alignItems="flex-end">
                      <Box display="flex" flexDirection="column" gap="1">
                        <Label>{dict.form.bannerButtonPosition}</Label>
                        <Select
                          id="banner-button-position"
                          name="banner-button-position"
                          value={bannerButtonPosition}
                          onChange={(e) =>
                            setBannerButtonPosition(
                              fieldValue(e) as BannerButtonPosition,
                            )
                          }>
                          {BANNER_BUTTON_POSITIONS.map((position) => (
                            <Select.Option
                              key={position}
                              label={
                                dict.form[
                                  `bannerButtonPosition_${position}` as keyof typeof dict.form
                                ] as string
                              }
                              value={position}
                            />
                          ))}
                        </Select>
                      </Box>
                      <FormField label={dict.form.bannerButtonUrl}>
                        <FormField.Input
                          name="banner-button-url"
                          value={bannerLinkUrl}
                          placeholder={dict.form.bannerButtonUrlPlaceholder}
                          onChange={(event) =>
                            setBannerLinkUrl(fieldValue(event))
                          }
                        />
                      </FormField>
                      {bannerButtonPosition !== "full" ? (
                        <FormField label={dict.form.bannerButtonText}>
                          <FormField.Input
                            name="banner-button-text"
                            value={bannerButtonText}
                            placeholder={
                              dict.form.bannerButtonTextPlaceholder
                            }
                            onChange={(event) =>
                              setBannerButtonText(fieldValue(event))
                            }
                          />
                        </FormField>
                      ) : null}
                    </Box>
                  ) : null}
                  <BannerModelPicker
                    value={bannerModel}
                    onChange={setBannerModel}
                    text1={bannerText1}
                    text2={bannerText2}
                    showButton={bannerShowButton}
                    buttonText={bannerButtonText}
                    buttonPosition={bannerButtonPosition}
                    container={bannerContainer}
                    textAlign={bannerTextAlign}
                    spacingTop={bannerSpacingTop}
                    spacingBottom={bannerSpacingBottom}
                    animation={bannerAnimation}
                  />
                </Box>
              </Card.Body>
            ) : (
              <Card.Body>
                <Text fontSize="caption" color="neutral-textLow">
                  {dict.form.bannerInactiveHelp}
                </Text>
              </Card.Body>
            )}
          </Card>

          <Card padding="base">
            <Card.Header>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="3"
                width="100%">
                <Title as="h4">{dict.form.countdownItemsCardTitle}</Title>
                <Toggle
                  name="countdown-items"
                  active={showCountdownOnItems}
                  onChange={() => setShowCountdownOnItems((v) => !v)}
                  label={
                    showCountdownOnItems
                      ? dict.form.sectionActive
                      : dict.form.sectionInactive
                  }
                />
              </Box>
            </Card.Header>
            {showCountdownOnItems ? (
              <Card.Body>
                <Box display="flex" flexDirection="column" gap="3">
                  <Box display="flex" flexDirection="column" gap="1">
                    <Label>{dict.form.countdownItemsSlot}</Label>
                    <Select
                      id="countdown-items-slot"
                      name="countdown-items-slot"
                      value={countdownItemsSlot}
                      onChange={(event) =>
                        setCountdownItemsSlot(
                          fieldValue(event) as CountdownItemsSlot,
                        )
                      }>
                      {COUNTDOWN_ITEMS_SLOTS.map((slot) => (
                        <Select.Option
                          key={slot}
                          label={dict.slots[slot] ?? slot}
                          value={slot}
                        />
                      ))}
                    </Select>
                  </Box>
                  <CountdownModelPicker
                    kind="items"
                    value={countdownItemsModel}
                    onChange={(model) => {
                      setCountdownItemsModel(model);
                      setCountdownItemsSlot(defaultCountdownItemsSlot(model));
                    }}
                  />
                  <CountdownPreview
                    kind="items"
                    model={countdownItemsModel}
                    theme={theme}
                    showDays={showDaysOnCountdown}
                    text1={countdownText1}
                    text2={countdownText2}
                  />
                </Box>
              </Card.Body>
            ) : (
              <Card.Body>
                <Text fontSize="caption" color="neutral-textLow">
                  {dict.form.countdownItemsInactiveHelp}
                </Text>
              </Card.Body>
            )}
          </Card>

          <Card padding="base">
            <Card.Header>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap="3"
                width="100%">
                <Title as="h4">{dict.form.countdownPdpCardTitle}</Title>
                <Toggle
                  name="countdown-pdp"
                  active={showCountdownOnPdp}
                  onChange={() => setShowCountdownOnPdp((v) => !v)}
                  label={
                    showCountdownOnPdp
                      ? dict.form.sectionActive
                      : dict.form.sectionInactive
                  }
                />
              </Box>
            </Card.Header>
            {showCountdownOnPdp ? (
              <Card.Body>
                <Box display="flex" flexDirection="column" gap="3">
                  <Box display="flex" flexDirection="column" gap="1">
                    <Label>{dict.form.countdownPdpSlot}</Label>
                    <Select
                      id="countdown-pdp-slot"
                      name="countdown-pdp-slot"
                      value={countdownPdpSlot}
                      onChange={(event) =>
                        setCountdownPdpSlot(
                          fieldValue(event) as CountdownPdpSlot,
                        )
                      }>
                      {COUNTDOWN_PDP_SLOTS.map((slot) => (
                        <Select.Option
                          key={slot}
                          label={dict.slots[slot] ?? slot}
                          value={slot}
                        />
                      ))}
                    </Select>
                  </Box>
                  <CountdownModelPicker
                    kind="pdp"
                    value={countdownPdpModel}
                    onChange={(model) => {
                      setCountdownPdpModel(model);
                      setCountdownPdpSlot(defaultCountdownPdpSlot(model));
                    }}
                  />
                  <CountdownPreview
                    kind="pdp"
                    model={countdownPdpModel}
                    theme={theme}
                    showDays={showDaysOnCountdown}
                    text1={countdownText1}
                    text2={countdownText2}
                  />
                </Box>
              </Card.Body>
            ) : (
              <Card.Body>
                <Text fontSize="caption" color="neutral-textLow">
                  {dict.form.countdownPdpInactiveHelp}
                </Text>
              </Card.Body>
            )}
          </Card>

          <FormCard title={dict.form.theme}>
            <Text fontSize="caption" color="neutral-textLow">
              {dict.form.themeHelp}
            </Text>
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="3">
              {(
                [
                  ["primaryColor", dict.form.themePrimary],
                  ["secondaryColor", dict.form.themeSecondary],
                  ["backgroundColor", dict.form.themeBackground],
                  ["textColor", dict.form.themeText],
                  ["accentColor", dict.form.themeAccent],
                  ["buttonColor", dict.form.themeButton],
                  ["buttonTextColor", dict.form.themeButtonText],
                  ["countdownBg", dict.form.themeCountdownBg],
                  ["countdownText", dict.form.themeCountdownText],
                ] as const
              ).map(([key, label]) => (
                <FormField key={key} label={label}>
                  <FormField.Input
                    type="color"
                    value={theme[key]}
                    onChange={(e) =>
                      setTheme((current) => ({
                        ...current,
                        [key]: fieldValue(e),
                      }))
                    }
                  />
                </FormField>
              ))}
              <FormField label={dict.form.themeRadius}>
                <FormField.Input
                  type="number"
                  value={String(theme.borderRadius)}
                  onChange={(e) =>
                    setTheme((current) => ({
                      ...current,
                      borderRadius: Number(fieldValue(e)),
                    }))
                  }
                />
              </FormField>
            </Box>
          </FormCard>

          <Box display="flex" justifyContent="flex-end" gap="2" paddingY="2">
            <Button appearance="neutral" onClick={() => router.push("/offers")}>
              {dict.form.cancel}
            </Button>
            <Button appearance="primary" onClick={handleSave} disabled={saving}>
              {dict.form.save}
            </Button>
          </Box>
        </Box>
      </Page.Body>

      <ProductSideModal
        open={productModalOpen}
        selectedProductIds={productIds}
        onClose={() => setProductModalOpen(false)}
        onApply={handleApplyProducts}
      />
      <PriceConfigSideModal
        open={priceModalOpen}
        items={items}
        fillMode={fillMode}
        fillValue={fillValue}
        onClose={() => setPriceModalOpen(false)}
        onApply={({
          items: nextItems,
          fillMode: nextMode,
          fillValue: nextValue,
        }) => {
          setItems(nextItems);
          setFillMode(nextMode);
          setFillValue(nextValue);
        }}
      />
      <Modal
        open={confirmNoDiscountOpen}
        onDismiss={() => setConfirmNoDiscountOpen(false)}
        closeOnOutsidePress={false}>
        <Modal.Header title={dict.form.noDiscountConfirmTitle} />
        <Modal.Body>
          <Text>{dict.form.noDiscountConfirmBody}</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="neutral"
            onClick={() => setConfirmNoDiscountOpen(false)}>
            {dict.form.cancel}
          </Button>
          <Button
            appearance="primary"
            onClick={() => void confirmSaveWithoutDiscount()}
            disabled={saving}>
            {dict.form.noDiscountConfirmContinue}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        open={confirmApplyNowOpen}
        onDismiss={() => setConfirmApplyNowOpen(false)}
        closeOnOutsidePress={false}>
        <Modal.Header title={dict.form.applyNowConfirmTitle} />
        <Modal.Body>
          <Text>{dict.form.applyNowConfirmBody}</Text>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="neutral"
            onClick={() => setConfirmApplyNowOpen(false)}>
            {dict.form.cancel}
          </Button>
          <Button
            appearance="primary"
            onClick={() => void confirmApplyPricesNow()}
            disabled={saving}>
            {dict.form.applyNowConfirmContinue}
          </Button>
        </Modal.Footer>
      </Modal>
    </Page>
  );
}
