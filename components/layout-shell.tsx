"use client";

import { usePathname } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast-provider";
import { Toaster } from "@/components/ui/toaster";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname === "/print";

  if (isBare) return <>{children}</>;

  return (
    <ToastProvider>
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-sm font-semibold text-zinc-900">Lexoutil</div>

          <nav className="flex flex-wrap items-center gap-4 text-sm text-zinc-700">
            <a className="hover:text-zinc-900" href="/">
              Accueil
            </a>
            <a className="hover:text-zinc-900" href="/guides">
              Guides
            </a>
            <a className="hover:text-zinc-900" href="/documents">
              Documents
            </a>
            <a className="hover:text-zinc-900" href="/assistance">
              Assistance
            </a>
            <a className="hover:text-zinc-900" href="/mise-en-relation">
              Mise en relation
            </a>
            <a className="hover:text-zinc-900" href="/tarifs">
              Tarifs
            </a>
            <a className="hover:text-zinc-900" href="/compte">
              Compte
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4">{children}</main>

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
          </div>

          {/* ✅ Disclaimer global (Étape 8) */}
          <p className="mt-4 text-xs text-zinc-500">
            ⚠️ Lexoutil fournit des informations générales et des modèles. Cela ne constitue pas un conseil juridique
            personnalisé. En cas d’urgence ou de situation complexe, rapprochez-vous d’un professionnel du droit.
          </p>
        </div>
      </footer>

      <Toaster />
    </ToastProvider>
  );
}
