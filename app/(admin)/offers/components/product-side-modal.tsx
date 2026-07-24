"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Input,
  Select,
  Spinner,
  Text,
  Thumbnail,
  useToast,
} from "@nimbus-ds/components";
import { InteractiveList, SideModal } from "@nimbus-ds/patterns";
import { listCategories, listProducts } from "@/lib/admin-api";
import { t } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ApiCategory, ApiProduct } from "@/lib/types";

export type SelectedProduct = Pick<
  ApiProduct,
  "id" | "name" | "imageUrl" | "variants"
>;

const SEARCH_DEBOUNCE_MS = 400;
const ALL_CATEGORIES = "";

function matchesQuery(product: ApiProduct, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  if (product.name.toLowerCase().includes(q)) return true;
  return (product.variants ?? []).some((variant) =>
    (variant.sku ?? "").toLowerCase().includes(q),
  );
}

function toSelected(product: ApiProduct): SelectedProduct {
  return {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    variants: product.variants,
  };
}

export function ProductSideModal({
  open,
  selectedProductIds,
  onClose,
  onApply,
}: {
  open: boolean;
  selectedProductIds: number[];
  onClose: () => void;
  onApply: (products: SelectedProduct[]) => void;
}) {
  const { dict } = useLocale();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectingCategory, setSelectingCategory] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [localSelected, setLocalSelected] = useState<
    Record<number, SelectedProduct>
  >({});

  useEffect(() => {
    if (!open) return;
    const next: Record<number, SelectedProduct> = {};
    for (const id of selectedProductIds) {
      next[id] = { id, name: `#${id}`, imageUrl: null, variants: undefined };
    }
    setLocalSelected(next);
    setQuery("");
    setDebouncedQuery("");
    setCategoryId(ALL_CATEGORIES);
  }, [open, selectedProductIds]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {
        if (!cancelled) {
          addToast({
            id: "categories-load-error",
            type: "danger",
            text: dict.home.error,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, addToast, dict.home.error]);

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [open, query]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    listProducts({
      q: debouncedQuery || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      variants: true,
      page: 1,
    })
      .then((data) => {
        if (cancelled) return;
        const filtered = data.filter((product) =>
          matchesQuery(product, debouncedQuery),
        );
        setProducts(filtered);
        setLocalSelected((prev) => {
          const next = { ...prev };
          for (const product of filtered) {
            if (next[product.id]) next[product.id] = toSelected(product);
          }
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) {
          addToast({
            id: "products-load-error",
            type: "danger",
            text: dict.home.error,
          });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, debouncedQuery, categoryId, addToast, dict.home.error]);

  const toggle = (product: ApiProduct) => {
    setLocalSelected((prev) => {
      if (prev[product.id]) {
        const next = { ...prev };
        delete next[product.id];
        return next;
      }
      return { ...prev, [product.id]: toSelected(product) };
    });
  };

  const selectAllFromCategory = async () => {
    if (!categoryId) return;
    setSelectingCategory(true);
    try {
      const data = await listProducts({
        categoryId: Number(categoryId),
        variants: true,
        page: 1,
      });
      setLocalSelected((prev) => {
        const next = { ...prev };
        for (const product of data) {
          next[product.id] = toSelected(product);
        }
        return next;
      });
      setProducts(data);
    } catch {
      addToast({
        id: "select-category-error",
        type: "danger",
        text: dict.home.error,
      });
    } finally {
      setSelectingCategory(false);
    }
  };

  const selectedCount = useMemo(
    () => Object.keys(localSelected).length,
    [localSelected],
  );

  const selectedCategoryName = useMemo(() => {
    if (!categoryId) return null;
    return categories.find((c) => String(c.id) === categoryId)?.name ?? null;
  }, [categories, categoryId]);

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="480px"
      title={dict.products.title}
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
          children: dict.products.apply,
          appearance: "primary",
          onClick: () => {
            onApply(Object.values(localSelected));
            onClose();
          },
        },
      }}>
      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="3" paddingX="4">
          <Input
            placeholder={dict.form.searchProducts}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Select
            id="product-category-filter"
            name="product-category-filter"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}>
            <Select.Option
              label={dict.form.filterAllCategories}
              value={ALL_CATEGORIES}
            />
            {categories.map((category) => (
              <Select.Option
                key={category.id}
                label={category.name}
                value={String(category.id)}
              />
            ))}
          </Select>
          {categoryId ? (
            <Button
              appearance="neutral"
              onClick={() => void selectAllFromCategory()}
              disabled={selectingCategory || loading}>
              {selectingCategory
                ? dict.products.loading
                : selectedCategoryName
                  ? t(dict.form.selectAllFromCategoryNamed, {
                      name: selectedCategoryName,
                    })
                  : dict.form.selectAllFromCategory}
            </Button>
          ) : null}
          <Text>{t(dict.form.productsSelected, { count: selectedCount })}</Text>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" padding="6">
            <Spinner />
          </Box>
        ) : products.length === 0 ? (
          <Box paddingX="4">
            <Text>{dict.products.empty}</Text>
          </Box>
        ) : (
          <Box overflow="auto" maxHeight="420px">
            <InteractiveList>
              {products.map((product) => {
                const skus = (product.variants ?? [])
                  .map((v) => v.sku)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(", ");
                return (
                  <InteractiveList.CheckboxItem
                    key={product.id}
                    title={``}
                    checkbox={{
                      name: `product-${product.id}`,
                      checked: Boolean(localSelected[product.id]),
                      onChange: () => toggle(product),
                    }}>
                    <Box display="flex" alignItems="center" gap="2">
                      {product.imageUrl ? (
                        <Thumbnail
                          src={product.imageUrl}
                          alt={product.name}
                          width="40px"
                        />
                      ) : null}
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text>{product.name}</Text>
                        {skus ? (
                          <Text color="neutral-textLow" fontSize="caption">
                            SKU: {skus}
                          </Text>
                        ) : null}
                      </Box>
                    </Box>
                  </InteractiveList.CheckboxItem>
                );
              })}
            </InteractiveList>
          </Box>
        )}
      </Box>
    </SideModal>
  );
}
