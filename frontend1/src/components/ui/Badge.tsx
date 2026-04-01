import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";
type BadgeTone = "default" | "brand" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "border-white/10 bg-white/5 text-slate-400",
  accent: "border-primary/20 bg-primary/10 text-primary shadow-[0_0_10px_rgba(59,130,246,0.2)]",
  success: "border-accent/20 bg-accent/10 text-accent shadow-[0_0_10px_rgba(16,185,129,0.2)]",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  danger: "border-red-500/20 bg-red-500/10 text-red-500",
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
