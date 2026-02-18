"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getConsent, setConsent, type CookieConsent } from "@/lib/cookie-consent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Mode = "simple" | "details";

export default function CookieBanner() {
  const [consent, setConsentState] = useState<CookieConsent | null>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("simple");
  const [analytics, setAnalytics] = useState(false);

  const needsChoice = useMemo(() => !consent, [consent]);

  useEffect(() => {
    const c = getConsent();
    setConsentState(c);
    setAnalytics(Boolean(c?.analytics));
    setOpen(!c);

    function onOpenSettings() {
      setMode("details");
      setOpen(true);
    }

    window.addEventListener("lexoutil:open-cookie-settings", onOpenSettings as any);
    return () => window.removeEventListener("lexoutil:open-cookie-settings", onOpenSettings as any);
  }, []);

  if (!open && !needsChoice) return null;

  function acceptAll() {
    setConsent({ analytics: true });
    const c = getConsent();
    setConsentState(c);
    setAnalytics(true);
    setOpen(false);
  }

  function refuseAll() {
    setConsent({ analytics: false });
    const c = getConsent();
    setConsentState(c);
    setAnalytics(false);
    setOpen(false);
  }

  function saveChoices() {
    setConsent({ analytics });
    const c = getConsent();
    setConsentState(c);
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900">Cookies & mesure d’audience</div>
                <p className="mt-1 text-sm text-zinc-600">
                  Lexoutil utilise uniquement des cookies nécessaires au fonctionnement, et (optionnellement) une mesure
                  d’audience via <span className="font-medium">Vercel Analytics</span>. Vous pouvez accepter, refuser,
                  ou personnaliser.
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  En savoir plus :{" "}
                  <Link className="underline" href="/confidentialite">
                    Confidentialité
                  </Link>
                  .
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Button variant="secondary" type="button" onClick={refuseAll}>
                  Refuser
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setMode((m) => (m === "simple" ? "details" : "simple"))}
                >
                  {mode === "simple" ? "Personnaliser" : "Retour"}
                </Button>
                <Button type="button" onClick={acceptAll}>
                  Tout accepter
                </Button>
              </div>
            </div>

            {mode === "details" ? (
              <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-sm font-semibold text-zinc-900">Préférences</div>

                <div className="mt-3 space-y-3">
                  <div className="flex items-start gap-3">
                    <input id="cookies-necessary" type="checkbox" checked={true} disabled className="mt-1" />
                    <div>
                      <label htmlFor="cookies-necessary" className="text-sm font-medium text-zinc-900">
                        Cookies nécessaires (obligatoires)
                      </label>
                      <p className="text-sm text-zinc-600">
                        Indispensables pour le fonctionnement du site (navigation, sécurité, préférences).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="cookies-analytics"
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="mt-1"
                    />
                    <div>
                      <label htmlFor="cookies-analytics" className="text-sm font-medium text-zinc-900">
                        Mesure d’audience (Vercel Analytics)
                      </label>
                      <p className="text-sm text-zinc-600">
                        Permet de comprendre les pages les plus consultées et d’améliorer le service. Activée uniquement
                        avec votre accord.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Button type="button" onClick={saveChoices}>
                      Enregistrer mes choix
                    </Button>
                    <Button variant="secondary" type="button" onClick={refuseAll}>
                      Tout refuser
                    </Button>
                  </div>

                  <p className="pt-1 text-xs text-zinc-500">
                    Vous pouvez modifier votre choix à tout moment via « Gestion des cookies » en bas de page.
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
