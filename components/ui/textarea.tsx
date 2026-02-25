import * as React from "react";

/**
 * Textarea — Design system Lexoutil
 * - Supporte le ref (forwardRef)
 * - Props standards <textarea>
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className = "", ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      className={[
        "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
        "placeholder:text-zinc-400",
        "outline-none",
        "focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-300",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "min-h-24 resize-vertical",
        className,
      ].join(" ")}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
