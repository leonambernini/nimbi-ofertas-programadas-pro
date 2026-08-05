"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Input,
  Pagination,
  Spinner,
  Table,
  Tag,
  Text,
  useToast,
} from "@nimbus-ds/components";
import { EyeIcon, HistoryIcon, ListIcon, SlidersIcon } from "@nimbus-ds/icons";
import { EmptyMessage, Page } from "@nimbus-ds/patterns";
import {
  listPriceSyncLogs,
  retryRestoreOfferPrices,
  type PriceSyncLog,
} from "@/lib/admin-api";
import { t, type Dictionary } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { PriceLogDetailSideModal } from "./components/price-log-detail-side-modal";
import {
  DEFAULT_PRICE_LOGS_FILTERS,
  PriceLogsFilterSideModal,
  resolveDateRange,
  type PriceLogsFilters,
} from "./components/price-logs-filter-side-modal";

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

function statusLabel(status: string, dict: Dictionary) {
  const map = dict.home.status as Record<string, string>;
  return map[status] ?? status;
}

function actionLabel(value: PriceSyncLog["action"], dict: Dictionary) {
  if (value === "apply") return dict.priceLogs.actionApply;
  if (value === "restore") return dict.priceLogs.actionRestore;
  if (value === "activate") return dict.priceLogs.actionActivate;
  return dict.priceLogs.actionDeactivate;
}

function translateLogMessage(message: string | null, dict: Dictionary) {
  if (!message) return "—";

  const known: Record<string, string> = {
    applied: dict.priceLogs.msgApplied,
    reapplied: dict.priceLogs.msgReapplied,
    restored: dict.priceLogs.msgRestored,
    skipped_prices_not_applied: dict.priceLogs.msgSkippedNotApplied,
    skipped_no_items: dict.priceLogs.msgSkippedNoItems,
  };
  if (known[message]) return known[message];

  const arrow = message.includes(" → ")
    ? " → "
    : message.includes(" -> ")
      ? " -> "
      : null;
  if (arrow) {
    const [fromRaw, toRaw] = message.split(arrow).map((part) => part.trim());
    if (fromRaw && toRaw) {
      return t(dict.priceLogs.msgStatusChange, {
        from: statusLabel(fromRaw, dict),
        to: statusLabel(toRaw, dict),
      });
    }
  }

  return message;
}

function formatChipDate(value: string, locale: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y, m, d] = value.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    locale === "es" ? "es-AR" : "pt-BR",
  );
}

