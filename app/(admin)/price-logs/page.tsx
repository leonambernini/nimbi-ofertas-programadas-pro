"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Label,
  Pagination,
  Select,
  Spinner,
  Table,
  Tag,
  Text,
  useToast,
} from "@nimbus-ds/components";
import { Page } from "@nimbus-ds/patterns";
import {
  listPriceSyncLogs,
  retryRestoreOfferPrices,
  type PriceSyncLog,
} from "@/lib/admin-api";
import { useLocale } from "@/lib/i18n/locale-context";

type ActionFilter = "all" | "apply" | "restore" | "activate" | "deactivate";
type SuccessFilter = "all" | "true" | "false";

export default function PriceLogsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { dict, locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<PriceSyncLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState<ActionFilter>("all");
  const [success, setSuccess] = useState<SuccessFilter>("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listPriceSyncLogs({
        page,
        pageSize: 30,
        action,
        success,
      });
      setLogs(result.logs);
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
  }, [action, addToast, dict.home.error, page, success]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionLabel = (value: PriceSyncLog["action"]) => {
    if (value === "apply") return dict.priceLogs.actionApply;
    if (value === "restore") return dict.priceLogs.actionRestore;
    if (value === "activate") return dict.priceLogs.actionActivate;
    return dict.priceLogs.actionDeactivate;
  };

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleString(locale === "es" ? "es-AR" : "pt-BR");

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

          <Box display="flex" gap="3" flexWrap="wrap">
            <Box minWidth="180px" display="flex" flexDirection="column" gap="2">
              <Label htmlFor="price-logs-action">
                {dict.priceLogs.filterAction}
              </Label>
              <Select
                id="price-logs-action"
                name="action"
                value={action}
                onChange={(e) => {
                  setPage(1);
                  setAction(e.target.value as ActionFilter);
                }}
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
            <Box minWidth="160px" display="flex" flexDirection="column" gap="2">
              <Label htmlFor="price-logs-success">
                {dict.priceLogs.filterSuccess}
              </Label>
              <Select
                id="price-logs-success"
                name="success"
                value={success}
                onChange={(e) => {
                  setPage(1);
                  setSuccess(e.target.value as SuccessFilter);
                }}
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

          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="30vh"
            >
              <Spinner size="large" />
            </Box>
          ) : logs.length === 0 ? (
            <Text>{dict.priceLogs.empty}</Text>
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
                              {log.offer.status}
                            </Text>
                          </Box>
                        </Table.Cell>
                        <Table.Cell>{actionLabel(log.action)}</Table.Cell>
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
                            {(log.message ?? "—").slice(0, 180)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {(log.action === "restore" ||
                            log.offer.pricesApplied) && (
                            <Button
                              appearance="neutral"
                              size="small"
                              disabled={busyId === log.id}
                              onClick={() => void handleRetry(log)}
                            >
                              {busyId === log.id
                                ? "..."
                                : dict.priceLogs.retryRestore}
                            </Button>
                          )}
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
