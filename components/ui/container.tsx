import * as React from "react";
import { cn } from "@/lib/cn";

type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

const sizes: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
};

export function Container({ className, size = "md", ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4", sizes[size], className)} {...props} />
  );
}
