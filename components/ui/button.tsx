import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  /**
   * ✅ Permet d'utiliser <Button asChild> <Link/> </Button>
   * Sans transmettre "asChild" au DOM.
   */
  asChild?: boolean;
};

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

function mergeHandlers<T extends React.SyntheticEvent>(
  ours?: (e: T) => void,
  theirs?: (e: T) => void
) {
  return (e: T) => {
    ours?.(e);
    theirs?.(e);
  };
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  children,
  asChild = false,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md font-medium " +
    "transition-all duration-150 ease-out " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white " +
    "disabled:pointer-events-none disabled:opacity-50 " +
    "active:scale-[0.98]";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 hover:shadow-md",
    secondary:
      "bg-white text-zinc-900 border border-zinc-200 shadow-sm hover:bg-zinc-50 hover:shadow-md",
    outline:
      "bg-transparent text-zinc-900 border border-zinc-300 hover:bg-zinc-50",
    ghost: "bg-transparent text-zinc-900 hover:bg-zinc-100",
    danger:
      "bg-red-600 text-white shadow-sm hover:bg-red-500 hover:shadow-md",
  };

  const sizes: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-10 px-5 text-sm",
  };

  const finalDisabled = disabled || isLoading;

  const content = isLoading ? (
    <>
      <Spinner className="opacity-90" />
      <span>Chargement…</span>
    </>
  ) : (
    <>
      {leftIcon ? <span className="inline-flex">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="inline-flex">{rightIcon}</span> : null}
    </>
  );

  // ✅ Mode asChild (ex: <Link />)
  if (asChild) {
    // Il faut un seul enfant React (Link, a, etc.)
    if (!React.isValidElement(children)) {
      return (
        <span className={cn(base, variants[variant], sizes[size], className)}>
          {content}
        </span>
      );
    }

    const child = children as React.ReactElement<any>;

    const mergedClassName = cn(
      base,
      variants[variant],
      sizes[size],
      className,
      child.props?.className
    );

    // On évite de passer "type" sur un <a> par exemple
    const safeProps: any = { ...props };
    delete safeProps.type;

    // Gestion disabled pour les liens : aria-disabled + empêcher clic
    const onClick = mergeHandlers<React.MouseEvent<any>>(
      (e) => {
        if (finalDisabled) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      child.props?.onClick
    );

    return React.cloneElement(child, {
      ...safeProps,
      onClick,
      className: mergedClassName,
      "aria-busy": isLoading || undefined,
      "aria-disabled": finalDisabled || undefined,
      tabIndex:
        finalDisabled && typeof child.props?.tabIndex === "undefined"
          ? -1
          : child.props?.tabIndex,
    });
  }

  // ✅ Mode normal : vrai <button>
  return (
    <button
      type={type}
      disabled={finalDisabled}
      aria-busy={isLoading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {content}
    </button>
  );
}
