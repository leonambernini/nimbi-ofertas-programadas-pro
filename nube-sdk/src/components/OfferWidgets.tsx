import { Box, Image, Link, SideScroll, Text } from "@tiendanube/nube-sdk-jsx";
import { keyframes, StyleSheet, styled, theme } from "@tiendanube/nube-sdk-ui";
import { MONO_FONT, offerThemeVars } from "../lib/offer-styles";
import {
  bannerLabel,
  bannerSpacingCss,
  formatCountdown,
  htmlToPlainText,
  msUntil,
  resolveBannerAnimation,
  resolveBannerButtonPosition,
  resolveBannerModel,
  resolveBannerSpacing,
  resolveBannerTextAlign,
  resolveSectionConfig,
  type StorefrontOffer,
} from "../lib/types";

export { CountdownItems, CountdownPdp } from "./CountdownModels";

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const pulseAnim = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.82; }
`;

const shineAnim = keyframes`
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
`;

const slideAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6px); }
`;

const BannerFrame = styled(Box)`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
`;

const BannerOuter = styled(Box)`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
`;

const BannerOuterPulse = styled(Box)`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
  animation: ${pulseAnim} 2s ease-in-out infinite;
`;

const BannerOuterShine = styled(Box)`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
  background-size: 200% 100%;
  animation: ${shineAnim} 2.8s linear infinite;
`;

const BannerOuterSlide = styled(Box)`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  position: relative;
  animation: ${slideAnim} 2.4s ease-in-out infinite;
`;

const BannerInner = styled(Box)`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  box-sizing: border-box;
  margin: 0;
`;

const BannerFullLink = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  text-decoration: none;
  color: transparent;
  background: transparent;
`;

const BannerLabel = styled(Box)`
  font-weight: 700;
  font-size: 14px;
  line-height: 1.2;
  margin: 0;
  padding: 0;
`;

const BannerLabelCaps = styled(Box)`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  line-height: 1;
  margin: 0;
  padding: 0;
`;

const BannerTimeChip = styled(Box)`
  padding: 6px 10px;
  border-radius: var(--op-radius-sm);
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin: 0;
  flex-shrink: 0;
`;

const BannerTimeLarge = styled(Box)`
  font-family: ${MONO_FONT};
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
`;

const BannerTimeUrgent = styled(Box)`
  padding: 6px 12px;
  border-radius: 999px;
  font-family: ${MONO_FONT};
  font-weight: 700;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  margin: 0;
  flex-shrink: 0;
`;

const BannerBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  margin: 0;
  flex-shrink: 0;
  box-sizing: border-box;
`;

const ShowcaseRoot = styled(Box)`
  width: 100%;
  padding: 16px;
  background: var(--op-secondary);
  border-radius: var(--op-radius);
  box-sizing: border-box;
  margin: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShowcaseBanner = styled(Image)`
  width: 100%;
  object-fit: cover;
  border-radius: var(--op-radius);
  display: block;
`;

const ShowcaseTitle = styled(Text)`
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--op-text);
  font-family: ${theme.heading.font};
`;

const ShowcaseSubtitle = styled(Text)`
  display: block;
  font-size: 13px;
  color: var(--op-accent);
`;

const ShowcaseBody = styled(Text)`
  display: block;
  font-size: 13px;
  color: var(--op-text);
  line-height: 1.4;
`;

const Card = styled(Box)`
  background: var(--op-bg);
  color: var(--op-text);
  border: 1px solid var(--op-soft-border, transparent);
  border-radius: var(--op-radius);
  overflow: hidden;
  box-sizing: border-box;
`;

const CardImage = styled(Image)`
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
`;

const CardBody = styled(Box)`
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CardName = styled(Text)`
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--op-text);
`;

const CardPrices = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
`;

const CardOriginal = styled(Text)`
  font-size: 12px;
  text-decoration: line-through;
  opacity: 0.6;
  color: var(--op-text);
`;

const CardOffer = styled(Text)`
  font-size: 14px;
  font-weight: 700;
  color: var(--op-accent);
`;

const Grid = styled(Box)`
  display: grid;
  gap: 8px;
  width: 100%;
`;

const Scroll = styled(SideScroll)`
  width: 100%;
