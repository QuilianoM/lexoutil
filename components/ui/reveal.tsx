"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: React.ReactNode;
  className?: string;

  /**
   * Délai avant l'animation (en millisecondes)
   * Exemple : 80, 120, 200...
   */
  delayMs?: number;

  /**
   * Si true, l'animation se joue une seule fois (recommandé)
   */
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delayMs = 60,
  once = true,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect "réduire les animations" si l'utilisateur l'a activé
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: "0px 0px -5% 0px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transform-gpu transition-all duration-500 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
    >
      {children}
    </div>
  );
}
