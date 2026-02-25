"use client";

import { useMemo, useState } from "react";
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
  if (m.includes("user already registered") || m.includes("already registered"))
    return "Un compte existe déjà avec cet email. Essayez de vous connecter.";
  if (m.includes("password") && m.includes("should be"))
    return "Mot de passe trop faible. Utilisez au moins 6 caractères.";
  if (m.includes("too many requests"))
    return "Trop de tentatives. Attendez un peu puis réessayez.";
  if (m.includes("invalid email"))
    return "Email invalide.";
  if (m.includes("network") || m.includes("fetch"))
    return "Problème de connexion internet. Réessayez.";

  return "Création du compte impossible. Réessayez plus tard.";
}

export default function InscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = useMemo(() => {
    const r = searchParams.get("redirect");
    return r && r.startsWith("/") ? r : "/compte";
  }, [searchParams]);

  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // conformité : acceptation CGU + confidentialité
  const [accept, setAccept] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<string>("");

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  function resetErrors() {
    setMessage("");
    setEmailError(null);
    setPasswordError(null);
    setAcceptError(null);
  }

  function validate() {
    let ok = true;
    const eMail = email.trim();

    if (!isValidEmail(eMail)) {
      setEmailError("Email invalide (ex : nom@email.com).");
      ok = false;
    }

    if (!password || password.length < 6) {
      setPasswordError("Mot de passe trop court (minimum 6 caractères).");
      ok = false;
    }

    if (!accept) {
      setAcceptError("Vous devez accepter les CGU et la politique de confidentialité.");
      ok = false;
    }

    return ok;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    resetErrors();

    if (!validate()) return;

    setLoading(true);
    try {
      const eMail = email.trim();

      const { data, error } = await supabase.auth.signUp({
        email: eMail,
        password,
        options: {
          // redirection après confirmation email (quand tu as un domaine)
          emailRedirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}${redirect}`
              : undefined,
        },
      });

      if (error) {
        setMessage(supabaseErrorToFR(error.message));
        return;
      }

      // Cas 1 : Email confirmation activée => session souvent null
      // Cas 2 : Email confirmation désactivée => session existe
      if (data?.session) {
        router.replace(redirect);
        return;
      }

      setMessage(
        "Compte créé. Vérifiez votre boîte mail (et les spams) pour confirmer votre email, puis revenez vous connecter."
      );
    } finally {
      setLoading(false);
    }
  }

  const emailHintId = "email-hint";
  const emailErrorId = emailError ? "email-error" : undefined;

  const passwordHintId = "password-hint";
  const passwordErrorId = passwordError ? "password-error" : undefined;

  const acceptHintId = "accept-hint";
  const acceptErrorId = acceptError ? "accept-error" : undefined;

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-4xl py-10">
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h1 className="text-xl font-semibold text-zinc-900">Créer un compte</h1>
                <p className="mt-1 text-sm text-zinc-600">
                  Créez votre compte pour enregistrer votre historique.
                </p>

                {message ? (
                  <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
                    {message}
                  </div>
                ) : null}

                <form onSubmit={handleSignup} className="mt-5 grid gap-4" noValidate>
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
                      inputMode="email"
                      aria-invalid={Boolean(emailError) || undefined}
                      aria-describedby={[emailHintId, emailErrorId].filter(Boolean).join(" ") || undefined}
                    />
                    <div id={emailHintId} className="text-xs text-zinc-500">
                      Vous recevrez un email de confirmation.
                    </div>
                    {emailError ? (
                      <div id="email-error" className="text-xs text-red-600">
                        {emailError}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-1">
                    <label htmlFor="password" className="text-xs font-medium text-zinc-800">
                      Mot de passe
                    </label>
                    <Input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="minimum 6 caractères"
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(passwordError) || undefined}
                      aria-describedby={[passwordHintId, passwordErrorId].filter(Boolean).join(" ") || undefined}
                    />
                    <div id={passwordHintId} className="text-xs text-zinc-500">
                      Astuce : évitez un mot de passe trop simple.
                    </div>
                    {passwordError ? (
                      <div id="password-error" className="text-xs text-red-600">
                        {passwordError}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-start gap-2">
                      <input
                        id="accept"
                        type="checkbox"
                        className="mt-1 h-4 w-4"
                        checked={accept}
                        onChange={(e) => setAccept(e.target.checked)}
                        aria-invalid={Boolean(acceptError) || undefined}
                        aria-describedby={[acceptHintId, acceptErrorId].filter(Boolean).join(" ") || undefined}
                      />
                      <label htmlFor="accept" className="text-sm text-zinc-700">
                        J’accepte les{" "}
                        <Link className="underline" href="/cgu" target="_blank">
                          CGU
                        </Link>{" "}
                        et la{" "}
                        <Link className="underline" href="/confidentialite" target="_blank">
                          politique de confidentialité
                        </Link>
                        .
                      </label>
                    </div>

                    <div id={acceptHintId} className="text-xs text-zinc-500">
                      Obligatoire pour créer un compte.
                    </div>

                    {acceptError ? (
                      <div id="accept-error" className="text-xs text-red-600">
                        {acceptError}
                      </div>
                    ) : null}
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? "Création…" : "Créer mon compte"}
                  </Button>

                  <Button type="button" variant="ghost" asChild>
                    <Link href={`/connexion?redirect=${encodeURIComponent(redirect)}`}>
                      J’ai déjà un compte
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
