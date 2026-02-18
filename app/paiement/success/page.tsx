"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { refreshProStatus } from "@/lib/subscription";

export default function PaiementSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const sessionId = searchParams.get("session_id");

  const [state, setState] = useState<
    "checking" | "refreshing" | "ok" | "not_pro" | "not_connected" | "error"
  >("checking");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState("checking");
      setMessage("");

      try {
        const { data, error } = await supabase.auth.getUser();

        if (cancelled) return;

        if (error || !data?.user) {
          setState("not_connected");
          setMessage("Vous devez être connecté pour valider votre abonnement.");
          return;
        }

        setState("refreshing");
        const result = await refreshProStatus();

        if (cancelled) return;

        if (result.ok && result.pro === true) {
          setState("ok");
          setMessage("Abonnement Pro activé ✅");
          return;
        }

        setState("not_pro");
        setMessage(
          "Paiement reçu, mais l’activation Pro n’est pas encore visible. Réessayez dans quelques secondes."
        );
      } catch (e: any) {
        if (!cancelled) {
          setState("error");
          setMessage(
            typeof e?.message === "string"
              ? e.message
              : "Erreur lors de la validation du paiement."
          );
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [supabase, sessionId]);

  async function retry() {
    setState("refreshing");
    setMessage("");

    const result = await refreshProStatus();
    if (result.ok && result.pro === true) {
      setState("ok");
      setMessage("Abonnement Pro activé ✅");
    } else {
      setState("not_pro");
      setMessage(
        "Toujours pas activé. Attendez 10–20 secondes puis réessayez. (Le webhook Stripe peut être légèrement en retard.)"
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Paiement confirmé</h1>

      {sessionId ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Référence Stripe : {sessionId}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          Référence Stripe non fournie.
        </p>
      )}

      <div className="mt-6 rounded-lg border p-4">
        {state === "checking" || state === "refreshing" ? (
          <p className="text-sm text-muted-foreground">
            Vérification de l’activation Pro…
          </p>
        ) : null}

        {message ? (
          <div className="mt-3 rounded-md border p-3 text-sm">{message}</div>
        ) : null}

        {state === "not_connected" ? (
          <button
            type="button"
            onClick={() => router.replace("/connexion?next=/paiement/success")}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Se connecter
          </button>
        ) : null}

        {state === "not_pro" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => router.replace("/compte")}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Aller à mon compte
            </button>
          </div>
        ) : null}

        {state === "ok" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.replace("/documents")}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Aller au générateur
            </button>
            <button
              type="button"
              onClick={() => router.replace("/compte")}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Voir mon compte
            </button>
          </div>
        ) : null}

        {state === "error" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Réessayer
            </button>
            <button
              type="button"
              onClick={() => router.replace("/compte")}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Aller à mon compte
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        <p className="font-medium">Information importante</p>
        <p className="mt-1">
          LEXOUTIL fournit des modèles et informations générales. Cela ne
          constitue pas un conseil juridique personnalisé.
        </p>
      </div>
    </main>
  );
}
