"use client";

import { Suspense } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  documentTemplates,
  type DocumentField,
  type DocumentTemplate,
} from "@/lib/document-templates";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import LegalDisclaimer from "@/components/legal-disclaimer";

import {
  addToHistory,
  clearDraft,
  clearHistory,
  downloadBackupFile,
  importUserBackupFromText,
  loadDraft,
  loadHistory,
  saveDraft,
  type HistoryItem,
} from "@/lib/user-data";

import { sanitizeText } from "@/lib/sanitize";
import { createDocument } from "@/lib/supabase-documents";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

// ✅ Pro/Free + erreurs FR
import { isPro } from "@/lib/subscription";
import { erreurFR } from "@/lib/errors-fr";

type PreviewMode = "layout" | "text";

type FormState = {
  templateId: string;
  values: Record<string, string>;
};

const defaultTemplateId = "mise-en-demeure";
const HISTORY_MAX_ITEMS = 30;

/* ---------------------- Helpers safe (templates) ---------------------- */

function getFieldsSafe(template: any): DocumentField[] {
  const fields = template?.fields;
  return Array.isArray(fields) ? fields : [];
}

function getFirstValidTemplate(list: any[]): any | null {
  if (!Array.isArray(list) || list.length === 0) return null;
  const valid = list.find((t) => Array.isArray(t?.fields));
  return valid || list[0] || null;
}

function getTemplateSafe(list: any[], templateId: string): any | null {
  const found = Array.isArray(list) ? list.find((t) => t?.id === templateId) : null;
  if (found && Array.isArray(found?.fields)) return found;
  return getFirstValidTemplate(list);
}

function isTemplateIdValid(list: any[], templateId: string) {
  if (!templateId) return false;
  return Array.isArray(list) && list.some((t) => t?.id === templateId);
}

function buildInitialValues(template: any): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const f of getFieldsSafe(template)) obj[f.id] = "";
  return obj;
}

function applyPrefillIfEmpty(
  template: any,
  currentValues: Record<string, string>,
  prefill: Record<string, string>
) {
  // n’applique que si le champ existe dans le template
  const allowed = new Set(getFieldsSafe(template).map((f) => f.id));
  const next = { ...currentValues };

  for (const [k, v] of Object.entries(prefill)) {
    if (!allowed.has(k)) continue;
    const current = (next[k] || "").trim();
    if (current) continue; // ne remplace pas si déjà rempli
    next[k] = String(v || "");
  }

  return next;
}

/* ---------------------- Helpers texte ---------------------- */

function normalizeLines(v: string) {
  return (v || "")
    .split("\n")
    .map((s) => s.trimEnd())
    .join("\n")
    .trim();
}

function snippetFromText(text: string, max = 180) {
  const t = normalizeLines(text).replace(/\s+/g, " ").trim();
  if (!t) return "";
  return t.length > max ? t.slice(0, max).trim() + "…" : t;
}

