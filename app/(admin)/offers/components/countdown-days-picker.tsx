"use client";

import { Box, Text } from "@nimbus-ds/components";
import { useLocale } from "@/lib/i18n/locale-context";

type Props = {
  value: boolean;
  onChange: (showDays: boolean) => void;
};

function DigitBlock({
  value,
  unit,
  highlight = false,
}: {
  value: string;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="1"
      minWidth="40px">
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width="44px"
        height="44px"
        borderRadius="2"
        borderWidth="1"
        borderStyle="solid"
        borderColor={highlight ? "primary-interactive" : "neutral-interactive"}
        backgroundColor={highlight ? "primary-surface" : "neutral-background"}>
        <Text
          fontSize="highlight"
          fontWeight="bold"
          color={highlight ? "primary-interactive" : undefined}>
          {value}
        </Text>
      </Box>
      <Text fontSize="caption" color="neutral-textLow" textAlign="center">
        {unit}
      </Text>
    </Box>
  );
}

function Colon() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="44px"
      paddingX="1">
      <Text fontSize="highlight" fontWeight="bold" color="neutral-textLow">
        :
      </Text>
    </Box>
  );
}

function OptionCard({
  selected,
  title,
  onClick,
  children,
}: {
  selected: boolean;
  title: string;
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
      gap="3"
      padding="4"
      borderWidth="1"
      borderStyle="solid"
      borderColor={selected ? "primary-interactive" : "neutral-interactive"}
      borderRadius="2"
      backgroundColor={selected ? "primary-surface" : "neutral-background"}
      cursor="pointer"
      width="100%">
      <Text fontSize="base" fontWeight="medium" textAlign="center">
        {title}
      </Text>
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        gap="1"
        width="100%"
        flexWrap="wrap">
        {children}
      </Box>
    </Box>
  );
}

export function CountdownDaysPicker({ value, onChange }: Props) {
  const { dict } = useLocale();
  const f = dict.form;

  return (
    <Box display="flex" flexDirection="column" gap="2">
      <Text fontSize="caption" color="neutral-textLow">
        {f.countdownShowDaysHelp}
      </Text>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap="3">
        <OptionCard
          selected={!value}
          title={f.countdownFormatHours}
          onClick={() => onChange(false)}>
          <DigitBlock value="53" unit={f.countdownUnitHour} />
          <Colon />
          <DigitBlock value="42" unit={f.countdownUnitMin} />
          <Colon />
          <DigitBlock value="18" unit={f.countdownUnitSec} />
        </OptionCard>

        <OptionCard
          selected={value}
          title={f.countdownFormatDays}
          onClick={() => onChange(true)}>
          <DigitBlock value="02" unit={f.countdownUnitDay} highlight />
          <Colon />
          <DigitBlock value="05" unit={f.countdownUnitHour} />
          <Colon />
          <DigitBlock value="42" unit={f.countdownUnitMin} />
          <Colon />
          <DigitBlock value="18" unit={f.countdownUnitSec} />
        </OptionCard>
      </Box>
    </Box>
  );
}
