import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Precision Building | Construção LSF e Reabilitação",
    template: "%s | Precision Building",
  },
  description:
    "Construção LSF, reabilitação e renovação. Acompanhe a sua obra, as decisões, os pagamentos e os prazos num só lugar.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
