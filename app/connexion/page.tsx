"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function supabaseErrorToFR(raw?: string) {
  const m = (raw || "").toLowerCase();

  if (!m) return "Une erreur est survenue. Réessayez.";
  if (m.includes("invalid login credentials"))
    return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed") || m.includes("not confirmed"))
    return "Votre email n’est pas confirmé. Utilisez “Renvoyer l’email de confirmation”.";
  if (m.includes("too many requests"))
    return "Trop de tentatives. Attendez un peu puis réessayez.";
  if (m.includes("user not found"))
    return "Aucun compte trouvé avec cet email.";
  if (m.includes("password") && m.includes("invalid"))
    return "Mot de passe incorrect.";
  if (m.includes("network") || m.includes("fetch"))
    return "Problème de connexion internet. Réessayez.";

  return "Connexion impossible. Vérifiez vos informations et réessayez.";
}

export default function ConnexionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useMemo(() => {
    const r = searchParams.get("redirect");
    return r && r.startsWith("/") ? r : "/compte";
  }, [searchParams]);

  const resetSuccess = searchParams.get("reset") === "success";

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string>("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (resetSuccess) {
      setMessage("✅ Mot de passe modifié, vous pouvez vous connecter.");
    }

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) router.replace(redirect);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetErrors() {
    setMessage("");
    setEmailError(null);
    setPasswordError(null);
  }

  function validate() {
    let ok = true;
    const eMail = email.trim();

    if (!isValidEmail(eMail)) {
      setEmailError("Email invalide (ex : nom@email.com).");
      ok = false;
    }

    if (!password || password.length < 6) {
      setPasswordError("Mot de passe invalide (minimum 6 caractères).");
      ok = false;
    }

    return ok;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();

    if (!validate()) return;

    setLoading(true);
    try {
      const eMail = email.trim();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: eMail,
        password,
      });

      if (error || !data?.user) {
        setMessage(supabaseErrorToFR(error?.message));
        return;
      }

      router.replace(redirect);
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmationEmail() {
    resetErrors();

    const eMail = email.trim();
    if (!isValidEmail(eMail)) {
      setEmailError("Saisissez votre email pour renvoyer le lien de confirmation.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: eMail,
      });

      if (error) {
        setMessage(supabaseErrorToFR(error.message));
        return;
      }

      setMessage("Email de confirmation renvoyé. Vérifiez aussi les spams/indésirables.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-4xl py-10">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h1 className="text-xl font-semibold text-zinc-900">Connexion</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Connectez-vous pour accéder à votre compte.
                </p>

                {message ? (
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}

                <form onSubmit={handleLogin} className="mt-5 grid gap-4" noValidate>
                  <div className="grid gap-1">
                    <label htmlFor="email" className="text-xs font-medium text-zinc-800">
                      Email
                    </label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex : nom@email.com"
                      autoComplete="email"
                    />
                    {emailError && <div className="text-xs text-red-600">{emailError}</div>}
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="password" className="text-xs font-medium text-zinc-800">
                      Mot de passe
                    </label>
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                    />
                    {passwordError && <div className="text-xs text-red-600">{passwordError}</div>}
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Connexion…" : "Se connecter"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resendConfirmationEmail}
                    disabled={loading}
                  >
                    Renvoyer l’email de confirmation
                  </Button>

                  <Button type="button" variant="ghost" asChild>
                    <Link href={`/inscription?redirect=${encodeURIComponent(redirect)}`}>
                      Créer un compte
                    </Link>
                  </Button>
                </form>

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
