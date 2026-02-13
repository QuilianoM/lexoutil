import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function MiseEnRelationPage() {
  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Mise en relation</h1>

      <p className="mt-1 text-sm text-zinc-600">
        Si votre situation nécessite un accompagnement personnalisé, Lexoutil peut vous orienter vers un
        professionnel du droit (avocat / juriste / organisme adapté).{" "}
        <span className="text-zinc-500">
          Lexoutil fournit une aide générale et des modèles — pas de conseil juridique personnalisé.
        </span>
      </p>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Quand utiliser la mise en relation ?</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Lorsque le dossier devient complexe, urgent, ou qu’un avis professionnel est nécessaire.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Dossier complexe</Badge>
                <Badge variant="outline">Urgence</Badge>
                <Badge variant="outline">Contentieux</Badge>
                <Badge variant="outline">Montant important</Badge>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Reason
                title="Vous n’obtenez aucune réponse"
                text="Relances sans effet, blocage, interlocuteur injoignable, situation qui traîne."
              />
              <Reason
                title="Risques élevés"
                text="Suspension/expulsion, menace de plainte, somme élevée, impact professionnel."
              />
              <Reason
                title="Besoin d’une stratégie"
                text="Choisir la bonne action : médiation, mise en demeure, procédure, conciliateur…"
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link href="/assistance">
                <Button>Décrire ma situation</Button>
              </Link>
              <Link href="/documents">
                <Button variant="secondary">Commencer par un document</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Comment ça fonctionne</h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Step
                number="1"
                title="Vous expliquez les faits"
                text="Vous décrivez la situation (dates, preuves, échanges)."
              />
              <Step
                number="2"
                title="Orientation"
                text="Nous identifions les prochaines étapes possibles et les documents utiles."
              />
              <Step
                number="3"
                title="Professionnel (si nécessaire)"
                text="Si un accompagnement personnalisé est requis, vous êtes orienté vers un professionnel adapté."
              />
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              La mise en relation dépend de la disponibilité des professionnels et de la nature du dossier.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Transparence</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>Lexoutil ne remplace pas un avocat.</li>
                <li>Les guides et modèles sont des informations générales.</li>
                <li>Vous restez libre d’accepter ou non une mise en relation.</li>
                <li>Vous choisissez ensuite le professionnel et les modalités.</li>
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">Clair</Badge>
                <Badge variant="outline">Sans promesses irréalistes</Badge>
                <Badge variant="outline">Traçable</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-semibold text-zinc-900">Important (données & confidentialité)</h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
                <li>Ne transmettez pas de mots de passe, données bancaires, ou documents d’identité complets.</li>
                <li>Partagez uniquement le nécessaire (faits, dates, preuves générales).</li>
                <li>Pour les pièces sensibles : transmettre uniquement via un canal sécurisé du professionnel.</li>
              </ul>

              <div className="mt-4">
                <Link href="/confidentialite">
                  <Button variant="secondary">Lire la confidentialité</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Prêt à commencer ?</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Décrivez votre situation pour être orienté, ou générez d’abord un document propre.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/assistance">
                <Button>Décrire ma situation</Button>
              </Link>
              <Link href="/documents">
                <Button variant="secondary">Générer un document</Button>
              </Link>
              <Link href="/guides">
                <Button variant="secondary">Voir les guides</Button>
              </Link>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Lexoutil fournit une aide générale. Pour un avis personnalisé, adressez-vous à un professionnel du droit.
            </p>
          </CardContent>
        </Card>
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

function Reason({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <div className="text-sm font-semibold text-zinc-900">{title}</div>
      <p className="mt-2 text-sm text-zinc-600">{text}</p>
    </div>
  );
}
