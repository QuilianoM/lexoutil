import * as React from "react";
import { cn } from "@/lib/cn";

export type DividerProps = React.HTMLAttributes<HTMLHRElement>;

export function Divider({ className, ...props }: DividerProps) {
  return (
    <hr className={cn("my-6 border-zinc-200", className)} {...props} />
  );
}
