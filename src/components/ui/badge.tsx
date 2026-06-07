import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "accent" | "outline" | "mono";

const variants: Record<Variant, string> = {
  default: "bg-surface-2 text-foreground border border-border",
  accent: "bg-accent-soft text-accent-strong border border-accent-ring/60",
  outline: "border border-border-strong text-muted",
  mono: "font-mono text-[0.7rem] tracking-wide uppercase text-muted border border-border bg-surface",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
