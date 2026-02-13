import { NextRequest, NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// ✅ pdf-lib => runtime Node recommandé (plus stable sur Vercel)
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const payload = await req.json()
  const filename = buildFilename(payload)

  const pdfBytes = await generateLegalPdf(payload)

  // ✅ FIX TS: on renvoie un Uint8Array "propre" (pas .buffer)
  const body = new Uint8Array(pdfBytes)

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}

/* ============================
   UTILITAIRES
============================ */

function buildFilename(data: any) {
  const base = data?.title || "document-juridique"
  return base.replace(/[^a-z0-9]/gi, "_").toLowerCase() + ".pdf"
}

/* ============================
   GÉNÉRATION PDF JURIDIQUE A4
============================ */

async function generateLegalPdf(data: any): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()

  const page = pdf.addPage([595.28, 841.89]) // A4
  const font = await pdf.embedFont(StandardFonts.TimesRoman)
  const bold = await pdf.embedFont(StandardFonts.TimesRomanBold)

  const margin = 60
  let y = 780
  const lineHeight = 18
  const maxWidth = 595.28 - margin * 2

  const wrapLines = (text: string, maxChars = 95) => {
    const words = String(text || "").split(/\s+/).filter(Boolean)
    const lines: string[] = []
    let line = ""
    for (const w of words) {
      const test = line ? `${line} ${w}` : w
      if (test.length > maxChars) {
        if (line) lines.push(line)
        line = w
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
    return lines.length ? lines : [""]
  }

  const drawLine = (text: string, size = 12, isBold = false) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: isBold ? bold : font,
      color: rgb(0, 0, 0),
      maxWidth,
    })
    y -= lineHeight
  }

  const drawParagraph = (text: string, size = 12) => {
    const paragraphs = String(text || "").split("\n")
    for (const p of paragraphs) {
      const lines = wrapLines(p)
      for (const l of lines) drawLine(l, size)
      y -= 10
    }
  }

  const drawTitle = (text: string) => {
    page.drawText(String(text || "Document juridique"), {
      x: margin,
      y,
      size: 16,
      font: bold,
      color: rgb(0, 0, 0),
      maxWidth,
    })
    y -= 32
  }

  /* ========= CONTENU ========= */

  drawTitle(data?.title || "Document juridique")

  drawParagraph(`Fait le : ${new Date().toLocaleDateString("fr-FR")}`)
  drawParagraph("")

  if (data?.sender) drawParagraph(`Expéditeur : ${data.sender}`)
  if (data?.recipient) drawParagraph(`Destinataire : ${data.recipient}`)

  drawParagraph("")
  drawLine("Objet :", 12, true)
  drawParagraph(data?.subject || "")
  drawParagraph("")

  drawParagraph(data?.content || "")

  drawParagraph("")
  drawParagraph("Cordialement,")
  drawParagraph("")
  drawParagraph(data?.signature || "")

  /* ========= PIED DE PAGE ========= */

  page.drawText("Lexoutil — assistance juridique", {
    x: margin,
    y: 40,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })

  return await pdf.save()
}
