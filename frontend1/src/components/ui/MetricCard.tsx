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
      className={`rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md ${toneStyles[tone]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="font-mono-display text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
            {label}
          </p>
          {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
        </div>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/5 text-zinc-900 ring-1 ring-zinc-900/5">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-8 font-display text-4xl font-black tracking-tight text-[var(--color-text)]">
        {value}
      </p>
      {supportingText ? (
        <p className="mt-2.5 text-[13px] font-bold leading-relaxed text-zinc-500">
          {supportingText}
        </p>
      ) : null}
    </article>
  );
}
