"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Input,
  Modal,
  Pagination,
  Spinner,
  Table,
  Tag,
  Text,
  Toggle,
  useToast,
} from "@nimbus-ds/components";
import {
  EditIcon,
  FireIcon,
  SlidersIcon,
  TagIcon,
  TrashIcon,
  TiendanubeIcon,
} from "@nimbus-ds/icons";
import { InitialScreen, Page } from "@nimbus-ds/patterns";
import { navigateHeaderRemove } from "@tiendanube/nexo";
import { deleteOffer, listOffers, patchOffer } from "@/lib/admin-api";
import { t } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";
import { getNexoClient } from "@/lib/nexo";
import { deriveStatus } from "@/lib/offers";
import type { ApiOfferGroup } from "@/lib/types";
import {
  OffersFilterSideModal,
  type EnabledFilter,
  type OffersListFilters,
  type SortKey,
} from "./components/offers-filter-side-modal";
import initialScreenImage from "./initial-screen.png";

const BULLET_ICONS = [TagIcon, FireIcon, TiendanubeIcon];

const DEFAULT_FILTERS: OffersListFilters = {
  enabled: "all",
  date: "",
  status: "all",
  sortBy: "startsAt",
};

const SEARCH_DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

function formatPeriod(startsAt: string, endsAt: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  return `${fmt(startsAt)} → ${fmt(endsAt)}`;
}

function statusAppearance(
  status: string,
): "neutral" | "success" | "warning" | "danger" | "primary" {
  if (status === "active") return "success";
  if (status === "scheduled") return "primary";
  if (status === "ended") return "neutral";
  if (status === "disabled") return "danger";
  return "warning";
}

type ConfirmState =
  | { type: "delete"; offer: ApiOfferGroup }
  | { type: "toggle"; offer: ApiOfferGroup; nextEnabled: boolean };

