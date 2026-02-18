"use client";

import { useEffect, useMemo } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { refreshProStatus, setSubscriptionStatus } from "@/lib/subscription";

/**
 * Synchronise le statut Pro/Free côté client :
 * - au chargement (si connecté)
 * - à chaque login/logout
 */
export default function ProStatusSync() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let mounted = true;

    async function checkNow() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;

        if (data?.user) {
          await refreshProStatus(); // appelle /api/subscription/status
        } else {
          // pas connecté => on peut remettre le cache à "free" (ou null si tu préfères)
          setSubscriptionStatus(false);
        }
      } catch {
        // silencieux : on ne bloque jamais l'UI
      }
    }

    // 1) check au chargement
    checkNow();

    // 2) check à chaque changement d'auth
    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (!mounted) return;

      if (event === "SIGNED_IN") {
        await refreshProStatus();
      }

      if (event === "SIGNED_OUT") {
        setSubscriptionStatus(false);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe();
    };
  }, [supabase]);

  return null;
}
