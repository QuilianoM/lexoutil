"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { documentTemplates } from "@/lib/document-templates";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

type FormState = {
  templateId: string;
  nom: string;
  adresse: string;
  ville: string;
  date: string; // jj/mm/aaaa
  destinataire: string;
  adresseDestinataire: string;
  objet: string;
  faits: string;
  demande: string;
  delai: string; // jours
};

const defaultState: FormState = {
  templateId: "mise-en-demeure",
  nom: "",
  adresse: "",
  ville: "",
  date: "",
  destinataire: "",
  adresseDestinataire: "",
  objet: "",
  faits: "",
  demande: "",
  delai: "",
};

const HISTORY_MAX_ITEMS = 30;

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

function validateDelai(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (!/^\d+$/.test(v)) return "Le délai doit être un nombre (ex : 8)";
  const n = Number(v);
  if (!Number.isFinite(n)) return "Valeur invalide";
  if (n <= 0) return "Le délai doit être supérieur à 0";
  if (n > 365) return "Le délai semble trop élevé (max 365)";
  return null;
}

function formatPlaceDate(ville: string, date: string) {
  const v = ville.trim();
  const d = date.trim();
  if (!v && !d) return "";
  if (v && d) return `${v}, le ${d}`;
  if (v && !d) return v;
  return `Le ${d}`;
}

function makePlainText(form: FormState, body: string) {
  const sender = [form.nom, form.adresse]
    .map((x) => x.trim())
    .filter(Boolean)
    .join("\n");

  const recipient = [form.destinataire, form.adresseDestinataire]
    .map((x) => x.trim())
    .filter(Boolean)
    .join("\n");

  const placeDate = formatPlaceDate(form.ville, form.date);

  const parts: string[] = [];
  if (sender) parts.push(sender);
  parts.push("");

  if (recipient) parts.push(`Destinataire\n${recipient}`);
  parts.push("");

  if (placeDate) parts.push(placeDate);
  parts.push("");

  if (form.objet.trim()) parts.push(`Objet : ${form.objet.trim()}`);
  parts.push("");

  parts.push(normalizeLines(body));

  return parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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
  const m = d.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
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

/**
 * ✅ Étape 8.3 : sanitation centralisée
 * On garde l'état "form" tel que l'utilisateur tape,
 * mais on utilise "cleanForm" pour:
 * - generate
 * - saveDraft
 * - history
 * - copy
 * - pdf
 */
function sanitizeForm(input: FormState): FormState {
  return {
    templateId: input.templateId, // pas de sanitation sur l'id
    nom: sanitizeText(input.nom, { maxLen: 80 }),
    adresse: sanitizeText(input.adresse, { maxLen: 180, multiline: true }),
    ville: sanitizeText(input.ville, { maxLen: 80 }),
    date: sanitizeText(input.date, { maxLen: 10 }),
    destinataire: sanitizeText(input.destinataire, { maxLen: 120 }),
    adresseDestinataire: sanitizeText(input.adresseDestinataire, { maxLen: 220, multiline: true }),
    objet: sanitizeText(input.objet, { maxLen: 160 }),
    faits: sanitizeText(input.faits, { maxLen: 2000, multiline: true }),
    demande: sanitizeText(input.demande, { maxLen: 2000, multiline: true }),
    delai: sanitizeText(input.delai, { maxLen: 4 }),
  };
}

// Champs UI (simple)
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-medium text-zinc-800">{children}</div>;
}

function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="text-xs text-zinc-500">{children}</div>;
}

function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <div className="text-xs text-red-600">{children}</div>;
}

function TextField(props: {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <FieldLabel>{props.label}</FieldLabel>
      <Input value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
      <FieldHint>{props.hint}</FieldHint>
      <FieldError>{props.error || undefined}</FieldError>
    </div>
  );
}

function TextAreaField(props: {
  label: string;
  value: string;
  placeholder?: string;
  hint?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <FieldLabel>{props.label}</FieldLabel>
      <Textarea value={props.value} placeholder={props.placeholder} onChange={(e) => props.onChange(e.target.value)} />
      <FieldHint>{props.hint}</FieldHint>
    </div>
  );
}

