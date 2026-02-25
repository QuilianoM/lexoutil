// lib/document-templates.ts
// Templates juridiques LEXOUTIL (industrialisation)

export type FieldType = "text" | "textarea" | "date_fr" | "number";

export type FieldSection =
  | "Vos informations"
  | "Destinataire"
  | "Commande et livraison"
  | "Produit et garantie"
  | "Paiement"
  | "Abonnement"
  | "Logement"
  | "Travail"
  | "Administration"
  | "Objet et contexte"
  | "Contenu";

export type DocumentField = {
  id: string;
  label: string;
  type: FieldType;
  section: FieldSection;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  maxLen?: number;
};

export type TemplateGenerate = (data: Record<string, string>) => string;

export type DocumentTemplate = {
  id: string;
  label: string;
  description: string;
  fields: DocumentField[];
  generate: TemplateGenerate;
};

function val(data: Record<string, string>, key: string) {
  return (data?.[key] || "").trim();
}

function optLine(label: string, v: string) {
  const x = (v || "").trim();
  return x ? `${label} : ${x}` : "";
}

function joinNonEmpty(lines: string[]) {
  return lines.filter(Boolean).join("\n");
}

/* =========================
   Champs COMMUNS
========================= */

const F_NOM: DocumentField = {
  id: "nom",
  label: "Votre nom",
  type: "text",
  section: "Vos informations",
  placeholder: "Ex. Jean Dupont",
  maxLen: 80,
  required: true,
};

const F_ADRESSE: DocumentField = {
  id: "adresse",
  label: "Votre adresse",
  type: "textarea",
  section: "Vos informations",
  placeholder: "Rue, code postal, ville",
  hint: "Multi-lignes possible",
  maxLen: 180,
  required: true,
};

const F_VILLE: DocumentField = {
  id: "ville",
  label: "Ville",
  type: "text",
  section: "Vos informations",
  placeholder: "Ex. Lyon",
  maxLen: 80,
  required: true,
};

const F_DATE: DocumentField = {
  id: "date",
  label: "Date",
  type: "date_fr",
  section: "Vos informations",
  placeholder: "jj/mm/aaaa",
  hint: "Ex : 12/03/2026",
  maxLen: 10,
  required: true,
};

const F_DESTINATAIRE: DocumentField = {
  id: "destinataire",
  label: "Destinataire",
  type: "text",
  section: "Destinataire",
  placeholder: "Nom / entreprise / service",
  maxLen: 120,
  required: true,
};

const F_ADRESSE_DEST: DocumentField = {
  id: "adresseDestinataire",
  label: "Adresse destinataire",
  type: "textarea",
  section: "Destinataire",
  placeholder: "Adresse complète (optionnel)",
  maxLen: 220,
  required: false,
};

const F_OBJET: DocumentField = {
  id: "objet",
  label: "Objet",
  type: "text",
  section: "Objet et contexte",
  placeholder: "Ex. Mise en demeure — livraison non reçue",
  maxLen: 160,
  required: true,
};

const F_FAITS: DocumentField = {
  id: "faits",
  label: "Faits",
  type: "textarea",
  section: "Contenu",
  placeholder: "Décrivez les faits (dates, échanges, preuves…)",
  hint: "Soyez clair et chronologique",
  maxLen: 2000,
  required: true,
};

const F_DEMANDE: DocumentField = {
  id: "demande",
  label: "Demande",
  type: "textarea",
  section: "Contenu",
  placeholder: "Ce que vous demandez exactement (solution attendue)",
  maxLen: 2000,
  required: true,
};

const F_DELAI: DocumentField = {
  id: "delai",
  label: "Délai (jours)",
  type: "number",
  section: "Contenu",
  placeholder: "Ex. 8",
  hint: "Optionnel (ex : 8 ou 15 jours)",
  maxLen: 4,
  required: false,
};

function commonBaseFields(extra?: DocumentField[]) {
  return [
    F_NOM,
    F_ADRESSE,
    F_VILLE,
    F_DATE,
    F_DESTINATAIRE,
    F_ADRESSE_DEST,
    ...(extra || []),
    F_OBJET,
    F_FAITS,
    F_DEMANDE,
    F_DELAI,
  ];
}

