import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CtaProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  primary?: boolean;
};

function CtaCard({ title, description, href, ctaLabel, primary }: CtaProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardContent className="flex flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        </div>

        <div className="mt-4">
          <Link href={href}>
            {primary ? (
              <Button size="sm">{ctaLabel}</Button>
            ) : (
              <Button size="sm" variant="secondary">
                {ctaLabel}
              </Button>
            )}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HomePage() {
  return (
    <Container>
      {/* HERO */}
      <Section className="py-14 text-center">
        <Badge variant="outline">LEXOUTIL</Badge>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
          Assistance juridique simple et génération de documents
        </h1>

        <p className="mt-3 text-zinc-600 max-w-2xl mx-auto">
          Créez rapidement vos documents, accédez à des guides clairs et bénéficiez d’une assistance
          structurée — sans jargon inutile.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/documents">Créer un document</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/guides">Voir les guides</Link>
          </Button>
        </div>
      </Section>

      {/* SERVICES */}
      <Section className="py-12 grid gap-4 md:grid-cols-3">
        <CtaCard
          title="Documents juridiques"
          description="Modèles prêts à l’emploi avec génération automatique."
          href="/documents"
          ctaLabel="Créer"
          primary
        />

        <CtaCard
          title="Guides pratiques"
          description="Explications claires étape par étape."
          href="/guides"
          ctaLabel="Consulter"
        />

        <CtaCard
          title="Assistance"
          description="Contactez-nous pour une aide générale."
          href="/assistance"
          ctaLabel="Demander"
        />
      </Section>

      {/* VALEUR */}
      <Section className="py-12 text-center">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Un outil juridique clair, rapide et accessible
        </h2>

        <p className="mt-3 text-zinc-600 max-w-2xl mx-auto">
          Pensé pour particuliers et professionnels : sans complexité inutile, sans frais cachés,
          et avec une approche responsable.
        </p>
      </Section>

      {/* DISCLAIMER */}
      <Section className="pb-14 text-xs text-zinc-500 text-center max-w-3xl mx-auto">
        LEXOUTIL fournit des modèles et informations générales. Aucun conseil juridique personnalisé.
      </Section>
    </Container>
  );
}
