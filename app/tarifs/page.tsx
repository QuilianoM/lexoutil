"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { getSubscriptionStatus, isPro, refreshProStatus } from "@/lib/subscription";

// On convertit n'importe quel "SubscriptionStatus" en "pro" | "free" de façon robuste
function toTier(status: unknown): "pro" | "free" {
  // cas 1: string
  if (typeof status === "string") {
    const s = status.toLowerCase();
    return s.includes("pro") ? "pro" : "free";
  }

  // cas 2: objet { status: "..."} / { plan: "..."} / { tier: "..."} etc.
  if (status && typeof status === "object") {
    const anyStatus = status as any;

    const candidate =
      anyStatus?.tier ??
      anyStatus?.plan ??
      anyStatus?.status ??
      anyStatus?.subscription ??
      anyStatus?.level ??
      anyStatus?.type ??
      "";

    if (typeof candidate === "string") {
      const s = candidate.toLowerCase();
      return s.includes("pro") ? "pro" : "free";
    }

    // parfois boolean
    if (typeof anyStatus?.pro === "boolean") {
      return anyStatus.pro ? "pro" : "free";
    }
  }

  // fallback
  return "free";
}

export default function TarifsPage() {
  const [tier, setTier] = useState<"pro" | "free">("free");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // Statut immédiat (cache local, quel que soit le type)
    setTier(toTier(getSubscriptionStatus() as unknown));
  }, []);

  async function actualiserDepuisServeur() {
    setLoading(true);
    setMessage("");

    try {
      const res = await refreshProStatus();

      if (res && typeof res === "object" && "ok" in res) {
        // format attendu dans ton projet: { ok: boolean, pro?: boolean }
        const ok = (res as any).ok === true;
        const pro = (res as any).pro === true;

        if (ok) {
          setTier(pro ? "pro" : "free");
          setMessage(pro ? "✅ Statut Pro actif." : "✅ Statut Free.");
        } else {
          setTier(isPro() ? "pro" : "free");
          setMessage("⚠️ Impossible de vérifier le statut serveur. Statut local conservé.");
        }
      } else {
        // fallback si refreshProStatus change un jour
        setTier(isPro() ? "pro" : "free");
        setMessage("⚠️ Vérification serveur indisponible. Statut local conservé.");
      }
    } finally {
      setLoading(false);
      window.setTimeout(() => setMessage(""), 3500);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-4xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Tarifs</h1>
              <p className="mt-1 text-sm text-zinc-600">Choisissez l’offre adaptée à vos besoins.</p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">STATUT</Badge>
              <Badge className={tier === "pro" ? "bg-zinc-900 text-white" : ""}>
                {tier === "pro" ? "PRO" : "FREE"}
              </Badge>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {/* FREE */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900">Free</h2>
                  <Badge variant="outline">Gratuit</Badge>
                </div>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  <li>Création de documents sur cet appareil</li>
                  <li>Historique local (navigateur)</li>
                  <li>Accès aux guides</li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild variant="secondary">
                    <Link href="/documents">Commencer</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PRO */}
            <Card className="border-zinc-900">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-900">Pro</h2>
                  <Badge className="bg-zinc-900 text-white">Recommandé</Badge>
                </div>

                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-700">
                  <li>Historique en ligne (cloud)</li>
                  <li>Synchronisation multi-appareils</li>
                  <li>Sauvegarde / restauration</li>
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/paiement">S’abonner</Link>
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={actualiserDepuisServeur}
                    disabled={loading}
                  >
                    {loading ? "Vérification…" : "Vérifier mon statut"}
                  </Button>
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Le statut Pro est géré via Stripe (paiement sécurisé).
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 text-xs text-zinc-500">
            ⚠️ LEXOUTIL fournit des modèles et informations générales. Aucun conseil juridique personnalisé.
          </div>
        </div>
      </Section>
    </Container>
  );
}
