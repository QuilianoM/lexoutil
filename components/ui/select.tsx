import * as React from "react";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  const invalid =
    props["aria-invalid"] === true || props["aria-invalid"] === "true";

  return (
    <select
      className={cn(
        "w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-900 " +
          "transition-colors duration-150 ease-out " +
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        invalid
          ? "border-red-300 focus-visible:ring-red-500/30"
          : "border-zinc-200 focus-visible:border-zinc-300",
        className
      )}
      {...props}
    />
  );
}
