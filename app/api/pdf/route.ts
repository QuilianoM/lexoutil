import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { documentTemplates, type DocumentField } from "@/lib/document-templates";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";

/* =========================
   RATE LIMIT (mémoire)
========================= */

type RateBucket = { count: number; resetAt: number };
const GLOBAL_KEY = "__LEXOUTIL_PDF_RATE__";

function getRateMap(): Map<string, RateBucket> {
  const g = globalThis as any;
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Map<string, RateBucket>();
  return g[GLOBAL_KEY] as Map<string, RateBucket>;
}

function getClientIp(req: NextRequest) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function getFingerprint(req: NextRequest) {
  const ip = getClientIp(req);
  const ua = (req.headers.get("user-agent") || "unknown").slice(0, 120);
  return `${ip}::${ua}`;
}

function rateLimit(req: NextRequest, windowMs: number, max: number) {
  const now = Date.now();
  const map = getRateMap();
  const key = getFingerprint(req) + `::${windowMs}::${max}`;

  const b = map.get(key);
  if (!b || now > b.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, resetAt: now + windowMs };
  }
  if (b.count >= max) return { ok: false, resetAt: b.resetAt };
  b.count += 1;
  map.set(key, b);
  return { ok: true, resetAt: b.resetAt };
}

function reject429(resetAt: number) {
  const retrySec = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { ok: false, error: "Trop de demandes. Réessayez dans quelques instants." },
    { status: 429, headers: { "Retry-After": String(retrySec), "Cache-Control": "no-store" } }
  );
}

/* =========================
   Helpers validation FR
========================= */

function isDateFRStrict(value: string) {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (yyyy < 1900 || yyyy > 2100) return false;
  if (mm < 1 || mm > 12) return false;

  const isLeap = (yyyy % 4 === 0 && yyyy % 100 !== 0) || yyyy % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDay = daysInMonth[mm - 1];

  return dd >= 1 && dd <= maxDay;
}

function isPositiveIntInRange(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function todayFR() {
  return new Date().toLocaleDateString("fr-FR");
}

/* =========================
   SANITATION AUTOMATIQUE
   (allowlist = template.fields)
========================= */

function sanitizeByField(field: DocumentField, raw: unknown): { value: string; error?: string } {
  const maxLen = typeof field.maxLen === "number" ? field.maxLen : 2000;
  const multiline = field.type === "textarea";

  let value = sanitizeText(safeString(raw), { maxLen, multiline });

  // Validations type
  if (field.type === "date_fr") {
    value = value.trim();
    if (value && !isDateFRStrict(value)) return { value, error: `Date invalide pour "${field.label}"` };
  }

  if (field.type === "number") {
    value = value.trim();
    if (value && !isPositiveIntInRange(value, 0, 365)) return { value, error: `Nombre invalide pour "${field.label}"` };
  }

  if (field.required) {
    if (!value.trim()) return { value, error: `Champ obligatoire manquant : "${field.label}"` };
  }

  return { value };
}

function buildFilename(base: string) {
  const cleaned = (base || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 90)
    .toLowerCase();
  return (cleaned || "document-juridique") + ".pdf";
}

/* =========================
   ROUTE POST
========================= */

export async function POST(req: NextRequest) {
  // 3 req / 15s + 10 req / 5min
  const burst = rateLimit(req, 15_000, 3);
  if (!burst.ok) return reject429(burst.resetAt);

  const long = rateLimit(req, 5 * 60_000, 10);
  if (!long.ok) return reject429(long.resetAt);

  // Lecture body
  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  if (!raw) return NextResponse.json({ ok: false, error: "Requête vide." }, { status: 400 });
  if (raw.length > 80_000) return NextResponse.json({ ok: false, error: "Requête trop volumineuse." }, { status: 413 });

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide." }, { status: 400 });
  }

  const templateId = sanitizeText(safeString(payload?.templateId), { maxLen: 120, multiline: false });
  const template = documentTemplates.find((t) => t.id === templateId);

  if (!template) {
    return NextResponse.json({ ok: false, error: "Modèle introuvable." }, { status: 400 });
  }

  const incoming = (payload?.data || {}) as Record<string, unknown>;

  // ✅ allowlist dynamique : template.fields
  const out: Record<string, string> = {};
  for (const field of template.fields) {
    const res = sanitizeByField(field, incoming[field.id]);
    if (res.error) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    out[field.id] = res.value;
  }

  // Date fallback si champ date existe mais vide
  if ("date" in out && !out.date) out.date = todayFR();

  // Génération du texte
  const generatedText = template.generate(out);

  // Header blocks (si présents)
  const nom = out.nom || "";
  const adresse = out.adresse || "";
  const ville = out.ville || "";
  const date = out.date || todayFR();
  const destinataire = out.destinataire || "";
  const adresseDestinataire = out.adresseDestinataire || "";
  const objet = out.objet || template.label || "Document juridique";

  const senderBlock = [nom, adresse].filter(Boolean).join("\n");
  const recipientBlock = [destinataire, adresseDestinataire].filter(Boolean).join("\n");
  const placeDate = ville ? `${ville}, le ${date}` : `Le ${date}`;

  const pdfBytes = await generateLegalPdf({
    title: objet,
    placeDate,
    sender: senderBlock,
    recipient: recipientBlock,
    subject: objet,
    content: generatedText,
    signature: nom,
  });

  const body = new Uint8Array(pdfBytes);
  const filename = buildFilename(objet);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

/* ============================
   PDF A4 (simple, lisible)
============================ */

async function generateLegalPdf(data: {
  title: string;
  placeDate: string;
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  signature: string;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4

  const font = await pdf.embedFont(StandardFonts.TimesRoman);
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  const margin = 60;
  const maxWidth = 595.28 - margin * 2;

  let y = 780;
  const lineHeight = 18;

  const wrapLines = (text: string, maxChars = 95) => {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (test.length > maxChars) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };

  const drawLine = (text: string, size = 12, isBold = false) => {
    if (y < 80) return;
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0, 0, 0),
      maxWidth,
    });
    y -= lineHeight;
  };

  const drawParagraph = (text: string, size = 12) => {
    const paragraphs = String(text || "").split("\n");
    for (const p of paragraphs) {
      const lines = wrapLines(p);
      for (const l of lines) drawLine(l, size);
      y -= 10;
      if (y < 80) break;
    }
  };

  // Titre
  page.drawText(String(data.title || "Document juridique"), {
    x: margin,
    y,
    size: 16,
    font: bold,
    color: rgb(0, 0, 0),
    maxWidth,
  });
  y -= 32;

  if (data.placeDate) {
    drawParagraph(data.placeDate);
    drawParagraph("");
  }

  if (data.sender) {
    drawLine("Expéditeur :", 12, true);
    drawParagraph(data.sender);
    drawParagraph("");
  }

  if (data.recipient) {
    drawLine("Destinataire :", 12, true);
    drawParagraph(data.recipient);
    drawParagraph("");
  }

  if (data.subject) {
    drawLine("Objet :", 12, true);
    drawParagraph(data.subject);
    drawParagraph("");
  }

  drawParagraph(data.content || "");

  drawParagraph("");
  drawParagraph("Cordialement,");
  drawParagraph("");
  drawParagraph(data.signature || "");

  page.drawText("Lexoutil — assistance juridique (pas de conseil personnalisé)", {
    x: margin,
    y: 40,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  return await pdf.save();
}
