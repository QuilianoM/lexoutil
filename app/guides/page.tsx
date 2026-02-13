import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Guide = {
  id: string;
  titre: string;
  description: string;
  categorie: "Consommation" | "E-commerce" | "Logement" | "Travail" | "Administratif";
  niveau: "Débutant" | "Intermédiaire";
  resultat: string;
};

const GUIDES: Guide[] = [
  {
    id: "mise-en-demeure",
    titre: "Mise en demeure : quand et comment l’envoyer",
    description:
      "Comprendre le rôle de la mise en demeure, ce qu’elle doit contenir, et comment l’utiliser avant une procédure.",
    categorie: "Consommation",
    niveau: "Débutant",
    resultat: "Obtenir un modèle prêt à compléter + les bonnes étapes",
  },
  {
    id: "litige-livraison",
    titre: "Colis marqué livré mais non reçu : quoi faire",
    description:
      "Vérifier les preuves, ouvrir une réclamation, et préparer un écrit clair pour la plateforme / le vendeur.",
    categorie: "E-commerce",
    niveau: "Débutant",
    resultat: "Savoir quoi demander et dans quel ordre",
  },
  {
    id: "remboursement-annulation",
    titre: "Remboursement, rétractation, annulation : les bases",
    description:
      "Distinguer rétractation, annulation, remboursement et les délais habituels (selon le contexte).",
    categorie: "E-commerce",
    niveau: "Débutant",
    resultat: "Réagir correctement sans perdre de temps",
  },
  {
    id: "facture-impayee",
    titre: "Facture impayée : relance, mise en demeure, suite possible",
    description:
      "Structurer une relance efficace et escalader proprement si aucune réponse (sans menaces inutiles).",
    categorie: "Administratif",
    niveau: "Intermédiaire",
    resultat: "Cadre clair pour relancer + document propre",
  },
  {
    id: "logement-travaux",
    titre: "Logement : travaux, défauts, litiges simples",
    description:
      "Comment formuler un écrit clair pour signaler un problème, demander une action, et tracer les échanges.",
    categorie: "Logement",
    niveau: "Débutant",
    resultat: "Un plan d’action + un écrit exploitable",
  },
  {
    id: "travail-ecrit",
    titre: "Travail : formaliser un écrit (demande / contestation)",
    description:
      "Rédiger un message structuré et factuel : dates, faits, demande, délai. Utile avant d’aller plus loin.",
    categorie: "Travail",
    niveau: "Intermédiaire",
    resultat: "Écrit clair + plus de crédibilité",
  },
];

const CATEGORIES: Array<Guide["categorie"]> = [
  "Consommation",
  "E-commerce",
  "Logement",
  "Travail",
  "Administratif",
];

function badgeForCategory(cat: Guide["categorie"]) {
  // On reste sobre : outline partout, le texte fait la différence.
  return <Badge variant="outline">{cat}</Badge>;
}

export default function GuidesPage() {
  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Guides</h1>

      <p className="mt-1 text-sm text-zinc-600">
        Des explications simples pour comprendre les étapes et générer les bons documents.
      </p>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Commencer rapidement</h2>
                <p className="text-xs text-zinc-500">
                  Si vous voulez un résultat immédiat, utilisez le générateur.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/documents">
                  <Button>Ouvrir le générateur</Button>
                </Link>
                <Link href="/assistance">
                  <Button variant="secondary">Demander une assistance</Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">Informations générales</Badge>
              <Badge variant="outline">Modèles de documents</Badge>
              <Badge variant="outline">Orientation</Badge>
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Lexoutil fournit une aide générale et des modèles — pas de conseil juridique personnalisé.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Par catégories</h2>
            <p className="text-xs text-zinc-500">
              Choisissez un guide, puis passez au générateur si besoin.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {CATEGORIES.map((cat) => {
            const items = GUIDES.filter((g) => g.categorie === cat);
            return (
              <Card key={cat}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{cat}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {items.length} guide{items.length > 1 ? "s" : ""}
                      </div>
                    </div>
                    {badgeForCategory(cat)}
                  </div>

                  <ul className="mt-4 space-y-3">
                    {items.map((g) => (
                      <li key={g.id} className="rounded-lg border border-zinc-200 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-semibold text-zinc-900">{g.titre}</div>
                          <Badge variant="outline">{g.niveau}</Badge>
                        </div>

                        <p className="mt-1 text-sm text-zinc-600">{g.description}</p>

                        <p className="mt-2 text-xs text-zinc-500">
                          <span className="font-medium text-zinc-700">Résultat :</span> {g.resultat}
                        </p>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          <Link href="/documents">
                            <Button size="sm">Générer un document</Button>
                          </Link>
                          <Link href="/assistance">
                            <Button size="sm" variant="secondary">
                              Poser une question
                            </Button>
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section className="pt-6">
        <Card>
          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-zinc-900">Astuce</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Pour gagner du temps : préparez une chronologie (dates, faits, preuves), puis utilisez le générateur
              de documents. Vous aurez un texte clair, structuré, et facile à relire.
            </p>

            <div className="mt-4">
              <Link href="/documents">
                <Button>Aller au générateur</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Section>
    </Container>
  );
}
