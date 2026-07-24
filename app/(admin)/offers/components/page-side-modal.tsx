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
import { listStorePages } from "@/lib/admin-api";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ApiStorePage } from "@/lib/types";

export type SelectedStorePage = ApiStorePage;

export function PageSideModal({
  open,
  selectedPageId,
  onClose,
  onApply,
}: {
  open: boolean;
  selectedPageId: number | null;
  onClose: () => void;
  onApply: (page: SelectedStorePage) => void;
}) {
  const { dict } = useLocale();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<ApiStorePage[]>([]);
  const [localSelected, setLocalSelected] = useState<number | null>(
    selectedPageId,
  );

  useEffect(() => {
    if (!open) return;
    setLocalSelected(selectedPageId);
    setQuery("");
  }, [open, selectedPageId]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    listStorePages()
      .then((data) => {
        if (!cancelled) setPages(data);
      })
      .catch(() => {
        if (!cancelled) {
          addToast({
            id: "pages-load-error",
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

  const filtered = pages.filter((page) => {
    if (!query.trim()) return true;
    const q = query.trim().toLowerCase();
    return (
      page.title.toLowerCase().includes(q) ||
      page.handle.toLowerCase().includes(q)
    );
  });

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="480px"
      title={dict.form.selectPageTitle}
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
          disabled: localSelected == null,
          onClick: () => {
            const page = pages.find((p) => p.id === localSelected);
            if (!page) return;
            onApply(page);
            onClose();
          },
        },
      }}>
      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="4" paddingX="4">
          <Input
            placeholder={dict.form.searchPages}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" padding="6">
            <Spinner />
          </Box>
        ) : filtered.length === 0 ? (
          <Box paddingX="4" paddingY="2">
            <Text>{dict.form.pagesEmpty}</Text>
          </Box>
        ) : (
          <Box overflow="auto">
            <InteractiveList>
              {filtered.map((page) => (
                <InteractiveList.RadioItem
                  key={page.id}
                  title={page.title}
                  description={`/${page.handle}`}
                  radio={{
                    name: "store-page",
                    checked: localSelected === page.id,
                    onChange: () => setLocalSelected(page.id),
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
