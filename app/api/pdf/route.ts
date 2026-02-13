import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    const filename = buildFilename(payload);

    const bytes = await generatePdfBytes(payload);

    // ✅ Conversion robuste : Uint8Array -> Buffer (compatible Response)
    const buffer = Buffer.from(bytes);

    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new Response("Erreur lors de la génération du PDF", { status: 500 });
  }
}

/* ===== Fonctions utilitaires ===== */

function buildFilename(data: any) {
  const base =
    (typeof data?.title === "string" && data.title) ||
    (typeof data?.templateId === "string" && data.templateId) ||
    "document";

  const safe = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return `${safe || "document"}.pdf`;
}

async function generatePdfBytes(data: any): Promise<Uint8Array> {
  /**
   * MVP : "PDF mock" pour débloquer le build prod.
   * On branchera une vraie génération PDF A4 après Vercel.
   */
  const text = JSON.stringify(data, null, 2);
  return new TextEncoder().encode(text);
}
