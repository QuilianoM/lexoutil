import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "@/components/layout-shell";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Lexoutil — Assistance juridique",
    template: "%s — Lexoutil",
  },

  description:
    "Lexoutil fournit des informations générales et des modèles de documents. Pas de conseil juridique personnalisé.",

  alternates: {
    canonical: siteUrl,
  },

  openGraph: {
    title: "Lexoutil — Assistance juridique",
    description:
      "Informations générales + modèles de documents (MVP). Pas de conseil juridique personnalisé.",
    url: siteUrl,
    siteName: "Lexoutil",
    locale: "fr_FR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Lexoutil — Assistance juridique",
    description:
      "Informations générales + modèles de documents (MVP). Pas de conseil juridique personnalisé.",
  },

  robots: {
    index: true,
    follow: true,
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
