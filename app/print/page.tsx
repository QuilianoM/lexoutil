"use client";

import { useEffect, useMemo, useState } from "react";

type PrintPayload = {
  sender: string;
  recipient: string;
  placeDate: string;
  objet: string;
  bodyText: string;
  title?: string;
};

function splitLines(s: string) {
  return (s || "").replace(/\r/g, "").split("\n");
}

function toParagraphs(bodyText: string) {
  const normalized = (bodyText || "").trim().replace(/\r/g, "");
  if (!normalized) return [];
  return normalized
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function startsWithRecipientLabel(lines: string[]) {
  const first = (lines[0] || "").trim().toLowerCase();
  return first === "destinataire" || first === "à l’attention de :" || first === "a l’attention de :";
}

export default function PrintPage() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);
  const [showUi, setShowUi] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lexoutil_print_payload");
      if (!raw) {
        setPayload({
          sender: "Votre nom\nVotre adresse",
          recipient: "Destinataire\nAdresse du destinataire",
          placeDate: "Ville, le jj/mm/aaaa",
          objet: "Objet : (objet)",
          bodyText: "Remplissez les champs sur /documents puis cliquez sur Imprimer.",
          title: "Document",
        });
        return;
      }
      setPayload(JSON.parse(raw) as PrintPayload);
    } catch {
      setPayload({
        sender: "Votre nom\nVotre adresse",
        recipient: "Destinataire\nAdresse du destinataire",
        placeDate: "Ville, le jj/mm/aaaa",
        objet: "Objet : (objet)",
        bodyText: "Erreur de lecture du contenu à imprimer.",
        title: "Document",
      });
    }
  }, []);

  const paragraphs = useMemo(() => toParagraphs(payload?.bodyText || ""), [payload]);

  useEffect(() => {
    const before = () => setShowUi(false);
    const after = () => setShowUi(true);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  useEffect(() => {
    if (!payload) return;
    const t = window.setTimeout(() => {
      setShowUi(false);
      window.setTimeout(() => {
        try {
          window.focus();
          window.print();
        } catch {}
        window.setTimeout(() => {
          try {
            window.close();
          } catch {}
        }, 250);
      }, 50);
    }, 200);
    return () => window.clearTimeout(t);
  }, [payload]);

  if (!payload) return <div style={{ padding: 24 }}>Chargement…</div>;

  const senderLines = splitLines(payload.sender || "").filter((l) => l.trim() !== "");
  const recipientLinesRaw = splitLines(payload.recipient || "").filter((l) => l.trim() !== "");
  const hasLabelInRecipient = startsWithRecipientLabel(recipientLinesRaw);

  return (
    <>
      <style>{`
        @page { size: A4; margin: 25mm 20mm; }

        html, body { margin: 0; padding: 0; background: #f3f4f6; }

        /* ✅ Règles anti-coupure en impression */
        @media print {
          html, body {
            background: #fff !important;
            overflow: visible !important;
            height: auto !important;
          }

          .screen-wrap { padding: 0 !important; background: #fff !important; min-height: auto !important; }

          .sheet {
            width: auto !important;
            margin: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          /* Évite les coupures “moches” */
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Paragraphes : éviter coupure, mais autoriser si vraiment nécessaire */
          p {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Empêche orphelins/veuves si supporté */
          p { orphans: 3; widows: 3; }
        }
      `}</style>

      {showUi ? (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 50,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: "10px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(6px)",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          }}
        >
          <div style={{ fontSize: 13, color: "#111827" }}>
            Impression en cours… (la fenêtre se fermera automatiquement)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => window.print()}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Relancer l’impression
            </button>
            <button
              onClick={() => window.close()}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      <div
        className="screen-wrap"
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "72px 12px 24px",
        }}
      >
        <div
          className="sheet"
          style={{
            width: "min(210mm, 100%)",
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "25mm 20mm",
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              color: "#111827",
            }}
          >
            {/* En-tête */}
            <div className="avoid-break" style={{ display: "flex", gap: "24px" }}>
              <div style={{ width: "50%", fontSize: 12, lineHeight: "18px" }}>
                {senderLines.map((l, i) => (
                  <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                    {l}
                  </div>
                ))}
              </div>

              <div style={{ width: "50%", fontSize: 12, lineHeight: "18px", textAlign: "right" }}>
                {!hasLabelInRecipient ? (
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>Destinataire</div>
                ) : null}
                {recipientLinesRaw.map((l, i) => (
                  <div key={i} style={{ whiteSpace: "pre-wrap" }}>
                    {l}
                  </div>
                ))}
                <div style={{ marginTop: 12 }}>{payload.placeDate}</div>
              </div>
            </div>

            {/* Objet */}
            <div className="avoid-break" style={{ marginTop: 26, fontSize: 12 }}>
              <strong>{payload.objet}</strong>
            </div>

            {/* Corps */}
            <div style={{ marginTop: 26, fontSize: 12, lineHeight: "20px" }}>
              {paragraphs.length ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} style={{ margin: "0 0 14px", textIndent: "2em", whiteSpace: "pre-wrap" }}>
                    {p}
                  </p>
                ))
              ) : (
                <div style={{ whiteSpace: "pre-wrap" }}>{payload.bodyText}</div>
              )}

              {/* Zone signature (évite coupure) */}
              <div className="avoid-break" style={{ marginTop: 18 }}>
                {/* Tu peux laisser vide si tes modèles gèrent déjà la signature */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
