"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  loadHistory,
  removeHistoryItemById,
  saveDraft,
  clearHistory,
  clearDraft,
  type HistoryItem,
} from "@/lib/user-data";

import { documentTemplates } from "@/lib/document-templates";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

import {
  deleteDocumentById,
  listMyDocuments,
  syncLocalHistoryToCloud,
  type SupabaseDocumentRow,
} from "@/lib/supabase-documents";

import { isPro } from "@/lib/subscription";
import { erreurFR } from "@/lib/errors-fr";

function formatFR(ts: number) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString("fr-FR");
  }
}

type Mode = "cloud" | "local";

function templateLabelOf(templateId: string | null | undefined) {
  if (!templateId) return "Document";
  const t = documentTemplates.find((x) => x.id === templateId);
  return t?.label ?? templateId;
}

function cloudRowToHistoryItem(row: SupabaseDocumentRow): HistoryItem {
  return {
    id: String(row.id),
    createdAt: row.created_at ? Date.parse(row.created_at) : Date.now(),
    templateId: row.template_id ?? "",
    templateLabel: row.template_label ?? templateLabelOf(row.template_id),
    objet: row.objet ?? "",
    destinataire: row.destinataire ?? "",
    snippet: row.snippet ?? "",
    form: (row.form ?? {}) as Record<string, unknown>,
  };
}

