import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Assistance",
  description: "Assistance juridique : explication générale, orientation, formulaire de contact.",
  alternates: {
    canonical: `${siteUrl}/assistance`,
  },
  openGraph: {
    title: "Assistance — Lexoutil",
    description: "Assistance juridique : explication générale, orientation, formulaire de contact.",
    url: `${siteUrl}/assistance`,
    siteName: "Lexoutil",
    locale: "fr_FR",
    type: "website",
  },
};

export default function AssistanceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