function slugifyFilename(input: string) {
  return (input || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

function formatDateForFilename(d: string) {
  const m = (d || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  return `${yyyy}-${mm}-${dd}`;
}

function formatFR(ts?: number) {
  if (!ts) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

/* ---------------------- Validation FR simple ---------------------- */

function isLeapYear(y: number) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function validateDateFR(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "Format attendu : jj/mm/aaaa";

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (yyyy < 1900 || yyyy > 2100) return "Année invalide";
  if (mm < 1 || mm > 12) return "Mois invalide";

  const daysInMonth = [
    31,
    isLeapYear(yyyy) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  const maxDay = daysInMonth[mm - 1];
  if (dd < 1 || dd > maxDay) return "Jour invalide";

  return null;
}

/* ---------------------- UI helpers ---------------------- */

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="text-xs font-medium text-zinc-800">
      {children}
    </label>
  );
}

function FieldHint({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div id={id} className="text-xs text-zinc-500">
      {children}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div id={id} className="text-xs text-red-600" role="alert" aria-live="polite">
      {children}
    </div>
  );
}

/* ---------------------- Sanitize + validate ---------------------- */

function sanitizeFieldValue(field: DocumentField, raw: string) {
  const maxLen = typeof field.maxLen === "number" ? field.maxLen : 2000;
  const multiline = field.type === "textarea";
  return sanitizeText(raw || "", { maxLen, multiline });
}

function validateFieldValue(field: DocumentField, value: string): string | null {
  const v = (value || "").trim();
  if (field.required && !v) return "Champ obligatoire";

  if (field.type === "date_fr") return validateDateFR(v);

  if (field.type === "number") {
    if (!v) return null;
    if (!/^\d+$/.test(v)) return "Ce champ doit être un nombre (ex : 8)";
  }

  return null;
}

function validateTemplateValues(template: any, values: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const f of getFieldsSafe(template)) {
    const err = validateFieldValue(f, values[f.id] ?? "");
    if (err) errors[f.id] = err;
  }
  return errors;
}

/* ---------------------- Page (inner) ---------------------- */

function DocumentsPageInner() {
  const uid = useId();
  const searchParams = useSearchParams();

  const templates = documentTemplates as unknown as DocumentTemplate[];

  const [form, setForm] = useState<FormState>(() => {
    const t = getTemplateSafe(templates as any[], defaultTemplateId);
    return { templateId: t?.id || defaultTemplateId, values: buildInitialValues(t) };
  });

  const [previewMode, setPreviewMode] = useState<PreviewMode>("layout");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [message, setMessage] = useState<string>("");
  const [copied, setCopied] = useState<"ok" | "err" | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ URL params (conversion)
  const templateParam = (searchParams?.get("template") || "").trim();

  // ✅ URL params (prefill)
  const prefillParam = useMemo(() => {
    const objet = (searchParams?.get("prefill_objet") || "").trim();
    const faits = (searchParams?.get("prefill_faits") || "").trim();
    const demande = (searchParams?.get("prefill_demande") || "").trim();
    const delai = (searchParams?.get("prefill_delai") || "").trim();

    const out: Record<string, string> = {};
    if (objet) out.objet = objet;
    if (faits) out.faits = faits;
    if (demande) out.demande = demande;
    if (delai) out.delai = delai;
    return out;
  }, [searchParams]);

  const currentTemplate = useMemo(
    () => getTemplateSafe(templates as any[], form.templateId),
    [templates, form.templateId]
  );

  const fields = useMemo(() => getFieldsSafe(currentTemplate), [currentTemplate]);

  const cleanValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const f of fields) {
      out[f.id] = sanitizeFieldValue(f, form.values[f.id] ?? "");
    }
    return out;
  }, [fields, form.values]);

  const errors = useMemo(
    () => validateTemplateValues(currentTemplate, cleanValues),
    [currentTemplate, cleanValues]
  );
  const hasBlockingError = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const firstErrorId = useMemo(() => {
    const keys = Object.keys(errors);
    return keys.length ? keys[0] : null;
  }, [errors]);

  const previewText = useMemo(() => {
    try {
      const tpl = currentTemplate as any;
      if (tpl?.generate && typeof tpl.generate === "function") {
        return String(
          tpl.generate({
            templateId: form.templateId,
            ...cleanValues,
          }) || ""
        );
      }
    } catch {
      // ignore
    }
    return "";
  }, [currentTemplate, form.templateId, cleanValues]);

  const filenameBase = useMemo(() => {
    const base = cleanValues.objet || (currentTemplate as any)?.label || "document";
    const date = formatDateForFilename(cleanValues.date || "");
    const parts = [slugifyFilename(base), date].filter(Boolean);
    return parts.join("_") || "document";
  }, [cleanValues.objet, cleanValues.date, currentTemplate]);

  function focusFirstError() {
    if (!firstErrorId) return;
    const el = document.getElementById(`${uid}-${firstErrorId}`);
    if (el && "focus" in el) (el as any).focus();
  }

  function guardBlockingErrors(actionLabel: string): boolean {
    if (!hasBlockingError) return true;
    setMessage(`Action impossible : corrigez les erreurs du formulaire avant de ${actionLabel}.`);
    focusFirstError();
    return false;
  }

  function doClearDraft() {
    clearDraft();
    const t = getTemplateSafe(documentTemplates as any[], defaultTemplateId);
    if (t) setForm({ templateId: t.id, values: buildInitialValues(t) });
    setPreviewMode("layout");
    setLastSavedAt(undefined);
    setMessage("Brouillon effacé.");
  }

  function refreshHistoryUI() {
    setHistory(loadHistory());
  }

  async function pushHistorySnapshot() {
    const localId = crypto.randomUUID();

    const item: HistoryItem = {
      id: localId,
      createdAt: Date.now(),
      templateId: form.templateId,
      templateLabel: (currentTemplate as any)?.label || "Document",
      objet: (cleanValues.objet || "").trim(),
      destinataire: (cleanValues.destinataire || "").trim(),
      snippet: snippetFromText(previewText),
      form: { templateId: form.templateId, ...cleanValues, _localId: localId },
    };

    // ✅ Cloud = Pro uniquement
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();

      if (data?.user && isPro()) {
        await createDocument({
          template_id: item.templateId,
          template_label: item.templateLabel,
          objet: item.objet,
          destinataire: item.destinataire,
          snippet: item.snippet,
          content: previewText,
          form: item.form,
        });
        return;
      }

      // connecté mais Free => on informe, puis on continue en local
      if (data?.user && !isPro()) {
        setMessage(
          "Sauvegarde en ligne (cloud) réservée aux comptes Pro. En gratuit, le document est enregistré en local."
        );
        window.setTimeout(() => setMessage(""), 4000);
      }
    } catch (e: any) {
      // Erreur cloud => on continue en local
      setMessage(erreurFR(e, "Sauvegarde en ligne impossible. Enregistrement en local."));
      window.setTimeout(() => setMessage(""), 4000);
    }

    const added = addToHistory(item, HISTORY_MAX_ITEMS);

    if (!added) {
      setMessage("Limite gratuite atteinte : passez en Pro pour enregistrer plus de documents.");
      return;
    }

    refreshHistoryUI();
  }

  async function handleCopy() {
    if (!guardBlockingErrors("copier")) return;

    const text = (previewText || "").trim();
    if (!text) {
      setMessage("Aucun texte à copier (le document est vide).");
      window.setTimeout(() => setMessage(""), 3000);
      return;
    }

    setIsCopying(true);
    setCopied(null);

    // Fonction fallback ultra compatible (même si Clipboard API est bloquée)
    const fallbackCopy = (value: string) => {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.opacity = "0";
      ta.style.pointerEvents = "none";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);

      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    };

    try {
      // 1) Clipboard API (meilleur cas)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied("ok");
        void pushHistorySnapshot();
      } else {
        // 2) Fallback si API indisponible
        const ok = fallbackCopy(text);
        if (!ok) throw new Error("Fallback copy failed");
        setCopied("ok");
        void pushHistorySnapshot();
      }
    } catch (e) {
      // 3) Dernière chance : fallback même si Clipboard API existe mais échoue
      const ok = fallbackCopy(text);
      if (ok) {
        setCopied("ok");
        void pushHistorySnapshot();
      } else {
        setCopied("err");
        setMessage("Copie impossible. Astuce : cliquez dans l’aperçu, faites Ctrl+C.");
        window.setTimeout(() => setMessage(""), 5000);
      }
    } finally {
      setIsCopying(false);
      window.setTimeout(() => setCopied(null), 2500);
    }
  }

  async function handleDownloadPdf() {
    if (!guardBlockingErrors("exporter en PDF")) return;

    setIsPdfLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: form.templateId,
          data: cleanValues,
          previewMode,
        }),
      });

      if (!res.ok) throw new Error("Erreur PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filenameBase || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      void pushHistorySnapshot();
    } catch {
      setMessage("Impossible de générer le PDF. Réessayez.");
    } finally {
      setIsPdfLoading(false);
    }
  }

  // ✅ Impression PRO : ouvre /print avec le texte du document
  function handleOpenPrintPro() {
    if (!guardBlockingErrors("imprimer")) return;

    const text = (previewText || "").trim();
    if (!text) {
      setMessage("Aucun texte à imprimer (le document est vide).");
      window.setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      sessionStorage.setItem(
        "print_payload",
        JSON.stringify({
          text,
          title: `${(currentTemplate as any)?.label || "Document"} — Lexoutil`,
        })
      );

      window.open("/print", "_blank", "noopener,noreferrer");
    } catch {
      setMessage("Impossible d’ouvrir la vue impression. Réessayez.");
      window.setTimeout(() => setMessage(""), 3000);
    }
  }

  function openImportDialog() {
    if (!importInputRef.current) return;
    importInputRef.current.value = "";
    importInputRef.current.click();
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text();
      const res = importUserBackupFromText(text, { mergeHistory: true });

      setHistory(loadHistory());
      const d = loadDraft();
      if (d) {
        const raw = (d.form || {}) as any;
        const templateId =
          typeof raw.templateId === "string" ? raw.templateId : defaultTemplateId;
        const t = getTemplateSafe(documentTemplates as any[], templateId);

        if (t) {
          const initial = buildInitialValues(t);
          for (const f of getFieldsSafe(t)) {
            const v = raw[f.id];
            if (typeof v === "string") initial[f.id] = v;
          }
          setForm({ templateId: t.id, values: initial });
        }

        setPreviewMode(d.previewMode);
        setLastSavedAt(d.savedAt);
      }

      setMessage(
        `Import réussi : historique +${res.importedHistoryCount}` +
          (res.importedDraft ? " (brouillon restauré)." : ".")
      );
    } catch (e: any) {
      setMessage(e?.message || "Import impossible : fichier non reconnu.");
    }
  }

  function handleLoadHistoryItem(item: HistoryItem) {
    const raw = (item.form || {}) as any;
    const templateId =
      typeof raw.templateId === "string" ? raw.templateId : item.templateId;
    const t = getTemplateSafe(documentTemplates as any[], templateId);

    if (t) {
      const initial = buildInitialValues(t);
      for (const f of getFieldsSafe(t)) {
        const v = raw[f.id];
        if (typeof v === "string") initial[f.id] = v;
      }
      setForm({ templateId: t.id, values: initial });
    }

    setPreviewMode("layout");
    setMessage("Document chargé depuis l'historique.");
    setShowHistory(false);
  }

  function handleClearHistory() {
    clearHistory();
    refreshHistoryUI();
    setMessage("Historique supprimé.");
  }

  function handleDownloadBackup() {
    downloadBackupFile();
    setMessage("Sauvegarde téléchargée.");
  }

  // ✅ CHARGEMENT INITIAL : si template URL valide -> charge template + applique prefill (sans écraser si déjà rempli)
  useEffect(() => {
    setHistory(loadHistory());

    if (templateParam && isTemplateIdValid(documentTemplates as any[], templateParam)) {
      const t = getTemplateSafe(documentTemplates as any[], templateParam);
      if (t) {
        const base = buildInitialValues(t);
        const withPrefill = applyPrefillIfEmpty(t, base, prefillParam);

        setForm({ templateId: t.id, values: withPrefill });
        setPreviewMode("layout");
        setLastSavedAt(undefined);

        const lbl = (t as any)?.label || t.id;
        setMessage(
          Object.keys(prefillParam).length
            ? `Modèle + pré-remplissage : ${lbl}`
            : `Modèle : ${lbl}`
        );
      }
      return;
    }

    // Sinon : comportement normal (brouillon local)
    const d = loadDraft();
    if (d) {
      const raw = (d.form || {}) as any;
      const templateId =
        typeof raw.templateId === "string" ? raw.templateId : defaultTemplateId;
      const t = getTemplateSafe(documentTemplates as any[], templateId);

      if (t) {
        const initial = buildInitialValues(t);
        for (const f of getFieldsSafe(t)) {
          const v = raw[f.id];
          if (typeof v === "string") initial[f.id] = v;
        }
        setForm({ templateId: t.id, values: initial });
      }

      setPreviewMode(d.previewMode);
      setLastSavedAt(d.savedAt);
    }
  }, [templateParam, prefillParam]);

  // auto-save draft
  useEffect(() => {
    const now = Date.now();
    const payload = {
      form: { templateId: form.templateId, ...cleanValues },
      previewMode,
      savedAt: now,
    };
    saveDraft(payload);
    setLastSavedAt(now);
  }, [form.templateId, cleanValues, previewMode]);

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-6xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Générateur de documents. Remplissez le formulaire, vérifiez l’aperçu, puis
                copiez ou exportez en PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setShowHistory((v) => !v)}>
                {showHistory ? "Fermer l'historique" : `Historique (${history.length})`}
              </Button>

              <Button variant="secondary" onClick={doClearDraft}>
                Effacer le brouillon
              </Button>

              <Button variant="secondary" onClick={handleDownloadBackup}>
                Télécharger sauvegarde
              </Button>

              <Button variant="secondary" onClick={openImportDialog}>
                Importer sauvegarde
              </Button>

              <input
                ref={importInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleImportFile(f);
                }}
              />
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 lg:grid-cols-12">
            {/* Form */}
            <div className="lg:col-span-5">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-zinc-900">Formulaire</div>
                    <Badge variant="outline">
                      {lastSavedAt ? `Brouillon enregistré • ${formatFR(lastSavedAt)}` : "—"}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <FieldLabel htmlFor={`${uid}-template`}>Modèle</FieldLabel>
                    <Select
                      id={`${uid}-template`}
                      value={form.templateId}
                      onChange={(e) => {
                        const nextId = e.target.value;
                        const t = getTemplateSafe(documentTemplates as any[], nextId);
                        if (!t) return;

                        setForm({
                          templateId: t.id,
                          values: buildInitialValues(t),
                        });
                      }}
                    >
                      {(documentTemplates as any[]).map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="mt-5 grid gap-4">
                    {fields.map((field) => {
                      const id = `${uid}-${field.id}`;
                      const err = errors[field.id];

                      const commonProps = {
                        id,
                        value: form.values[field.id] ?? "",
                        onChange: (e: any) => {
                          const v = e.target.value as string;
                          setForm((prev) => ({
                            ...prev,
                            values: { ...prev.values, [field.id]: v },
                          }));
                        },
                        "aria-invalid": !!err,
                      } as any;

                      return (
                        <div key={field.id} className="grid gap-1">
                          <FieldLabel htmlFor={id}>
                            {field.label}{" "}
                            {field.required ? <span className="text-red-600">*</span> : null}
                          </FieldLabel>

                          {field.type === "textarea" ? (
                            <Textarea {...commonProps} placeholder={field.placeholder} />
                          ) : (
                            <Input {...commonProps} placeholder={field.placeholder} />
                          )}

                          {field.hint ? (
                            <FieldHint id={`${id}-hint`}>{field.hint}</FieldHint>
                          ) : null}
                          {err ? <FieldError id={`${id}-err`}>{err}</FieldError> : null}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <Button onClick={handleCopy} disabled={isCopying || hasBlockingError}>
                      {isCopying ? "Copie…" : "Copier"}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={handleDownloadPdf}
                      disabled={isPdfLoading || hasBlockingError}
                    >
                      {isPdfLoading ? "PDF…" : "Télécharger PDF"}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => setPreviewMode((m) => (m === "layout" ? "text" : "layout"))}
                    >
                      {previewMode === "layout" ? "Aperçu texte" : "Aperçu mise en page"}
                    </Button>

                    {copied === "ok" ? (
                      <span className="text-xs text-green-700">Copié ✓</span>
                    ) : null}
                    {copied === "err" ? (
                      <span className="text-xs text-red-600">Copie impossible</span>
                    ) : null}
                  </div>

                  {hasBlockingError ? (
                    <div className="mt-3 text-xs text-red-600">
                      Corrigez les erreurs du formulaire avant de copier ou exporter.
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <div className="mt-4">
                <LegalDisclaimer />
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-7">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-zinc-900">Aperçu</div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {previewMode === "layout" ? "Mise en page" : "Texte"}
                      </Badge>

                      {/* ✅ Impression PRO (ouvre /print avec le texte) */}
                      <button
                        type="button"
                        className="text-xs text-zinc-600 underline"
                        onClick={handleOpenPrintPro}
                      >
                        Imprimer (pro)
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border bg-white p-6">
                    <pre
                      className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-900"
                      onClick={(e) => {
                        const el = e.currentTarget;
                        const range = document.createRange();
                        range.selectNodeContents(el);
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(range);
                      }}
                      title="Cliquez pour sélectionner tout le texte"
                    >
                      {previewText}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {showHistory ? (
                <Card className="mt-5">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-zinc-900">Historique</div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="secondary" onClick={() => setHistory(loadHistory())}>
                          Actualiser
                        </Button>

                        <Button variant="destructive" onClick={handleClearHistory}>
                          Supprimer l'historique
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {history.length === 0 ? (
                        <div className="text-sm text-zinc-600">
                          Aucun document dans l’historique.
                        </div>
                      ) : (
                        history.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-60 flex-1">
                                  <div className="text-sm font-semibold text-zinc-900">
                                    {item.objet || item.templateLabel}
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-600">
                                    {formatFR(item.createdAt)} • {item.templateLabel}
                                    {item.destinataire ? ` • ${item.destinataire}` : ""}
                                  </div>

                                  {item.snippet ? (
                                    <div className="mt-2 text-sm text-zinc-700 line-clamp-3">
                                      {item.snippet}
                                    </div>
                                  ) : null}
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Button
                                    variant="secondary"
                                    onClick={() => handleLoadHistoryItem(item)}
                                  >
                                    Charger
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </Section>
    </Container>
  );
}

/* ---------------------- Page (export) ---------------------- */

export default function DocumentsPage() {
  return (
    <Suspense
      fallback={
        <Container>
          <Section>
            <div className="mx-auto w-full max-w-6xl py-10">
              <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                Chargement…
              </div>
            </div>
          </Section>
        </Container>
      }
    >
      <DocumentsPageInner />
    </Suspense>
  );
}
