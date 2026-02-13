import * as React from "react";
import { cn } from "@/lib/cn";
import { Label } from "@/components/ui/label";

type FieldProps = {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center gap-2">
          <Label htmlFor={htmlFor}>
            {label}
            {required ? <span className="ml-1 text-red-600">*</span> : null}
          </Label>
        </div>
      ) : null}

      <div>{children}</div>

      {error ? (
        <p id={errorId} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
