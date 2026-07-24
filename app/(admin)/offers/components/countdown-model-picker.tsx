"use client";

import { Box, Text } from "@nimbus-ds/components";
import type {
  CountdownItemsModel,
  CountdownPdpModel,
} from "@/lib/countdown-models";
import { useLocale } from "@/lib/i18n/locale-context";

type ItemsProps = {
  kind: "items";
  value: CountdownItemsModel;
  onChange: (model: CountdownItemsModel) => void;
};

type PdpProps = {
  kind: "pdp";
  value: CountdownPdpModel;
  onChange: (model: CountdownPdpModel) => void;
};

type Props = ItemsProps | PdpProps;

const mono: React.CSSProperties = {
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  fontVariantNumeric: "tabular-nums",
  fontWeight: 700,
};

function ModelButton({
  selected,
  label,
  description,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  description: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onClick}
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="1"
      padding="2"
      borderWidth="1"
      borderStyle="solid"
      borderColor={selected ? "primary-interactive" : "neutral-interactive"}
      borderRadius="2"
      backgroundColor={selected ? "primary-surface" : "neutral-background"}
      cursor="pointer"
      width="100%">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="100%"
        minHeight="80px"
        padding="1"
        borderRadius="2"
        backgroundColor="neutral-surface">
        {children}
      </Box>
      <Text fontSize="caption" fontWeight="medium" textAlign="center">
        {label}
      </Text>
      <Text fontSize="caption" color="neutral-textLow" textAlign="center">
        {description}
      </Text>
    </Box>
  );
}

function MiniDigit({
  value,
  unit,
  dark = false,
}: {
  value: string;
  unit?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}>
      <div
        style={{
          ...mono,
          fontSize: 13,
          minWidth: 28,
          height: 26,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 4,
          background: dark ? "rgba(255,255,255,0.15)" : "#F3F4F6",
          color: dark ? "#fff" : "#111827",
          border: dark
            ? "1px solid rgba(255,255,255,0.25)"
            : "1px solid #E5E7EB",
        }}>
        {value}
      </div>
      {unit ? (
        <span
          style={{
            fontSize: 8,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: dark ? "rgba(255,255,255,0.75)" : "#6B7280",
            fontWeight: 600,
          }}>
          {unit}
        </span>
      ) : null}
    </div>
  );
}

function MiniColon({ dark = false }: { dark?: boolean }) {
  return (
    <span
      style={{
        ...mono,
        fontSize: 12,
        color: dark ? "rgba(255,255,255,0.7)" : "#9CA3AF",
        paddingTop: 2,
      }}>
      :
    </span>
  );
}

const ItemsPreview: Record<CountdownItemsModel, React.ReactNode> = {
  badge: (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 999,
        background: "#E11D48",
        color: "#fff",
        boxShadow: "0 6px 14px rgba(225,29,72,0.28)",
      }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em" }}>
        TERMINA EM
      </span>
      <span style={{ ...mono, fontSize: 13 }}>02:14:08</span>
    </div>
  ),
  bar: (
    <div style={{ width: "100%", maxWidth: 150 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 8,
        }}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "#6B7280",
          }}>
          Oferta expira
        </span>
        <span style={{ ...mono, fontSize: 11, color: "#E11D48" }}>05:42:12</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "#E5E7EB",
          overflow: "hidden",
        }}>
        <div
          style={{
            width: "65%",
            height: "100%",
            background: "#E11D48",
            borderRadius: 999,
          }}
        />
      </div>
    </div>
  ),
  flash: (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 999,
        background: "#0F172A",
        border: "1px solid #5EEAD4",
        boxShadow: "0 6px 16px rgba(15,23,42,0.25)",
      }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 900,
          fontStyle: "italic",
          textTransform: "uppercase",
          color: "#fff",
        }}>
        Flash
      </span>
      <span style={{ width: 1, height: 12, background: "#fff", opacity: 0.3 }} />
      <span style={{ ...mono, fontSize: 12, color: "#FCA5A5" }}>00:59:59</span>
    </div>
  ),
  inline: (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <MiniDigit value="04" />
      <MiniColon />
      <MiniDigit value="12" />
      <MiniColon />
      <MiniDigit value="55" />
    </div>
  ),
  hero: (
    <div
      style={{
        width: "100%",
        maxWidth: 160,
        padding: "10px 12px",
        borderRadius: 10,
        background: "#E11D48",
        color: "#fff",
        boxShadow: "0 8px 18px rgba(225,29,72,0.25)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}>
      <span
        style={{
          fontSize: 8,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          opacity: 0.9,
        }}>
        Acaba em
      </span>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <MiniDigit value="02" unit="Dias" dark />
        <MiniColon dark />
        <MiniDigit value="14" unit="Horas" dark />
        <MiniColon dark />
        <MiniDigit value="08" unit="Mins" dark />
      </div>
    </div>
  ),
};

const PdpPreview: Record<CountdownPdpModel, React.ReactNode> = {
  urgency_box: (
    <div
      style={{
        width: "100%",
        maxWidth: 170,
        padding: "10px 12px",
        borderRadius: 8,
        background: "#E11D48",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: "0 8px 18px rgba(225,29,72,0.25)",
      }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
        }}>
        A oferta expira em
      </span>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 5 }}>
        <MiniDigit value="02" unit="H" dark />
        <MiniColon dark />
        <MiniDigit value="45" unit="M" dark />
        <MiniColon dark />
        <MiniDigit value="12" unit="S" dark />
      </div>
    </div>
  ),
  inline: (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: 9,
            color: "#9CA3AF",
            textDecoration: "line-through",
          }}>
          R$ 129
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#E11D48" }}>
          R$ 89
        </span>
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "5px 8px",
          borderRadius: 999,
          background: "#DBEAFE",
          border: "1px solid #93C5FD",
        }}>
        <span
          style={{
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#1E3A8A",
          }}>
          Flash
        </span>
        <span style={{ ...mono, fontSize: 11, color: "#1E3A8A" }}>04:12:55</span>
      </div>
    </div>
  ),
  progress: (
    <div style={{ width: "100%", maxWidth: 160 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          gap: 6,
        }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "#111827" }}>
          85% reservado
        </span>
        <span style={{ ...mono, fontSize: 10, color: "#E11D48" }}>12:05:01</span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 999,
          background: "#E5E7EB",
          overflow: "hidden",
          marginBottom: 4,
        }}>
        <div
          style={{
            width: "85%",
            height: "100%",
            background: "#E11D48",
            borderRadius: 999,
          }}
        />
      </div>
      <span style={{ fontSize: 8, fontStyle: "italic", color: "#6B7280" }}>
        Termina em breve
      </span>
    </div>
  ),
  floating: (
    <div style={{ position: "relative", width: 88, height: 64 }}>
      <div
        style={{
          position: "absolute",
          inset: "10px 8px 0",
          borderRadius: 8,
          background: "#E5E7EB",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: 999,
          background: "#111827",
          color: "#fff",
          boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
        }}>
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#E11D48",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
          <span
            style={{
              fontSize: 7,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              opacity: 0.7,
            }}>
            Expira
          </span>
          <span style={{ ...mono, fontSize: 10 }}>02:14:08</span>
        </div>
      </div>
    </div>
  ),
  banner: (
    <div
      style={{
        width: "100%",
        maxWidth: 170,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "8px 10px",
        background: "#0F172A",
        color: "#fff",
        borderTop: "1px solid rgba(225,29,72,0.35)",
        borderBottom: "1px solid rgba(225,29,72,0.35)",
      }}>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#FCA5A5",
        }}>
          Limitada
        </span>
      <span style={{ ...mono, fontSize: 12 }}>02:45:12</span>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#FCA5A5",
        }}>
          Agora
        </span>
    </div>
  ),
};