/* =========================
   Champs SPÉCIFIQUES
========================= */

// Commande & livraison
const F_PLATEFORME: DocumentField = {
  id: "plateforme",
  label: "Plateforme",
  type: "text",
  section: "Commande et livraison",
  placeholder: "Ex. Leboncoin / Amazon / Shopify",
  maxLen: 60,
  required: true,
};

const F_NUM_COMMANDE: DocumentField = {
  id: "numeroCommande",
  label: "Numéro de commande",
  type: "text",
  section: "Commande et livraison",
  placeholder: "Ex. CMD-123456 / #A1B2C3",
  maxLen: 80,
  required: true,
};

const F_TRANSPORTEUR: DocumentField = {
  id: "transporteur",
  label: "Transporteur",
  type: "text",
  section: "Commande et livraison",
  placeholder: "Ex. Colissimo / Chronopost",
  maxLen: 80,
  required: false,
};

const F_NUM_SUIVI: DocumentField = {
  id: "numeroSuivi",
  label: "Numéro de suivi",
  type: "text",
  section: "Commande et livraison",
  placeholder: "Ex. 6A12345678901",
  maxLen: 80,
  required: false,
};

const F_DATE_COMMANDE: DocumentField = {
  id: "dateCommande",
  label: "Date de commande",
  type: "date_fr",
  section: "Commande et livraison",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

const F_DATE_LIV_PREVUE: DocumentField = {
  id: "dateLivraisonPrevue",
  label: "Date de livraison prévue",
  type: "date_fr",
  section: "Commande et livraison",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

const F_MONTANT: DocumentField = {
  id: "montant",
  label: "Montant (TTC)",
  type: "text",
  section: "Commande et livraison",
  placeholder: "Ex. 499,99 €",
  maxLen: 40,
  required: true,
};

// Produit & garantie
const F_PRODUIT: DocumentField = {
  id: "produit",
  label: "Produit / Service",
  type: "text",
  section: "Produit et garantie",
  placeholder: "Ex. Ordinateur portable / smartphone / prestation",
  maxLen: 120,
  required: true,
};

const F_DATE_RECEPTION: DocumentField = {
  id: "dateReception",
  label: "Date de réception",
  type: "date_fr",
  section: "Produit et garantie",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

const F_DEFAUT: DocumentField = {
  id: "defaut",
  label: "Problème constaté",
  type: "textarea",
  section: "Produit et garantie",
  placeholder: "Décrivez le défaut / non-conformité (symptômes, impacts, preuves)",
  maxLen: 2000,
  required: true,
};

// Paiement
const F_DATE_PAIEMENT: DocumentField = {
  id: "datePaiement",
  label: "Date du paiement",
  type: "date_fr",
  section: "Paiement",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

const F_MOYEN_PAIEMENT: DocumentField = {
  id: "moyenPaiement",
  label: "Moyen de paiement",
  type: "text",
  section: "Paiement",
  placeholder: "Ex. CB / PayPal / virement",
  maxLen: 60,
  required: false,
};

const F_REFERENCE_PAIEMENT: DocumentField = {
  id: "referencePaiement",
  label: "Référence paiement",
  type: "text",
  section: "Paiement",
  placeholder: "Ex. ID transaction / référence",
  maxLen: 80,
  required: false,
};

// Abonnement
const F_SERVICE: DocumentField = {
  id: "service",
  label: "Service / Abonnement",
  type: "text",
  section: "Abonnement",
  placeholder: "Ex. abonnement streaming / assurance / box",
  maxLen: 120,
  required: true,
};

const F_IDENTIFIANT: DocumentField = {
  id: "identifiant",
  label: "Identifiant client",
  type: "text",
  section: "Abonnement",
  placeholder: "Ex. N° client / email",
  maxLen: 120,
  required: false,
};

const F_DATE_DEMANDE: DocumentField = {
  id: "dateDemande",
  label: "Date de la demande",
  type: "date_fr",
  section: "Abonnement",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

// Logement
const F_ADRESSE_LOGEMENT: DocumentField = {
  id: "adresseLogement",
  label: "Adresse du logement",
  type: "textarea",
  section: "Logement",
  placeholder: "Adresse complète",
  maxLen: 220,
  required: true,
};

const F_BAILLEUR: DocumentField = {
  id: "bailleur",
  label: "Bailleur / Agence",
  type: "text",
  section: "Logement",
  placeholder: "Nom du bailleur / agence",
  maxLen: 120,
  required: true,
};

const F_DATE_SORTIE: DocumentField = {
  id: "dateSortie",
  label: "Date de sortie (état des lieux)",
  type: "date_fr",
  section: "Logement",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

const F_DEPOT: DocumentField = {
  id: "depotGarantie",
  label: "Montant du dépôt de garantie",
  type: "text",
  section: "Logement",
  placeholder: "Ex. 900 €",
  maxLen: 40,
  required: false,
};

const F_TRAVAUX: DocumentField = {
  id: "travaux",
  label: "Travaux / problèmes",
  type: "textarea",
  section: "Logement",
  placeholder: "Décrivez les désordres (humidité, chauffage, électricité, etc.)",
  maxLen: 2000,
  required: true,
};

// Travail
const F_EMPLOYEUR: DocumentField = {
  id: "employeur",
  label: "Employeur",
  type: "text",
  section: "Travail",
  placeholder: "Nom de l'entreprise",
  maxLen: 120,
  required: true,
};

const F_POSTE: DocumentField = {
  id: "poste",
  label: "Poste",
  type: "text",
  section: "Travail",
  placeholder: "Ex. Vendeur / Assistant / Gestionnaire",
  maxLen: 120,
  required: false,
};

const F_DATE_FIN: DocumentField = {
  id: "dateFinContrat",
  label: "Date de fin de contrat",
  type: "date_fr",
  section: "Travail",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

// Administration
const F_ORGANISME: DocumentField = {
  id: "organisme",
  label: "Organisme / Administration",
  type: "text",
  section: "Administration",
  placeholder: "Ex. CAF / Pôle Emploi / Impôts",
  maxLen: 120,
  required: true,
};

const F_REFERENCE_DOSSIER: DocumentField = {
  id: "referenceDossier",
  label: "Référence dossier / décision",
  type: "text",
  section: "Administration",
  placeholder: "N° dossier, référence courrier…",
  maxLen: 120,
  required: false,
};

const F_DATE_DECISION: DocumentField = {
  id: "dateDecision",
  label: "Date de la décision contestée",
  type: "date_fr",
  section: "Administration",
  placeholder: "jj/mm/aaaa",
  maxLen: 10,
  required: false,
};

/* =========================
   TEMPLATES (15 essentiels)
========================= */

export const documentTemplates: DocumentTemplate[] = [
  // 1) Mise en demeure (générique)
  {
    id: "mise-en-demeure",
    label: "Mise en demeure",
    description: "Réclamer l’exécution d’une obligation (paiement, livraison, prestation…).",
    fields: commonBaseFields(),
    generate: (data) => {
      const nom = val(data, "nom");
      const faits = val(data, "faits");
      const demande = val(data, "demande");
      const delai = val(data, "delai");

      return `Madame, Monsieur,

Je vous adresse la présente mise en demeure concernant les faits suivants :

${faits}

En conséquence, je vous demande de bien vouloir :

${demande}

À défaut de réponse ou d’exécution dans un délai de ${delai || "X"} jours à compter de la réception de ce courrier, je me verrai contraint(e) d’engager les démarches nécessaires.

Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 2) Litige livraison — colis non reçu
  {
    id: "litige-livraison-colis-non-recu",
    label: "Litige livraison — colis non reçu",
    description:
      "Commande indiquée « livrée » ou en retard : demander enquête, preuve de remise, et solution (renvoi ou remboursement).",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_TRANSPORTEUR, F_NUM_SUIVI, F_DATE_COMMANDE, F_DATE_LIV_PREVUE, F_MONTANT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const plateforme = val(data, "plateforme");
      const numeroCommande = val(data, "numeroCommande");
      const montant = val(data, "montant");

      const bloc = joinNonEmpty([
        optLine("Plateforme", plateforme),
        optLine("Commande", numeroCommande),
        optLine("Montant", montant),
        optLine("Transporteur", val(data, "transporteur")),
        optLine("N° de suivi", val(data, "numeroSuivi")),
        optLine("Date de commande", val(data, "dateCommande")),
        optLine("Livraison prévue", val(data, "dateLivraisonPrevue")),
      ]);

      const faits = val(data, "faits");
      const demande = val(data, "demande");
      const delai = val(data, "delai");

      return `Madame, Monsieur,

Je vous contacte concernant un litige de livraison relatif à la commande suivante :

${bloc || "— Informations commande / livraison —"}

Faits :
${faits}

Demande :
${demande}

Je vous remercie de traiter cette demande au plus tard sous ${delai || "X"} jours à compter de la réception de ce courrier, en me communiquant notamment :
- l’ouverture d’une enquête transporteur si nécessaire,
- la preuve de remise (signature / point relais / horodatage / lieu de dépôt),
- la solution retenue (renvoi ou remboursement).

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 3) Demande de remboursement
  {
    id: "demande-remboursement",
    label: "Demande de remboursement",
    description: "Demander un remboursement après achat non conforme / non livré / annulé.",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_MONTANT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Plateforme", val(data, "plateforme")),
        optLine("Commande", val(data, "numeroCommande")),
        optLine("Montant", val(data, "montant")),
      ]);

      return `Madame, Monsieur,

Je vous contacte afin de solliciter un remboursement concernant la commande suivante :

${bloc || "— Informations commande —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de traiter cette demande dans un délai de ${val(data, "delai") || "X"} jours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 4) Rétractation achat en ligne (14 jours)
  {
    id: "retractation-achat-en-ligne",
    label: "Rétractation achat en ligne (14 jours)",
    description: "Exercer le droit de rétractation pour un achat à distance.",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_DATE_COMMANDE, F_MONTANT, F_PRODUIT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Plateforme", val(data, "plateforme")),
        optLine("Commande", val(data, "numeroCommande")),
        optLine("Date de commande", val(data, "dateCommande")),
        optLine("Produit", val(data, "produit")),
        optLine("Montant", val(data, "montant")),
      ]);

      return `Madame, Monsieur,

Par la présente, j’exerce mon droit de rétractation concernant l’achat à distance suivant :

${bloc || "— Informations achat —"}

Faits :
${val(data, "faits")}

Demande :
Je vous remercie de me confirmer la prise en compte de ma rétractation et de procéder au remboursement dans les délais légaux, selon le moyen de paiement utilisé.

Merci également de m’indiquer la procédure de retour (adresse, modalités, preuve d’envoi à conserver).

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 5) Annulation de commande
  {
    id: "annulation-commande",
    label: "Annulation de commande",
    description: "Annuler une commande (avant expédition / erreur / changement) et demander confirmation.",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_DATE_COMMANDE, F_MONTANT, F_PRODUIT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Plateforme", val(data, "plateforme")),
        optLine("Commande", val(data, "numeroCommande")),
        optLine("Date de commande", val(data, "dateCommande")),
        optLine("Produit", val(data, "produit")),
        optLine("Montant", val(data, "montant")),
      ]);

      return `Madame, Monsieur,

Je vous demande l’annulation de la commande suivante :

${bloc || "— Informations commande —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de me confirmer l’annulation et, le cas échéant, le remboursement correspondant.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 6) Garantie légale de conformité
  {
    id: "garantie-legale-conformite",
    label: "Garantie légale de conformité",
    description: "Demander réparation/remplacement (puis remboursement si impossible) pour non-conformité.",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_PRODUIT, F_DATE_RECEPTION, F_DEFAUT, F_MONTANT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Plateforme", val(data, "plateforme")),
        optLine("Commande", val(data, "numeroCommande")),
        optLine("Produit", val(data, "produit")),
        optLine("Date de réception", val(data, "dateReception")),
        optLine("Montant", val(data, "montant")),
      ]);

      return `Madame, Monsieur,

Je vous contacte au titre de la garantie légale de conformité concernant :

${bloc || "— Informations produit/commande —"}

Problème constaté :
${val(data, "defaut")}

Faits :
${val(data, "faits")}

Demande :
Je vous demande la mise en conformité du bien (réparation ou remplacement). À défaut de solution dans un délai raisonnable, je solliciterai une réduction du prix ou le remboursement, selon la situation.

Veuillez me préciser la procédure (retour, prise en charge, délais) et me confirmer la prise en compte de ma demande.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 7) Vice caché
  {
    id: "vice-cache",
    label: "Vice caché (vente)",
    description: "Demander résolution de vente (annulation) ou réduction du prix pour vice caché.",
    fields: commonBaseFields([F_PLATEFORME, F_NUM_COMMANDE, F_PRODUIT, F_DATE_RECEPTION, F_DEFAUT, F_MONTANT]),
    generate: (data) => {
      const nom = val(data, "nom");

      const bloc = joinNonEmpty([
        optLine("Plateforme", val(data, "plateforme")),
        optLine("Commande", val(data, "numeroCommande")),
        optLine("Produit", val(data, "produit")),
        optLine("Date de réception", val(data, "dateReception")),
        optLine("Montant", val(data, "montant")),
      ]);

      return `Madame, Monsieur,

Je vous informe avoir constaté un défaut susceptible de constituer un vice caché concernant :

${bloc || "— Informations produit/vente —"}

Problème constaté :
${val(data, "defaut")}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de me faire un retour sous ${val(data, "delai") || "X"} jours, et de m’indiquer la procédure de traitement (expertise, retour, solution).

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 8) Contestation prélèvement / paiement non autorisé
  {
    id: "contestation-prelevement",
    label: "Contestation prélèvement / paiement non autorisé",
    description: "Contester un paiement/prélèvement, demander remboursement et justificatifs.",
    fields: commonBaseFields([F_MONTANT, F_DATE_PAIEMENT, F_MOYEN_PAIEMENT, F_REFERENCE_PAIEMENT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Montant", val(data, "montant")),
        optLine("Date du paiement", val(data, "datePaiement")),
        optLine("Moyen de paiement", val(data, "moyenPaiement")),
        optLine("Référence", val(data, "referencePaiement")),
      ]);

      return `Madame, Monsieur,

Je conteste l’opération suivante :

${bloc || "— Informations paiement —"}

Faits :
${val(data, "faits")}

Demande :
Je vous demande de me communiquer les justificatifs liés à cette opération et de procéder au remboursement si l’opération n’est pas autorisée / n’est pas justifiée.

Merci de me répondre sous ${val(data, "delai") || "X"} jours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 9) Résiliation abonnement / service
  {
    id: "resiliation-abonnement",
    label: "Résiliation abonnement / service",
    description: "Demander la résiliation (et confirmation) d’un abonnement/service.",
    fields: commonBaseFields([F_SERVICE, F_IDENTIFIANT, F_DATE_DEMANDE]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Service", val(data, "service")),
        optLine("Identifiant", val(data, "identifiant")),
        optLine("Date de la demande", val(data, "dateDemande")),
      ]);

      return `Madame, Monsieur,

Je vous demande la résiliation du service / abonnement suivant :

${bloc || "— Informations abonnement —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de me confirmer la date effective de résiliation et l’absence de prélèvements futurs.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 10) Restitution dépôt de garantie (locataire)
  {
    id: "restitution-depot-garantie",
    label: "Restitution dépôt de garantie",
    description: "Réclamer la restitution du dépôt de garantie après sortie (locataire).",
    fields: commonBaseFields([F_BAILLEUR, F_ADRESSE_LOGEMENT, F_DATE_SORTIE, F_DEPOT]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Bailleur / agence", val(data, "bailleur")),
        optLine("Logement", val(data, "adresseLogement")),
        optLine("Date de sortie", val(data, "dateSortie")),
        optLine("Dépôt de garantie", val(data, "depotGarantie")),
      ]);

      return `Madame, Monsieur,

Je vous contacte afin de solliciter la restitution de mon dépôt de garantie relatif au logement suivant :

${bloc || "— Informations logement —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de procéder au règlement dans les délais applicables, et de me communiquer le détail des retenues éventuelles (justificatifs).

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 11) Mise en demeure bailleur (travaux / insalubrité)
  {
    id: "mise-en-demeure-bailleur-travaux",
    label: "Mise en demeure bailleur (travaux)",
    description: "Demander des travaux / mise en conformité du logement (humidité, chauffage, etc.).",
    fields: commonBaseFields([F_BAILLEUR, F_ADRESSE_LOGEMENT, F_TRAVAUX]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Bailleur / agence", val(data, "bailleur")),
        optLine("Logement", val(data, "adresseLogement")),
      ]);

      return `Madame, Monsieur,

Je vous mets en demeure d’intervenir concernant le logement suivant :

${bloc || "— Informations logement —"}

Travaux / problèmes :
${val(data, "travaux")}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

À défaut d’intervention sous ${val(data, "delai") || "X"} jours, je me réserve la possibilité d’engager les démarches nécessaires.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 12) Nuisances de voisinage (mise en demeure)
  {
    id: "nuisances-voisinage",
    label: "Nuisances de voisinage (mise en demeure)",
    description: "Demander la cessation de nuisances (bruit, odeurs, troubles).",
    fields: commonBaseFields(),
    generate: (data) => {
      const nom = val(data, "nom");
      return `Madame, Monsieur,

Je vous informe subir des nuisances récurrentes dont l’origine semble provenir de votre fait / de votre logement.

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de faire le nécessaire sous ${val(data, "delai") || "X"} jours. À défaut, je me réserve la possibilité d’engager les démarches utiles.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 13) Demande documents employeur
  {
    id: "demande-documents-employeur",
    label: "Demande documents employeur",
    description: "Demander attestation, certificats, bulletins, solde de tout compte, etc.",
    fields: commonBaseFields([F_EMPLOYEUR, F_POSTE, F_DATE_FIN]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Employeur", val(data, "employeur")),
        optLine("Poste", val(data, "poste")),
        optLine("Date de fin de contrat", val(data, "dateFinContrat")),
      ]);

      return `Madame, Monsieur,

Je vous contacte afin de solliciter la remise / l’envoi des documents suivants relatifs à ma situation :

${bloc || "— Informations —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de me répondre sous ${val(data, "delai") || "X"} jours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 14) Recours gracieux (administration)
  {
    id: "recours-gracieux",
    label: "Recours gracieux (administration)",
    description: "Contester une décision administrative par recours gracieux.",
    fields: commonBaseFields([F_ORGANISME, F_REFERENCE_DOSSIER, F_DATE_DECISION]),
    generate: (data) => {
      const nom = val(data, "nom");
      const bloc = joinNonEmpty([
        optLine("Organisme", val(data, "organisme")),
        optLine("Référence", val(data, "referenceDossier")),
        optLine("Date décision", val(data, "dateDecision")),
      ]);

      return `Madame, Monsieur,

Je forme un recours gracieux à l’encontre de la décision suivante :

${bloc || "— Informations décision —"}

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de réexaminer ma situation et de me notifier votre décision. Merci de me répondre sous ${val(data, "delai") || "X"} jours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },

  // 15) Réclamation service / prestation (générique)
  {
    id: "reclamation-service",
    label: "Réclamation (service / prestation)",
    description: "Signaler une prestation non conforme et demander une solution.",
    fields: commonBaseFields(),
    generate: (data) => {
      const nom = val(data, "nom");
      return `Madame, Monsieur,

Je vous adresse la présente réclamation au sujet du service / de la prestation suivante :

Faits :
${val(data, "faits")}

Demande :
${val(data, "demande")}

Je vous remercie de me répondre sous ${val(data, "delai") || "X"} jours.

Veuillez agréer, Madame, Monsieur, mes salutations distinguées.

Signature :
${nom}`;
    },
  },
];