export default function OffersPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { dict } = useLocale();
  const nexo = getNexoClient();

  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [offers, setOffers] = useState<ApiOfferGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

  const [filterNameInput, setFilterNameInput] = useState("");
  const [debouncedFilterName, setDebouncedFilterName] = useState("");
  const [filters, setFilters] = useState<OffersListFilters>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasQueryFilters =
    debouncedFilterName.trim() !== "" ||
    filters.enabled !== "all" ||
    filters.date !== "" ||
    filters.status !== "all";

  useEffect(() => {
    navigateHeaderRemove(nexo);
  }, [nexo]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedFilterName(filterNameInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filterNameInput]);

  const loadOffers = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setListLoading(true);
      try {
        const result = await listOffers({
          q: debouncedFilterName,
          enabled: filters.enabled,
          status: filters.status,
          date: filters.date || undefined,
          sortBy: filters.sortBy,
          page,
          pageSize: PAGE_SIZE,
        });
        setOffers(result.offers);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        if (result.page !== page && result.totalPages > 0) {
          setPage(Math.min(page, result.totalPages));
        }
      } catch {
        addToast({
          id: "offers-load-error",
          type: "danger",
          text: dict.home.error,
        });
      } finally {
        setLoading(false);
        setListLoading(false);
      }
    },
    [addToast, debouncedFilterName, dict.home.error, filters, page],
  );

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const applyFilters = (next: OffersListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const enabledLabel = (value: EnabledFilter) => {
    if (value === "active") return dict.home.filters.enabledActive;
    if (value === "inactive") return dict.home.filters.enabledInactive;
    return dict.home.filters.enabledAll;
  };

  const sortLabel = (value: SortKey) => {
    if (value === "status") return dict.home.filters.sortStatus;
    if (value === "enabled") return dict.home.filters.sortEnabled;
    return dict.home.filters.sortStartsAt;
  };

  const formatChipDate = (date: string) => {
    const [y, m, d] = date.split("-");
    if (!y || !m || !d) return date;
    return `${d}/${m}/${y}`;
  };

  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; text: string; clear: () => void }> = [];

    if (filters.enabled !== "all") {
      chips.push({
        key: "enabled",
        text: t(dict.home.filters.chipEnabled, {
          value: enabledLabel(filters.enabled),
        }),
        clear: () => {
          setFilters((prev) => ({ ...prev, enabled: "all" }));
          setPage(1);
        },
      });
    }
    if (filters.date) {
      chips.push({
        key: "date",
        text: t(dict.home.filters.chipDate, {
          value: formatChipDate(filters.date),
        }),
        clear: () => {
          setFilters((prev) => ({ ...prev, date: "" }));
          setPage(1);
        },
      });
    }
    if (filters.status !== "all") {
      chips.push({
        key: "status",
        text: t(dict.home.filters.chipStatus, {
          value: dict.home.status[filters.status] ?? filters.status,
        }),
        clear: () => {
          setFilters((prev) => ({ ...prev, status: "all" }));
          setPage(1);
        },
      });
    }
    if (filters.sortBy !== "startsAt") {
      chips.push({
        key: "sort",
        text: t(dict.home.filters.chipSort, {
          value: sortLabel(filters.sortBy),
        }),
        clear: () => {
          setFilters((prev) => ({ ...prev, sortBy: "startsAt" }));
          setPage(1);
        },
      });
    }

    return chips;
  }, [filters, dict.home.filters, dict.home.status]);

  const willTouchPrices = (state: ConfirmState) => {
    if (state.type === "delete") {
      return state.offer.pricesApplied;
    }
    if (!state.nextEnabled) {
      return state.offer.pricesApplied;
    }
    const nextStatus = deriveStatus({
      enabled: true,
      startsAt: new Date(state.offer.startsAt),
      endsAt: new Date(state.offer.endsAt),
    });
    return (
      state.offer.autoApplyPrices &&
      nextStatus === "active" &&
      !state.offer.pricesApplied
    );
  };

  const runToggle = async (offer: ApiOfferGroup, nextEnabled: boolean) => {
    const previous = offers;
    setOffers(
      offers.map((item) =>
        item.id === offer.id ? { ...item, enabled: nextEnabled } : item,
      ),
    );
    try {
      const updated = await patchOffer(offer.id, { enabled: nextEnabled });
      setOffers((current) =>
        current.map((item) => (item.id === offer.id ? updated : item)),
      );
      // Recarrega se o filtro de ativo/inativo puder esconder o item
      if (filters.enabled !== "all") {
        await loadOffers({ silent: true });
      }
    } catch {
      setOffers(previous);
      addToast({
        id: `offer-toggle-error-${offer.id}`,
        type: "danger",
        text: dict.home.error,
      });
    }
  };

  const runDelete = async (id: string) => {
    const previous = offers;
    setOffers(offers.filter((offer) => offer.id !== id));
    try {
      await deleteOffer(id);
      addToast({
        id: `offer-deleted-${id}`,
        type: "success",
        text: dict.home.deleted,
      });
      await loadOffers({ silent: true });
    } catch {
      setOffers(previous);
      addToast({
        id: `offer-delete-error-${id}`,
        type: "danger",
        text: dict.home.error,
      });
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.type === "delete") {
        await runDelete(confirm.offer.id);
      } else {
        await runToggle(confirm.offer, confirm.nextEnabled);
      }
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Page>
        <Page.Body>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh">
            <Spinner size="large" />
          </Box>
        </Page.Body>
      </Page>
    );
  }

  const showOnboarding =
    !loading && total === 0 && !hasQueryFilters && filterNameInput.trim() === "";

  const confirmTitle =
    confirm?.type === "delete"
      ? dict.home.deleteConfirmTitle
      : confirm?.nextEnabled
        ? dict.home.toggleEnableTitle
        : dict.home.toggleDisableTitle;

  const confirmBody =
    confirm?.type === "delete"
      ? dict.home.deleteConfirmBody
      : confirm?.nextEnabled
        ? dict.home.toggleEnableBody
        : dict.home.toggleDisableBody;

  const confirmPricesBody =
    confirm?.type === "delete"
      ? dict.home.deleteConfirmBodyPrices
      : confirm?.nextEnabled
        ? dict.home.toggleEnableBodyPrices
        : dict.home.toggleDisableBodyPrices;

  const showPricesNote = confirm ? willTouchPrices(confirm) : false;

  return (
    <Page>
      {!showOnboarding && (
        <Page.Header
          title={dict.appName}
          buttonStack={
            <Box display="flex" gap="2">
              <Button
                appearance="neutral"
                onClick={() => router.push("/price-logs")}>
                {dict.home.priceLogs}
              </Button>
              <Button
                appearance="neutral"
                onClick={() => router.push("/subscription")}>
                {dict.home.subscription}
              </Button>
              <Button
                appearance="primary"
                onClick={() => router.push("/offers/new")}>
                {dict.home.createOffer}
              </Button>
            </Box>
          }
        />
      )}
      <Page.Body>
        {showOnboarding ? (
          <InitialScreen>
            <InitialScreen.Hero
              subtitle={dict.home.initialSubtitle}
              title={dict.home.initialTitle}
              bullets={dict.home.initialBullets.map((text, index) => {
                const Icon = BULLET_ICONS[index] ?? TagIcon;
                return (
                  <InitialScreen.Bullet
                    key={text}
                    icon={<Icon />}
                    text={text}
                  />
                );
              })}
              actions={
                <Box display="flex" gap="2">
                  <Button
                    appearance="neutral"
                    onClick={() => router.push("/subscription")}>
                    {dict.home.initialSubscriptionCta}
                  </Button>
                  <Button
                    appearance="primary"
                    onClick={() => router.push("/offers/new")}>
                    {dict.home.initialCta}
                  </Button>
                </Box>
              }
              image={
                <img
                  src={initialScreenImage.src}
                  alt={dict.home.initialTitle}
                  width="100%"
                />
              }
            />
          </InitialScreen>
        ) : (
          <Box display="flex" flexDirection="column" gap="4">
            <Box display="flex" flexDirection="column" gap="2">
              <Box display="flex" gap="1" alignItems="center">
                <Box flex="1">
                  <Input.Search
                    placeholder={dict.home.filters.namePlaceholder}
                    value={filterNameInput}
                    onChange={(e) => setFilterNameInput(e.target.value)}
                  />
                </Box>
                <Button
                  appearance="neutral"
                  aria-label={dict.home.filters.openFilters}
                  onClick={() => setFiltersOpen(true)}>
                  <SlidersIcon />
                </Button>
              </Box>

              <Box display="flex" gap="2" alignItems="center" flexWrap="wrap">
                <Text color="neutral-textLow">
                  {t(dict.home.filters.results, {
                    count: total,
                  })}
                </Text>
                {listLoading ? <Spinner size="small" /> : null}
                {filterChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    text={chip.text}
                    removable
                    onClick={chip.clear}
                  />
                ))}
              </Box>
            </Box>

            <OffersFilterSideModal
              open={filtersOpen}
              value={filters}
              onClose={() => setFiltersOpen(false)}
              onApply={applyFilters}
            />

            {offers.length === 0 ? (
              <Box padding="6" textAlign="center">
                <Text>{dict.home.filters.empty}</Text>
              </Box>
            ) : (
              <Table>
                <Table.Head>
                  <Table.Row>
                    <Table.Cell as="th" width="50px">
                      {dict.home.columns.enabled}
                    </Table.Cell>
                    <Table.Cell as="th">{dict.home.columns.name}</Table.Cell>
                    <Table.Cell as="th" width="190px">
                      {dict.home.columns.display}
                    </Table.Cell>
                    <Table.Cell as="th" width="80px">
                      {dict.home.columns.products}
                    </Table.Cell>
                    <Table.Cell as="th">{dict.home.columns.period}</Table.Cell>
                    <Table.Cell as="th" width="120px">
                      {dict.home.columns.status}
                    </Table.Cell>
                    <Table.Cell as="th" width="80px">
                      {dict.home.columns.actions}
                    </Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {offers.map((offer) => {
                    const displayTags = [
                      {
                        key: "banner",
                        label: dict.home.displayTags.banner,
                        active: offer.enableBanner,
                      },
                      {
                        key: "showcase",
                        label: dict.home.displayTags.showcase,
                        active: offer.showCountdownOnItems,
                      },
                      {
                        key: "pdp",
                        label: dict.home.displayTags.pdp,
                        active: offer.showCountdownOnPdp,
                      },
                    ];

                    return (
                      <Table.Row key={offer.id}>
                        <Table.Cell>
                          <Toggle
                            name={`enabled-${offer.id}`}
                            active={offer.enabled}
                            onChange={() =>
                              setConfirm({
                                type: "toggle",
                                offer,
                                nextEnabled: !offer.enabled,
                              })
                            }
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <Text fontWeight="medium">{offer.name}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Box display="flex" gap="1" flexWrap="wrap">
                            {displayTags.map((tag) => (
                              <Tag
                                key={tag.key}
                                appearance={
                                  tag.active ? "success" : "neutral"
                                }>
                                {tag.label}
                              </Tag>
                            ))}
                          </Box>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>{offer.itemCount}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text>
                            {formatPeriod(offer.startsAt, offer.endsAt)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Tag appearance={statusAppearance(offer.status)}>
                            {dict.home.status[offer.status] ?? offer.status}
                          </Tag>
                        </Table.Cell>
                        <Table.Cell>
                          <Box display="flex" gap="2">
                            <IconButton
                              source={<EditIcon />}
                              size="2rem"
                              onClick={() =>
                                router.push(`/offers/${offer.id}`)
                              }
                            />
                            <IconButton
                              source={<TrashIcon />}
                              size="2rem"
                              onClick={() =>
                                setConfirm({ type: "delete", offer })
                              }
                            />
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}

            {totalPages > 1 ? (
              <Box display="flex" justifyContent="center">
                <Pagination
                  activePage={page}
                  pageCount={totalPages}
                  onPageChange={(nextPage) => setPage(nextPage)}
                />
              </Box>
            ) : null}
          </Box>
        )}
      </Page.Body>

      <Modal
        open={Boolean(confirm)}
        onDismiss={() => {
          if (!busy) setConfirm(null);
        }}
        closeOnOutsidePress={!busy}>
        <Modal.Header title={confirmTitle} />
        <Modal.Body>
          <Box display="flex" flexDirection="column" gap="2">
            <Text>{confirmBody}</Text>
            {showPricesNote ? (
              <>
                <Text fontWeight="medium">{confirmPricesBody}</Text>
                <Text color="neutral-textLow">
                  {dict.home.pricesSyncWarning}
                </Text>
              </>
            ) : null}
          </Box>
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="neutral"
            onClick={() => setConfirm(null)}
            disabled={busy}>
            {dict.home.confirmCancel}
          </Button>
          <Button
            appearance={confirm?.type === "delete" ? "danger" : "primary"}
            onClick={() => void handleConfirm()}
            disabled={busy}>
            {busy ? <Spinner size="small" /> : dict.home.confirmContinue}
          </Button>
        </Modal.Footer>
      </Modal>
    </Page>
  );
}
