// lib/guides.ts
// Guides LEXOUTIL + connexion directe au générateur /documents (conversion)

export type GuideStep = {
  titre: string;
  details: string[];
};

export type GuideContent = {
  intro: string;
  pointsCles: string[];
  etapes: GuideStep[];
  exempleMessage: string;
  erreursCourantes: string[];
  aRetenir: string[];
  disclaimer: string;
};

export type GuideSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
};

export type GuidePrefill = Record<string, string>;

export type Guide = {
  id: string;
  titre: string;
  description: string;
  categorie: string; // ex: "Consommation"
  niveau: "Débutant" | "Intermédiaire" | "Avancé";
  seo?: GuideSeo;

  // ✅ Conversion: bouton "Générer un document" relié aux templates
  templateId?: string; // id présent dans lib/document-templates.ts
  prefill?: GuidePrefill; // champs pré-remplis via query params prefill_*

  contenu: GuideContent;
};

/* ----------------------------- Helpers ----------------------------- */

export function getGuideById(id: string) {
  return GUIDES.find((g) => g.id === id) || null;
}

export function listGuideIds() {
  return GUIDES.map((g) => g.id);
}

// Construit l’URL vers /documents avec template + pré-remplissage
export function buildDocumentsUrlForGuide(guide: Guide) {
  const template = guide.templateId || "";
  const params = new URLSearchParams();

  if (template) params.set("template", template);

  const prefill = guide.prefill || {};
  for (const [k, v] of Object.entries(prefill)) {
    if (typeof v === "string" && v.trim()) {
      params.set(`prefill_${k}`, v.trim());
    }
  }

  const qs = params.toString();
  return qs ? `/documents?${qs}` : "/documents";
}

/* ----------------------------- Guides ----------------------------- */
/**
 * ⚠️ Important :
 * - templateId doit correspondre à un id de lib/document-templates.ts
 * - prefill_... doit correspondre aux champs du template (ex : objet, faits, demande, delai, etc.)
 */
