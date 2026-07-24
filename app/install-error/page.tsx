import { Box, Text, Title } from "@nimbus-ds/components";

export default async function InstallErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap="3"
      padding="6"
    >
      <Title as="h1">Selos Pro</Title>
      <Text>
        Não foi possível concluir a instalação
        {reason ? ` (${reason})` : ""}. Tente novamente pelo Admin da Nuvemshop.
      </Text>
    </Box>
  );
}
