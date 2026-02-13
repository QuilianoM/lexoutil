import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <Container size="md" className="py-10">
      {/* HERO */}
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Lexoutil — assistance juridique simple & documents prêts à copier
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
          Expliquez votre situation, suivez les étapes recommandées, puis générez un document clair
          (mise en demeure, relance, contestation…).{" "}
          <span className="text-zinc-500">
            Informations générales uniquement — pas de conseil juridique personnalisé.
          </span>
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link href="/documents">
            <Button>Générer un document</Button>
          </Link>
          <Link href="/guides">
            <Button variant="secondary">Lire les guides</Button>
          </Link>
          <Link href="/assistance">
            <Button variant="secondary">Demander une assistance</Button>
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="outline">Simple</Badge>
          <Badge variant="outline">Rapide</Badge>
          <Badge variant="outline">Sobre & pro</Badge>
          <Badge variant="outline">A4 + PDF</Badge>
        </div>
      </div>

      {/* COMMENT ÇA MARCHE */}
      <Section className="pt-8">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Comment ça marche</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Step
                number="1"
                title="Décrivez les faits"
                text="Dates, faits, échanges, preuves disponibles. Restez simple et chronologique."
              />
              <Step
                number="2"
                title="Générez le document"
                text="Le générateur structure le texte (objet, paragraphes, demande, délai)."
              />
              <Step
                number="3"
                title="Copiez / PDF / imprimez"
                text="Copie robuste, aperçu A4, export PDF et impression propre."
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/documents">
                <Button>Ouvrir le générateur</Button>
              </Link>
              <Link href="/print">
                <Button variant="secondary">Voir l’aperçu A4</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* CE QUE TU OBTIENS */}
      <Section className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Ce que vous obtenez</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>Un texte clair, structuré, et facile à relire</li>
                <li>Un format “courrier” propre (expéditeur/destinataire/objet)</li>
                <li>Un aperçu A4 fidèle + export PDF</li>
                <li>Une base solide pour vos échanges (plateforme, vendeur, organisme…)</li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">Mise en demeure</Badge>
                <Badge variant="outline">Relance</Badge>
                <Badge variant="outline">Contestations</Badge>
                <Badge variant="outline">Litiges simples</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Important (cadre juridique)</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>Lexoutil fournit une aide générale (explications & modèles).</li>
                <li>Ce n’est pas une consultation d’avocat.</li>
                <li>En cas d’urgence ou de dossier complexe : avocat / professionnel du droit.</li>
                <li>Ne transmettez pas d’informations sensibles (mots de passe, carte bancaire, etc.).</li>
              </ul>

              <div className="mt-4">
                <Link href="/assistance">
                  <Button variant="secondary">Contacter l’assistance</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* BLOCS “SERVICES” */}
      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Services</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Service
                title="Guides"
                text="Comprendre les étapes et éviter les erreurs classiques."
                ctaLabel="Voir les guides"
                href="/guides"
              />
              <Service
                title="Documents"
                text="Générer rapidement un courrier structuré et professionnel."
                ctaLabel="Générer"
                href="/documents"
                primary
              />
              <Service
                title="Assistance"
                text="Obtenir une orientation simple sur les documents utiles."
                ctaLabel="Demander"
                href="/assistance"
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* FOOTER NOTE */}
      <Section className="pt-6">
        <p className="text-center text-xs text-zinc-500">
          En utilisant Lexoutil, vous acceptez les pages légales :{" "}
          <Link className="underline" href="/mentions">
            Mentions légales
          </Link>
          ,{" "}
          <Link className="underline" href="/confidentialite">
            Confidentialité
          </Link>{" "}
          et{" "}
          <Link className="underline" href="/cgu">
            CGU
          </Link>
          .
        </p>
      </Section>
    </Container>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
          {number}
        </span>
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{text}</p>
    </div>
  );
}

function Service({
  title,
  text,
  href,
  ctaLabel,
  primary,
}: {
  title: string;
  text: string;
  href: string;
  ctaLabel: string;
  primary?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <p className="mt-1 text-sm text-zinc-600">{text}</p>
        </div>
        {primary ? <Badge>Recommandé</Badge> : <Badge variant="outline">Service</Badge>}
      </div>

      <div className="mt-4">
        <Link href={href}>
          <Button size="sm" variant={primary ? "primary" : "secondary"}>
            {ctaLabel}
          </Button>
        </Link>
      </div>
    </div>
  );
}
