"use client";

import { Box, Text } from "@nimbus-ds/components";
import type {
  BannerAnimation,
  BannerButtonPosition,
  BannerModel,
  BannerSpacing,
  BannerTextAlign,
} from "@/lib/banner-models";
import {
  BANNER_MODELS,
  BANNER_SPACING_PX,
  DEFAULT_BANNER_SPACING,
} from "@/lib/banner-models";
import { useLocale } from "@/lib/i18n/locale-context";

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
        minHeight="96px"
        padding="2"
        borderRadius="2"
        backgroundColor="neutral-surface"
        overflow="hidden">
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

type PreviewOptions = {
  text1: string;
  text2: string;
  showButton: boolean;
  buttonText: string;
  buttonPosition: BannerButtonPosition;
  container: boolean;
  textAlign: BannerTextAlign;
  spacingTop: BannerSpacing;
  spacingBottom: BannerSpacing;
  animation: BannerAnimation;
};

function animationStyle(animation: BannerAnimation): React.CSSProperties {
  if (animation === "pulse") {
    return { animation: "op-banner-pulse 2s ease-in-out infinite" };
  }
  if (animation === "slide") {
    return { animation: "op-banner-slide 2.4s ease-in-out infinite" };
  }
  if (animation === "shine") {
    return {
      backgroundSize: "200% 100%",
      animation: "op-banner-shine 2.8s linear infinite",
    };
  }
  return {};
}

function justifyForAlign(align: BannerTextAlign): React.CSSProperties["justifyContent"] {
  if (align === "left") return "flex-start";
  if (align === "right") return "flex-end";
  return "center";
}

function PreviewButton({
  model,
  label,
  position,
  textAlign,
}: {
  model: BannerModel;
  label: string;
  position: BannerButtonPosition;
  textAlign: BannerTextAlign;
}) {
  const style: React.CSSProperties =
    model === "urgent"
      ? {
          background: "rgba(255,255,255,0.95)",
          color: "#E11D48",
        }
      : {
          background: model === "soft" ? "#E11D48" : "#111827",
          color: "#fff",
        };

  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 9,
        fontWeight: 700,
        lineHeight: 1,
        flexShrink: 0,
        whiteSpace: "nowrap",
        marginLeft:
          position === "after" && textAlign === "left" ? "auto" : undefined,
        marginRight:
          position === "before" && textAlign === "right" ? "auto" : undefined,
      }}>
      {label}
    </span>
  );
}

