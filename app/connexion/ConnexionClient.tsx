"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LegalDisclaimer from "@/components/legal-disclaimer";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function ConnexionClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  const nextUrl = ((sp?.get("next") || "/compte").trim() || "/compte") as string;

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data?.user) router.replace(nextUrl);
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const e1 = email.trim();
    if (!e1) return setMessage("Veuillez saisir votre email.");
    if (!password) return setMessage("Veuillez saisir votre mot de passe.");

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: e1,
        password,
      });

      if (error) {
        setMessage("Connexion impossible. Vérifiez vos identifiants.");
        return;
      }

      router.replace(nextUrl);
    } catch {
      setMessage("Erreur technique lors de la connexion. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMagicLink() {
    setMessage("");
    const e1 = email.trim();
    if (!e1) return setMessage("Veuillez saisir votre email.");

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${nextUrl.startsWith("/") ? nextUrl : `/${nextUrl}`}`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email: e1,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });

      if (error) {
        setMessage("Impossible d’envoyer le lien. Réessayez.");
        return;
      }

      setMessage("Lien envoyé. Consultez votre email pour vous connecter.");
    } catch {
      setMessage("Erreur technique. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <div className="mx-auto w-full max-w-lg py-10">
          <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Connectez-vous pour accéder à votre compte et vos documents.
          </p>

          {message ? (
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-700">
              {message}
            </div>
          ) : null}

          <Card className="mt-6">
            <CardContent className="p-6">
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-1">
                  <label className="text-xs font-medium text-zinc-800">Email</label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: nom@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="grid gap-1">
                  <label className="text-xs font-medium text-zinc-800">Mot de passe</label>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    type="password"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Connexion…" : "Se connecter"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleMagicLink()}
                    disabled={loading}
                  >
                    {loading ? "Envoi…" : "Envoyer un lien"}
                  </Button>
                </div>

                <div className="text-xs text-zinc-600">
                  Pas de compte ?{" "}
                  <Link className="underline" href="/inscription">
                    Créer un compte
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-4">
            <LegalDisclaimer />
          </div>
        </div>
      </Section>
    </Container>
  );
}
