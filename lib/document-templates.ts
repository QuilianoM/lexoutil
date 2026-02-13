type GenerateArgs = {
  nom: string;
  adresse: string;
  ville: string;
  date: string;
  destinataire: string;
  adresseDestinataire: string;
  objet: string;
  faits: string;
  demande: string;
  delai: string;
};

export const documentTemplates = [
  {
    id: "mise-en-demeure",
    label: "Mise en demeure",
    description:
      "Réclamer l’exécution d’une obligation (paiement, livraison, etc.).",

    generate: ({ faits, demande, delai, nom }: GenerateArgs) => {
      return `Madame, Monsieur,

Je me permets de vous adresser la présente mise en demeure concernant les faits suivants :

${faits || "— Décrivez les faits de manière chronologique —"}

En conséquence, je vous demande de bien vouloir :

${demande || "— Indiquez précisément ce que vous demandez —"}

À défaut de réponse dans un délai de ${delai || "X"} jours à compter de la réception de ce courrier, je me verrai contraint(e) d’engager les démarches nécessaires.

Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

Signature :
${nom || "[Votre nom]"}`;
    },
  },
];
