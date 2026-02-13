import * as React from "react";
import { cn } from "@/lib/cn";

type CalloutVariant = "info" | "warning" | "success" | "danger";

export type CalloutProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
  variant?: CalloutVariant;
};

export function Callout({
  className,
  title,
  variant = "info",
  ...props
}: CalloutProps) {
  const styles: Record<CalloutVariant, string> = {
    info: "border-zinc-200 bg-white",
    warning: "border-amber-200 bg-amber-50",
    success: "border-emerald-200 bg-emerald-50",
    danger: "border-red-200 bg-red-50",
  };

  const titleColor: Record<CalloutVariant, string> = {
    info: "text-zinc-900",
    warning: "text-amber-900",
    success: "text-emerald-900",
    danger: "text-red-900",
  };

  const textColor: Record<CalloutVariant, string> = {
    info: "text-zinc-700",
    warning: "text-amber-800",
    success: "text-emerald-800",
    danger: "text-red-800",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        styles[variant],
        className
      )}
      {...props}
    >
      {title ? (
        <div className={cn("mb-1 text-sm font-semibold", titleColor[variant])}>
          {title}
        </div>
      ) : null}
      <div className={cn("text-sm leading-relaxed", textColor[variant])} />
      {/* on garde props.children dans le rendu via ...props (React le gère) */}
    </div>
  );
}
