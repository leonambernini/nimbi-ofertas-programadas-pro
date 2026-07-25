"use client";

import { useEffect, useState } from "react";
import { Box, Input, Label, Select, Text } from "@nimbus-ds/components";
import { SideModal } from "@nimbus-ds/patterns";
import { useLocale } from "@/lib/i18n/locale-context";
import type { ApiOfferGroup } from "@/lib/types";

export type EnabledFilter = "all" | "active" | "inactive";
export type StatusFilter = "all" | ApiOfferGroup["status"];
export type SortKey = "status" | "enabled" | "startsAt";

export type OffersListFilters = {
  enabled: EnabledFilter;
  date: string;
  status: StatusFilter;
  sortBy: SortKey;
};

type Props = {
  open: boolean;
  value: OffersListFilters;
  onClose: () => void;
  onApply: (next: OffersListFilters) => void;
};

export function OffersFilterSideModal({
  open,
  value,
  onClose,
  onApply,
}: Props) {
  const { dict } = useLocale();
  const [draft, setDraft] = useState<OffersListFilters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: dict.home.filters.statusAll },
    { value: "draft", label: dict.home.status.draft },
    { value: "scheduled", label: dict.home.status.scheduled },
    { value: "active", label: dict.home.status.active },
    { value: "ended", label: dict.home.status.ended },
    { value: "disabled", label: dict.home.status.disabled },
  ];

  const apply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="420px"
      title={dict.home.filters.title}
      paddingHeader="base"
      paddingBody="base"
      paddingFooter="base"
      footer={{
        primaryAction: {
          children: dict.home.filters.apply,
          appearance: "primary",
          onClick: apply,
        },
        secondaryAction: {
          children: dict.home.filters.clear,
          appearance: "neutral",
          onClick: () => {
            const cleared: OffersListFilters = {
              enabled: "all",
              date: "",
              status: "all",
              sortBy: "startsAt",
            };
            setDraft(cleared);
            onApply(cleared);
            onClose();
          },
        },
      }}>
      <Box display="flex" flexDirection="column" gap="4">
        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="offers-filter-enabled">
            {dict.home.filters.enabled}
          </Label>
          <Select
            id="offers-filter-enabled"
            name="offers-filter-enabled"
            value={draft.enabled}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                enabled: e.target.value as EnabledFilter,
              }))
            }>
            <Select.Option
              label={dict.home.filters.enabledAll}
              value="all"
            />
            <Select.Option
              label={dict.home.filters.enabledActive}
              value="active"
            />
            <Select.Option
              label={dict.home.filters.enabledInactive}
              value="inactive"
            />
          </Select>
        </Box>

        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="offers-filter-date">{dict.home.filters.date}</Label>
          <Input
            id="offers-filter-date"
            name="offers-filter-date"
            type="date"
            value={draft.date}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, date: e.target.value }))
            }
          />
          <Text fontSize="caption" color="neutral-textLow">
            {dict.home.filters.dateHelp}
          </Text>
        </Box>

        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="offers-filter-status">
            {dict.home.filters.status}
          </Label>
          <Select
            id="offers-filter-status"
            name="offers-filter-status"
            value={draft.status}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                status: e.target.value as StatusFilter,
              }))
            }>
            {statusOptions.map((option) => (
              <Select.Option
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </Select>
        </Box>

        <Box display="flex" flexDirection="column" gap="2">
          <Label htmlFor="offers-filter-sort">{dict.home.filters.sortBy}</Label>
          <Select
            id="offers-filter-sort"
            name="offers-filter-sort"
            value={draft.sortBy}
            onChange={(e) =>
              setDraft((prev) => ({
                ...prev,
                sortBy: e.target.value as SortKey,
              }))
            }>
            <Select.Option
              label={dict.home.filters.sortStatus}
              value="status"
            />
            <Select.Option
              label={dict.home.filters.sortEnabled}
              value="enabled"
            />
            <Select.Option
              label={dict.home.filters.sortStartsAt}
              value="startsAt"
            />
          </Select>
        </Box>
      </Box>
    </SideModal>
  );
}
