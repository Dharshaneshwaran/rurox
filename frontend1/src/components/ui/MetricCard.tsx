import type { ReactNode } from "react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

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
  backgroundImage?: string;
};

const toneStyles: Record<MetricTone, string> = {
  neutral:
    "border-border bg-surface text-primary",
  brand:
    "border-[color:rgba(var(--color-brand-rgb),0.1)] bg-[var(--color-brand-soft)] text-primary",
  accent:
    "border-[color:rgba(193,132,37,0.1)] bg-[var(--color-accent-soft)] text-primary",
  success:
    "border-[color:rgba(45,123,102,0.1)] bg-[var(--color-success-soft)] text-primary",
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
  backgroundImage,
}: MetricCardProps) {
  const supportingText = detail ?? hint;

  return (
    <article
      className={cn(
        "relative group overflow-hidden rounded-[28px] border p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] sm:rounded-[32px] sm:p-7",
        toneStyles[tone]
      )}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-[0.04] grayscale pointer-events-none"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative z-10 flex flex-col justify-between h-full gap-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <p className="font-mono-display text-[10px] font-black uppercase tracking-[0.28em] text-primary/72 transition-colors">
              {label}
            </p>
            {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
          </div>
          {icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-subtle text-primary border border-border/10 transition-all group-hover:border-accent group-hover:text-accent">
              {icon}
            </div>
          ) : null}
        </div>
        
        <div>
          <p className="font-display text-4xl font-black tracking-tighter text-primary leading-none sm:text-5xl">
            {value}
          </p>
          {supportingText ? (
            <p className="mt-3 max-w-[240px] text-[13px] font-semibold leading-relaxed text-primary/82">
              {supportingText}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
