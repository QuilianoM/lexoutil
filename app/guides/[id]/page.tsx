// app/guides/[id]/page.tsx

import type { Metadata } from "next";
import { GUIDES, getGuideById } from "@/lib/guides";
import GuideDetailClient from "./guide-detail-client";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guide = getGuideById(id);

  if (!guide) {
    return {
      title: "Guide introuvable — Lexoutil",
      description: "Le guide demandé n’existe pas ou a été supprimé.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${guide.titre} — Lexoutil`;
  const description = guide.description;
  const canonical = `/guides/${guide.id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

type TocItem = { id: string; label: string };

function slugifyId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function countWords(text: string) {
  return (text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean).length;
}

function estimateReadingMinutes(guide: any) {
  // ~220 mots / minute
  let words = 0;

  words += countWords(guide.titre);
  words += countWords(guide.description);
  words += countWords(guide.contenu.intro);

  for (const p of guide.contenu.pointsCles || []) words += countWords(p);
  for (const e of guide.contenu.etapes || []) {
    words += countWords(e.titre);
    for (const d of e.details || []) words += countWords(d);
  }
  words += countWords(guide.contenu.exempleMessage);
  for (const p of guide.contenu.erreursCourantes || []) words += countWords(p);
  for (const p of guide.contenu.aRetenir || []) words += countWords(p);

  const minutes = Math.max(1, Math.ceil(words / 220));
  return { minutes, words };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = getGuideById(id);

  // TOC standard (sections fixes)
  const toc: TocItem[] = [
    { id: slugifyId("introduction"), label: "Introduction" },
    { id: slugifyId("points-cles"), label: "Points clés" },
    { id: slugifyId("etapes"), label: "Étapes" },
    { id: slugifyId("exemple-message"), label: "Exemple de message" },
    { id: slugifyId("erreurs-courantes"), label: "Erreurs courantes" },
    { id: slugifyId("a-retenir"), label: "À retenir" },
  ];

  if (!guide) {
    // on délègue l'affichage "introuvable" au client pour cohérence UX
    return (
      <GuideDetailClient
        guide={null}
        toc={toc}
        reading={{ minutes: 1, words: 0 }}
        requestedId={id}
      />
    );
  }

  const reading = estimateReadingMinutes(guide);

  return (
    <GuideDetailClient
      guide={guide}
      toc={toc}
      reading={reading}
      requestedId={id}
    />
  );
}
