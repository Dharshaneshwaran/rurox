import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";
type BadgeTone = "default" | "brand" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-border bg-background text-muted-foreground",
  accent: "border-primary/20 bg-primary-soft text-primary-strong",
  success: "border-success bg-success-soft text-success",
  warning: "border-warning bg-warning-soft text-warning",
  danger: "border-danger bg-danger-soft text-danger",
};

export function badgeClasses({
  variant = "neutral",
  className,
}: {
  variant?: BadgeVariant;
  className?: string;
}) {
  return cn(
    "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em]",
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
        : tone ?? variant;

  return (
    <span
      className={badgeClasses({ variant: resolvedVariant, className })}
      {...props}
    />
  );
}