`;

/** Aceita http(s) absoluto ou caminho relativo da loja (`/`, `/ofertas`). */
function isBannerLinkUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  const url = value.trim();
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (url.startsWith("/")) return true;
  if (url.startsWith("./") || url.startsWith("../")) return true;
  return false;
}

export function OfferBanner({
  offer,
  keyId,
}: {
  offer: StorefrontOffer;
  keyId: string | number;
}) {
  const vars = offerThemeVars(offer.theme);
  const key = String(keyId);
  const countdown = formatCountdown(
    msUntil(offer.endsAt),
    Boolean(offer.showDaysOnCountdown),
  );
  const text1 = bannerLabel(offer, 1, "Oferta por tempo limitado");
  const text2 = bannerLabel(offer, 2, "Aproveite agora");
  const model = resolveBannerModel(offer);
  const animation = resolveBannerAnimation(offer);
  const textAlign = resolveBannerTextAlign(offer);
  const buttonPosition = resolveBannerButtonPosition(offer);
  const spacingTop = resolveBannerSpacing(offer.bannerSpacingTop);
  const spacingBottom = resolveBannerSpacing(offer.bannerSpacingBottom);
  const useContainer = Boolean(offer.bannerContainer);
  const buttonText =
    typeof offer.bannerButtonText === "string"
      ? offer.bannerButtonText.trim()
      : "";
  const buttonUrl = offer.bannerLinkUrl?.trim() || "";
  const linkEnabled =
    Boolean(offer.bannerShowButton) && isBannerLinkUrl(buttonUrl);
  const isFullLink = linkEnabled && buttonPosition === "full";
  const showPill =
    linkEnabled &&
    buttonPosition !== "full" &&
    Boolean(buttonText);

  const Outer =
    animation === "pulse"
      ? BannerOuterPulse
      : animation === "shine"
        ? BannerOuterShine
        : animation === "slide"
          ? BannerOuterSlide
          : BannerOuter;

  const baseBg =
    model === "strip"
      ? "var(--op-countdown-bg)"
      : model === "soft"
        ? "var(--op-secondary)"
        : "var(--op-primary)";

  const shellStyle: Record<string, string> = {
    ...vars,
    background: baseBg,
    color:
      model === "strip" || model === "soft"
        ? model === "strip"
          ? "var(--op-countdown-text)"
          : "var(--op-text)"
        : "var(--op-on-primary)",
  };
  if (useContainer) {
    shellStyle.maxWidth = "1200px";
    shellStyle.marginLeft = "auto";
    shellStyle.marginRight = "auto";
  }
  if (model === "strip" || model === "soft") {
    shellStyle.borderTop = "1px solid var(--op-soft-border, transparent)";
    shellStyle.borderBottom = "1px solid var(--op-soft-border, transparent)";
  }
  if (model === "soft" || model === "solid" || model === "urgent") {
    shellStyle.borderRadius = "var(--op-radius)";
  }
  if (model === "urgent" && animation !== "shine") {
    shellStyle.backgroundImage =
      "linear-gradient(90deg, #9F1239 0%, var(--op-primary) 100%)";
  }
  if (animation === "shine") {
    const shineBase = baseBg;
    shellStyle.backgroundImage = `linear-gradient(110deg, ${shineBase} 0%, ${shineBase} 40%, rgba(255,255,255,0.22) 50%, ${shineBase} 60%, ${shineBase} 100%)`;
    shellStyle.backgroundSize = "200% 100%";
  }

  const justifyContent =
    textAlign === "left"
      ? "flex-start"
      : textAlign === "right"
        ? "flex-end"
        : "center";

  const labelColor =
    model === "strip" || model === "soft"
      ? "var(--op-primary)"
      : "var(--op-on-primary)";
  const timeBg =
    model === "soft"
      ? "transparent"
      : model === "urgent"
        ? "rgba(0,0,0,0.25)"
        : "var(--op-countdown-bg)";
  const timeColor =
    model === "soft"
      ? "var(--op-primary)"
      : model === "urgent"
        ? "var(--op-on-primary)"
        : "var(--op-countdown-text)";
  const LabelEl =
    model === "strip" || model === "urgent" ? BannerLabelCaps : BannerLabel;
  const TimeEl =
    model === "strip"
      ? BannerTimeLarge
      : model === "urgent"
        ? BannerTimeUrgent
        : BannerTimeChip;

  const buttonStyle: Record<string, string> = {
    ...(model === "urgent"
      ? {
          background: "rgba(255,255,255,0.95)",
          color: "var(--op-primary)",
        }
      : {
          background: "var(--op-btn)",
          color: "var(--op-on-primary)",
        }),
  };
  if (buttonPosition === "after" && textAlign === "left") {
    buttonStyle.marginLeft = "auto";
  }
  if (buttonPosition === "before" && textAlign === "right") {
    buttonStyle.marginRight = "auto";
  }

  const beforeBtn =
    showPill && buttonPosition === "before" ? (
      <BannerBtn href={buttonUrl} style={buttonStyle}>
        {buttonText}
      </BannerBtn>
    ) : (
      <Box style={{ display: "none" }} />
    );
  const afterBtn =
    showPill && buttonPosition === "after" ? (
      <BannerBtn href={buttonUrl} style={buttonStyle}>
        {buttonText}
      </BannerBtn>
    ) : (
      <Box style={{ display: "none" }} />
    );

  return (
    <BannerFrame
      key={key}
      style={{
        marginTop: bannerSpacingCss(spacingTop),
        marginBottom: bannerSpacingCss(spacingBottom),
      }}>
      <Outer style={shellStyle}>
        {isFullLink ? (
          <BannerFullLink href={buttonUrl}>{"\u00a0"}</BannerFullLink>
        ) : (
          <Box style={{ display: "none" }} />
        )}
        <BannerInner style={{ justifyContent }}>
          {beforeBtn}
          <LabelEl style={{ color: labelColor }}>{text1}</LabelEl>
          <TimeEl
            style={
              model === "strip"
                ? { color: timeColor }
                : { background: timeBg, color: timeColor }
            }>
            {countdown}
          </TimeEl>
          <LabelEl style={{ color: labelColor }}>{text2}</LabelEl>
          {afterBtn}
        </BannerInner>
      </Outer>
    </BannerFrame>
  );
}

export function OfferShowcase({ offer }: { offer: StorefrontOffer }) {
  const vars = offerThemeVars(offer.theme);
  const config = resolveSectionConfig(offer);
  const title = config.title || offer.name;
  const subtitle =
    config.subtitle ||
    `Termina em ${formatCountdown(msUntil(offer.endsAt), Boolean(offer.showDaysOnCountdown))}`;
  const cols = config.itemsPerRow;
  const isCarousel = config.layout === "carousel";
  const cardWidth = `calc((100% - ${(cols - 1) * 8}px) / ${cols})`;

  const byProduct = new Map<
    number,
    {
      productId: number;
      name: string;
      imageUrl: string | null;
      offerPrice: number;
      originalPrice: number;
    }
  >();
  for (const item of offer.items) {
    if (byProduct.has(item.productId)) continue;
    byProduct.set(item.productId, {
      productId: item.productId,
      name: item.productName || `#${item.productId}`,
      imageUrl: item.imageUrl,
      offerPrice: item.offerPrice,
      originalPrice: item.originalPrice,
    });
  }
  const products = [...byProduct.values()].slice(0, 12);

  const cardStyle = StyleSheet.create({
    carousel: {
      width: cardWidth,
      flex: `0 0 ${cardWidth}`,
    },
    grid: {
      width: "100%",
    },
  });

  const productNodes = products.map((product) => (
    <Card
      key={`showcase-item-${offer.id}-${product.productId}`}
      style={isCarousel ? cardStyle.carousel : cardStyle.grid}>
      {product.imageUrl ? (
        <CardImage src={product.imageUrl} alt={product.name} />
      ) : (
        <Box style={{ width: "100%", height: "8px" }} />
      )}
      <CardBody>
        <CardName>{product.name}</CardName>
        <CardPrices>
          <CardOriginal>{formatMoney(product.originalPrice)}</CardOriginal>
          <CardOffer>{formatMoney(product.offerPrice)}</CardOffer>
        </CardPrices>
      </CardBody>
    </Card>
  ));

  const textTop = htmlToPlainText(config.textTop);
  const textBottom = htmlToPlainText(config.textBottom);

  return (
    <ShowcaseRoot key={`showcase-${offer.id}`} style={vars}>
      {config.bannerTopUrl ? (
        <ShowcaseBanner
          src={config.bannerTopUrl}
          alt={title}
          style={{ maxHeight: "220px" }}
        />
      ) : (
        <Box style={{ display: "none" }} />
      )}

      <ShowcaseTitle>{title}</ShowcaseTitle>
      <ShowcaseSubtitle>{subtitle}</ShowcaseSubtitle>

      {textTop ? (
        <ShowcaseBody>{textTop}</ShowcaseBody>
      ) : (
        <Box style={{ display: "none" }} />
      )}

      {isCarousel ? (
        <Scroll
          key={`showcase-scroll-${offer.id}`}
          gap={8}
          hideScrollbar={false}>
          {productNodes}
        </Scroll>
      ) : (
        <Grid
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}>
          {productNodes}
        </Grid>
      )}

      {textBottom ? (
        <ShowcaseBody>{textBottom}</ShowcaseBody>
      ) : (
        <Box style={{ display: "none" }} />
      )}

      {config.bannerBottomUrl ? (
        <ShowcaseBanner
          src={config.bannerBottomUrl}
          alt={title}
          style={{ maxHeight: "180px" }}
        />
      ) : (
        <Box style={{ display: "none" }} />
      )}
    </ShowcaseRoot>
  );
}
