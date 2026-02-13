import "./globals.css";
import LayoutShell from "@/components/layout-shell";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Lexoutil — Assistance juridique",
    template: "%s — Lexoutil",
  },
  description: "Assistance juridique en ligne et générateur de documents.",
  applicationName: "Lexoutil",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: "Lexoutil",
    title: "Lexoutil — Assistance juridique",
    description: "Assistance juridique en ligne et générateur de documents.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
