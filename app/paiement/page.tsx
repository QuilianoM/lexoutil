"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function PaiementPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setChecking(true);
      setError("");

      try {
        const { data, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !data?.user) {
          // Pas connecté → redirection vers /connexion
          router.replace(`/connexion?redirect=${encodeURIComponent("/paiement")}`);
          return;
        }

        setUserEmail(data.user.email ?? null);
      } catch (e: any) {
        if (!cancelled) {
          setError(
            typeof e?.message === "string"
              ? e.message
              : "Erreur lors de la vérification de connexion."
          );
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  async function startCheckout() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || data?.ok !== true || typeof data?.url !== "string") {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Impossible de démarrer le paiement Stripe."
        );
        setLoading(false);
        return;
      }

      // Redirection vers Stripe Checkout
      window.location.href = data.url;
    } catch (e: any) {
      setError(
        typeof e?.message === "string"
          ? e.message
          : "Erreur réseau lors du lancement du paiement."
      );
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Paiement</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Vérification de votre connexion…
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Passer en Pro</h1>

      <p className="mt-3 text-sm text-muted-foreground">
        {userEmail ? `Connecté en tant que : ${userEmail}` : "Connecté (email non disponible)."}
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <h2 className="text-base font-semibold">Abonnement Pro</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Accès aux fonctionnalités Pro (selon ton offre).
        </p>

        {error ? (
          <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={startCheckout}
          disabled={loading}
          className="mt-5 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Ouverture du paiement…" : "S’abonner (Stripe)"}
        </button>

        <p className="mt-3 text-xs text-muted-foreground">
          * Vous serez redirigé vers Stripe pour finaliser le paiement.
        </p>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        <p className="font-medium">Information importante</p>
        <p className="mt-1">
          LEXOUTIL fournit des modèles et informations générales. Cela ne constitue pas un conseil
          juridique personnalisé.
        </p>
      </div>
    </main>
  );
}
