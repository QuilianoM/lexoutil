import * as React from "react";

/**
 * Input — Design system Lexoutil
 * - Supporte le ref (forwardRef)
 * - Props standards <input>
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={[
        "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900",
        "placeholder:text-zinc-400",
        "outline-none",
        "focus:ring-2 focus:ring-zinc-900/15 focus:border-zinc-300",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
