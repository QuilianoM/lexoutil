// app/guides/page.tsx

import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { GUIDES, type Guide } from "@/lib/guides";

function badgeForCategory(cat: Guide["categorie"]) {
  return <Badge variant="outline">{cat}</Badge>;
}

export default function GuidesPage() {
  // Catégories calculées automatiquement depuis les guides
  const categories = Array.from(new Set(GUIDES.map((g) => g.categorie))).sort();

  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Guides</h1>

      <p className="mt-1 text-sm text-zinc-600">
        Des explications simples pour comprendre les démarches et générer les bons
        documents.
      </p>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">
                  Trouvez le bon guide
                </h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Chaque guide explique les étapes et les documents à produire.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/documents">Générer un document</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/assistance">Assistance</Link>
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat} variant="outline">
                  {cat}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((g) => (
            <Card key={g.id} className="transition hover:shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  {badgeForCategory(g.categorie)}
                  <Badge variant="outline">{g.niveau}</Badge>
                </div>

️
                <h3 className="mt-3 text-base font-semibold text-zinc-900">
                  {g.titre}
                </h3>

                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  {g.description}
                </p>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href={`/guides/${g.id}`}>Lire le guide</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/documents">Générer un document</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </Container>
  );
}