export default function HistoriquePage() {
  const [mode, setMode] = useState<Mode>("local");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string>("");

  const [cloudRows, setCloudRows] = useState<SupabaseDocumentRow[]>([]);
  const [localRows, setLocalRows] = useState<HistoryItem[]>([]);
  const [q, setQ] = useState("");

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  // évite de relancer l’auto-sync en boucle
  const autoSyncDoneRef = useRef(false);

  async function getUserOrNull() {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user ?? null;
    } catch {
      return null;
    }
  }

  function buildSyncPayload(items: HistoryItem[]) {
    return items.map((it) => ({
      id: it.id,
      templateId: it.templateId,
      templateLabel: it.templateLabel,
      objet: it.objet,
      destinataire: it.destinataire,
      snippet: it.snippet,
      form: it.form,
      content: it.snippet || "",
      createdAt: it.createdAt,
    }));
  }

  async function autoSyncLocalIfNeeded() {
    const user = await getUserOrNull();
    if (!user) return;

    // ✅ Cloud réservé au Pro
    if (!isPro()) return;

    if (autoSyncDoneRef.current) return;

    const local = loadHistory();
    if (!local || local.length === 0) {
      autoSyncDoneRef.current = true;
      return;
    }

    autoSyncDoneRef.current = true;

    try {
      setSyncing(true);
      const payload = buildSyncPayload(local);
      const result = await syncLocalHistoryToCloud(payload);

      // Après sync réussie, on vide le local
      clearHistory();
      clearDraft();

      setMessage(
        `Synchronisation : ${result.created} ajouté(s), ${result.skipped} déjà présent(s).`
      );
      window.setTimeout(() => setMessage(""), 3500);
    } catch (e: any) {
      setMessage(erreurFR(e, "Synchro impossible. Vos documents restent en local."));
      window.setTimeout(() => setMessage(""), 3500);
    } finally {
      setSyncing(false);
    }
  }

  async function refresh() {
    setLoading(true);
    setMessage("");

    try {
      // Toujours charger le local
      setLocalRows(loadHistory());

      const user = await getUserOrNull();

      if (!user) {
        setMode("local");
        setCloudRows([]);
        return;
      }

      // ✅ connecté mais Free => local seulement
      if (!isPro()) {
        setMode("local");
        setCloudRows([]);
        return;
      }

      // ✅ connecté + Pro => auto-sync local -> cloud (une seule fois)
      await autoSyncLocalIfNeeded();

      setMode("cloud");
      const cloud = await listMyDocuments(200);
      setCloudRows(cloud);

      // recharge local (normalement vide après sync)
      setLocalRows(loadHistory());
    } catch (e: any) {
      setMode("local");
      setCloudRows([]);
      setLocalRows(loadHistory());
      setMessage(erreurFR(e, "Impossible de charger l’historique."));
      window.setTimeout(() => setMessage(""), 3500);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayRows = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = mode === "cloud" ? cloudRows.map(cloudRowToHistoryItem) : localRows;

    if (!query) return base;

    const hay = (s?: string | null) => (s || "").toLowerCase();
    return base.filter((r) => {
      return (
        hay(r.objet).includes(query) ||
        hay(r.destinataire).includes(query) ||
        hay(r.snippet).includes(query) ||
        hay(r.templateLabel).includes(query) ||
        hay(r.templateId).includes(query)
      );
    });
  }, [mode, q, cloudRows, localRows]);

  function goLogin() {
    window.location.href = `/connexion?redirect=${encodeURIComponent("/historique")}`;
  }

  async function handleSyncLocalToCloud() {
    // ✅ Pro uniquement
    if (!isPro()) {
      setMessage("La synchronisation cloud est réservée aux comptes Pro.");
      window.setTimeout(() => setMessage(""), 3500);
      return;
    }

    setSyncing(true);
    setMessage("");

    try {
      const local = loadHistory();
      if (!local || local.length === 0) {
        setMessage("Aucun document local à synchroniser.");
        window.setTimeout(() => setMessage(""), 2500);
        return;
      }

      const payload = buildSyncPayload(local);
      const result = await syncLocalHistoryToCloud(payload);

      clearHistory();
      clearDraft();

      setMessage(
        `Synchronisation : ${result.created} ajouté(s), ${result.skipped} déjà présent(s).`
      );
      window.setTimeout(() => setMessage(""), 3500);

      await refresh();
    } catch (e: any) {
      setMessage(erreurFR(e, "Synchronisation impossible."));
      window.setTimeout(() => setMessage(""), 3500);
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeleteCloud(id: string) {
    try {
      await deleteDocumentById(id);
      setMessage("Document supprimé.");
      window.setTimeout(() => setMessage(""), 2000);
      await refresh();
    } catch (e: any) {
      setMessage(erreurFR(e, "Suppression impossible."));
      window.setTimeout(() => setMessage(""), 3000);
    }
  }

  function handleUseLocal(item: HistoryItem) {
    try {
      saveDraft({
        form: item.form,
        previewMode: "layout",
        savedAt: Date.now(),
      });
      window.location.href = "/documents";
    } catch {
      setMessage("Impossible d’ouvrir ce document.");
      window.setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <Container size="md" className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Historique</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Retrouvez vos documents enregistrés. En Pro, vous avez aussi l’historique en ligne (cloud).
      </p>

      <Section className="pt-6">
        {message ? (
          <Card>
            <CardContent className="p-4 text-sm text-zinc-700">{message}</CardContent>
          </Card>
        ) : null}

        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  Mode : {mode === "cloud" ? "En ligne (Pro)" : "Local"}
                </Badge>

                {!loading && !syncing && (
                  <Badge variant="outline">{displayRows.length} élément(s)</Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={refresh} disabled={loading || syncing}>
                  Actualiser
                </Button>

                {/* Bouton sync : seulement Pro */}
                <Button onClick={handleSyncLocalToCloud} disabled={loading || syncing || !isPro()}>
                  {syncing ? "Synchronisation..." : "Sync local → cloud (Pro)"}
                </Button>

                {/* Connexion */}
                <Button asChild variant="outline">
                  <Link href="/connexion">Connexion</Link>
                </Button>

                {/* Tarifs */}
                <Button asChild>
                  <Link href="/tarifs">Tarifs</Link>
                </Button>
              </div>
            </div>

            {/* Si connecté mais pas Pro : explication */}
            {!isPro() ? (
              <div className="mt-4 rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
                <div className="font-semibold text-zinc-900">Cloud réservé aux comptes Pro</div>
                <p className="mt-1 text-zinc-600">
                  En gratuit, vos documents restent sur cet appareil (local). En Pro, vous bénéficiez de :
                  historique en ligne, synchronisation, et sauvegarde sur plusieurs appareils.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href="/tarifs">Passer en Pro</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/documents">Continuer</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (objet, destinataire, texte...)"
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section className="pt-6">
        <div className="grid gap-3">
          {displayRows.map((it) => (
            <Card key={it.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900">
                      {it.templateLabel || templateLabelOf(it.templateId)}
                    </div>

                    <div className="mt-1 text-xs text-zinc-600">
                      {formatFR(it.createdAt)} • {it.objet || "Sans objet"} •{" "}
                      {it.destinataire || "Sans destinataire"}
                    </div>

                    <div className="mt-2 text-sm text-zinc-700 line-clamp-3">
                      {it.snippet || "—"}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <Button variant="outline" onClick={() => handleUseLocal(it)}>
                      Ouvrir
                    </Button>

                    {mode === "cloud" ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDeleteCloud(it.id)}
                      >
                        Supprimer (cloud)
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          removeHistoryItemById(it.id);
                          setLocalRows(loadHistory());
                        }}
                      >
                        Supprimer (local)
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayRows.length === 0 ? (
            <Card>
              <CardContent className="p-5 text-sm text-zinc-700">
                Aucun document pour le moment.
                <div className="mt-3">
                  <Button asChild>
                    <Link href="/documents">Créer un document</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </Section>
    </Container>
  );
}
