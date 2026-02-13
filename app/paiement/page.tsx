"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLocalUserId } from "@/lib/subscription";

export default function PaiementPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(getLocalUserId());
  }, []);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Impossible de démarrer le paiement.");
      }

      if (typeof data.url === "string" && data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("URL de paiement invalide.");
    } catch (e: any) {
      setError(typeof e?.message === "string" ? e.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-3xl py-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Paiement</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Abonnement Pro via Stripe Checkout (préparation + webhook).
              </p>
            </div>
            <Badge>Stripe</Badge>
          </div>

          <Card className="mt-6">
            <CardContent className="p-5">
              <p className="text-sm text-zinc-700">
                Cliquez sur “Passer Pro” pour lancer Stripe.
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Identifiant local (provisoire) : <span className="font-mono">{userId || "…"}</span>
              </p>

              {error ? (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button onClick={startCheckout} disabled={loading || !userId}>
                  {loading ? "Ouverture…" : "Passer Pro"}
                </Button>

                <Button variant="secondary" asChild>
                  <Link href="/tarifs">Retour aux tarifs</Link>
                </Button>
              </div>

              <p className="mt-3 text-xs text-zinc-500">
                Ensuite : Stripe webhook → activation Pro serveur (vrai abonnement).
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
