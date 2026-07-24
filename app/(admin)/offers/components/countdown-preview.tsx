"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Text } from "@nimbus-ds/components";
import type {
  CountdownItemsModel,
  CountdownPdpModel,
} from "@/lib/countdown-models";
import { useLocale } from "@/lib/i18n/locale-context";
import type { OfferTheme } from "@/lib/types";

type Kind = "items" | "pdp";

type Props = {
  kind: Kind;
  model: CountdownItemsModel | CountdownPdpModel;
  theme: OfferTheme;
  showDays: boolean;
  text1?: string;
  text2?: string;
  /** ms restantes para a prévia (default ~2d). */
  previewMs?: number;
};

function pickText(value: string | undefined, fallback: string) {
  const t = value?.trim();
  return t || fallback;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function partsFromMs(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalHours: Math.floor(totalSec / 3600),
  };
}

function formatTimer(ms: number, showDays: boolean) {
  const p = partsFromMs(ms);
  if (showDays && p.days > 0) {
    return `${p.days}d ${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
  }
  if (showDays) {
    return `${pad(p.hours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
  }
  return `${pad(p.totalHours)}:${pad(p.minutes)}:${pad(p.seconds)}`;
}

const mono: React.CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontVariantNumeric: "tabular-nums",
  fontWeight: 700,
};

function PreviewFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box display="flex" flexDirection="column" gap="3">
      <Text fontSize="highlight" fontWeight="medium">
        {label}
      </Text>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="96px"
        padding="3"
        borderRadius="2"
        backgroundColor="neutral-surface">
        {children}
      </Box>
    </Box>
  );
}

