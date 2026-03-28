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
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-foreground/10",
  accent: "border-primary/30 bg-primary-soft/55",
  success: "border-success bg-success-soft/65",
};

export default function StatCard({
  label,
  value,
  detail,
  helper,
  icon,
  tone = "default",
  className,
}: StatCardProps) {
  const supportingText = helper ?? detail;

  return (
    <section
      className={cn(
        "rounded-[26px] border border-border bg-white p-6 shadow-[var(--shadow-card)]",
        toneClasses[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-4 font-display text-4xl tracking-[-0.04em] text-foreground">
            {value}
          </p>
          {supportingText ? (
            <p className="mt-3 text-sm text-muted-foreground">{supportingText}</p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-foreground">
            {icon}
          </div>
        ) : null}
      </div>
    </section>
  );
}
