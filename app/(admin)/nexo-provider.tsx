"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Spinner, Text, ToastProvider } from "@nimbus-ds/components";
import {
  ACTION_NAVIGATE_SYNC,
  ErrorBoundary,
  connect,
  iAmReady,
  syncPathname,
  type NavigateSyncResponse,
} from "@tiendanube/nexo";
import { ensureWebhooks, getMe } from "@/lib/admin-api";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getNexoClient } from "@/lib/nexo";

type Status = "connecting" | "connected" | "standalone";

export function NexoProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("connecting");
  const [language, setLanguage] = useState("pt");
  const [blocked, setBlocked] = useState(false);
  const bootstrapped = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const nexo = getNexoClient();

    connect(nexo)
      .then(() => {
        setStatus("connected");
        iAmReady(nexo);
      })
      .catch(() => {
        setStatus("standalone");
      });
  }, []);

  // Bootstrap uma vez: webhooks + me (acesso/idioma)
  useEffect(() => {
    if (status === "connecting" || bootstrapped.current) return;
    bootstrapped.current = true;

    ensureWebhooks().catch(() => {});
    getMe()
      .then((me) => {
        setLanguage(me.language);
        setBlocked(Boolean(me.blocked));
      })
      .catch(() => {});
  }, [status]);

  // Gate: se bloqueado, mantém em /subscription
  useEffect(() => {
    if (!blocked) return;
    if (pathname === "/subscription" || pathname.startsWith("/subscription/")) {
      return;
    }
    router.replace("/subscription");
  }, [blocked, pathname, router]);

  useEffect(() => {
    if (status !== "connected") return;
    syncPathname(getNexoClient(), pathname);
  }, [status, pathname]);

  useEffect(() => {
    if (status !== "connected") return;

    const unsubscribe = getNexoClient().suscribe(
      ACTION_NAVIGATE_SYNC,
      ({ path, replace }: NavigateSyncResponse) => {
        if (replace) {
          router.replace(path);
        } else {
          router.push(path);
        }
      },
    );

    return unsubscribe;
  }, [status, router]);

  if (status === "connecting") {
    return (
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        gap="2"
      >
        <Spinner size="large" />
        <Text>Conectando...</Text>
      </Box>
    );
  }

  const content = (
    <LocaleProvider initialLocale={language}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );

  if (status === "standalone") {
    return content;
  }

  return <ErrorBoundary nexo={getNexoClient()}>{content}</ErrorBoundary>;
}
