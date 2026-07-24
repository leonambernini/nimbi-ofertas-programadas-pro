"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Input,
  Spinner,
  Text,
  useToast,
} from "@nimbus-ds/components";
import { InteractiveList, SideModal } from "@nimbus-ds/patterns";
import { listCategories } from "@/lib/admin-api";
import { t } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ApiCategory } from "@/lib/types";

const SEARCH_DEBOUNCE_MS = 300;

export function CategorySideModal({
  open,
  selectedCategoryIds,
  onClose,
  onApply,
}: {
  open: boolean;
  selectedCategoryIds: number[];
  onClose: () => void;
  onApply: (categoryIds: number[]) => void;
}) {
  const { dict } = useLocale();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [localSelected, setLocalSelected] = useState<Record<number, true>>({});

  useEffect(() => {
    if (!open) return;
    const next: Record<number, true> = {};
    for (const id of selectedCategoryIds) next[id] = true;
    setLocalSelected(next);
    setQuery("");
    setDebouncedQuery("");
  }, [open, selectedCategoryIds]);

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
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, addToast, dict.home.error]);

  const filtered = categories.filter((category) => {
    if (!debouncedQuery) return true;
    return category.name.toLowerCase().includes(debouncedQuery.toLowerCase());
  });

  const selectedCount = Object.keys(localSelected).length;

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="480px"
      title={dict.form.selectCategoriesTitle}
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
            onApply(Object.keys(localSelected).map(Number));
            onClose();
          },
        },
      }}>
      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="4" paddingX="4">
          <Input
            placeholder={dict.form.searchCategories}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Text>
            {t(dict.form.categoriesSelected, { count: selectedCount })}
          </Text>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" padding="6">
            <Spinner />
          </Box>
        ) : filtered.length === 0 ? (
          <Box paddingX="4">
            <Text>{dict.form.categoriesEmpty}</Text>
          </Box>
        ) : (
          <Box overflow="auto">
            <InteractiveList>
              {filtered.map((category) => (
                <InteractiveList.CheckboxItem
                  key={category.id}
                  title={category.name}
                  checkbox={{
                    name: `category-${category.id}`,
                    checked: Boolean(localSelected[category.id]),
                    onChange: () => {
                      setLocalSelected((prev) => {
                        const next = { ...prev };
                        if (next[category.id]) delete next[category.id];
                        else next[category.id] = true;
                        return next;
                      });
                    },
                  }}
                />
              ))}
            </InteractiveList>
          </Box>
        )}
      </Box>
    </SideModal>
  );
}
