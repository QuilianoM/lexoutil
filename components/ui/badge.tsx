import * as React from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "outline";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium " +
    "transition-colors duration-150 ease-out";

  const variants: Record<BadgeVariant, string> = {
    default: "bg-zinc-900 text-white hover:bg-zinc-800",
    outline:
      "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props} />
  );
}
