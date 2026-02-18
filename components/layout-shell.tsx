"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// ✅ On importe en "namespace" puis on récupère default OU named.
// Ça évite 100% des erreurs "got: object".
import * as ToastProviderMod from "@/components/ui/toast-provider";
import * as ToasterMod from "@/components/ui/toaster";

import * as LegalDisclaimerMod from "@/components/legal-disclaimer";
import * as CookieBannerMod from "@/components/cookie-banner";
import * as VercelAnalyticsConsentMod from "@/components/vercel-analytics-consent";
import * as ProStatusSyncMod from "@/components/pro-status-sync";

type AnyComp = React.ComponentType<any>;

function pickComponent(mod: any, preferredName?: string): AnyComp | null {
  const byName = preferredName ? mod?.[preferredName] : null;
  const byDefault = mod?.default;

  const c = byName ?? byDefault;

  // On vérifie que c'est bien un composant (fonction) et pas un objet.
  if (typeof c === "function") return c as AnyComp;

  return null;
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      className={[
        "hover:text-zinc-900",
        active ? "text-zinc-900 font-medium" : "text-zinc-700",
      ].join(" ")}
      href={href}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </a>
  );
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname === "/print";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  if (isBare) return <>{children}</>;

  // ✅ Récupération robuste des composants (default OU named)
  const ToastProvider =
    pickComponent(ToastProviderMod, "ToastProvider") ?? ((p: any) => <>{p.children}</>);
  const Toaster = pickComponent(ToasterMod, "Toaster") ?? (() => null);

  const LegalDisclaimer =
    pickComponent(LegalDisclaimerMod, "LegalDisclaimer") ??
    pickComponent(LegalDisclaimerMod) ??
    (() => null);

  const CookieBanner =
    pickComponent(CookieBannerMod, "CookieBanner") ??
    pickComponent(CookieBannerMod) ??
    (() => null);

  const VercelAnalyticsConsent =
    pickComponent(VercelAnalyticsConsentMod, "VercelAnalyticsConsent") ??
    pickComponent(VercelAnalyticsConsentMod) ??
    (() => null);

  const ProStatusSync =
    pickComponent(ProStatusSyncMod, "ProStatusSync") ??
    pickComponent(ProStatusSyncMod) ??
    (() => null);

  const nav = [
    { href: "/", label: "Accueil" },
    { href: "/guides", label: "Guides" },
    { href: "/documents", label: "Documents" },
    { href: "/historique", label: "Historique" },
    { href: "/assistance", label: "Assistance" },
    { href: "/mise-en-relation", label: "Mise en relation" },
    { href: "/tarifs", label: "Tarifs" },
    { href: "/compte", label: "Compte" },
  ];

  function openCookieSettings() {
    window.dispatchEvent(new CustomEvent("lexoutil:open-cookie-settings"));
  }

  return (
    <ToastProvider>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Aller au contenu
      </a>

      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-sm font-semibold text-zinc-900">Lexoutil</div>

          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                active={pathname === item.href}
              />
            ))}
          </nav>
        </div>
      </header>

      <main id="contenu" className="mx-auto w-full max-w-5xl px-4">
        {children}
      </main>

      <footer className="mt-10 border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
            <a className="hover:text-zinc-900" href="/mentions">
              Mentions légales
            </a>
            <a className="hover:text-zinc-900" href="/confidentialite">
              Confidentialité
            </a>
            <a className="hover:text-zinc-900" href="/cgu">
              CGU
            </a>

            <button
              type="button"
              onClick={openCookieSettings}
              className="hover:text-zinc-900 underline underline-offset-2"
            >
              Gestion des cookies
            </button>
          </div>

          <div className="mt-4">
            {/* variant="global" si ton composant le supporte. Sinon, il ignore. */}
            <LegalDisclaimer variant="global" />
          </div>
        </div>
      </footer>

      {/* ✅ Sync Pro/Free */}
      <ProStatusSync />

      {/* ✅ Cookies + Analytics consent */}
      <CookieBanner />
      <VercelAnalyticsConsent />

      <Toaster />
    </ToastProvider>
  );
}
