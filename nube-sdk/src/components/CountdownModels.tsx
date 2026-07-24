import { Box, Icon } from "@tiendanube/nube-sdk-jsx";
import { keyframes, styled, theme } from "@tiendanube/nube-sdk-ui";
import {
  MONO_FONT,
  offerThemeVars,
  progressFillStyle,
} from "../lib/offer-styles";
import {
  countdownLabel,
  countdownParts,
  msUntil,
  offerProgressPercent,
  resolveItemsModel,
  resolvePdpModel,
  type StorefrontOffer,
} from "../lib/types";

/**
 * Tipografia via Box (div) — evita <Text>/<p> com margens do tema da loja.
 * Para rótulos inline no fluxo, usar display: inline / inline-block no CSS.
 */

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Timer string — com dias (2d HH:MM:SS) ou horas totais (HH:MM:SS). */
function formatTimer(ms: number, showDays: boolean) {
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hoursOfDay = Math.floor((totalSec % 86400) / 3600);
  const totalHours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (showDays && days > 0) {
    return `${days}d ${pad(hoursOfDay)}:${pad(minutes)}:${pad(seconds)}`;
  }
  if (showDays) {
    return `${pad(hoursOfDay)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(totalHours)}:${pad(minutes)}:${pad(seconds)}`;
}

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

const ColCenter = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const DigitGlass = styled(Box)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--op-radius-sm);
  padding: 8px 16px;
  min-width: 64px;
  text-align: center;
  box-sizing: border-box;
  margin: 0;
`;

const DigitMuted = styled(Box)`
  background: var(--op-secondary);
  color: var(--op-text);
  border-radius: var(--op-radius-sm);
  padding: 4px 8px;
  min-width: 32px;
  text-align: center;
  box-sizing: border-box;
  margin: 0;
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
`;

const DigitMutedPulse = styled(Box)`
  background: var(--op-secondary);
  color: var(--op-text);
  border-radius: var(--op-radius-sm);
  padding: 4px 8px;
  min-width: 32px;
  text-align: center;
  box-sizing: border-box;
  margin: 0;
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const DigitValue = styled(Box)`
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  margin: 0;
  padding: 0;
`;

const DigitValuePulse = styled(Box)`
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
  margin: 0;
  padding: 0;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const DigitUnit = styled(Box)`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 4px 0 0;
  padding: 0;
  opacity: 0.8;
  font-weight: 600;
  line-height: 1;
`;

/** Dois-pontos alinhado ao bloco do dígito (mesmo padding vertical). */
const ColonGlass = styled(Box)`
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 22px;
  line-height: 1.1;
  padding: 8px 0;
  margin: 0;
  opacity: 0.9;
`;

const ColonMuted = styled(Box)`
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 14px;
  line-height: 1.1;
  margin: 0;
  padding: 0;
`;

const Row = styled(Box)`
  display: flex;
  align-items: flex-start;
  margin: 0;
  padding: 0;
`;

const InlineRow = styled(Box)`
  display: inline-flex;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const BaselineRow = styled(Box)`
  display: inline-flex;
  align-items: baseline;
  margin: 0;
  padding: 0;
`;

/* —— Itens da vitrine —— */

const BarRoot = styled(Box)`
  width: 100%;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 6px 0 0;
  padding: 0;
  box-sizing: border-box;
`;

const BarTrack = styled(Box)`
  height: 6px;
  width: 100%;
  background: var(--op-secondary);
  border-radius: 999px;
  overflow: hidden;
  margin: 0;
`;

const FlashRoot = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 4px 16px 4px 12px;
  border-radius: 999px;
  background: var(--op-countdown-bg);
  border: 1px solid var(--op-flash-border, transparent);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  animation: ${pulse} 2s ease-in-out infinite;
  margin: 0;
  box-sizing: border-box;
