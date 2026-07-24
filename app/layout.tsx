import type { Metadata } from "next";
import "@nimbus-ds/styles/dist/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selos Pro",
  description: "Selos e bandeiras animadas para produtos Nuvemshop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
