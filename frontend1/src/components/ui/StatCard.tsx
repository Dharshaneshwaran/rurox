import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  helper?: string;
  icon?: ReactNode;
  tone?: "default" | "accent" | "success";
  className?: string;
  backgroundImage?: string;
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-[var(--color-border)] bg-[var(--color-surface)]",
  accent: "border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]",
  success: "border-[var(--color-success-soft)] bg-[var(--color-success-soft)]",
};

const labelTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-[var(--color-text-muted)]",
  accent: "text-[var(--color-accent)]",
  success: "text-[var(--color-success)]",
};

const valueTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-[var(--color-text)]",
  accent: "text-[var(--color-accent)]",
  success: "text-[var(--color-success)]",
};

const iconTone: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]",
  accent: "bg-[var(--color-surface)] text-[var(--color-accent)]",
  success: "bg-[var(--color-surface)] text-[var(--color-success)]",
};

export default function StatCard({
  label,
  value,
  detail,
  helper,
  icon,
  tone = "default",
  className,
  backgroundImage,
}: StatCardProps) {
  const supportingText = helper ?? detail;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        toneClasses[tone],
        className
      )}
    >
      {backgroundImage && (
        <div 
          className="absolute right-0 top-0 h-full w-1/2 opacity-[0.03] pointer-events-none"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to left, black, transparent)'
          }}
        />
      )}
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("text-[11px] font-semibold uppercase tracking-[0.1em]", labelTone[tone])}>
            {label}
          </p>
          <p className={cn("mt-2 text-2xl font-bold tracking-tight", valueTone[tone])}>
            {value}
          </p>
          {supportingText && (
            <p className="mt-1 text-[12px] text-[var(--color-text-muted)] leading-relaxed">{supportingText}</p>
          )}
        </div>
        {icon && (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm", iconTone[tone])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