export default function PriceLogsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { dict, locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<PriceSyncLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [filters, setFilters] = useState<PriceLogsFilters>(
    DEFAULT_PRICE_LOGS_FILTERS,
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailLog, setDetailLog] = useState<PriceSyncLog | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedName(nameInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [nameInput]);

  const dateRange = useMemo(() => resolveDateRange(filters), [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPriceSyncLogs({
        page,
        pageSize: PAGE_SIZE,
        action: filters.action,
        success: filters.success,
        q: debouncedName,
        from: dateRange.from || undefined,
        to: dateRange.to || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      addToast({
        id: "price-logs-error",
        type: "danger",
        text: dict.home.error,
      });
    } finally {
      setLoading(false);
    }
  }, [
    addToast,
    dateRange.from,
    dateRange.to,
    debouncedName,
    dict.home.error,
    filters.action,
    filters.success,
    page,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString(locale === "es" ? "es-AR" : "pt-BR");

  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; text: string; clear: () => void }> = [];

    if (filters.datePreset !== "all") {
      let value = "";
      if (filters.datePreset === "7") value = dict.priceLogs.dateLast7;
      else if (filters.datePreset === "15") value = dict.priceLogs.dateLast15;
      else if (filters.datePreset === "30") value = dict.priceLogs.dateLast30;
      else {
        const fromLabel = filters.from
          ? formatChipDate(filters.from, locale)
          : "…";
        const toLabel = filters.to ? formatChipDate(filters.to, locale) : "…";
        value = `${fromLabel} – ${toLabel}`;
      }
      chips.push({
        key: "date",
        text: t(dict.priceLogs.chipDate, { value }),
        clear: () => {
          setPage(1);
          setFilters((prev) => ({
            ...prev,
            datePreset: "all",
            from: "",
            to: "",
          }));
        },
      });
    }

    if (filters.action !== "all") {
      const action = filters.action;
      chips.push({
        key: "action",
        text: t(dict.priceLogs.chipAction, {
          value: actionLabel(action, dict),
        }),
        clear: () => {
          setPage(1);
          setFilters((prev) => ({ ...prev, action: "all" }));
        },
      });
    }

    if (filters.success !== "all") {
      chips.push({
        key: "success",
        text: t(dict.priceLogs.chipResult, {
          value:
            filters.success === "true"
              ? dict.priceLogs.success
              : dict.priceLogs.failed,
        }),
        clear: () => {
          setPage(1);
          setFilters((prev) => ({ ...prev, success: "all" }));
        },
      });
    }

    return chips;
  }, [dict, filters, locale]);

  const handleRetry = async (log: PriceSyncLog) => {
    setBusyId(log.id);
    try {
      const result = await retryRestoreOfferPrices(log.offer.id);
      addToast({
        id: `retry-${log.id}`,
        type: result.ok ? "success" : "danger",
        text: result.ok ? dict.priceLogs.retryOk : dict.priceLogs.retryFail,
      });
      await load();
    } catch {
      addToast({
        id: `retry-error-${log.id}`,
        type: "danger",
        text: dict.priceLogs.retryFail,
      });
    } finally {
      setBusyId(null);
    }
  };

  const clearAllFilters = () => {
    setPage(1);
    setNameInput("");
    setDebouncedName("");
    setFilters(DEFAULT_PRICE_LOGS_FILTERS);
  };

  const hasActiveFilters =
    debouncedName.trim() !== "" ||
    nameInput.trim() !== "" ||
    filters.datePreset !== "all" ||
    filters.action !== "all" ||
    filters.success !== "all";

  const showEmptyOnly = !loading && logs.length === 0 && !hasActiveFilters;
  const showFilteredEmpty = !loading && logs.length === 0 && hasActiveFilters;

  if (loading && logs.length === 0) {
    return (
      <Page>
        <Page.Header
          title={dict.priceLogs.title}
          buttonStack={
            <Button appearance="neutral" onClick={() => router.push("/offers")}>
              {dict.priceLogs.back}
            </Button>
          }
        />
        <Page.Body>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <Spinner size="large" />
          </Box>
        </Page.Body>
      </Page>
    );
  }

  if (showEmptyOnly) {
    return (
      <Page>
        <Page.Header
          title={dict.priceLogs.title}
          buttonStack={
            <Button appearance="neutral" onClick={() => router.push("/offers")}>
              {dict.priceLogs.back}
            </Button>
          }
        />
        <Page.Body>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <EmptyMessage
              icon={<ListIcon />}
              title={dict.priceLogs.emptyTitle}
              text={dict.priceLogs.emptyText}
              actions={
                <Button
                  appearance="primary"
                  onClick={() => router.push("/offers")}
                >
                  {dict.priceLogs.emptyBackOffers}
                </Button>
              }
            />
          </Box>
        </Page.Body>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header
        title={dict.priceLogs.title}
        buttonStack={
          <Button appearance="neutral" onClick={() => router.push("/offers")}>
            {dict.priceLogs.back}
          </Button>
        }
      />
      <Page.Body>
        <Box display="flex" flexDirection="column" gap="4">
          <Text color="neutral-textLow">{dict.priceLogs.subtitle}</Text>

          <Box display="flex" gap="2" alignItems="center">
            <Box flex="1">
              <Input
                id="price-logs-search"
                name="q"
                placeholder={dict.priceLogs.searchPlaceholder}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
            </Box>
            <Button
              appearance="neutral"
              aria-label={dict.priceLogs.openFilters}
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersIcon />
            </Button>
          </Box>

          <Box display="flex" gap="2" alignItems="center" flexWrap="wrap">
            <Text color="neutral-textLow">
              {t(dict.priceLogs.results, { count: total })}
            </Text>
            {loading ? <Spinner size="small" /> : null}
            {filterChips.map((chip) => (
              <Chip
                key={chip.key}
                text={chip.text}
                removable
                onClick={chip.clear}
              />
            ))}
          </Box>

          <PriceLogsFilterSideModal
            open={filtersOpen}
            value={filters}
            onClose={() => setFiltersOpen(false)}
            onApply={(next) => {
              setPage(1);
              setFilters(next);
            }}
          />

          <PriceLogDetailSideModal
            open={Boolean(detailLog)}
            log={detailLog}
            onClose={() => setDetailLog(null)}
            actionLabel={
              detailLog ? actionLabel(detailLog.action, dict) : "—"
            }
            messageLabel={
              detailLog
                ? translateLogMessage(detailLog.message, dict)
                : "—"
            }
            statusLabel={
              detailLog ? statusLabel(detailLog.offer.status, dict) : "—"
            }
          />

          {showFilteredEmpty ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="40vh"
              paddingY="6"
            >
              <EmptyMessage
                icon={<ListIcon />}
                title={dict.priceLogs.emptyFilteredTitle}
                text={dict.priceLogs.emptyFilteredText}
                actions={
                  <Button appearance="primary" onClick={clearAllFilters}>
                    {dict.priceLogs.emptyClearFilters}
                  </Button>
                }
              />
            </Box>
          ) : (
            <>
              <Box overflow="auto">
                <Table>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell as="th">{dict.priceLogs.colWhen}</Table.Cell>
                      <Table.Cell as="th">{dict.priceLogs.colOffer}</Table.Cell>
                      <Table.Cell as="th">{dict.priceLogs.colAction}</Table.Cell>
                      <Table.Cell as="th">{dict.priceLogs.colResult}</Table.Cell>
                      <Table.Cell as="th">
                        {dict.priceLogs.colPricesApplied}
                      </Table.Cell>
                      <Table.Cell as="th">{dict.priceLogs.colMessage}</Table.Cell>
                      <Table.Cell as="th"> </Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {logs.map((log) => (
                      <Table.Row key={log.id}>
                        <Table.Cell>{formatWhen(log.createdAt)}</Table.Cell>
                        <Table.Cell>
                          <Box display="flex" flexDirection="column" gap="1">
                            <Text fontWeight="medium">{log.offer.name}</Text>
                            <Text fontSize="caption" color="neutral-textLow">
                              {statusLabel(log.offer.status, dict)}
                            </Text>
                          </Box>
                        </Table.Cell>
                        <Table.Cell>
                          {actionLabel(log.action, dict)}
                        </Table.Cell>
                        <Table.Cell>
                          <Tag appearance={log.success ? "success" : "danger"}>
                            {log.success
                              ? dict.priceLogs.success
                              : dict.priceLogs.failed}
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          {log.offer.pricesApplied
                            ? dict.priceLogs.yes
                            : dict.priceLogs.no}
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontSize="caption">
                            {translateLogMessage(log.message, dict).slice(
                              0,
                              180,
                            )}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Box display="flex" gap="2" alignItems="center">
                            <IconButton
                              source={<EyeIcon />}
                              size="2rem"
                              title={dict.priceLogs.viewDetails}
                              aria-label={dict.priceLogs.viewDetails}
                              onClick={() => setDetailLog(log)}
                            />
                            {(log.action === "restore" ||
                              log.offer.pricesApplied) && (
                              <IconButton
                                source={<HistoryIcon />}
                                size="2rem"
                                title={dict.priceLogs.retryRestoreTitle}
                                aria-label={dict.priceLogs.retryRestoreTitle}
                                disabled={busyId === log.id}
                                onClick={() => void handleRetry(log)}
                              />
                            )}
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Box>

              {totalPages > 1 ? (
                <Box display="flex" justifyContent="center">
                  <Pagination
                    activePage={page}
                    pageCount={totalPages}
                    onPageChange={(nextPage) => setPage(nextPage)}
                  />
                </Box>
              ) : null}
            </>
          )}
        </Box>
      </Page.Body>
    </Page>
  );
}