function BannerPreview({
  model,
  options,
}: {
  model: BannerModel;
  options: PreviewOptions;
}) {
  const label1 = options.text1.trim() || "OFERTA";
  const label2 = options.text2.trim() || "AGORA";
  const btnLabel = options.buttonText.trim() || "Ver ofertas";
  const isFullLink =
    options.showButton && options.buttonPosition === "full";
  const showPill =
    options.showButton && options.buttonPosition !== "full";
  const anim = animationStyle(options.animation);

  const frame: React.CSSProperties = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    boxSizing: "border-box",
  };

  const shell: React.CSSProperties = {
    width: options.container ? "78%" : "100%",
    boxSizing: "border-box",
    overflow: "hidden",
    position: "relative",
    marginTop: `${BANNER_SPACING_PX[options.spacingTop]}px`,
    marginBottom: `${BANNER_SPACING_PX[options.spacingBottom]}px`,
    ...anim,
  };

  const inner: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: justifyForAlign(options.textAlign),
    gap: 8,
    padding: "10px 12px",
    boxSizing: "border-box",
  };

  if (model === "solid") {
    shell.background =
      options.animation === "shine"
        ? "linear-gradient(110deg, #E11D48 0%, #E11D48 40%, rgba(255,255,255,0.22) 50%, #E11D48 60%, #E11D48 100%)"
        : "#E11D48";
    shell.borderRadius = 8;
    shell.color = "#fff";
  } else if (model === "strip") {
    shell.background =
      options.animation === "shine"
        ? "linear-gradient(110deg, #111827 0%, #111827 40%, rgba(255,255,255,0.18) 50%, #111827 60%, #111827 100%)"
        : "#111827";
    shell.color = "#fff";
  } else if (model === "soft") {
    shell.background =
      options.animation === "shine"
        ? "linear-gradient(110deg, #FEF2F2 0%, #FEF2F2 40%, rgba(255,255,255,0.7) 50%, #FEF2F2 60%, #FEF2F2 100%)"
        : "#FEF2F2";
    shell.border = "1px solid #E11D4833";
    shell.borderRadius = 8;
    shell.color = "#111827";
  } else {
    shell.background =
      options.animation === "shine"
        ? "linear-gradient(110deg, #E11D48 0%, #E11D48 40%, rgba(255,255,255,0.22) 50%, #E11D48 60%, #E11D48 100%)"
        : "linear-gradient(90deg, #9F1239, #E11D48)";
    shell.borderRadius = 8;
    shell.color = "#fff";
  }

  const labelStyle: React.CSSProperties =
    model === "strip" || model === "urgent"
      ? {
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: model === "strip" ? "#E11D48" : "#fff",
          maxWidth: 64,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }
      : {
          fontSize: 10,
          fontWeight: 700,
          color: model === "soft" ? "#E11D48" : "#fff",
          maxWidth: 64,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        };

  const timeStyle: React.CSSProperties =
    model === "strip"
      ? { ...mono, fontSize: 12, color: "#fff" }
      : model === "soft"
        ? { ...mono, fontSize: 12, color: "#E11D48" }
        : model === "urgent"
          ? {
              ...mono,
              fontSize: 12,
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              padding: "4px 10px",
              borderRadius: 999,
            }
          : {
              ...mono,
              fontSize: 11,
              background: "#111827",
              color: "#fff",
              padding: "4px 8px",
              borderRadius: 4,
            };

  const buttonEl = showPill ? (
    <PreviewButton
      model={model}
      label={btnLabel}
      position={options.buttonPosition}
      textAlign={options.textAlign}
    />
  ) : null;

  return (
    <div style={frame}>
      <div style={shell}>
        {isFullLink ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              border: "1px dashed rgba(255,255,255,0.55)",
              borderRadius: "inherit",
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        ) : null}
        <div style={inner}>
          {options.buttonPosition === "before" ? buttonEl : null}
          <span style={labelStyle}>{label1}</span>
          <span style={timeStyle}>05:42:18</span>
          <span style={labelStyle}>{label2}</span>
          {options.buttonPosition === "after" ? buttonEl : null}
        </div>
      </div>
    </div>
  );
}

type Props = {
  value: BannerModel;
  onChange: (model: BannerModel) => void;
  text1?: string;
  text2?: string;
  showButton?: boolean;
  buttonText?: string;
  buttonPosition?: BannerButtonPosition;
  container?: boolean;
  textAlign?: BannerTextAlign;
  spacingTop?: BannerSpacing;
  spacingBottom?: BannerSpacing;
  animation?: BannerAnimation;
};

export function BannerModelPicker({
  value,
  onChange,
  text1 = "",
  text2 = "",
  showButton = false,
  buttonText = "",
  buttonPosition = "after",
  container = false,
  textAlign = "center",
  spacingTop = DEFAULT_BANNER_SPACING,
  spacingBottom = DEFAULT_BANNER_SPACING,
  animation = "none",
}: Props) {
  const { dict } = useLocale();
  const labels: Record<BannerModel, { label: string; description: string }> = {
    solid: {
      label: dict.form.bannerModelSolid,
      description: dict.form.bannerModelSolidDesc,
    },
    strip: {
      label: dict.form.bannerModelStrip,
      description: dict.form.bannerModelStripDesc,
    },
    soft: {
      label: dict.form.bannerModelSoft,
      description: dict.form.bannerModelSoftDesc,
    },
    urgent: {
      label: dict.form.bannerModelUrgent,
      description: dict.form.bannerModelUrgentDesc,
    },
  };

  const options: PreviewOptions = {
    text1,
    text2,
    showButton,
    buttonText,
    buttonPosition,
    container,
    textAlign,
    spacingTop,
    spacingBottom,
    animation,
  };

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <style>{`
        @keyframes op-banner-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.82; }
        }
        @keyframes op-banner-shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes op-banner-slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
      `}</style>
      <Text fontSize="caption" fontWeight="medium">
        {dict.form.bannerModelPick}
      </Text>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap="2">
        {BANNER_MODELS.map((model) => (
          <ModelButton
            key={model}
            selected={value === model}
            label={labels[model].label}
            description={labels[model].description}
            onClick={() => onChange(model)}>
            <BannerPreview model={model} options={options} />
          </ModelButton>
        ))}
      </Box>
    </Box>
  );
}
