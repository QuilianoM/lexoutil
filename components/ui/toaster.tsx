"use client";

import * as React from "react";
import { useToast } from "./toast-provider";
import { cn } from "@/lib/cn";

function variantClasses(variant: "success" | "error" | "info" | undefined) {
  if (variant === "success") return "border-emerald-200 bg-emerald-50 text-emerald-950";
  if (variant === "error") return "border-red-200 bg-red-50 text-red-950";
  return "border-zinc-200 bg-white text-zinc-950";
}

function dotClasses(variant: "success" | "error" | "info" | undefined) {
  if (variant === "success") return "bg-emerald-600";
  if (variant === "error") return "bg-red-600";
  return "bg-zinc-800";
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-2xl border p-3 shadow-sm",
            "transition-all duration-200 ease-out",
            "animate-in fade-in slide-in-from-top-2",
            variantClasses(t.variant)
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", dotClasses(t.variant))} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description ? <p className="mt-1 text-sm opacity-80">{t.description}</p> : null}
            </div>

            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-lg px-2 py-1 text-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
