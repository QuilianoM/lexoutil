"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionStatus, setSubscriptionStatus } from "@/lib/subscription";
import { useEffect, useState } from "react";

export default function TarifsPage() {
  const [status, setStatus] = useState<"free" | "pro">("free");

  useEffect(() => {
    setStatus(getSubscriptionStatus());
  }, []);

  function activerProPourTest() {
    setSubscriptionStatus("pro");
    setStatus("pro");
  }

  function repasserGratuitPourTest() {
    setSubscriptionStatus("free");
    setStatus("free");
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-5xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Tarifs</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Accès gratuit + option Pro (abonnement) — préparation pour Stripe.
              </p>
            </div>
            <Badge>{status === "pro" ? "Pro (test)" : "Gratuit"}</Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-semibold">Gratuit</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Génération de documents + aperçu + PDF.
                </p>
                <ul className="mt-4 list-disc pl-5 text-sm text-zinc-700">
                  <li>Brouillon auto + historique local</li>
                  <li>Export/Import sauvegarde (.json)</li>
                  <li>PDF A4 propre</li>
                </ul>

                <div className="mt-5 flex gap-2">
                  <Button variant="secondary" asChild>
                    <Link href="/documents">Accéder</Link>
                  </Button>

                  {/* Bouton test */}
                  <Button variant="ghost" onClick={repasserGratuitPourTest}>
                    Mettre en “Gratuit”
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">Pro</h2>
                  <Badge>À venir</Badge>
                </div>

                <p className="mt-1 text-sm text-zinc-600">
                  Fonctionnalités avancées + sauvegarde cloud + usage illimité.
                </p>

                <ul className="mt-4 list-disc pl-5 text-sm text-zinc-700">
                  <li>Compte + synchronisation cloud (multi-appareils)</li>
                  <li>Accès modèles premium (pack Pro)</li>
                  <li>Historique illimité + recherche</li>
                  <li>Paiement Stripe + factures</li>
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/paiement">Passer Pro</Link>
                  </Button>

                  {/* Bouton test */}
                  <Button variant="ghost" onClick={activerProPourTest}>
                    Activer “Pro” (test)
                  </Button>
                </div>

                <p className="mt-3 text-xs text-zinc-500">
                  Le bouton “Passer Pro” sera relié à Stripe (Checkout) plus tard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </Container>
  );
}