export function CountdownModelPicker(props: Props) {
  const { dict } = useLocale();
  const f = dict.form;

  if (props.kind === "items") {
    const models: CountdownItemsModel[] = [
      "badge",
      "bar",
      "flash",
      "inline",
      "hero",
    ];
    const labels: Record<CountdownItemsModel, { label: string; desc: string }> =
      {
        badge: {
          label: f.countdownModelItemsBadge,
          desc: f.countdownModelItemsBadgeDesc,
        },
        bar: {
          label: f.countdownModelItemsBar,
          desc: f.countdownModelItemsBarDesc,
        },
        flash: {
          label: f.countdownModelItemsFlash,
          desc: f.countdownModelItemsFlashDesc,
        },
        inline: {
          label: f.countdownModelItemsInline,
          desc: f.countdownModelItemsInlineDesc,
        },
        hero: {
          label: f.countdownModelItemsHero,
          desc: f.countdownModelItemsHeroDesc,
        },
      };

    return (
      <Box display="flex" flexDirection="column" gap="2">
        <Text fontSize="caption" color="neutral-textLow">
          {f.countdownModelPick}
        </Text>
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))"
          gap="2">
          {models.map((model) => (
            <ModelButton
              key={model}
              selected={props.value === model}
              label={labels[model].label}
              description={labels[model].desc}
              onClick={() => props.onChange(model)}>
              {ItemsPreview[model]}
            </ModelButton>
          ))}
        </Box>
      </Box>
    );
  }

  const models: CountdownPdpModel[] = [
    "urgency_box",
    "inline",
    "progress",
    "floating",
    "banner",
  ];
  const labels: Record<CountdownPdpModel, { label: string; desc: string }> = {
    urgency_box: {
      label: f.countdownModelPdpUrgency,
      desc: f.countdownModelPdpUrgencyDesc,
    },
    inline: {
      label: f.countdownModelPdpInline,
      desc: f.countdownModelPdpInlineDesc,
    },
    progress: {
      label: f.countdownModelPdpProgress,
      desc: f.countdownModelPdpProgressDesc,
    },
    floating: {
      label: f.countdownModelPdpFloating,
      desc: f.countdownModelPdpFloatingDesc,
    },
    banner: {
      label: f.countdownModelPdpBanner,
      desc: f.countdownModelPdpBannerDesc,
    },
  };

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Text fontSize="caption" color="neutral-textLow">
        {f.countdownModelPick}
      </Text>
      <Box
        display="grid"
        gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))"
        gap="2">
        {models.map((model) => (
          <ModelButton
            key={model}
            selected={props.value === model}
            label={labels[model].label}
            description={labels[model].desc}
            onClick={() => props.onChange(model)}>
            {PdpPreview[model]}
          </ModelButton>
        ))}
      </Box>
    </Box>
  );
}
