"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/reveal";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * Active l'apparition animée (recommandé)
   */
  reveal?: boolean;

  /**
   * Décalage en ms pour varier les animations (ex: 0, 80, 140...)
   */
  revealDelayMs?: number;
};

export function Section({
  className,
  reveal = true,
  revealDelayMs = 60,
  children,
  ...props
}: SectionProps) {
  const content = (
    <section className={cn("w-full", className)} {...props}>
      {children}
    </section>
  );

  if (!reveal) return content;

  return <Reveal delayMs={revealDelayMs}>{content}</Reveal>;
}
