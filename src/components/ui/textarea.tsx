import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-border bg-surface px-4 py-3 text-[0.95rem] leading-relaxed text-foreground placeholder:text-faint",
      "transition-colors focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent-ring/40",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
