import { NexoProvider } from "./nexo-provider";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <NexoProvider>{children}</NexoProvider>;
}
