"use client";

// app/guides/[id]/guide-detail-client.tsx

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { buildDocumentsUrlForGuide, listGuideIds } from "@/lib/guides";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type TocItem = { id: string; label: string };

type Props = {
  guide: Guide | null;
  toc: TocItem[];
  reading: { minutes: number; words: number };
  requestedId: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalizeId(id: string) {
  return (id || "").trim();
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function GuideDetailClient({ guide, toc, reading, requestedId }: Props) {
  const [activeId, setActiveId] = useState<string>(toc?.[0]?.id || "");
  const [copiedExample, setCopiedExample] = useState<"ok" | "err" | null>(null);
  const [copiedLink, setCopiedLink] = useState<"ok" | "err" | null>(null);

  const sectionIds = useMemo(() => toc.map((t) => t.id).filter(Boolean), [toc]);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // ✅ Surbrillance auto section active
  useEffect(() => {
    if (!sectionIds.length) return;

    // Nettoyage si déjà créé
    if (observerRef.current) observerRef.current.disconnect();

    const obs = new IntersectionObserver(
      (entries) => {
        // On choisit la section visible la plus "forte"
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: null,
        // Déclenche un peu avant le haut, comme un sommaire Wikipédia
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0.05, 0.12, 0.2, 0.35],
      }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    }

    observerRef.current = obs;

    return () => obs.disconnect();
  }, [sectionIds]);

  async function copyExample() {
    if (!guide?.contenu?.exempleMessage) return;
    setCopiedExample(null);
    try {
      await navigator.clipboard.writeText(guide.contenu.exempleMessage);
      setCopiedExample("ok");
    } catch {
      setCopiedExample("err");
    } finally {
      window.setTimeout(() => setCopiedExample(null), 2000);
    }
  }

  async function copyPageLink() {
    setCopiedLink(null);
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink("ok");
    } catch {
      setCopiedLink("err");
    } finally {
      window.setTimeout(() => setCopiedLink(null), 2000);
    }
  }

  function printPdf() {
    // Impression navigateur → “Enregistrer en PDF”
    window.print();
  }

  // Lien conversion : /documents?template=...&prefill_...
  const documentsUrl = guide ? buildDocumentsUrlForGuide(guide) : "/documents";

  // ✅ Page “guide introuvable”
  if (!guide) {
    const ids = listGuideIds();

    return (
      <Container>
        <Section>
          <div className="mx-auto w-full max-w-6xl py-10">
            <h1 className="text-2xl font-semibold tracking-tight">Guide introuvable</h1>
            <p className="mt-2 text-sm text-zinc-600">
              L’URL demandée contient cet identifiant : <span className="font-mono">{requestedId}</span>
            </p>

            <Card className="mt-6">
              <CardContent className="p-5">
                <div className="text-sm font-semibold text-zinc-900">
                  Voici les IDs disponibles dans <span className="font-mono">lib/guides.ts</span> :
                </div>

                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                  {ids.map((x) => (
                    <li key={x}>
                      <Link className="underline" href={`/guides/${x}`}>
                        {x}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/guides">← Retour aux guides</Link>
                  </Button>

                  <Button variant="secondary" asChild>
                    <Link href="/documents">Générer un document</Link>
                  </Button>
                </div>

                <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                  <p className="text-xs leading-5 text-zinc-600">
                    Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel
                    du droit.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </Container>
    );
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-6xl py-10">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-[260px] flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{guide.categorie}</Badge>
                <Badge variant="outline">{guide.niveau}</Badge>
                <Badge variant="outline">
                  Temps de lecture : {reading?.minutes || 1} min
                </Badge>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">{guide.titre}</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{guide.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {/* ✅ Conversion */}
                <Button asChild>
                  <Link href={documentsUrl}>Générer un document</Link>
                </Button>

                <Button variant="secondary" asChild>
                  <Link href="/guides">← Retour aux guides</Link>
                </Button>

                <Button variant="secondary" onClick={copyPageLink}>
                  Copier le lien
                </Button>

                <Button variant="secondary" onClick={printPdf}>
                  Imprimer / PDF
                </Button>

                {copiedLink === "ok" ? <span className="text-xs text-green-700">Lien copié ✓</span> : null}
                {copiedLink === "err" ? <span className="text-xs text-red-600">Copie impossible</span> : null}
              </div>
            </div>
          </div>

          {/* Layout : contenu + sommaire collant à droite */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            {/* Contenu */}
            <div className="lg:col-span-8">
              <Card>
                <CardContent className="p-6">
                  {/* INTRO */}
                  <div id={normalizeId(sectionIds[0] || "introduction")} className="scroll-mt-28">
                    <h2 className="text-lg font-semibold text-zinc-900">Introduction</h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{guide.contenu.intro}</p>
                  </div>

                  {/* POINTS CLÉS */}
                  <div id={normalizeId(sectionIds[1] || "points-cles")} className="mt-8 scroll-mt-28">
                    <h2 className="text-lg font-semibold text-zinc-900">Points clés</h2>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                      {guide.contenu.pointsCles.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* ÉTAPES */}
                  <div id={normalizeId(sectionIds[2] || "etapes")} className="mt-8 scroll-mt-28">
                    <h2 className="text-lg font-semibold text-zinc-900">Étapes</h2>

                    <div className="mt-4 grid gap-4">
                      {guide.contenu.etapes.map((e, idx) => (
                        <Card key={idx} className="avoid-print-break">
                          <CardContent className="p-4">
                            <div className="text-sm font-semibold text-zinc-900">
                              {idx + 1}) {e.titre}
                            </div>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                              {e.details.map((d, j) => (
                                <li key={j}>{d}</li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* EXEMPLE MESSAGE */}
                  <div id={normalizeId(sectionIds[3] || "exemple-message")} className="mt-8 scroll-mt-28">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold text-zinc-900">Exemple de message</h2>

                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={copyExample}>
                          Copier l’exemple (1 clic)
                        </Button>

                        {copiedExample === "ok" ? <span className="text-xs text-green-700">Copié ✓</span> : null}
                        {copiedExample === "err" ? <span className="text-xs text-red-600">Copie impossible</span> : null}
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border bg-white p-4">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900">
                        {guide.contenu.exempleMessage}
                      </pre>
                    </div>

                    <div className="mt-3 text-xs text-zinc-600">
                      Astuce : vous pouvez copier/coller l’exemple puis l’adapter.
                    </div>
                  </div>

                  {/* ERREURS COURANTES */}
                  <div id={normalizeId(sectionIds[4] || "erreurs-courantes")} className="mt-8 scroll-mt-28">
                    <h2 className="text-lg font-semibold text-zinc-900">Erreurs courantes</h2>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                      {guide.contenu.erreursCourantes.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* À RETENIR */}
                  <div id={normalizeId(sectionIds[5] || "a-retenir")} className="mt-8 scroll-mt-28">
                    <h2 className="text-lg font-semibold text-zinc-900">À retenir</h2>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                      {guide.contenu.aRetenir.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  {/* DISCLAIMER */}
                  <div className="mt-10 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <div className="text-xs font-semibold text-zinc-900">Avertissement</div>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">{guide.contenu.disclaimer}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sommaire sticky */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <Card className="avoid-print-break">
                  <CardContent className="p-5">
                    <div className="text-sm font-semibold text-zinc-900">Sommaire</div>

                    <div className="mt-3 grid gap-1">
                      {toc.map((item) => {
                        const isActive = item.id === activeId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => scrollToId(item.id)}
                            className={cn(
                              "w-full rounded-md px-3 py-2 text-left text-sm transition",
                              "border",
                              isActive
                                ? "border-zinc-900 bg-zinc-900 text-white"
                                : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                            )}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-600">
                      Le sommaire se met en surbrillance automatiquement quand vous descendez.
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      <Button asChild>
                        <Link href={documentsUrl}>Générer un document</Link>
                      </Button>

                      <Button variant="secondary" onClick={printPdf}>
                        Imprimer / PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </div>
      </Section>
    </Container>
  );
}
