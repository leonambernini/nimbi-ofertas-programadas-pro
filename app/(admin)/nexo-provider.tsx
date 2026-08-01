"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Box, Spinner, Text, ToastProvider } from "@nimbus-ds/components";
import {
  ACTION_NAVIGATE_SYNC,
  ErrorBoundary,
  connect,
  getStoreInfo,
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
  const [bootReady, setBootReady] = useState(false);
  const [language, setLanguage] = useState("pt");
  const [country, setCountry] = useState<string | null>(null);
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

  /**
   * Bootstrap:
   * - idioma/país → Nexo `getStoreInfo` (fonte correta no Enhanced Admin)
   * - acesso/assinatura → `/me`
   */
  useEffect(() => {
    if (status === "connecting" || bootstrapped.current) return;
    bootstrapped.current = true;

    const nexo = getNexoClient();

    const localeFromNexo =
      status === "connected"
        ? getStoreInfo(nexo)
            .then((info) => ({
              language: info.language || "pt",
              country: info.country || null,
            }))
            .catch(() => null)
        : Promise.resolve(null);

    const mePromise = getMe().catch(() => null);

    Promise.all([
      localeFromNexo,
      mePromise,
      ensureWebhooks().catch(() => {}),
    ])
      .then(([nexoLocale, me]) => {
        if (nexoLocale) {
          setLanguage(nexoLocale.language);
          setCountry(nexoLocale.country);
        } else if (me) {
          /** Fallback: `/me` (standalone ou falha do getStoreInfo). */
          setLanguage(me.language || "pt");
          setCountry(me.country ?? null);
        }
        if (me) setBlocked(Boolean(me.blocked));
      })
      .finally(() => {
        setBootReady(true);
      });
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

  if (status === "connecting" || !bootReady) {
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
    <LocaleProvider initialLocale={language} country={country}>
      <ToastProvider>{children}</ToastProvider>
    </LocaleProvider>
  );

  if (status === "standalone") {
    /**
     * Fora do iframe do Enhanced Admin o Nexo não emite JWT.
     * Em produção, evita chamar a API e receber 401 missing_token.
     */
    if (process.env.NODE_ENV === "production") {
      return (
        <Box
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap="2"
          padding="6"
        >
          <Text fontSize="highlight" fontWeight="medium" textAlign="center">
            Abra o Ofertas Programadas Pro pelo Admin da Nuvemshop
          </Text>
          <Text color="neutral-textLow" textAlign="center">
            A sessão só funciona dentro do painel (Apps → Ofertas Programadas
            Pro). Abrir a URL da Vercel direto não autentica.
          </Text>
        </Box>
      );
    }
    return content;
  }

  return <ErrorBoundary nexo={getNexoClient()}>{content}</ErrorBoundary>;
}
