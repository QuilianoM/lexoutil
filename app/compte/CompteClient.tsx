"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { isPro, refreshProStatus } from "@/lib/subscription";

import {
  clearAllLocalUserData,
  downloadBackupFile,
  getLocalDocumentsStats,
} from "@/lib/user-data";

import { listMyDocuments, deleteDocumentById } from "@/lib/supabase-documents";

type LocalStats = {
  hasDraft: boolean;
  historyCount: number;
  historyLimit: number;
  draftSavedAt?: number | null;
};

function formatFR(ts?: number | null) {
  if (!ts) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function supabaseErrorToFR(raw?: string) {
  const m = (raw || "").toLowerCase();
  if (!m) return "Une erreur est survenue. Réessayez.";

  if (m.includes("not connected") || m.includes("non connecté")) return "Vous n’êtes pas connecté.";
  if (m.includes("network") || m.includes("fetch")) return "Problème de connexion internet. Réessayez.";
  if (m.includes("permission") || m.includes("not allowed") || m.includes("forbidden")) return "Action non autorisée.";
  if (m.includes("too many requests")) return "Trop de tentatives. Attendez un peu puis réessayez.";

  return "Action impossible. Réessayez plus tard.";
}

function safeGetLocalStats(): LocalStats {
  try {
    return getLocalDocumentsStats() as LocalStats;
  } catch {
    return { hasDraft: false, historyCount: 0, historyLimit: 0, draftSavedAt: null };
  }
}

export default function ComptePage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);

  // user
  const [email, setEmail] = useState<string>("");
  const [lastSignInAt, setLastSignInAt] = useState<number | null>(null);

  // statut
  const [proStatus, setProStatus] = useState<"pro" | "free">("free");
  const [proSyncLoading, setProSyncLoading] = useState(false);

  // local stats
  const [localReady, setLocalReady] = useState(false);
  const [localStats, setLocalStats] = useState<LocalStats>({
    hasDraft: false,
    historyCount: 0,
    historyLimit: 0,
    draftSavedAt: null,
  });

  // cloud stats
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudCount, setCloudCount] = useState<number | null>(null);

  // UX
  const [message, setMessage] = useState<string>("");

  // confirmations
  const [confirmLocal, setConfirmLocal] = useState(false);
  const [confirmCloudText, setConfirmCloudText] = useState("");
  const cloudCanDelete = confirmCloudText.trim().toUpperCase() === "SUPPRIMER";

  // reset password
  const [resetLoading, setResetLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>("");

  // Stripe portal
  const [portalLoading, setPortalLoading] = useState(false);

  // ✅ Charge localStats après montage (évite hydration mismatch)
  useEffect(() => {
    setLocalStats(safeGetLocalStats());
    setLocalReady(true);
  }, []);

  async function syncProFromServer() {
    setProSyncLoading(true);
    try {
      const res = await refreshProStatus();
      if (res.ok) {
        setProStatus(res.pro ? "pro" : "free");
      } else {
        // si l'appel échoue, on garde le cache local existant
        setProStatus(isPro() ? "pro" : "free");
      }
    } finally {
      setProSyncLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        router.replace("/connexion?redirect=%2Fcompte");
        return;
      }

      const userEmail = data.user.email || "";
      setEmail(userEmail);
      setResetEmail(userEmail);

      setLastSignInAt(data.user.last_sign_in_at ? Date.parse(data.user.last_sign_in_at) : null);

      // 1) statut immédiat (cache local)
      setProStatus(isPro() ? "pro" : "free");

      setLoading(false);

      // 2) re-sync serveur (fiable)
      await syncProFromServer();
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refreshLocalStats() {
    setMessage("");
    setLocalStats(safeGetLocalStats());
    setLocalReady(true);
  }

  async function handleLogout() {
    setMessage("");
    await supabase.auth.signOut();
    router.replace("/connexion");
  }

  async function handleDownloadBackup() {
    setMessage("");
    downloadBackupFile();
    setMessage("Sauvegarde téléchargée (fichier .json).");
  }

  function handleDeleteLocalData() {
    setMessage("");

    if (!confirmLocal) {
      setMessage("Veuillez cocher la confirmation avant de supprimer les données locales.");
      return;
    }

    clearAllLocalUserData();
    refreshLocalStats();
    setConfirmLocal(false);
    setMessage("✅ Données locales supprimées (brouillon + historique).");
  }

  async function handleRefreshCloudCount() {
    setMessage("");
    setCloudLoading(true);
    try {
      const docs = await listMyDocuments(200);
      setCloudCount(docs.length);
      setMessage("Historique en ligne chargé.");
    } catch (e: any) {
      setCloudCount(null);
      setMessage(supabaseErrorToFR(e?.message));
    } finally {
      setCloudLoading(false);
    }
  }

  async function handleDeleteCloudHistory() {
    setMessage("");

    if (!cloudCanDelete) {
      setMessage("Tapez SUPPRIMER pour confirmer la suppression de l’historique en ligne.");
      return;
    }

    setCloudLoading(true);
    try {
      let totalDeleted = 0;

      while (true) {
        const docs = await listMyDocuments(200);
        if (!docs.length) break;

        for (const d of docs) {
          await deleteDocumentById(d.id);
          totalDeleted += 1;
        }

        if (totalDeleted > 5000) break;
      }

      setCloudCount(0);
      setConfirmCloudText("");
      setMessage(`✅ Historique en ligne supprimé (${totalDeleted} document(s)).`);
    } catch (e: any) {
      setMessage(supabaseErrorToFR(e?.message));
    } finally {
      setCloudLoading(false);
    }
  }

  async function handleSendResetPasswordEmail() {
    setMessage("");

    const target = resetEmail.trim();
    if (!isValidEmail(target)) {
      setMessage("Email invalide. Vérifiez l’adresse puis réessayez.");
      return;
    }

    setResetLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reinitialisation`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(target, { redirectTo });

      if (error) {
        setMessage(supabaseErrorToFR(error.message));
        return;
      }

      setMessage("✅ Email envoyé. Vérifiez votre boîte mail (et les spams) pour réinitialiser le mot de passe.");
    } finally {
      setResetLoading(false);
    }
  }

  async function handleOpenStripePortal() {
    setMessage("");
    setPortalLoading(true);

    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || data?.ok !== true || typeof data?.url !== "string") {
        setMessage(typeof data?.error === "string" ? data.error : "Impossible d’ouvrir le portail Stripe.");
        return;
      }

      window.location.href = data.url;
    } catch (e: any) {
      setMessage(e?.message ? supabaseErrorToFR(e.message) : "Impossible d’ouvrir le portail Stripe.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-4xl py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Compte</h1>
              <p className="mt-1 text-sm text-zinc-600">
                Gérez votre connexion, votre statut Pro, vos données locales et votre historique en ligne.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">SUPABASE</Badge>
              <Badge className={proStatus === "pro" ? "bg-zinc-900 text-white" : ""}>
                {proStatus === "pro" ? "PRO" : "FREE"}
              </Badge>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          {/* INFOS COMPTE + ABONNEMENT */}
          <Card className="mt-6">
            <CardContent className="p-5">
              {loading ? (
                <div className="text-sm text-zinc-500">Chargement…</div>
              ) : (
                <div className="grid gap-4">
                  <div className="rounded-lg border border-zinc-200 bg-white p-4">
                    <div className="text-sm font-semibold text-zinc-900">Informations</div>

                    <div className="mt-2 text-xs text-zinc-700">
                      Email : <span className="font-mono">{email || "—"}</span>
                    </div>

                    <div className="text-xs text-zinc-700">
                      Dernière connexion : <span className="font-mono">{formatFR(lastSignInAt)}</span>
                    </div>

                    <div className="mt-3 text-xs text-zinc-500">
                      Statut : {proStatus === "pro" ? "Pro actif" : "Free"}.
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button type="button" variant="secondary" onClick={syncProFromServer} disabled={proSyncLoading}>
                        {proSyncLoading ? "Actualisation…" : "Actualiser le statut"}
                      </Button>

                      {proStatus === "pro" ? (
                        <Button type="button" onClick={handleOpenStripePortal} disabled={portalLoading}>
                          {portalLoading ? "Ouverture…" : "Gérer mon abonnement"}
                        </Button>
                      ) : (
                        <Button type="button" onClick={() => router.push("/tarifs")}>
                          Passer Pro
                        </Button>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-zinc-500">
                      Le portail Stripe permet de gérer la carte, l’abonnement et les factures.
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={handleLogout}>
                      Se déconnecter
                    </Button>

                    <Button type="button" variant="secondary" onClick={() => router.push("/documents")}>
                      Aller aux documents
                    </Button>

                    <Button type="button" variant="ghost" onClick={() => router.push("/historique")}>
                      Historique
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MOT DE PASSE */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Mot de passe</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Recevez un email pour réinitialiser votre mot de passe.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">SÉCURITÉ</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="grid gap-1">
                  <label htmlFor="resetEmail" className="text-xs font-medium text-zinc-800">
                    Email du compte
                  </label>
                  <Input
                    id="resetEmail"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ex : nom@email.com"
                    autoComplete="email"
                    inputMode="email"
                  />
                  <div className="text-xs text-zinc-500">
                    Le lien de réinitialisation sera envoyé à cette adresse.
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleSendResetPasswordEmail} disabled={resetLoading}>
                    {resetLoading ? "Envoi…" : "Envoyer le lien de réinitialisation"}
                  </Button>
                </div>

                <p className="text-xs text-zinc-500">
                  Astuce : si vous ne recevez rien, vérifiez les spams/indésirables.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* DONNÉES LOCALES */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Données locales (sur cet appareil)</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Brouillon et historique enregistrés dans votre navigateur.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">LOCAL</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="text-xs text-zinc-700">
                    Brouillon enregistré :{" "}
                    <span className="font-mono">
                      {localReady ? (localStats.hasDraft ? "oui" : "non") : "—"}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-700">
                    Documents dans l’historique :{" "}
                    <span className="font-mono">{localReady ? localStats.historyCount : "—"}</span>
                  </div>

                  <div className="text-xs text-zinc-700">
                    Dernière sauvegarde du brouillon :{" "}
                    <span className="font-mono">
                      {localReady ? formatFR(localStats.draftSavedAt ?? null) : "—"}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-zinc-500">
                    Limite actuelle :{" "}
                    <span className="font-mono">{localReady ? localStats.historyLimit : "—"}</span> documents
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={handleDownloadBackup}>
                    Télécharger une sauvegarde
                  </Button>

                  <Button type="button" variant="ghost" onClick={refreshLocalStats}>
                    Actualiser
                  </Button>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="text-sm font-semibold text-zinc-900">Supprimer les données locales</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Cela supprime le brouillon + l’historique de ce navigateur (cela ne supprime pas vos données Supabase).
                  </p>

                  <div className="mt-3 flex items-start gap-2">
                    <input
                      id="confirmLocal"
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={confirmLocal}
                      onChange={(e) => setConfirmLocal(e.target.checked)}
                    />
                    <label htmlFor="confirmLocal" className="text-sm text-zinc-700">
                      Je confirme vouloir supprimer les données locales.
                    </label>
                  </div>

                  <div className="mt-3">
                    <Button type="button" onClick={handleDeleteLocalData}>
                      Supprimer les données locales
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DONNÉES EN LIGNE */}
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">Historique en ligne (Supabase)</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Documents enregistrés dans votre base Supabase (si vous êtes connecté).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">CLOUD</Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="text-xs text-zinc-700">
                    Documents en ligne : <span className="font-mono">{cloudCount === null ? "—" : cloudCount}</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={handleRefreshCloudCount} disabled={cloudLoading}>
                      {cloudLoading ? "Chargement…" : "Actualiser le nombre"}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="text-sm font-semibold text-zinc-900">Supprimer l’historique en ligne</div>
                  <p className="mt-1 text-xs text-zinc-500">
                    ⚠️ Cette action supprime définitivement tous vos documents en ligne. Tapez{" "}
                    <span className="font-mono">SUPPRIMER</span> pour confirmer.
                  </p>

                  <div className="mt-3 grid gap-2">
                    <label htmlFor="confirmCloud" className="text-xs font-medium text-zinc-800">
                      Confirmation
                    </label>
                    <Input
                      id="confirmCloud"
                      value={confirmCloudText}
                      onChange={(e) => setConfirmCloudText(e.target.value)}
                      placeholder="Tapez SUPPRIMER"
                    />
                  </div>

                  <div className="mt-3">
                    <Button type="button" onClick={handleDeleteCloudHistory} disabled={cloudLoading || !cloudCanDelete}>
                      {cloudLoading ? "Suppression…" : "Supprimer l’historique en ligne"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-xs text-zinc-500">
            ⚠️ LEXOUTIL propose des modèles et une assistance générale. Aucun conseil juridique personnalisé.
          </p>
        </div>
      </Section>
    </Container>
  );
}
