"use client";

import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaiementCancelPage() {
  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-3xl py-10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Paiement annulé</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Aucun paiement n’a été effectué.
              </p>
            </div>
            <Badge>Annulé</Badge>
          </div>

          <Card className="mt-6">
            <CardContent className="p-5">
              <p className="text-sm text-zinc-700">
                Vous pouvez réessayer à tout moment depuis la page Tarifs.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/tarifs">Retour aux tarifs</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/documents">Continuer en gratuit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
