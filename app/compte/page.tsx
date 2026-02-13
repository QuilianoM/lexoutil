"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLocalUserId, getSubscriptionStatus, setSubscriptionStatus } from "@/lib/subscription";
import {
  clearAllLocalUserData,
  clearHistory,
  downloadBackupFile,
  getLocalDocumentsStats,
  importUserBackupFromText,
} from "@/lib/user-data";

export default function ComptePage() {
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"free" | "pro">("free");

  const [docStats, setDocStats] = useState<{
    hasDraft: boolean;
    draftSavedAt?: number;
    historyCount: number;
  }>({ hasDraft: false, historyCount: 0 });

  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    refreshStats();
  }, []);

  function refreshStats() {
    setUserId(getLocalUserId());
    setStatus(getSubscriptionStatus());
    setDocStats(getLocalDocumentsStats());
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
      setMessage(
        `Import réussi : historique +${res.importedHistoryCount} entrées` +
          (res.importedDraft ? " (brouillon restauré)." : ".")
      );
      refreshStats();
    } catch (e: any) {
      setMessage(e?.message || "Import impossible : fichier non reconnu.");
    }
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

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-5xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Compte</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Cette page est prête pour le futur login (NextAuth) et les abonnements (Stripe).
              </p>
            </div>
            <Badge>{status === "pro" ? "Pro (test)" : "Gratuit"}</Badge>
          </div>

          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="grid gap-2 text-sm text-zinc-700">
                <div>
                  <span className="font-semibold">Identifiant local :</span>{" "}
                  <span className="font-mono text-xs">{userId || "…"}</span>
                </div>

                <div>
                  <span className="font-semibold">Statut :</span> {status === "pro" ? "Pro" : "Gratuit"}
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  Plus tard, cet identifiant sera remplacé par le compte (email / connexion). On pourra importer
                  automatiquement l’historique local dans le cloud.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubscriptionStatus("pro");
                      setStatus("pro");
                    }}
                  >
                    Activer Pro (test)
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSubscriptionStatus("free");
                      setStatus("free");
                    }}
                  >
                    Repasser Gratuit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ✅ Étape 7 : Données locales */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900">Données locales</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Vos documents sont enregistrés uniquement sur cet appareil (localStorage).
                  </p>
                </div>
                <Badge>{docStats.historyCount} document(s)</Badge>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-zinc-700">
                <div>
                  <span className="font-semibold">Brouillon :</span>{" "}
                  {docStats.hasDraft ? (
                    <span>présent (dernière sauvegarde : {formatFR(docStats.draftSavedAt)})</span>
                  ) : (
                    <span>aucun</span>
                  )}
                </div>

                <div>
                  <span className="font-semibold">Historique :</span> {docStats.historyCount} entrée(s)
                </div>

                {message ? (
                  <p className="mt-2 rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-700">
                    {message}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      downloadBackupFile();
                      setMessage("Sauvegarde téléchargée (JSON). Conservez-la précieusement.");
                    }}
                  >
                    Télécharger une sauvegarde
                  </Button>

                  <Button variant="ghost" onClick={openImportDialog}>
                    Importer une sauvegarde
                  </Button>

                  <div className="flex-1" />

                  {/* ✅ Nouveau bouton : effacer uniquement l’historique */}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ok = window.confirm(
                        "Supprimer uniquement l’historique des documents sur cet appareil ?\n\nLe brouillon sera conservé."
                      );
                      if (!ok) return;
                      clearHistory();
                      setMessage("Historique supprimé (brouillon conservé).");
                      refreshStats();
                    }}
                    disabled={docStats.historyCount === 0}
                  >
                    Effacer l’historique
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      const ok = window.confirm(
                        "Supprimer TOUTES les données locales LEXOUTIL sur cet appareil ?\n\n- Brouillon\n- Historique\n- Identifiant local\n- Statut Pro (test)\n\nAction irréversible (sauf si vous avez une sauvegarde)."
                      );
                      if (!ok) return;
                      clearAllLocalUserData();
                      setMessage("Données locales supprimées.");
                      refreshStats();
                    }}
                  >
                    Tout supprimer (cet appareil)
                  </Button>
                </div>

                {/* input caché pour import */}
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
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </Container>
  );
}