`;

const FlashLabel = styled(Box)`
  font-size: 15px;
  font-weight: 900;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--op-on-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const FlashDivider = styled(Box)`
  width: 1px;
  height: 16px;
  background: var(--op-countdown-text);
  opacity: 0.3;
  margin: 0;
  flex-shrink: 0;
`;

const MonoAccent = styled(Box)`
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--op-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const InlineRoot = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 6px 0 0;
  padding: 0;
`;

const HeroRoot = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  margin: 8px 0 0;
  background: var(--op-primary);
  color: var(--op-on-primary);
  border-radius: var(--op-radius-lg);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
  box-sizing: border-box;
`;

const HeroTitle = styled(Box)`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.9;
  text-align: center;
  color: var(--op-on-primary);
  line-height: 1.2;
  margin: 0;
  padding: 0;
`;

const HeroDigit = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--op-on-primary);
  margin: 0;
  padding: 0;
`;

const HeroColon = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  opacity: 0.5;
  color: var(--op-on-primary);
  margin: 0;
  padding: 0;
`;

const BadgeRoot = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--op-primary);
  color: var(--op-on-primary);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
  margin: 0;
  box-sizing: border-box;
`;

const BadgeLabel = styled(Box)`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--op-on-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const BadgeTime = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  color: var(--op-on-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const Caption = styled(Box)`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--op-text);
  opacity: 0.65;
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const BarTime = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  color: var(--op-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

/* —— PDP —— */

const PdpInline = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--op-secondary);
  border: 1px solid var(--op-soft-border, transparent);
  margin: 8px 0 0;
  box-sizing: border-box;
`;

const PdpInlineLabel = styled(Box)`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--op-text);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const PdpInlineTime = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 16px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  color: var(--op-text);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const ProgressRoot = styled(Box)`
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 10px 0 0;
  padding: 0;
  box-sizing: border-box;
`;

const ProgressTrack = styled(Box)`
  height: 8px;
  width: 100%;
  background: var(--op-secondary);
  border: 1px solid var(--op-soft-border, transparent);
  border-radius: 999px;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0;
`;

const ProgressLabel = styled(Box)`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--op-text);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const ProgressMeta = styled(Box)`
  font-size: 14px;
  color: var(--op-text);
  opacity: 0.75;
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline;
`;

const ProgressTime = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--op-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline;
`;

const ProgressHint = styled(Box)`
  font-size: 14px;
  font-style: italic;
  color: var(--op-text);
  opacity: 0.65;
  line-height: 1.3;
  margin: 0;
  padding: 0;
`;

const FloatingRoot = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 999px;
  background: var(--op-countdown-bg);
  color: var(--op-countdown-text);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
  margin: 8px 0 0;
  box-sizing: border-box;
`;

const FloatingDot = styled(Box)`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--op-primary);
  animation: ${pulse} 1.6s ease-in-out infinite;
  margin: 0;
`;

const FloatingCaption = styled(Box)`
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--op-countdown-text);
  opacity: 0.7;
  line-height: 1;
  margin: 0 0 2px;
  padding: 0;
`;

const FloatingTime = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--op-countdown-text);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const BannerRoot = styled(Box)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 12px 16px;
  margin: 10px 0 0;
  background: var(--op-countdown-bg);
  color: var(--op-countdown-text);
  border-top: 1px solid var(--op-soft-border, transparent);
  border-bottom: 1px solid var(--op-soft-border, transparent);
  box-sizing: border-box;
`;

const BannerTag = styled(Box)`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--op-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const BannerUnit = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--op-countdown-text);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline;
`;

const BannerSec = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--op-on-primary);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const BannerSuffix = styled(Box)`
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0.7;
  color: var(--op-countdown-text);
  line-height: 1;
  margin: 0;
  padding: 0;
  display: inline;
`;

const UrgencyRoot = styled(Box)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  margin: 10px 0 0;
  background: var(--op-primary);
  color: var(--op-on-primary);
  border-radius: var(--op-radius);
  box-sizing: border-box;
