import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";
type BadgeTone = "default" | "brand" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)]",
  accent:  "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-soft)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success-soft)]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning-soft)]",
  danger:  "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger-soft)]",
};

export function badgeClasses({
  variant = "neutral",
  className,
}: {
  variant?: BadgeVariant;
  className?: string;
}) {
  return cn(
    "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
    variantClasses[variant],
    className
  );
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  tone?: BadgeTone;
};

export default function Badge({
  className,
  variant = "neutral",
  tone,
  ...props
}: BadgeProps) {
  const resolvedVariant =
    tone === "brand" || tone === "accent"
      ? "accent"
      : tone === "default"
        ? "neutral"
        : (tone as BadgeVariant) ?? variant;

  return (
    <span
      className={badgeClasses({ variant: resolvedVariant, className })}
      {...props}
    />
  );
}
