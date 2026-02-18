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

export default function ConnexionClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Identifiants incorrects");
      }

      router.push(redirect || "/compte");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Section>
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-center">
              Connexion à votre compte
            </h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && (
                <div className="text-sm text-red-600 text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="underline">
                Créer un compte
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          <LegalDisclaimer />
        </div>
      </Section>
    </Container>
  );
}
