// Nettoyage & sécurité des champs (Étape 8)
// Objectif : éviter HTML, caractères invisibles, et limiter la taille.

export type SanitizeOptions = {
  maxLen?: number;
  multiline?: boolean;
};

function stripHtml(input: string) {
  // supprime les balises HTML simples
  return input.replace(/<[^>]*>/g, "");
}

function stripControlChars(input: string) {
  // supprime caractères de contrôle (sauf \n et \t si multiline)
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

function collapseSpaces(input: string) {
  // réduit les espaces multiples (sans casser les retours à la ligne)
  return input.replace(/[ \t]{2,}/g, " ");
}

export function sanitizeText(value: string, options?: SanitizeOptions) {
  const maxLen = options?.maxLen ?? 300;
  const multiline = options?.multiline ?? false;

  let v = String(value ?? "");

  v = v.replace(/\r\n/g, "\n"); // uniformise
  v = stripControlChars(v);
  v = stripHtml(v);

  if (!multiline) {
    v = v.replace(/\n+/g, " "); // pas de multi-lignes
  }

  v = collapseSpaces(v).trim();

  if (v.length > maxLen) {
    v = v.slice(0, maxLen).trim();
  }

  return v;
}

export function sanitizeEmail(value: string) {
  // nettoyage basique + minuscule
  const v = sanitizeText(value, { maxLen: 254, multiline: false }).toLowerCase();
  return v;
}

export function isEmailOk(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