export const GUIDES: Guide[] = [
  {
    id: "mise-en-demeure",
    titre: "Mise en demeure : quand et comment l’envoyer",
    description:
      "Comprendre le rôle de la mise en demeure, ce qu’elle doit contenir, et comment l’utiliser avant une procédure.",
    categorie: "Consommation",
    niveau: "Débutant",
    seo: {
      title: "Mise en demeure : modèle + explications — Lexoutil",
      description:
        "Guide clair : quand envoyer une mise en demeure, quoi écrire, quelles preuves garder, et modèle prêt à copier.",
      keywords: ["mise en demeure", "modèle", "lettre", "courrier", "preuve", "délai"],
    },
    templateId: "mise-en-demeure",
    prefill: {
      objet: "Mise en demeure — exécution d’une obligation",
      faits:
        "Le [date], j’ai [décrit l’événement / la commande / l’accord] pour un montant de [montant].\n" +
        "À ce jour, [problème constaté : non-livraison / non-remboursement / non-conformité], malgré mes relances du [dates].\n" +
        "Je dispose des éléments suivants : [preuves : échanges, facture, suivi, photos…].",
      demande:
        "Je vous demande de [demande précise : livrer / rembourser / réparer / exécuter…].",
      delai: "8",
    },
    contenu: {
      intro:
        "La mise en demeure est un courrier formel qui demande l’exécution d’une obligation (payer, livrer, réparer, répondre) dans un délai raisonnable. Elle sert surtout à tracer l’historique et à montrer que vous avez tenté une résolution amiable.",
      pointsCles: [
        "Rester factuel : dates, faits, références (commande, facture).",
        "Formuler une demande claire + un délai.",
        "Conserver les preuves : accusés, échanges, captures, suivi.",
      ],
      etapes: [
        {
          titre: "Rassembler les preuves",
          details: [
            "Facture/commande, échanges, captures, conditions affichées au moment de l’achat.",
            "Toute preuve de paiement, de livraison, ou d’anomalie (photos, suivi).",
          ],
        },
        {
          titre: "Rédiger un courrier clair",
          details: [
            "Identité des parties + contexte.",
            "Rappel des faits (chronologie courte).",
            "Votre demande précise + délai.",
          ],
        },
        {
          titre: "Envoyer et tracer",
          details: [
            "En pratique : email + courrier (et recommandé si nécessaire).",
            "Conserver la preuve d’envoi et la preuve de réception.",
          ],
        },
      ],
      exempleMessage:
        "Madame, Monsieur,\n\n" +
        "Je vous adresse la présente mise en demeure concernant les faits suivants :\n" +
        "[faits + dates + références]\n\n" +
        "En conséquence, je vous demande de bien vouloir :\n" +
        "[demande précise]\n\n" +
        "À défaut de réponse ou d’exécution dans un délai de [X] jours à compter de la réception de ce courrier, je me réserve la possibilité d’engager les démarches nécessaires.\n\n" +
        "Veuillez agréer, Madame, Monsieur, mes salutations distinguées.\n\n" +
        "Signature :\n" +
        "[Nom]",
      erreursCourantes: [
        "Écrire sous le coup de l’émotion (accusations, insultes).",
        "Ne pas mettre de délai ou ne pas indiquer ce que vous demandez.",
        "Oublier les références (commande, facture) et les preuves.",
      ],
      aRetenir: [
        "Plus c’est factuel, plus c’est efficace.",
        "Un délai simple (8 ou 15 jours) suffit souvent.",
        "Gardez tout : captures, emails, suivi, preuves d’envoi.",
      ],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },

  {
    id: "litige-livraison",
    titre: "Colis marqué livré mais non reçu : quoi faire",
    description:
      "Les actions utiles (preuves, enquête, réclamation) quand un suivi indique “livré” mais que vous n’avez rien reçu.",
    categorie: "Consommation",
    niveau: "Débutant",
    templateId: "litige-livraison-colis-non-recu",
    prefill: {
      objet: "Litige livraison — colis indiqué livré mais non reçu",
      faits:
        "Ma commande [numéro] est indiquée comme livrée le [date] via le suivi [numéro de suivi], mais je n’ai pas reçu le colis.\n" +
        "J’ai vérifié auprès du voisinage / gardien / point relais et rien ne correspond.\n" +
        "Je demande la preuve de remise (signature, photo, géolocalisation, point de dépôt) et l’ouverture d’une enquête transporteur.",
      demande:
        "Je demande l’ouverture d’une enquête, la communication de la preuve de remise, puis une solution : renvoi du colis ou remboursement.",
      delai: "8",
    },
    contenu: {
      intro:
        "Quand un colis est indiqué “livré” mais non reçu, l’objectif est d’obtenir une preuve de remise fiable (signature, photo, point relais, horodatage) et d’ouvrir une enquête transporteur le plus vite possible.",
      pointsCles: [
        "Documentez tout : suivi, captures, messages, dates, adresse de livraison.",
        "Demandez la preuve de remise (signature/photo/point de dépôt).",
        "Exigez l’ouverture d’une enquête et une solution (renvoi ou remboursement).",
      ],
      etapes: [
        {
          titre: "Vérifier et documenter",
          details: [
            "Vérifiez l’adresse, la boîte aux lettres, le voisinage, le gardien, le point relais.",
            "Faites des captures du suivi et notez les dates/heures.",
          ],
        },
        {
          titre: "Demander la preuve de remise",
          details: [
            "Signature, photo, point de dépôt, horodatage, localisation.",
            "Demandez l’ouverture d’une enquête transporteur.",
          ],
        },
        {
          titre: "Obtenir une solution",
          details: [
            "Renvoi du colis si possible, sinon remboursement.",
            "Gardez une trace écrite de la demande (plateforme / email).",
          ],
        },
      ],
      exempleMessage:
        "Bonjour,\n\n" +
        "Ma commande [numéro] est indiquée comme livrée le [date] (suivi : [numéro]), mais je n’ai rien reçu.\n" +
        "Je vous demande :\n" +
        "- la preuve de remise (signature/photo/point de dépôt)\n" +
        "- l’ouverture d’une enquête transporteur\n" +
        "- une solution : renvoi ou remboursement\n\n" +
        "Merci pour votre retour sous [X] jours.\n\n" +
        "Cordialement,\n" +
        "[Nom]",
      erreursCourantes: [
        "Attendre trop longtemps avant d’ouvrir une enquête.",
        "Ne pas demander la preuve de remise.",
        "Ne pas conserver les captures et échanges.",
      ],
      aRetenir: [
        "Plus vous êtes rapide, plus l’enquête a des chances d’aboutir.",
        "La preuve de remise est centrale (signature/photo).",
      ],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },

  {
    id: "remboursement-annulation",
    titre: "Remboursement, rétractation, annulation : les bases",
    description:
      "Comprendre les différences et choisir la bonne démarche : rétractation, annulation, remboursement.",
    categorie: "Consommation",
    niveau: "Débutant",
    templateId: "demande-remboursement",
    prefill: {
      objet: "Demande de remboursement",
      faits:
        "J’ai effectué un achat le [date] (commande [numéro]) pour un montant de [montant].\n" +
        "À ce jour, [raison : produit non reçu / commande annulée / non-conformité], malgré mes relances.",
      demande:
        "Je demande le remboursement du montant payé, et la confirmation de la prise en compte de ma demande.",
      delai: "8",
    },
    contenu: {
      intro:
        "Selon la situation, vous n’utilisez pas les mêmes droits : la rétractation (achat à distance), l’annulation (avant expédition ou accord), ou la demande de remboursement (non-livraison, problème, annulation).",
      pointsCles: [
        "Rétractation : achat à distance, délai légal (selon le cadre applicable).",
        "Annulation : souvent avant expédition ou selon conditions du vendeur.",
        "Remboursement : non-livraison, annulation, non-conformité, etc.",
      ],
      etapes: [
        {
          titre: "Identifier votre cas",
          details: [
            "Achat en ligne récent ? → rétractation possible selon le cadre.",
            "Commande annulée ou non reçue ? → demande de remboursement.",
            "Erreur avant expédition ? → annulation (si accepté).",
          ],
        },
        {
          titre: "Rassembler vos éléments",
          details: ["Commande/facture, preuves de paiement, échanges, captures."],
        },
        {
          titre: "Envoyer une demande claire",
          details: [
            "Faits + demande + délai.",
            "Toujours conserver la trace écrite.",
          ],
        },
      ],
      exempleMessage:
        "Bonjour,\n\n" +
        "Je demande le remboursement de ma commande [numéro] (montant : [montant]) réalisée le [date].\n" +
        "Motif : [non-livraison / annulation / non-conformité].\n\n" +
        "Merci de confirmer la prise en compte et d’effectuer le remboursement sous [X] jours.\n\n" +
        "Cordialement,\n" +
        "[Nom]",
      erreursCourantes: [
        "Ne pas préciser la commande et le montant.",
        "Rester vague sur la demande (remboursement vs échange).",
      ],
      aRetenir: [
        "Toujours préciser : numéro de commande + montant + demande.",
        "Écrit + preuves = dossier solide.",
      ],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },

  {
    id: "facture-impayee",
    titre: "Facture impayée : relance, mise en demeure, suite possible",
    description:
      "Comment relancer proprement, formaliser une mise en demeure et préparer les suites en cas d’impayé.",
    categorie: "Paiement",
    niveau: "Débutant",
    templateId: "mise-en-demeure",
    prefill: {
      objet: "Mise en demeure — facture impayée",
      faits:
        "La facture [référence] d’un montant de [montant] émise le [date] est arrivée à échéance.\n" +
        "Malgré mes relances du [dates], aucun règlement n’a été reçu à ce jour.",
      demande:
        "Je vous mets en demeure de régler la somme due (facture [référence]) sous [X] jours, à compter de la réception du présent courrier.",
      delai: "8",
    },
    contenu: {
      intro:
        "En cas de facture impayée, il faut agir progressivement : relance amiable, puis formalisation (mise en demeure), et enfin suites si nécessaire.",
      pointsCles: [
        "Toujours rappeler la référence facture, la date, le montant et l’échéance.",
        "Conserver les relances (emails, messages, AR).",
        "Après mise en demeure, vous pourrez envisager les suites adaptées.",
      ],
      etapes: [
        {
          titre: "Relance amiable",
          details: [
            "Relance courte + rappel des infos essentielles.",
            "Fixez un délai simple de réponse/paiement.",
          ],
        },
        {
          titre: "Mise en demeure",
          details: [
            "Courrier plus formel avec délai et demande claire.",
            "Conservez la preuve d’envoi/réception.",
          ],
        },
        {
          titre: "Suite possible",
          details: ["Selon le contexte : médiation, procédure adaptée, etc."],
        },
      ],
      exempleMessage:
        "Bonjour,\n\n" +
        "Sauf erreur de ma part, la facture [référence] (montant : [montant]) arrivée à échéance le [date] reste impayée.\n" +
        "Merci de procéder au règlement sous [X] jours ou de me confirmer la date de paiement.\n\n" +
        "Cordialement,\n" +
        "[Nom]",
      erreursCourantes: [
        "Ne pas indiquer la référence et l’échéance.",
        "Menacer trop tôt sans dossier/proofs.",
      ],
      aRetenir: [
        "Rappel clair + délai + preuve = efficace.",
        "La mise en demeure sert à formaliser avant d’aller plus loin.",
      ],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },

  {
    id: "logement-travaux",
    titre: "Logement : travaux, défauts, litiges simples",
    description:
      "Que faire quand le logement a des problèmes (humidité, chauffage, etc.) et comment demander des travaux.",
    categorie: "Logement",
    niveau: "Débutant",
    templateId: "mise-en-demeure-bailleur-travaux",
    prefill: {
      objet: "Mise en demeure — travaux / problèmes dans le logement",
      faits:
        "Dans le logement situé [adresse], je constate les problèmes suivants : [décrire].\n" +
        "Ces désordres impactent l’usage normal du logement malgré mes signalements du [dates].",
      demande:
        "Je demande la réalisation des travaux nécessaires / la remise en état dans un délai raisonnable, avec confirmation écrite des dates d’intervention.",
      delai: "15",
    },
    contenu: {
      intro:
        "En cas de problèmes dans un logement (humidité, chauffage, électricité), l’objectif est de signaler, tracer, demander une intervention, et formaliser si nécessaire.",
      pointsCles: [
        "Photos + dates + échanges : indispensables.",
        "Décrire l’impact (santé, usage, sécurité).",
        "Demander une intervention + planning.",
      ],
      etapes: [
        {
          titre: "Documenter",
          details: [
            "Photos/vidéos datées, relevés, constats si possible.",
            "Historique des signalements (mail, SMS).",
          ],
        },
        {
          titre: "Demander une intervention",
          details: [
            "Demande claire + dates proposées.",
            "Relance si absence de réponse.",
          ],
        },
        {
          titre: "Formaliser",
          details: ["Mise en demeure si aucune action n’est entreprise."],
        },
      ],
      exempleMessage:
        "Bonjour,\n\n" +
        "Je vous informe des désordres suivants dans le logement [adresse] : [liste].\n" +
        "Je vous demande d’organiser une intervention et de me communiquer un planning sous [X] jours.\n\n" +
        "Cordialement,\n" +
        "[Nom]",
      erreursCourantes: ["Rester vague (sans photos/dates).", "Ne pas demander de planning."],
      aRetenir: ["Toujours tracer par écrit.", "Une demande claire + délai + preuves."],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },

  {
    id: "travail-ecrit",
    titre: "Travail : formaliser un écrit (demande / contestation)",
    description:
      "Comment rédiger un écrit simple et propre à son employeur : demande, contestation, documents, etc.",
    categorie: "Travail",
    niveau: "Débutant",
    templateId: "demande-documents-employeur",
    prefill: {
      objet: "Demande de documents à l’employeur",
      faits:
        "Je vous contacte concernant ma situation au sein de l’entreprise [nom].\n" +
        "J’ai besoin des documents suivants : [liste].",
      demande:
        "Je vous remercie de me transmettre ces documents par email ou courrier sous [X] jours.",
      delai: "8",
    },
    contenu: {
      intro:
        "Un écrit propre et factuel facilite la résolution : demande de documents, clarification, contestation. L’objectif : être clair, daté, et traçable.",
      pointsCles: [
        "Rester factuel, sans accusation inutile.",
        "Lister précisément ce que vous demandez.",
        "Conserver des preuves d’envoi/réception.",
      ],
      etapes: [
        {
          titre: "Préparer",
          details: ["Lister vos demandes.", "Rassembler vos infos (poste, dates)."],
        },
        {
          titre: "Rédiger",
          details: ["Contexte court + demande + délai.", "Ton neutre et professionnel."],
        },
        {
          titre: "Envoyer",
          details: ["Email + copie conservée.", "Relance si absence de réponse."],
        },
      ],
      exempleMessage:
        "Bonjour,\n\n" +
        "Je vous remercie de bien vouloir me transmettre : [liste des documents].\n" +
        "Merci de me faire un retour sous [X] jours.\n\n" +
        "Cordialement,\n" +
        "[Nom]",
      erreursCourantes: ["Demande trop vague.", "Aucun délai.", "Aucune trace conservée."],
      aRetenir: ["Clair + factuel + traçable.", "Toujours garder une copie."],
      disclaimer:
        "Lexoutil fournit des informations générales et des modèles. Ce service ne remplace pas un professionnel du droit.",
    },
  },
];
