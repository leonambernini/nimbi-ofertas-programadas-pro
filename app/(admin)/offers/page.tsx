"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  IconButton,
  Modal,
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
  TagIcon,
  TrashIcon,
  TiendanubeIcon,
} from "@nimbus-ds/icons";
import { InitialScreen, Page } from "@nimbus-ds/patterns";
import { navigateHeaderRemove } from "@tiendanube/nexo";
import { deleteOffer, listOffers, patchOffer } from "@/lib/admin-api";
import { useLocale } from "@/lib/i18n/locale-context";
import { getNexoClient } from "@/lib/nexo";
import { deriveStatus } from "@/lib/offers";
import type { ApiOfferGroup } from "@/lib/types";
import initialScreenImage from "./initial-screen.png";

const BULLET_ICONS = [TagIcon, FireIcon, TiendanubeIcon];

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
  const [offers, setOffers] = useState<ApiOfferGroup[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

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
                            appearance={tag.active ? "success" : "neutral"}>
                            {tag.label}
                          </Tag>
                        ))}
                      </Box>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{offer.itemCount}</Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Text>{formatPeriod(offer.startsAt, offer.endsAt)}</Text>
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
                          onClick={() => router.push(`/offers/${offer.id}`)}
                        />
                        <IconButton
                          source={<TrashIcon />}
                          size="2rem"
                          onClick={() => setConfirm({ type: "delete", offer })}
                        />
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
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