function ItemsPreview({
  model,
  theme,
  showDays,
  ms,
  text1,
  text2,
}: {
  model: CountdownItemsModel;
  theme: OfferTheme;
  showDays: boolean;
  ms: number;
  text1?: string;
  text2?: string;
}) {
  const hms = formatTimer(ms, showDays);
  const p = partsFromMs(ms);
  const progress = 65;
  void text2;

  if (model === "bar") {
    return (
      <div style={{ width: "100%", maxWidth: 280 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 6,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: theme.textColor,
            opacity: 0.7,
          }}>
          <span>{pickText(text1, "Oferta expira")}</span>
          <span style={{ ...mono, color: theme.primaryColor, fontSize: 13 }}>
            {hms}
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: theme.secondaryColor,
            overflow: "hidden",
          }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: theme.primaryColor,
              borderRadius: 999,
            }}
          />
        </div>
      </div>
    );
  }

  if (model === "flash") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 14px 6px 10px",
          borderRadius: 999,
          background: theme.countdownBg,
          border: `1px solid ${theme.accentColor}66`,
          color: theme.buttonTextColor,
          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        }}>
        <span
          style={{
            fontSize: 15,
            fontWeight: 900,
            fontStyle: "italic",
            textTransform: "uppercase",
          }}>
          {pickText(text1, "Flash Sale")}
        </span>
        <span style={{ width: 1, height: 16, background: "#fff", opacity: 0.3 }} />
        <span style={{ ...mono, color: theme.primaryColor, fontSize: 16 }}>
          {hms}
        </span>
      </div>
    );
  }

  if (model === "inline") {
    const units = showDays
      ? [p.days, p.hours, p.minutes, p.seconds]
      : [p.hours, p.minutes, p.seconds];
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        {units.map((value, i) => (
          <div
            key={i}
            style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {i > 0 ? (
              <span style={{ ...mono, color: theme.textColor, fontSize: 14 }}>
                :
              </span>
            ) : null}
            <div
              style={{
                background: theme.secondaryColor,
                color: theme.textColor,
                borderRadius: Math.max(4, theme.borderRadius / 2),
                padding: "4px 8px",
                minWidth: 32,
                textAlign: "center",
                ...mono,
                fontSize: 13,
              }}>
              {pad(value)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (model === "hero") {
    const units = showDays
      ? [
          [p.days, "Dias"],
          [p.hours, "Horas"],
          [p.minutes, "Mins"],
        ]
      : [
          [p.totalHours, "Horas"],
          [p.minutes, "Mins"],
          [p.seconds, "Segs"],
        ];
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "16px 20px",
          background: theme.primaryColor,
          color: theme.buttonTextColor,
          borderRadius: Math.max(12, theme.borderRadius),
          boxShadow: "0 16px 32px rgba(0,0,0,0.18)",
        }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.9,
          }}>
          {pickText(text1, "A maior promoção do ano acaba em:")}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {units.map(([value, unit], i) => (
            <div key={unit as string} style={{ display: "flex", gap: 12 }}>
              {i > 0 ? (
                <span style={{ fontSize: 28, fontWeight: 800, opacity: 0.5 }}>
                  :
                </span>
              ) : null}
              <div style={{ textAlign: "center", minWidth: 48 }}>
                <div style={{ ...mono, fontSize: 28 }}>
                  {pad(value as number)}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    opacity: 0.75,
                    marginTop: 4,
                  }}>
                  {unit}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // badge
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 14px",
        borderRadius: 999,
        background: theme.primaryColor,
        color: theme.buttonTextColor,
        boxShadow: "0 8px 16px rgba(0,0,0,0.16)",
      }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
        {pickText(text1, "Termina em")}
      </span>
      <span style={{ ...mono, fontSize: 15, letterSpacing: "0.04em" }}>
        {hms}
      </span>
    </div>
  );
}

function PdpPreview({
  model,
  theme,
  showDays,
  ms,
  text1,
  text2,
}: {
  model: CountdownPdpModel;
  theme: OfferTheme;
  showDays: boolean;
  ms: number;
  text1?: string;
  text2?: string;
}) {
  const hms = formatTimer(ms, showDays);
  const p = partsFromMs(ms);
  const progress = 72;

  if (model === "inline") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 999,
          background: theme.secondaryColor,
          border: `1px solid ${theme.primaryColor}33`,
        }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            color: theme.textColor,
          }}>
          {pickText(text1, "Oferta flash:")}
        </span>
        <span style={{ ...mono, fontSize: 14, color: theme.textColor }}>
          {hms}
        </span>
      </div>
    );
  }

  if (model === "progress") {
    return (
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            gap: 12,
            fontSize: 12,
          }}>
          <span style={{ fontWeight: 700, color: theme.textColor }}>
            {progress}% reservado
          </span>
          <span>
            <span style={{ color: theme.textColor, opacity: 0.75 }}>
              {pickText(text1, "Termina em:")}{" "}
            </span>
            <span style={{ ...mono, color: theme.primaryColor }}>{hms}</span>
          </span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 999,
            background: theme.secondaryColor,
            overflow: "hidden",
          }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: theme.primaryColor,
            }}
          />
        </div>
      </div>
    );
  }

  if (model === "floating") {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderRadius: 999,
          background: theme.countdownBg,
          color: theme.countdownText,
          boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
        }}>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.7,
            }}>
            {pickText(text1, "Expira em")}
          </span>
          <span style={{ ...mono, fontSize: 13 }}>{hms}</span>
        </div>
      </div>
    );
  }

  if (model === "banner") {
    return (
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: "10px 16px",
          background: theme.countdownBg,
          color: theme.countdownText,
          borderTop: `1px solid ${theme.primaryColor}33`,
          borderBottom: `1px solid ${theme.primaryColor}33`,
        }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.primaryColor,
          }}>
          {pickText(text1, "Oferta de tempo limitado")}
        </span>
        <span style={{ ...mono, fontSize: 18 }}>{hms}</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: theme.primaryColor,
          }}>
          {pickText(text2, "Aproveite agora")}
        </span>
      </div>
    );
  }

  // urgency_box
  const units = showDays
    ? [
        [p.days, "Dias"],
        [p.hours, "Horas"],
        [p.minutes, "Mins"],
        [p.seconds, "Segs"],
      ]
    : [
        [p.totalHours, "Horas"],
        [p.minutes, "Mins"],
        [p.seconds, "Segs"],
      ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 16px",
        background: theme.primaryColor,
        color: theme.buttonTextColor,
        borderRadius: Math.max(8, theme.borderRadius),
      }}>
      <span
        style={{
          fontSize: 16,
          fontWeight: 700,
          textTransform: "uppercase",
        }}>
        {pickText(text1, "A oferta expira em")}
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {units.map(([value, unit], i) => (
          <div key={unit as string} style={{ display: "flex", gap: 8 }}>
            {i > 0 ? (
              <span style={{ ...mono, fontSize: 20, paddingTop: 4 }}>:</span>
            ) : null}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4,
                  padding: "6px 10px",
                  minWidth: 48,
                  ...mono,
                  fontSize: 18,
                }}>
                {pad(value as number)}
              </div>
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  opacity: 0.8,
                  marginTop: 4,
                }}>
                {unit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CountdownPreview({
  kind,
  model,
  theme,
  showDays,
  text1,
  text2,
  previewMs = 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000 + 42 * 60 * 1000 + 18 * 1000,
}: Props) {
  const { dict } = useLocale();
  const [ms, setMs] = useState(previewMs);

  useEffect(() => {
    setMs(previewMs);
    const id = setInterval(() => {
      setMs((prev) => (prev <= 1000 ? previewMs : prev - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [previewMs, model, showDays, text1, text2]);

  const label = useMemo(
    () =>
      kind === "items"
        ? dict.form.countdownPreviewItems
        : dict.form.countdownPreviewPdp,
    [kind, dict.form.countdownPreviewItems, dict.form.countdownPreviewPdp],
  );

  return (
    <PreviewFrame label={label}>
      {kind === "items" ? (
        <ItemsPreview
          model={model as CountdownItemsModel}
          theme={theme}
          showDays={showDays}
          ms={ms}
          text1={text1}
          text2={text2}
        />
      ) : (
        <PdpPreview
          model={model as CountdownPdpModel}
          theme={theme}
          showDays={showDays}
          ms={ms}
          text1={text1}
          text2={text2}
        />
      )}
    </PreviewFrame>
  );
}