export default function DocumentsPage() {
  const [form, setForm] = useState<FormState>(defaultState);

  const [previewMode, setPreviewMode] = useState<"layout" | "text">("layout");
  const [isCopying, setIsCopying] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [copied, setCopied] = useState<null | "ok" | "err">(null);

  const [message, setMessage] = useState<string>("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);

  const importInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ cleanForm utilisé partout où on stocke / génère / exporte
  const cleanForm = useMemo(() => sanitizeForm(form), [form]);

  // Chargement : brouillon + historique (source unique : lib/user-data.ts)
  useEffect(() => {
    const d = loadDraft();
    if (d) {
      setForm(d.form as unknown as FormState);
      setPreviewMode(d.previewMode);
      setLastSavedAt(d.savedAt);
    }
    setHistory(loadHistory());
  }, []);

  // Auto-save brouillon (debounce léger) via lib/user-data.ts
  useEffect(() => {
    const id = window.setTimeout(() => {
      const now = Date.now();
      saveDraft({
        form: cleanForm as unknown as Record<string, unknown>,
        previewMode,
        savedAt: now,
      });
      setLastSavedAt(now);
    }, 450);
    return () => window.clearTimeout(id);
  }, [cleanForm, previewMode]);

  const currentTemplate = useMemo(() => {
    return documentTemplates.find((t) => t.id === form.templateId) || documentTemplates[0];
  }, [form.templateId]);

  const dateError = useMemo(() => validateDateFR(cleanForm.date), [cleanForm.date]);
  const delaiError = useMemo(() => validateDelai(cleanForm.delai), [cleanForm.delai]);
  const hasBlockingError = Boolean(dateError || delaiError);

  const generated = useMemo(() => {
    const body = currentTemplate.generate(cleanForm as any);
    const plain = makePlainText(cleanForm, body);
    return { body, plain };
  }, [currentTemplate, cleanForm]);

  const previewText = generated.plain;

  const filenameBase = useMemo(() => {
    const template = currentTemplate?.label || "document";
    const date = formatDateForFilename(cleanForm.date);
    const obj = slugifyFilename(cleanForm.objet);
    const parts = [template, obj, date].filter(Boolean).join("_");
    return slugifyFilename(parts || "document");
  }, [currentTemplate?.label, cleanForm.date, cleanForm.objet]);

  const disableActions = isCopying || isPdfLoading || hasBlockingError;

  function doClearDraft() {
    clearDraft();
    setForm(defaultState);
    setPreviewMode("layout");
    setLastSavedAt(undefined);
    setMessage("Brouillon effacé.");
  }

  function refreshHistoryUI() {
    setHistory(loadHistory());
  }

  function pushHistorySnapshot() {
    addToHistory(
      {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        templateId: cleanForm.templateId,
        templateLabel: currentTemplate.label,
        objet: cleanForm.objet.trim(),
        destinataire: cleanForm.destinataire.trim(),
        snippet: snippetFromText(previewText),
        form: cleanForm as unknown as Record<string, unknown>,
      },
      HISTORY_MAX_ITEMS
    );
    refreshHistoryUI();
  }

  async function handleCopy() {
    setIsCopying(true);
    setCopied(null);
    try {
      await navigator.clipboard.writeText(previewText);
      setCopied("ok");
      pushHistorySnapshot();
    } catch {
      setCopied("err");
    } finally {
      setIsCopying(false);
      window.setTimeout(() => setCopied(null), 2500);
    }
  }

  function handlePrint() {
    window.print();
  }

  async function handleDownloadPdf() {
    setIsPdfLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: cleanForm.templateId,
          data: cleanForm,
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

      pushHistorySnapshot();
    } catch {
      setMessage("Impossible de générer le PDF. Réessayez.");
    } finally {
      setIsPdfLoading(false);
    }
  }

  function downloadTextFile(filename: string, text: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleDownloadTxt() {
    downloadTextFile(`${filenameBase || "document"}.txt`, previewText);
    pushHistorySnapshot();
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
        setForm(d.form as unknown as FormState);
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
    setForm(item.form as unknown as FormState);
    setPreviewMode("layout");
    setMessage("Document chargé depuis l'historique.");
    setShowHistory(false);
  }

  function handleClearHistory() {
    clearHistory();
    refreshHistoryUI();
    setMessage("Historique supprimé.");
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-5xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Sélectionnez un modèle, remplissez les champs et copiez le texte, imprimez ou exportez en PDF.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">MVP</Badge>
              <Button type="button" variant="ghost" onClick={() => setShowHistory((v) => !v)}>
                {showHistory ? "Masquer l'historique" : "Historique"}
              </Button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">{message}</div>
          ) : null}

          {/* Historique */}
          {showHistory ? (
            <Card className="mt-6">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Historique (local)</h2>
                    <p className="text-xs text-zinc-500">
                      Jusqu'à {HISTORY_MAX_ITEMS} documents. Sauvegardé sur cet appareil.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => downloadBackupFile()}>
                      Télécharger une sauvegarde
                    </Button>

                    <Button type="button" variant="ghost" onClick={openImportDialog}>
                      Importer une sauvegarde
                    </Button>

                    <Button type="button" variant="ghost" onClick={handleClearHistory} disabled={history.length === 0}>
                      Supprimer l'historique
                    </Button>
                  </div>
                </div>

                <input
                  ref={importInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    handleImportFile(file);
                  }}
                />

                <div className="mt-4 grid gap-3">
                  {history.length === 0 ? (
                    <div className="text-sm text-zinc-500">Aucun document enregistré pour le moment.</div>
                  ) : (
                    history.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => handleLoadHistoryItem(h)}
                        className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-left transition hover:bg-zinc-50"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-zinc-900">
                            {h.templateLabel}
                            {h.objet ? ` — ${h.objet}` : ""}
                          </div>
                          <div className="text-xs text-zinc-500">{new Date(h.createdAt).toLocaleString("fr-FR")}</div>
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {h.destinataire
                            ? `Destinataire : ${h.destinataire}`
                            : "Destinataire : (non renseigné)"}
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">{h.snippet}</div>
                      </button>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Formulaire */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Générateur</h2>
                  <p className="text-xs text-zinc-500">
                    Brouillon auto enregistré sur cet appareil
                    {lastSavedAt ? ` — Dernière sauvegarde : ${formatFR(lastSavedAt)}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {copied === "ok" ? (
                    <Badge>Copié</Badge>
                  ) : copied === "err" ? (
                    <Badge className="bg-red-600 text-white hover:bg-red-600">Copie impossible</Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 grid gap-5">
                <div className="grid gap-1">
                  <FieldLabel>Modèle</FieldLabel>
                  <Select value={form.templateId} onChange={(e) => setForm((s) => ({ ...s, templateId: e.target.value }))}>
                    {documentTemplates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                  <FieldHint>{currentTemplate.description}</FieldHint>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Votre nom / Société"
                    value={form.nom}
                    placeholder="Ex : Jean Dupont"
                    onChange={(v) => setForm((s) => ({ ...s, nom: v }))}
                  />
                  <TextField
                    label="Ville"
                    value={form.ville}
                    placeholder="Ex : Toulouse"
                    onChange={(v) => setForm((s) => ({ ...s, ville: v }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Adresse"
                    value={form.adresse}
                    placeholder="Ex : 12 rue …"
                    onChange={(v) => setForm((s) => ({ ...s, adresse: v }))}
                  />
                  <TextField
                    label="Date (jj/mm/aaaa)"
                    value={form.date}
                    placeholder="Ex : 12/02/2026"
                    hint="Laissez vide si vous ne souhaitez pas l'afficher"
                    error={dateError}
                    onChange={(v) => setForm((s) => ({ ...s, date: v }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Destinataire"
                    value={form.destinataire}
                    placeholder="Ex : Société X"
                    onChange={(v) => setForm((s) => ({ ...s, destinataire: v }))}
                  />
                  <TextField
                    label="Adresse du destinataire"
                    value={form.adresseDestinataire}
                    placeholder="Ex : 8 avenue …"
                    onChange={(v) => setForm((s) => ({ ...s, adresseDestinataire: v }))}
                  />
                </div>

                <TextField
                  label="Objet"
                  value={form.objet}
                  placeholder="Ex : Mise en demeure de …"
                  onChange={(v) => setForm((s) => ({ ...s, objet: v }))}
                />

                <TextAreaField
                  label="Les faits"
                  value={form.faits}
                  placeholder="Décrivez la situation (chronologie, contexte)…"
                  onChange={(v) => setForm((s) => ({ ...s, faits: v }))}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Ce que vous demandez"
                    value={form.demande}
                    placeholder="Indiquez votre demande précise…"
                    onChange={(v) => setForm((s) => ({ ...s, demande: v }))}
                  />

                  <TextField
                    label="Délai (en jours)"
                    value={form.delai}
                    placeholder="Ex : 8"
                    hint="Optionnel. Utilisé si le modèle l'affiche."
                    error={delaiError}
                    onChange={(v) => setForm((s) => ({ ...s, delai: v }))}
                  />
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Button type="button" onClick={handleCopy} disabled={disableActions}>
                    {isCopying ? "Copie…" : "Copier le texte"}
                  </Button>

                  <Button type="button" variant="secondary" onClick={handleDownloadPdf} disabled={disableActions}>
                    {isPdfLoading ? "Génération…" : "Télécharger en PDF"}
                  </Button>

                  <Button type="button" variant="ghost" onClick={handlePrint} disabled={disableActions}>
                    Imprimer
                  </Button>

                  <Button type="button" variant="ghost" onClick={handleDownloadTxt} disabled={disableActions}>
                    Télécharger en .txt
                  </Button>

                  <Button type="button" variant="ghost" onClick={doClearDraft} disabled={isCopying || isPdfLoading}>
                    Effacer le brouillon
                  </Button>

                  <Button type="button" variant="outline" asChild>
                    <Link href="/compte">Gérer mes données</Link>
                  </Button>

                  <div className="flex-1" />

                  {hasBlockingError ? (
                    <span className="self-center text-xs text-red-600">Corrigez la date et/ou le délai.</span>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* APERÇU */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Aperçu du document</h2>
                  <p className="text-xs text-zinc-500">Mise à jour en temps réel</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-zinc-200 bg-white p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("layout")}
                      className={
                        "rounded px-2 py-1 transition " +
                        (previewMode === "layout"
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-700 hover:bg-zinc-50")
                      }
                    >
                      Mise en page
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("text")}
                      className={
                        "rounded px-2 py-1 transition " +
                        (previewMode === "text"
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-700 hover:bg-zinc-50")
                      }
                    >
                      Texte
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {previewMode === "text" ? (
                  <pre className="whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-900">
                    {previewText}
                  </pre>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-white p-6">
                    <div className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-900">
                      <pre className="whitespace-pre-wrap">{previewText}</pre>
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                ⚠️ LEXOUTIL propose des modèles et une assistance générale. Aucun conseil juridique personnalisé.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
