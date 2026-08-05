"use client";

import { useEffect, useState } from "react";
import { Box, Input, Label, Select, Text } from "@nimbus-ds/components";
import { SideModal } from "@nimbus-ds/patterns";
import { useLocale } from "@/lib/i18n/locale-context";

export type ActionFilter = "all" | "apply" | "restore" | "activate" | "deactivate";
export type SuccessFilter = "all" | "true" | "false";
export type DatePreset = "all" | "7" | "15" | "30" | "custom";

export type PriceLogsFilters = {
  datePreset: DatePreset;
  from: string;
  to: string;
  action: ActionFilter;
  success: SuccessFilter;
};

export const DEFAULT_PRICE_LOGS_FILTERS: PriceLogsFilters = {
  datePreset: "all",
  from: "",
  to: "",
  action: "all",
  success: "all",
};

type Props = {
  open: boolean;
  value: PriceLogsFilters;
  onClose: () => void;
  onApply: (next: PriceLogsFilters) => void;
};

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Converte preset em intervalo YYYY-MM-DD (local). */
export function resolveDateRange(filters: PriceLogsFilters): {
  from: string;
  to: string;
} {
  if (filters.datePreset === "custom") {
    return { from: filters.from, to: filters.to };
  }
  if (filters.datePreset === "all") {
    return { from: "", to: "" };
  }
  const days = Number(filters.datePreset);
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateInputValue(from), to: toDateInputValue(to) };
}

export function PriceLogsFilterSideModal({
  open,
  value,
  onClose,
  onApply,
}: Props) {
  const { dict } = useLocale();
  const [draft, setDraft] = useState<PriceLogsFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const apply = () => {
    const next: PriceLogsFilters =
      draft.datePreset === "custom"
        ? draft
        : { ...draft, from: "", to: "" };
    onApply(next);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="420px"
      title={dict.priceLogs.filtersTitle}
      paddingHeader="base"
      paddingBody="base"
      paddingFooter="base"
      footer={{
        primaryAction: {
          children: dict.priceLogs.applyFilters,
          appearance: "primary",
          onClick: apply,
        },
        secondaryAction: {
          children: dict.priceLogs.clearFilters,
          appearance: "neutral",
          onClick: () => {
            setDraft(DEFAULT_PRICE_LOGS_FILTERS);
            onApply(DEFAULT_PRICE_LOGS_FILTERS);
            onClose();
          },
        },
      }}
    >
      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="price-logs-date-preset">
            {dict.priceLogs.filterDate}
          </Label>
          <Select
            id="price-logs-date-preset"
            name="datePreset"
            value={draft.datePreset}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                datePreset: e.target.value as DatePreset,
              }))
            }
          >
            <Select.Option label={dict.priceLogs.dateAll} value="all" />
            <Select.Option label={dict.priceLogs.dateLast7} value="7" />
            <Select.Option label={dict.priceLogs.dateLast15} value="15" />
            <Select.Option label={dict.priceLogs.dateLast30} value="30" />
            <Select.Option
              label={dict.priceLogs.dateCustom}
              value="custom"
            />
          </Select>
        </Box>

        {draft.datePreset === "custom" ? (
          <Box display="flex" flexDirection="column" gap="3">
            <Box display="flex" flexDirection="column" gap="2">
              <Label htmlFor="price-logs-from">
                {dict.priceLogs.dateFrom}
              </Label>
              <Input
                id="price-logs-from"
                name="from"
                type="date"
                value={draft.from}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </Box>
            <Box display="flex" flexDirection="column" gap="2">
              <Label htmlFor="price-logs-to">{dict.priceLogs.dateTo}</Label>
              <Input
                id="price-logs-to"
                name="to"
                type="date"
                value={draft.to}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </Box>
            <Text fontSize="caption" color="neutral-textLow">
              {dict.priceLogs.dateCustomHelp}
            </Text>
          </Box>
        ) : null}

        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="price-logs-filter-action">
            {dict.priceLogs.filterAction}
          </Label>
          <Select
            id="price-logs-filter-action"
            name="action"
            value={draft.action}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                action: e.target.value as ActionFilter,
              }))
            }
          >
            <Select.Option label={dict.priceLogs.all} value="all" />
            <Select.Option
              label={dict.priceLogs.actionApply}
              value="apply"
            />
            <Select.Option
              label={dict.priceLogs.actionRestore}
              value="restore"
            />
            <Select.Option
              label={dict.priceLogs.actionActivate}
              value="activate"
            />
            <Select.Option
              label={dict.priceLogs.actionDeactivate}
              value="deactivate"
            />
          </Select>
        </Box>

        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="price-logs-filter-success">
            {dict.priceLogs.filterSuccess}
          </Label>
          <Select
            id="price-logs-filter-success"
            name="success"
            value={draft.success}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                success: e.target.value as SuccessFilter,
              }))
            }
          >
            <Select.Option label={dict.priceLogs.all} value="all" />
            <Select.Option
              label={dict.priceLogs.success}
              value="true"
            />
            <Select.Option
              label={dict.priceLogs.failed}
              value="false"
            />
          </Select>
        </Box>
      </Box>
    </SideModal>
  );
}
