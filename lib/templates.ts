export type DocTemplateId =
  | "mise-en-demeure-simple"
  | "demande-remboursement"
  | "annulation-prestation";

export type DocField = {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "date";
  required?: boolean;
};

export type DocTemplate = {
  id: DocTemplateId;
  title: string;
  subtitle: string;
  fields: DocField[];
  render: (data: Record<string, string>) => string;
};

function v(data: Record<string, string>, key: string) {
  return (data[key] || "").trim();
}

export const templates: DocTemplate[] = [
  {
    id: "mise-en-demeure-simple",
    title: "Mise en demeure (simple)",
    subtitle: "Réclamer l’exécution d’une obligation (paiement, livraison, etc.)",
    fields: [
      { name: "sender_name", label: "Votre nom", required: true },
      { name: "sender_address", label: "Votre adresse", type: "textarea", required: true },
      { name: "recipient_name", label: "Destinataire (nom / société)", required: true },
      { name: "recipient_address", label: "Adresse du destinataire", type: "textarea", required: true },
      { name: "subject", label: "Objet", placeholder: "Mise en demeure – [ex: livraison / paiement]" , required: true},
      { name: "facts", label: "Faits (résumé chronologique)", type: "textarea", required: true },
      { name: "request", label: "Ce que vous demandez", type: "textarea", required: true },
      { name: "deadline_days", label: "Délai (en jours)", placeholder: "8", required: true },
      { name: "city", label: "Ville", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
    render: (data) => {
      const deadline = v(data, "deadline_days") || "8";
      return `
${v(data, "sender_name")}
${v(data, "sender_address")}

À l’attention de :
${v(data, "recipient_name")}
${v(data, "recipient_address")}

${v(data, "city")}, le ${v(data, "date")}

Objet : ${v(data, "subject")}

Madame, Monsieur,

Je vous contacte au sujet des faits suivants :
${v(data, "facts")}

Par la présente, je vous mets en demeure de :
${v(data, "request")}

À défaut d’exécution sous ${deadline} jours à compter de la réception de ce courrier, je me réserve la possibilité d’engager toute démarche utile afin de faire valoir mes droits.

Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.

Signature :
${v(data, "sender_name")}
      `.trim();
    },
  },
  {
    id: "demande-remboursement",
    title: "Demande de remboursement",
    subtitle: "Demander un remboursement (achat, commande, service)",
    fields: [
      { name: "sender_name", label: "Votre nom", required: true },
      { name: "sender_address", label: "Votre adresse", type: "textarea", required: true },
      { name: "recipient_name", label: "Destinataire (nom / société)", required: true },
      { name: "recipient_address", label: "Adresse du destinataire", type: "textarea", required: true },
      { name: "order_ref", label: "Référence (commande / facture)", required: true },
      { name: "amount", label: "Montant", placeholder: "59,99 €", required: true },
      { name: "facts", label: "Motif / contexte", type: "textarea", required: true },
      { name: "city", label: "Ville", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
    render: (data) =>
      `
${v(data, "sender_name")}
${v(data, "sender_address")}

À l’attention de :
${v(data, "recipient_name")}
${v(data, "recipient_address")}

${v(data, "city")}, le ${v(data, "date")}

Objet : Demande de remboursement – Réf. ${v(data, "order_ref")}

Madame, Monsieur,

Je vous contacte concernant la référence ${v(data, "order_ref")} pour un montant de ${v(
        data,
        "amount"
      )}.

Motif de ma demande :
${v(data, "facts")}

Je vous remercie de bien vouloir procéder au remboursement dans les meilleurs délais et de me confirmer la prise en compte de cette demande.

Cordialement,

Signature :
${v(data, "sender_name")}
      `.trim(),
  },
  {
    id: "annulation-prestation",
    title: "Annulation de prestation",
    subtitle: "Notifier l’annulation / résiliation d’une prestation",
    fields: [
      { name: "sender_name", label: "Votre nom", required: true },
      { name: "sender_address", label: "Votre adresse", type: "textarea", required: true },
      { name: "recipient_name", label: "Destinataire (nom / société)", required: true },
      { name: "recipient_address", label: "Adresse du destinataire", type: "textarea", required: true },
      { name: "service_desc", label: "Prestation concernée", type: "textarea", required: true },
      { name: "reason", label: "Motif (optionnel)", type: "textarea" },
      { name: "city", label: "Ville", required: true },
      { name: "date", label: "Date", type: "date", required: true },
    ],
    render: (data) =>
      `
${v(data, "sender_name")}
${v(data, "sender_address")}

À l’attention de :
${v(data, "recipient_name")}
${v(data, "recipient_address")}

${v(data, "city")}, le ${v(data, "date")}

Objet : Annulation / résiliation de prestation

Madame, Monsieur,

Je vous informe par la présente de mon souhait d’annuler / résilier la prestation suivante :
${v(data, "service_desc")}

${v(data, "reason") ? `Motif :\n${v(data, "reason")}\n` : ""}

Je vous remercie de me confirmer la bonne prise en compte de cette demande.

Cordialement,

Signature :
${v(data, "sender_name")}
      `.trim(),
  },
];