`;

const UrgencyTitle = styled(Box)`
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--op-on-primary);
  margin: 0;
  padding: 0;
`;

const SpaceBetween = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0;
  padding: 0;
  width: 100%;
`;

const IconWrap = styled(Box)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
`;

const ColTight = styled(Box)`
  display: flex;
  flex-direction: column;
  line-height: 1;
  margin: 0;
  padding: 0;
`;

function DigitBox({
  value,
  unit,
  keyId,
  variant = "glass",
  pulseDigits = false,
}: {
  value: number;
  unit: string;
  keyId: string;
  variant?: "glass" | "muted";
  pulseDigits?: boolean;
}) {
  if (variant === "muted") {
    const MutedEl = pulseDigits ? DigitMutedPulse : DigitMuted;
    return <MutedEl key={keyId}>{pad(value)}</MutedEl>;
  }

  const color = "var(--op-on-primary)";
  const ValueEl = pulseDigits ? DigitValuePulse : DigitValue;

  return (
    <ColCenter key={keyId}>
      <DigitGlass>
        <ValueEl style={{ fontSize: "22px", color }}>{pad(value)}</ValueEl>
      </DigitGlass>
      {unit ? (
        <DigitUnit style={{ color }}>{unit}</DigitUnit>
      ) : (
        <Box style={{ display: "none" }} />
      )}
    </ColCenter>
  );
}

function EmptySlot({ keyId }: { keyId: string }) {
  return <Box key={keyId} style={{ display: "none" }} />;
}

function Colon({
  keyId,
  color,
  variant = "glass",
}: {
  keyId: string;
  color: string;
  variant?: "glass" | "muted" | "hero";
}) {
  if (variant === "muted") {
    return (
      <ColonMuted key={keyId} style={{ color }}>
        :
      </ColonMuted>
    );
  }
  if (variant === "hero") {
    return (
      <HeroColon key={keyId} style={{ color }}>
        :
      </HeroColon>
    );
  }
  return (
    <ColonGlass key={keyId} style={{ color }}>
      :
    </ColonGlass>
  );
}

/** Countdown nos cards da vitrine — espelha Modelos HTML/Itens da Vitrine. */
export function CountdownItems({
  offer,
  keyId,
}: {
  offer: StorefrontOffer;
  keyId: string | number;
}) {
  const offerTheme = offer.theme;
  const vars = offerThemeVars(offerTheme);
  const ms = msUntil(offer.endsAt);
  const key = String(keyId);

  if (ms <= 0) return <EmptySlot keyId={key} />;

  const showDays = Boolean(offer.showDaysOnCountdown);
  const parts = countdownParts(ms);
  const hms = formatTimer(ms, showDays);
  const model = resolveItemsModel(offer);
  const progress = offerProgressPercent(offer);

  if (model === "bar") {
    return (
      <BarRoot key={key} style={vars}>
        <SpaceBetween>
          <Caption>{countdownLabel(offer, 1, "Oferta Expira")}</Caption>
          <BarTime>{hms}</BarTime>
        </SpaceBetween>
        <BarTrack>
          <Box style={progressFillStyle(progress)} />
        </BarTrack>
      </BarRoot>
    );
  }

  if (model === "flash") {
    return (
      <FlashRoot key={key} style={vars}>
        <InlineRow style={{ gap: "8px" }}>
          <Icon name="fire" size={16} color={offerTheme.primaryColor} />
          <FlashLabel>{countdownLabel(offer, 1, "Flash Sale")}</FlashLabel>
        </InlineRow>
        <FlashDivider />
        <MonoAccent style={{ fontSize: "18px" }}>{hms}</MonoAccent>
      </FlashRoot>
    );
  }

  if (model === "inline") {
    const units = showDays
      ? [parts.days, parts.hours, parts.minutes, parts.seconds]
      : [parts.hours, parts.minutes, parts.seconds];
    return (
      <InlineRoot key={key} style={vars}>
        {units.map((value, index) => (
          <InlineRow key={`${key}-in-${index}`} style={{ gap: "4px" }}>
            {index > 0 ? (
              <Colon
                keyId={`${key}-c-${index}`}
                color={offerTheme.textColor}
                variant="muted"
              />
            ) : (
              <Box style={{ display: "none" }} />
            )}
            <DigitBox
              keyId={`${key}-d-${index}`}
              value={value}
              unit=""
              variant="muted"
              pulseDigits={index === units.length - 1}
            />
          </InlineRow>
        ))}
      </InlineRoot>
    );
  }

  if (model === "hero") {
    const totalHours = Math.floor(ms / 3600000);
    const units: Array<[number, string]> = showDays
      ? [
          [parts.days, "Dias"],
          [parts.hours, "Horas"],
          [parts.minutes, "Mins"],
        ]
      : [
          [totalHours, "Horas"],
          [parts.minutes, "Mins"],
          [parts.seconds, "Segs"],
        ];
    return (
      <HeroRoot key={key} style={vars}>
        <HeroTitle>
          {countdownLabel(offer, 1, "A maior promoção do ano acaba em:")}
        </HeroTitle>
        <Row style={{ gap: "16px" }}>
          {units.map(([value, unit], index) => (
            <Row key={`${key}-hero-${index}`} style={{ gap: "16px" }}>
              {index > 0 ? (
                <Colon
                  keyId={`${key}-hc-${index}`}
                  color={offerTheme.buttonTextColor}
                  variant="hero"
                />
              ) : (
                <Box style={{ display: "none" }} />
              )}
              <ColCenter style={{ minWidth: "48px" }}>
                <HeroDigit>{pad(value)}</HeroDigit>
                <DigitUnit
                  style={{
                    color: "var(--op-on-primary)",
                    opacity: 0.75,
                    marginTop: "4px",
                  }}>
                  {unit}
                </DigitUnit>
              </ColCenter>
            </Row>
          ))}
        </Row>
      </HeroRoot>
    );
  }

  // badge
  return (
    <BadgeRoot key={key} style={vars}>
      <Icon name="clock" size={18} color={offerTheme.buttonTextColor} />
      <BadgeLabel>{countdownLabel(offer, 1, "Termina em")}</BadgeLabel>
      <BadgeTime>{hms}</BadgeTime>
    </BadgeRoot>
  );
}

/** Countdown na PDP — espelha Modelos HTML/Pagina de Produto. */
export function CountdownPdp({
  offer,
  keyId,
}: {
  offer: StorefrontOffer;
  keyId: string | number;
}) {
  const offerTheme = offer.theme;
  const vars = offerThemeVars(offerTheme);
  const ms = msUntil(offer.endsAt);
  const key = String(keyId);

  if (ms <= 0) return <EmptySlot keyId={key} />;

  const showDays = Boolean(offer.showDaysOnCountdown);
  const parts = countdownParts(ms);
  const hms = formatTimer(ms, showDays);
  const model = resolvePdpModel(offer);
  const progress = offerProgressPercent(offer);
  const totalHours = Math.floor(ms / 3600000);
  const mins = parts.minutes;
  const secs = parts.seconds;

  if (model === "inline") {
    return (
      <PdpInline key={key} style={vars}>
        <Icon name="fire" size={14} color={offerTheme.primaryColor} />
        <PdpInlineLabel>
          {countdownLabel(offer, 1, "Oferta flash:")}
        </PdpInlineLabel>
        <PdpInlineTime>{hms}</PdpInlineTime>
      </PdpInline>
    );
  }

  if (model === "progress") {
    return (
      <ProgressRoot key={key} style={vars}>
        <SpaceBetween style={{ alignItems: "flex-end", gap: "12px" }}>
          <InlineRow style={{ gap: "6px" }}>
            <Icon name="fire" size={16} color={offerTheme.primaryColor} />
            <ProgressLabel>{`${progress}% reservado`}</ProgressLabel>
          </InlineRow>
          <BaselineRow style={{ gap: "4px" }}>
            <ProgressMeta>
              {countdownLabel(offer, 1, "Termina em:")}
            </ProgressMeta>
            <ProgressTime>{hms}</ProgressTime>
          </BaselineRow>
        </SpaceBetween>
        <ProgressTrack>
          <Box style={progressFillStyle(progress)} />
        </ProgressTrack>
        <ProgressHint>
          {countdownLabel(offer, 2, "Corra — esta oferta termina em breve.")}
        </ProgressHint>
      </ProgressRoot>
    );
  }

  if (model === "floating") {
    return (
      <FloatingRoot key={key} style={vars}>
        <IconWrap>
          <Icon name="clock" size={18} color={offerTheme.primaryColor} />
          <FloatingDot />
        </IconWrap>
        <ColTight>
          <FloatingCaption>
            {countdownLabel(offer, 1, "Expira em")}
          </FloatingCaption>
          <FloatingTime>{hms}</FloatingTime>
        </ColTight>
      </FloatingRoot>
    );
  }

  if (model === "banner") {
    return (
      <BannerRoot key={key} style={vars}>
        <BannerTag>
          {countdownLabel(offer, 1, "Oferta de tempo limitado")}
        </BannerTag>
        <InlineRow style={{ gap: "12px" }}>
          <Icon name="clock" size={18} color={offerTheme.countdownText} />
          {showDays ? (
            <BannerUnit>{hms}</BannerUnit>
          ) : (
            <BaselineRow style={{ gap: "4px" }}>
              <BannerUnit>{pad(totalHours % 100)}</BannerUnit>
              <BannerSuffix>h</BannerSuffix>
              <BannerUnit>{pad(mins)}</BannerUnit>
              <BannerSuffix>m</BannerSuffix>
              <BannerSec>{pad(secs)}</BannerSec>
              <BannerSuffix>s</BannerSuffix>
            </BaselineRow>
          )}
        </InlineRow>
        <BannerTag>{countdownLabel(offer, 2, "Aproveite agora")}</BannerTag>
      </BannerRoot>
    );
  }

  // urgency_box — tipografia do tema da loja no título
  const urgencyUnits: Array<[number, string, boolean]> = showDays
    ? [
        [parts.days, "Dias", false],
        [parts.hours, "Horas", false],
        [mins, "Mins", false],
        [secs, "Segs", true],
      ]
    : [
        [totalHours, "Horas", false],
        [mins, "Mins", false],
        [secs, "Segs", true],
      ];

  return (
    <UrgencyRoot key={key} style={vars}>
      <InlineRow style={{ gap: "12px" }}>
        <Icon name="fire" size={32} color={offerTheme.buttonTextColor} />
        <UrgencyTitle
          style={{
            fontFamily: theme.heading.font,
            fontWeight: theme.heading.fontWeight,
          }}>
          {countdownLabel(offer, 1, "A oferta expira em")}
        </UrgencyTitle>
      </InlineRow>
      <Row style={{ gap: "12px" }}>
        {urgencyUnits.map(([value, unit, pulseDigits], index) => (
          <Row key={`${key}-u-${index}`} style={{ gap: "12px" }}>
            {index > 0 ? (
              <Colon
                keyId={`${key}-c-${index}`}
                color={offerTheme.buttonTextColor}
                variant="glass"
              />
            ) : (
              <Box style={{ display: "none" }} />
            )}
            <DigitBox
              keyId={`${key}-d-${index}`}
              value={value}
              unit={unit}
              variant="glass"
              pulseDigits={pulseDigits}
            />
          </Row>
        ))}
      </Row>
    </UrgencyRoot>
  );
}
