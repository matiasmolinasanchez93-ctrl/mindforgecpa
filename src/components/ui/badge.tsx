import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "info" | "outline" | "muted";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  success: "bg-success-soft text-success ring-1 ring-inset ring-success/20",
  warning: "bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200",
  info: "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200",
  outline: "bg-white text-zinc-600 ring-1 ring-inset ring-zinc-200",
  muted: "bg-zinc-50 text-zinc-500 ring-1 ring-inset ring-zinc-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
