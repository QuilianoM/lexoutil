"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function supabaseErrorToFR(raw?: string) {
  const m = (raw || "").toLowerCase();
  if (!m) return "Une erreur est survenue. Réessayez.";

  if (m.includes("password") && (m.includes("weak") || m.includes("should be") || m.includes("short"))) {
    return "Mot de passe trop faible. Utilisez au moins 6 caractères.";
  }
  if (m.includes("expired") || m.includes("invalid") || m.includes("token")) {
    return "Lien invalide ou expiré. Demandez un nouveau lien depuis votre compte.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Problème de connexion internet. Réessayez.";
  }
  if (m.includes("too many requests")) {
    return "Trop de tentatives. Attendez un peu puis réessayez.";
  }

  return "Action impossible. Réessayez plus tard.";
}

function getHashParam(name: string) {
  // Ex : #access_token=...&refresh_token=...
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  if (!hash || hash.length < 2) return "";
  const params = new URLSearchParams(hash.substring(1));
  return params.get(name) || "";
}

export default function ReinitialisationPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [info, setInfo] = useState<string>("Vérification du lien…");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        // 1) Cas Supabase v2 (PKCE) => lien avec ?code=...
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("error");
            setInfo(supabaseErrorToFR(error.message));
            return;
          }
        } else {
          // 2) Cas lien avec tokens dans le hash => #access_token=...&refresh_token=...
          const access_token = getHashParam("access_token");
          const refresh_token = getHashParam("refresh_token");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) {
              setStatus("error");
              setInfo(supabaseErrorToFR(error.message));
              return;
            }
          }
        }

        // 3) Vérifie qu'on a une session
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setStatus("error");
          setInfo("Lien invalide ou expiré. Demandez un nouveau lien depuis votre compte.");
          return;
        }

        setStatus("ready");
        setInfo("Vous pouvez définir un nouveau mot de passe.");
      } catch (e: any) {
        setStatus("error");
        setInfo(supabaseErrorToFR(e?.message));
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate() {
    setPasswordError(null);
    setConfirmError(null);

    let ok = true;

    if (!password || password.length < 6) {
      setPasswordError("Mot de passe trop court (minimum 6 caractères).");
      ok = false;
    }

    if (confirm !== password) {
      setConfirmError("La confirmation ne correspond pas.");
      ok = false;
    }

    return ok;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setInfo("");
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setInfo(supabaseErrorToFR(error.message));
        return;
      }

      // Sécurité : on déconnecte et on renvoie vers la connexion
      await supabase.auth.signOut();

      router.replace("/connexion");
    } catch (e: any) {
      setInfo(supabaseErrorToFR(e?.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-4xl py-10">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-2">
                  <h1 className="text-xl font-semibold text-zinc-900">Réinitialisation</h1>
                  <Badge variant="outline">SÉCURITÉ</Badge>
                </div>

                <p className="mt-1 text-sm text-zinc-600">
                  Définissez un nouveau mot de passe pour votre compte.
                </p>

                <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                  {info}
                </div>

                {status === "loading" ? (
                  <div className="mt-5 text-sm text-zinc-500">Chargement…</div>
                ) : null}

                {status === "error" ? (
                  <div className="mt-5 grid gap-2">
                    <Button type="button" variant="secondary" onClick={() => router.push("/connexion")}>
                      Retour à la connexion
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => router.push("/compte")}>
                      Aller à mon compte
                    </Button>
                  </div>
                ) : null}

                {status === "ready" ? (
                  <form onSubmit={handleSave} className="mt-5 grid gap-4" noValidate>
                    <div className="grid gap-1">
                      <label htmlFor="password" className="text-xs font-medium text-zinc-800">
                        Nouveau mot de passe
                      </label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="minimum 6 caractères"
                        autoComplete="new-password"
                        aria-invalid={Boolean(passwordError) || undefined}
                      />
                      {passwordError ? <div className="text-xs text-red-600">{passwordError}</div> : null}
                    </div>

                    <div className="grid gap-1">
                      <label htmlFor="confirm" className="text-xs font-medium text-zinc-800">
                        Confirmation
                      </label>
                      <Input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="retapez le mot de passe"
                        autoComplete="new-password"
                        aria-invalid={Boolean(confirmError) || undefined}
                      />
                      {confirmError ? <div className="text-xs text-red-600">{confirmError}</div> : null}
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? "Enregistrement…" : "Enregistrer le nouveau mot de passe"}
                    </Button>

                    <p className="text-xs text-zinc-500">
                      Après enregistrement, vous serez redirigé vers la page de connexion.
                    </p>
                  </form>
                ) : null}

                <p className="mt-6 text-xs text-zinc-500">
                  ⚠️ LEXOUTIL propose des modèles et une assistance générale. Aucun conseil juridique personnalisé.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </Container>
  );
}
