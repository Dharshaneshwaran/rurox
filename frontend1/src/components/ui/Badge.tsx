import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";
type BadgeTone = "default" | "brand" | "accent" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700 border border-slate-200",
  accent: "bg-blue-100 text-blue-700 border border-blue-200",
  success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border border-amber-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
};

export function badgeClasses({
  variant = "neutral",
  className,
}: {
  variant?: BadgeVariant;
  className?: string;
}) {
  return cn(
    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
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
