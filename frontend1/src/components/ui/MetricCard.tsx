import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";

type MetricTone = "neutral" | "brand" | "accent" | "success";
type MetricBadgeTone = "default" | "brand" | "success" | "warning";

type MetricCardProps = {
  label: string;
  value: string;
  hint?: string;
  detail?: string;
  tone?: MetricTone;
  icon?: ReactNode;
  badge?: string;
  badgeTone?: MetricBadgeTone;
};

const toneStyles: Record<MetricTone, string> = {
  neutral:
    "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]",
  brand:
    "border-[color:rgba(30,109,118,0.18)] bg-[var(--color-primary-soft)] text-[var(--color-text)]",
  accent:
    "border-[color:rgba(193,132,37,0.18)] bg-[var(--color-accent-soft)] text-[var(--color-text)]",
  success:
    "border-[color:rgba(45,123,102,0.18)] bg-[var(--color-success-soft)] text-[var(--color-text)]",
};

export default function MetricCard({
  label,
  value,
  hint,
  detail,
  tone = "neutral",
  icon,
  badge,
  badgeTone = "default",
}: MetricCardProps) {
  const supportingText = detail ?? hint;

  return (
    <article
      className={`rounded-[28px] border p-5 shadow-[var(--shadow-card)] ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
            {label}
          </p>
          {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
        </div>
        {icon ? (
          <span className="rounded-2xl bg-white/65 p-2 text-[var(--color-text)]">
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-6 font-display text-3xl font-semibold tracking-[-0.05em] text-[var(--color-text)]">
        {value}
      </p>
      {supportingText ? (
        <p className="mt-2 text-sm leading-6 text-[var(--color-text-soft)]">
          {supportingText}
        </p>
      ) : null}
    </article>
  );
}
