"use client";

import { Box, Text } from "@nimbus-ds/components";
import type { BannerAnimation } from "@/lib/banner-models";
import { useLocale } from "@/lib/i18n/locale-context";

const VISUAL_ANIMATIONS: Exclude<BannerAnimation, "none">[] = [
  "pulse",
  "shine",
  "slide",
];

function AnimationCard({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
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
        minHeight="52px"
        padding="1"
        borderRadius="2"
        backgroundColor="neutral-surface"
        overflow="hidden">
        {children}
      </Box>
      <Text fontSize="caption" fontWeight="medium" textAlign="center">
        {label}
      </Text>
    </Box>
  );
}

function PreviewBar({ animation }: { animation: Exclude<BannerAnimation, "none"> }) {
  const style: React.CSSProperties = {
    width: "100%",
    height: 28,
    borderRadius: 6,
    background: "#E11D48",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.04em",
  };

  if (animation === "pulse") {
    style.animation = "op-anim-pulse 2s ease-in-out infinite";
  } else if (animation === "shine") {
    style.background =
      "linear-gradient(110deg, #E11D48 0%, #E11D48 40%, rgba(255,255,255,0.35) 50%, #E11D48 60%, #E11D48 100%)";
    style.backgroundSize = "200% 100%";
    style.animation = "op-anim-shine 2.8s linear infinite";
  } else {
    style.animation = "op-anim-slide 2.4s ease-in-out infinite";
  }

  return <div style={style}>05:42:18</div>;
}

type Props = {
  value: BannerAnimation;
  onChange: (value: BannerAnimation) => void;
};

export function BannerAnimationPicker({ value, onChange }: Props) {
  const { dict } = useLocale();

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <style>{`
        @keyframes op-anim-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.72; }
        }
        @keyframes op-anim-shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes op-anim-slide {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>
      <Text fontSize="caption" fontWeight="medium">
        {dict.form.bannerAnimation}
      </Text>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr 1fr" }}
        gap="2">
        {VISUAL_ANIMATIONS.map((animation) => (
          <AnimationCard
            key={animation}
            selected={value === animation}
            label={
              dict.form[
                `bannerAnimation_${animation}` as keyof typeof dict.form
              ] as string
            }
            onClick={() =>
              onChange(value === animation ? "none" : animation)
            }>
            <PreviewBar animation={animation} />
          </AnimationCard>
        ))}
      </Box>
      {value === "none" ? (
        <Text fontSize="caption" color="neutral-textLow">
          {dict.form.bannerAnimation_none}
        </Text>
      ) : null}
    </Box>
  );
}
