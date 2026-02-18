import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Mise en relation",
  description: "Prise de contact et mise en relation avec des professionnels du droit (selon disponibilité).",
  alternates: {
    canonical: `${siteUrl}/mise-en-relation`,
  },
  openGraph: {
    title: "Mise en relation — Lexoutil",
    description: "Prise de contact et mise en relation avec des professionnels du droit (selon disponibilité).",
    url: `${siteUrl}/mise-en-relation`,
    siteName: "Lexoutil",
    locale: "fr_FR",
    type: "website",
  },
};

export default function MiseEnRelationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
