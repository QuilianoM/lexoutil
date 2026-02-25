import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConfidentialitePage() {
  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Politique de confidentialité</h1>

      <p className="mt-2 text-sm text-zinc-600">
        Cette page explique comment Lexoutil traite les données personnelles et les cookies, conformément au RGPD.
      </p>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">RGPD</Badge>
              <Badge variant="outline">Transparence</Badge>
              <Badge variant="outline">Consentement</Badge>
            </div>

            <h2 className="mt-4 text-sm font-semibold text-zinc-900">1) Responsable du traitement</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Lexoutil (éditeur du site) est responsable du traitement des données collectées via le site.
              Les mentions légales sont disponibles sur la page{" "}
              <Link className="underline" href="/mentions">
                Mentions légales
              </Link>
              .
            </p>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">2) Quelles données sont traitées ?</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>
                Données fournies par l’utilisateur : informations saisies dans les formulaires (ex. nom, e-mail, situation).
              </li>
              <li>
                Données techniques minimales : informations nécessaires au fonctionnement et à la sécurité (ex. logs techniques).
              </li>
              <li>
                Mesure d’audience (optionnelle) : uniquement si vous l’acceptez via la bannière cookies.
              </li>
            </ul>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">3) Finalités</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Répondre à vos demandes d’assistance.</li>
              <li>Permettre la génération de documents et l’historique local (si activé sur votre appareil).</li>
              <li>Sécuriser le site (prévention des abus, erreurs, incidents).</li>
              <li>Améliorer le service via la mesure d’audience (si vous y consentez).</li>
            </ul>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">4) Base légale</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Exécution d’une demande : lorsque vous utilisez un formulaire pour obtenir une réponse.</li>
              <li>Intérêt légitime : sécurité, prévention des abus et bon fonctionnement.</li>
              <li>Consentement : pour la mesure d’audience (Vercel Analytics).</li>
            </ul>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">5) Cookies</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Lexoutil utilise :
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>
                <span className="font-medium">Cookies nécessaires</span> : indispensables au fonctionnement (obligatoires).
              </li>
              <li>
                <span className="font-medium">Mesure d’audience (optionnelle)</span> :{" "}
                Vercel Analytics, activée seulement si vous acceptez.
              </li>
            </ul>

            <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <div className="text-sm font-semibold text-zinc-900">Vercel Analytics (si accepté)</div>
              <p className="mt-1 text-sm text-zinc-700">
                Sert à comprendre l’usage du site (pages consultées, navigation globale) afin d’améliorer Lexoutil.
                Vous pouvez refuser ou retirer votre consentement à tout moment via « Gestion des cookies » en bas de page.
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Hébergement/plateforme : Vercel. Selon la configuration, des données peuvent transiter hors UE.
              </p>
            </div>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">6) Durées de conservation</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Demandes d’assistance : durée nécessaire au traitement + archivage raisonnable selon besoin.</li>
              <li>Historique / brouillon : stockés localement sur votre appareil (si votre navigateur l’autorise).</li>
              <li>Mesure d’audience : selon la politique de Vercel Analytics, uniquement si vous consentez.</li>
            </ul>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">7) Destinataires</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Les données sont destinées à Lexoutil et à ses prestataires techniques strictement nécessaires
              (hébergement, sécurité, mesure d’audience si acceptée).
            </p>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">8) Vos droits</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-700">
              <li>Droit d’accès, de rectification, d’effacement.</li>
              <li>Droit d’opposition et de limitation.</li>
              <li>Droit au retrait du consentement (cookies d’audience).</li>
              <li>Droit d’introduire une réclamation auprès de la CNIL.</li>
            </ul>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">9) Contact</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Pour toute demande liée à vos données : utilisez la page{" "}
              <Link className="underline" href="/assistance">
                Assistance
              </Link>{" "}
              (objet : “Données personnelles / RGPD”).
            </p>

            <h2 className="mt-5 text-sm font-semibold text-zinc-900">10) Avertissement</h2>
            <p className="mt-2 text-sm text-zinc-700">
              Lexoutil fournit des informations générales et des modèles. Cela ne constitue pas un conseil juridique
              personnalisé. Pour un avis adapté à votre situation, consultez un professionnel du droit.
            </p>
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
