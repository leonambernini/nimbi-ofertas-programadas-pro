"use client";

import type { ReactNode } from "react";
import { Box, Tag, Text, Title } from "@nimbus-ds/components";
import { SideModal } from "@nimbus-ds/patterns";
import type { PriceSyncLog } from "@/lib/admin-api";
import { t } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/lib/i18n/locale-context";

type Props = {
  open: boolean;
  log: PriceSyncLog | null;
  onClose: () => void;
  actionLabel: string;
  messageLabel: string;
  statusLabel: string;
};

type LogDetails = {
  itemCount?: number;
  productCount?: number;
  errors?: string[];
  attemptsByProduct?: Record<string, number>;
  maxAttempts?: number;
  endpoint?: string;
  force?: boolean;
  subset?: boolean;
  skipped?: boolean;
  reason?: string;
  bug?: boolean;
  source?: string;
  sample?: unknown;
  now?: string;
  startsAt?: string;
  endsAt?: string;
};

function asDetails(value: unknown): LogDetails {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as LogDetails;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box display="flex" flexDirection="column" gap="1">
      <Text fontSize="caption" color="neutral-textLow">
        {label}
      </Text>
      <Box>{children}</Box>
    </Box>
  );
}

export function PriceLogDetailSideModal({
  open,
  log,
  onClose,
  actionLabel,
  messageLabel,
  statusLabel,
}: Props) {
  const { dict, locale } = useLocale();
  const details = asDetails(log?.details);
  const errors = Array.isArray(details.errors)
    ? details.errors.filter((e) => typeof e === "string" && e.trim())
    : [];
  const attempts = details.attemptsByProduct ?? {};
  const attemptEntries = Object.entries(attempts);
  const maxAttemptsUsed = attemptEntries.reduce(
    (max, [, n]) => Math.max(max, Number(n) || 0),
    0,
  );

  const when = log
    ? new Date(log.createdAt).toLocaleString(
        locale === "es" ? "es-AR" : "pt-BR",
      )
    : "—";

  return (
    <SideModal
      open={open}
      onRemove={onClose}
      maxWidth="520px"
      title={dict.priceLogs.detailTitle}
      paddingHeader="base"
      paddingBody="base"
      paddingFooter="base"
      footer={{
        primaryAction: {
          children: dict.priceLogs.detailClose,
          appearance: "primary",
          onClick: onClose,
        },
        secondaryAction: {
          children: dict.form.cancel,
          appearance: "transparent",
          onClick: onClose,
        },
      }}
    >
      {!log ? (
        <Text>{dict.priceLogs.empty}</Text>
      ) : (
        <Box display="flex" flexDirection="column" gap="4">
          <DetailRow label={dict.priceLogs.colWhen}>
            <Text>{when}</Text>
          </DetailRow>

          <DetailRow label={dict.priceLogs.colOffer}>
            <Box display="flex" flexDirection="column" gap="1">
              <Text fontWeight="medium">{log.offer.name}</Text>
              <Text fontSize="caption" color="neutral-textLow">
                {statusLabel}
              </Text>
            </Box>
          </DetailRow>

          <Box display="flex" gap="4" flexWrap="wrap">
            <DetailRow label={dict.priceLogs.colAction}>
              <Text>{actionLabel}</Text>
            </DetailRow>
            <DetailRow label={dict.priceLogs.colResult}>
              <Tag appearance={log.success ? "success" : "danger"}>
                {log.success
                  ? dict.priceLogs.success
                  : dict.priceLogs.failed}
              </Tag>
            </DetailRow>
            <DetailRow label={dict.priceLogs.colPricesApplied}>
              <Text>
                {log.offer.pricesApplied
                  ? dict.priceLogs.yes
                  : dict.priceLogs.no}
              </Text>
            </DetailRow>
          </Box>

          <DetailRow label={dict.priceLogs.colMessage}>
            <Text>{messageLabel}</Text>
          </DetailRow>

          {(details.productCount != null || details.itemCount != null) && (
            <Box display="flex" gap="4" flexWrap="wrap">
              {details.productCount != null ? (
                <DetailRow label={dict.priceLogs.detailProducts}>
                  <Text>{details.productCount}</Text>
                </DetailRow>
              ) : null}
              {details.itemCount != null ? (
                <DetailRow label={dict.priceLogs.detailVariants}>
                  <Text>{details.itemCount}</Text>
                </DetailRow>
              ) : null}
            </Box>
          )}

          {(details.maxAttempts != null || attemptEntries.length > 0) && (
            <Box display="flex" flexDirection="column" gap="2">
              <Title as="h4">{dict.priceLogs.detailAttempts}</Title>
              <Box display="flex" gap="4" flexWrap="wrap">
                {details.maxAttempts != null ? (
                  <DetailRow label={dict.priceLogs.detailMaxAttempts}>
                    <Text>{details.maxAttempts}</Text>
                  </DetailRow>
                ) : null}
                {attemptEntries.length > 0 ? (
                  <DetailRow label={dict.priceLogs.detailHighestAttempt}>
                    <Text>{maxAttemptsUsed}</Text>
                  </DetailRow>
                ) : null}
              </Box>
              {attemptEntries.length > 0 ? (
                <Box display="flex" flexDirection="column" gap="1">
                  {attemptEntries.map(([productId, count]) => (
                    <Text key={productId} fontSize="caption">
                      {t(dict.priceLogs.detailAttemptRow, {
                        productId,
                        count,
                      })}
                    </Text>
                  ))}
                </Box>
              ) : (
                <Text fontSize="caption" color="neutral-textLow">
                  {dict.priceLogs.detailNoAttempts}
                </Text>
              )}
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap="2">
            <Title as="h4">{dict.priceLogs.detailErrors}</Title>
            {errors.length === 0 ? (
              <Text fontSize="caption" color="neutral-textLow">
                {dict.priceLogs.detailNoErrors}
              </Text>
            ) : (
              <Box display="flex" flexDirection="column" gap="2">
                {errors.map((error, index) => (
                  <Box
                    key={`${index}-${error.slice(0, 24)}`}
                    backgroundColor="danger-surface"
                    borderRadius="2"
                    padding="2"
                  >
                    <Text fontSize="caption">{error}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {(details.endpoint ||
            details.force != null ||
            details.bug ||
            details.source) && (
            <Box display="flex" flexDirection="column" gap="2">
              <Title as="h4">{dict.priceLogs.detailMeta}</Title>
              {details.endpoint ? (
                <DetailRow label={dict.priceLogs.detailEndpoint}>
                  <Text fontSize="caption">{details.endpoint}</Text>
                </DetailRow>
              ) : null}
              {details.force != null ? (
                <DetailRow label={dict.priceLogs.detailForce}>
                  <Text>
                    {details.force
                      ? dict.priceLogs.yes
                      : dict.priceLogs.no}
                  </Text>
                </DetailRow>
              ) : null}
              {details.source ? (
                <DetailRow label={dict.priceLogs.detailSource}>
                  <Text fontSize="caption">{details.source}</Text>
                </DetailRow>
              ) : null}
              {details.bug ? (
                <Tag appearance="danger">{dict.priceLogs.detailBug}</Tag>
              ) : null}
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap="2">
            <Title as="h4">{dict.priceLogs.detailRaw}</Title>
            <Box
              backgroundColor="neutral-surface"
              borderRadius="2"
              padding="3"
              overflow="auto"
              maxHeight="240px"
            >
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  fontSize: 12,
                }}
              >
                {JSON.stringify(log.details ?? {}, null, 2)}
              </pre>
            </Box>
          </Box>
        </Box>
      )}
    </SideModal>
  );
}
