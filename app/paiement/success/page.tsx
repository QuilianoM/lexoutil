"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setSubscriptionStatus } from "@/lib/subscription";

export default function PaiementSuccessPage() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // ✅ En attendant Stripe + webhook, on active Pro “local” automatiquement
    // Plus tard, on remplacera ça par une validation serveur via webhook Stripe.
    setSubscriptionStatus("pro");
    setDone(true);
  }, []);

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-3xl py-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Paiement réussi</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Merci ! Votre accès Pro est activé (mode local pour le moment).
              </p>
            </div>
            <Badge>Pro</Badge>
          </div>

          <Card className="mt-6">
            <CardContent className="p-5">
              <p className="text-sm text-zinc-700">
                {done
                  ? "✅ Accès Pro activé sur cet appareil."
                  : "Activation en cours…"}
              </p>

              <p className="mt-2 text-xs text-zinc-500">
                Plus tard : on activera Pro côté serveur via webhook Stripe (vrai abonnement).
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/compte">Voir mon compte</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/documents">Aller au générateur</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
