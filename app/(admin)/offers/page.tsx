"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  IconButton,
  Input,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  Tag,
  Text,
  Title,
  Toggle,
  useToast,
} from "@nimbus-ds/components";
import {
  EditIcon,
  FireIcon,
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
import initialScreenImage from "./initial-screen.png";

const BULLET_ICONS = [TagIcon, FireIcon, TiendanubeIcon];

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  scheduled: 1,
  draft: 2,
  ended: 3,
  disabled: 4,
};

type EnabledFilter = "all" | "active" | "inactive";
type StatusFilter = "all" | ApiOfferGroup["status"];
type SortKey = "status" | "enabled" | "startsAt";

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

/** A data do filtro (YYYY-MM-DD) cai dentro do período da oferta? */
function periodContainsDate(startsAt: string, endsAt: string, date: string) {
  if (!date) return true;
  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);
  if (Number.isNaN(dayStart.getTime()) || Number.isNaN(dayEnd.getTime())) {
    return true;
  }
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  return start <= dayEnd && end >= dayStart;
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
  const [offers, setOffers] = useState<ApiOfferGroup[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

  const [filterEnabled, setFilterEnabled] = useState<EnabledFilter>("all");
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("startsAt");

  useEffect(() => {
    navigateHeaderRemove(nexo);
  }, [nexo]);

  useEffect(() => {
    listOffers()
      .then(setOffers)
      .catch(() => {
        addToast({
          id: "offers-load-error",
          type: "danger",
          text: dict.home.error,
        });
      })
      .finally(() => setLoading(false));
  }, [addToast, dict.home.error]);

  const filteredOffers = useMemo(() => {
    const nameQuery = filterName.trim().toLowerCase();

    const list = offers.filter((offer) => {
      if (filterEnabled === "active" && !offer.enabled) return false;
      if (filterEnabled === "inactive" && offer.enabled) return false;
      if (nameQuery && !offer.name.toLowerCase().includes(nameQuery)) {
        return false;
      }
      if (
        filterDate &&
        !periodContainsDate(offer.startsAt, offer.endsAt, filterDate)
      ) {
        return false;
      }
      if (filterStatus !== "all" && offer.status !== filterStatus) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sortBy === "enabled") {
        if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
        return a.name.localeCompare(b.name, "pt");
      }
      if (sortBy === "status") {
        const sa = STATUS_ORDER[a.status] ?? 99;
        const sb = STATUS_ORDER[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name, "pt");
      }
      // startsAt
      const da = new Date(a.startsAt).getTime();
      const db = new Date(b.startsAt).getTime();
      if (da !== db) return db - da;
      return a.name.localeCompare(b.name, "pt");
    });

    return list;
  }, [
    offers,
    filterEnabled,
    filterName,
    filterDate,
    filterStatus,
    sortBy,
  ]);

  const hasActiveFilters =
    filterEnabled !== "all" ||
    filterName.trim() !== "" ||
    filterDate !== "" ||
    filterStatus !== "all";

  const clearFilters = () => {
    setFilterEnabled("all");
    setFilterName("");
    setFilterDate("");
    setFilterStatus("all");
    setSortBy("startsAt");
  };

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

  const showOnboarding = offers.length === 0;

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

  const statusOptions: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: dict.home.filters.statusAll },
    { value: "draft", label: dict.home.status.draft },
    { value: "scheduled", label: dict.home.status.scheduled },
    { value: "active", label: dict.home.status.active },
    { value: "ended", label: dict.home.status.ended },
    { value: "disabled", label: dict.home.status.disabled },
  ];

  return (
    <Page>
      {!showOnboarding && (
        <Page.Header
          title={dict.appName}
          buttonStack={
            <Box display="flex" gap="2">
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
            <Box
              display="flex"
              flexDirection="column"
              gap="3"
              backgroundColor="neutral-background"
              borderRadius="2"
              borderWidth="1"
              borderColor="neutral-interactive"
              borderStyle="solid"
              padding="4">
              <Title as="h4">{dict.home.filters.title}</Title>
              <Box
                display="flex"
                flexWrap="wrap"
                gap="3"
                alignItems="flex-end">
                <Box flex="1" minWidth="140px">
                  <Label htmlFor="filter-enabled">
                    {dict.home.filters.enabled}
                  </Label>
                  <Select
                    id="filter-enabled"
                    name="filter-enabled"
                    value={filterEnabled}
                    onChange={(e) =>
                      setFilterEnabled(e.target.value as EnabledFilter)
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

                <Box flex="1" minWidth="180px">
                  <Label htmlFor="filter-name">{dict.home.filters.name}</Label>
                  <Input
                    id="filter-name"
                    name="filter-name"
                    placeholder={dict.home.filters.namePlaceholder}
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                </Box>

                <Box flex="1" minWidth="160px">
                  <Label htmlFor="filter-date">{dict.home.filters.date}</Label>
                  <Input
                    id="filter-date"
                    name="filter-date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                  />
                  <Text fontSize="caption" color="neutral-textLow">
                    {dict.home.filters.dateHelp}
                  </Text>
                </Box>

                <Box flex="1" minWidth="140px">
                  <Label htmlFor="filter-status">
                    {dict.home.filters.status}
                  </Label>
                  <Select
                    id="filter-status"
                    name="filter-status"
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as StatusFilter)
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

                <Box flex="1" minWidth="160px">
                  <Label htmlFor="sort-by">{dict.home.filters.sortBy}</Label>
                  <Select
                    id="sort-by"
                    name="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortKey)}>
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

                {hasActiveFilters ? (
                  <Button appearance="neutral" onClick={clearFilters}>
                    {dict.home.filters.clear}
                  </Button>
                ) : null}
              </Box>
              <Text color="neutral-textLow">
                {t(dict.home.filters.results, {
                  count: filteredOffers.length,
                })}
              </Text>
            </Box>

            {filteredOffers.length === 0 ? (
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
                  {filteredOffers.map((offer) => {
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
