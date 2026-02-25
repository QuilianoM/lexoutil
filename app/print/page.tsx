"use client";

import { useEffect, useMemo, useState } from "react";

type PrintPayload = {
  text: string;
  title?: string;
};

export default function PrintPage() {
  const [payload, setPayload] = useState<PrintPayload | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("print_payload");
      if (!raw) return;
      const parsed = JSON.parse(raw) as PrintPayload;
      if (!parsed?.text) return;
      setPayload(parsed);
    } catch {
      setPayload(null);
    }
  }, []);

  useEffect(() => {
    if (payload?.title) document.title = payload.title;
  }, [payload?.title]);

  const text = useMemo(() => {
    return (payload?.text || "").replace(/\r\n/g, "\n").trim();
  }, [payload]);

  if (!payload || !text) {
    return (
      <div className="p-10 font-sans text-sm text-zinc-700">
        <div className="max-w-xl">
          <div className="text-lg font-semibold text-zinc-900">Aucun document à imprimer</div>
          <p className="mt-2">
            Retournez sur <span className="font-mono">/documents</span> puis cliquez sur{" "}
            <span className="font-semibold">“Imprimer (pro)”</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="print-root">
      {/* Barre d’actions (masquée à l’impression) */}
      <div className="toolbar no-print">
        <div className="toolbar-left">
          <div className="toolbar-title">Lexoutil — Vue impression</div>
          <div className="toolbar-subtitle">
            Conseil : dans la fenêtre d’impression, désactivez “En-têtes et pieds de page”.
          </div>
        </div>

        <div className="toolbar-actions">
          <a className="btn btn-light" href="/documents">
            Retour
          </a>
          <button className="btn btn-dark" onClick={() => window.print()}>
            Imprimer
          </button>
        </div>
      </div>

      {/* Feuille A4 */}
      <main className="sheet-wrap">
        <article className="sheet">
          <header className="doc-header">
            <div className="brand">LEXOUTIL</div>
            <div className="doc-title">{payload.title || "Document"}</div>
          </header>

          <div className="doc-body">
            <pre className="doc-text">{text}</pre>
          </div>

          <footer className="doc-footer">
            Document généré automatiquement par Lexoutil — à relire et vérifier avant utilisation.
          </footer>
        </article>
      </main>

      <style>{css}</style>
    </div>
  );
}

const css = `
  :root { color-scheme: light; }

  .print-root{
    min-height: 100vh;
    background: #f3f4f6;
  }

  /* Toolbar */
  .toolbar{
    position: fixed;
    top: 12px;
    left: 12px;
    right: 12px;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: rgba(255,255,255,0.96);
    backdrop-filter: blur(8px);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }

  .toolbar-title{
    font-size: 13px;
    font-weight: 700;
    color: #111827;
  }

  .toolbar-subtitle{
    margin-top: 2px;
    font-size: 12px;
    color: #6b7280;
  }

  .toolbar-actions{
    display: flex;
    gap: 8px;
    align-items: center;
    flex-shrink: 0;
  }

  .btn{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 12px;
    border-radius: 12px;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
    border: 1px solid transparent;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }

  .btn-light{
    background: #ffffff;
    border-color: #d1d5db;
    color: #111827;
  }

  .btn-dark{
    background: #111827;
    border-color: #111827;
    color: #ffffff;
  }

  /* A4 Sheet */
  .sheet-wrap{
    padding-top: 78px; /* place pour la toolbar */
    padding-bottom: 40px;
    display: flex;
    justify-content: center;
  }

  .sheet{
    width: 210mm;
    min-height: 297mm;
    background: #ffffff;
    box-sizing: border-box;
    padding: 18mm 18mm 16mm 18mm;
    box-shadow: 0 10px 28px rgba(0,0,0,0.12);
    border: 1px solid #e5e7eb;
  }

  .doc-header{
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8mm;
    margin-bottom: 10mm;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }

  .brand{
    font-size: 12px;
    letter-spacing: 0.16em;
    font-weight: 700;
    color: #111827;
  }

  .doc-title{
    margin-top: 6px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .doc-body{
    padding: 0;
  }

  .doc-text{
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 12pt;
    line-height: 1.65;
    color: #111827;
  }

  .doc-footer{
    margin-top: 14mm;
    padding-top: 6mm;
    border-top: 1px solid #e5e7eb;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
    font-size: 10pt;
    color: #6b7280;
  }

  /* Print */
  .no-print{ display: block; }

  @page{
    size: A4;
    margin: 16mm;
  }

  @media print{
    .print-root{ background: #ffffff; }
    .no-print{ display: none !important; }
    .sheet-wrap{ padding: 0; }
    .sheet{
      width: auto;
      min-height: auto;
      border: none;
      box-shadow: none;
      padding: 0;
    }
    .doc-header{
      padding-bottom: 8mm;
      margin-bottom: 10mm;
    }
  }
`;
