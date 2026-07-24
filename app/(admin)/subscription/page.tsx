"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Spinner,
  Tag,
  Text,
  Title,
  useToast,
} from "@nimbus-ds/components";
import { Page } from "@nimbus-ds/patterns";
import { getSubscription } from "@/lib/admin-api";
import { useLocale } from "@/lib/i18n/locale-context";
import type { SubscriptionInfo } from "@/lib/types";

const FAQ_PT = [
  {
    q: "Como funciona a assinatura?",
    a: "A Nuvemshop cria e gerencia a assinatura automaticamente quando você instala o app. O período de testes e as cobranças ficam na fatura da loja.",
  },
  {
    q: "O que é a data do próximo pagamento?",
    a: "É o campo next_execution da assinatura: o dia em que a plataforma gera a próxima cobrança, já considerando o período de teste.",
  },
  {
    q: "Preciso ativar algo no app?",
    a: "Não. A assinatura e o trial são controlados pela Nuvemshop. Este painel só mostra o status sincronizado.",
  },
  {
    q: "O que acontece se a assinatura for suspensa?",
    a: "As ofertas deixam de aparecer na vitrine até a assinatura ser regularizada (app/resumed).",
  },
];

const FAQ_ES = [
  {
    q: "¿Cómo funciona la suscripción?",
    a: "Nuvemshop crea y gestiona la suscripción automáticamente al instalar la app. El período de prueba y los cobros quedan en la factura de la tienda.",
  },
  {
    q: "¿Qué es la fecha del próximo pago?",
    a: "Es el campo next_execution de la suscripción: el día en que la plataforma genera el próximo cargo, ya considerando el período de prueba.",
  },
  {
    q: "¿Necesito activar algo en la app?",
    a: "No. La suscripción y la prueba las controla Nuvemshop. Este panel solo muestra el estado sincronizado.",
  },
  {
    q: "¿Qué pasa si se suspende la suscripción?",
    a: "Las ofertas dejan de mostrarse en la vitrina hasta que la suscripción se regularice (app/resumed).",
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { dict, locale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<SubscriptionInfo | null>(null);
  const [showFaq, setShowFaq] = useState(false);

  useEffect(() => {
    getSubscription()
      .then(setInfo)
      .catch(() => {
        addToast({
          id: "subscription-load-error",
          type: "danger",
          text: dict.home.error,
        });
      })
      .finally(() => setLoading(false));
  }, [addToast, dict.home.error]);

  const faq = locale === "es" ? FAQ_ES : FAQ_PT;
  const isActive = info?.status === "active";
  const isTrial = info?.status === "trial";
  const blocked = info ? info.hasAccess === false : false;
  const dateLocale = locale === "es" ? "es-AR" : "pt-BR";

  const statusLabel =
    info?.status === "active"
      ? dict.subscription.active
      : info?.status === "trial"
        ? dict.subscription.trial
        : info?.status === "suspended"
          ? dict.subscription.suspended
          : dict.subscription.inactive;

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="50vh"
      >
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <Page>
      <Page.Header
        title={dict.subscription.title}
        buttonStack={
          <Box display="flex" gap="2">
            <Button appearance="neutral" onClick={() => setShowFaq((v) => !v)}>
              {dict.subscription.faq}
            </Button>
            {!blocked ? (
              <Button
                appearance="transparent"
                onClick={() => router.push("/offers")}
              >
                ←
              </Button>
            ) : null}
          </Box>
        }
      />
      <Page.Body>
        <Box display="flex" flexDirection="column" gap="6">
          {blocked ? (
            <Box
              backgroundColor="warning-surface"
              borderRadius="4"
              padding="4"
              display="flex"
              flexDirection="column"
              gap="2"
            >
              <Title as="h3">{dict.subscription.blockedTitle}</Title>
              <Text>{dict.subscription.blockedDescription}</Text>
            </Box>
          ) : null}

          <Box
            backgroundColor="neutral-background"
            borderRadius="4"
            padding="6"
            borderWidth="1"
            borderStyle="solid"
            borderColor="neutral-interactive"
            display="flex"
            flexDirection="column"
            gap="3"
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Title as="h3">
                {info?.planCode
                  ? `Plan ${info.planCode}`
                  : dict.subscription.current}
              </Title>
              <Tag
                appearance={
                  isActive || isTrial ? "success" : "warning"
                }
              >
                {statusLabel}
              </Tag>
            </Box>

            <Text>{dict.subscription.managedByNuvemshop}</Text>

            {isTrial ? (
              <Text>{dict.subscription.trialActiveDescription}</Text>
            ) : null}

            <Text>
              {info?.amountCurrency ?? "—"}{" "}
              {info?.amountValue != null ? info.amountValue : "—"} /{" "}
              {locale === "es" ? "mes" : "mês"}
            </Text>

            {info?.description ? <Text>{info.description}</Text> : null}

            <Text fontWeight="medium">
              {dict.subscription.nextPayment}:{" "}
              {info?.nextExecution
                ? new Date(info.nextExecution).toLocaleDateString(dateLocale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
            </Text>
          </Box>

          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap="4">
            <PlanCard
              title={dict.subscription.trialCardTitle}
              priceLabel={dict.subscription.trialCardPrice}
              description={dict.subscription.trialCardDescription}
              features={[
                dict.subscription.features.animated,
                dict.subscription.features.unlimited,
                dict.subscription.features.iconAndText,
                dict.subscription.features.email,
                dict.subscription.features.whatsapp,
              ]}
              badge={isTrial ? dict.subscription.currentPlan : undefined}
            />
            <PlanCard
              title="Pro"
              priceLabel={
                info?.amountValue != null && Number(info.amountValue) > 0
                  ? `${info.amountCurrency ?? "BRL"} ${info.amountValue} / ${locale === "es" ? "mes" : "mês"}`
                  : dict.subscription.proPriceHint
              }
              description={dict.subscription.proCardDescription}
              features={[
                dict.subscription.features.animated,
                dict.subscription.features.unlimited,
                dict.subscription.features.iconAndText,
                dict.subscription.features.email,
                dict.subscription.features.whatsapp,
              ]}
              badge={isActive ? dict.subscription.currentPlan : undefined}
              highlight
            />
          </Box>

          {showFaq && (
            <Box
              backgroundColor="neutral-background"
              borderRadius="4"
              padding="4"
              borderWidth="1"
              borderStyle="solid"
              borderColor="neutral-interactive"
              display="flex"
              flexDirection="column"
              gap="4"
            >
              <Title as="h3">{dict.subscription.faq}</Title>
              {faq.map((item) => (
                <Box key={item.q} display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">{item.q}</Text>
                  <Text color="neutral-textLow">{item.a}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Page.Body>
    </Page>
  );
}

function PlanCard({
  title,
  priceLabel,
  description,
  features,
  badge,
  highlight,
}: {
  title: string;
  priceLabel: string;
  description: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <Box
      backgroundColor="neutral-background"
      borderRadius="4"
      padding="4"
      borderWidth="1"
      borderStyle="solid"
      borderColor={highlight ? "primary-interactive" : "neutral-interactive"}
      display="flex"
      flexDirection="column"
      gap="3"
      minHeight="240px"
    >
      {badge ? <Tag appearance="primary">{badge}</Tag> : null}
      <Title as="h4">{title}</Title>
      <Text fontWeight="bold">{priceLabel}</Text>
      <Text color="neutral-textLow">{description}</Text>
      {features.map((feature) => (
        <Text key={feature}>✓ {feature}</Text>
      ))}
    </Box>
  );
}
