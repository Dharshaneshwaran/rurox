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
    "border-zinc-200 bg-white text-zinc-950",
  brand:
    "border-[color:rgba(var(--color-brand-rgb),0.1)] bg-[var(--color-brand-soft)] text-zinc-950",
  accent:
    "border-[color:rgba(193,132,37,0.1)] bg-[var(--color-accent-soft)] text-zinc-950",
  success:
    "border-[color:rgba(45,123,102,0.1)] bg-[var(--color-success-soft)] text-zinc-950",
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
        "relative group overflow-hidden rounded-[32px] border p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]",
        toneStyles[tone]
      )}
    >
      {/* Subtle Integrated Imagery */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.06]"
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
            <p className="font-mono-display text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400 group-hover:text-[var(--color-brand)] transition-colors">
              {label}
            </p>
            {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
          </div>
          {icon ? (
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-950/5 text-zinc-900 border border-zinc-100 transition-all group-hover:border-[var(--color-brand)] group-hover:text-[var(--color-brand)]">
              {icon}
            </div>
          ) : null}
        </div>
        
        <div>
          <p className="font-display text-5xl font-black tracking-tighter text-zinc-900 leading-none">
            {value}
          </p>
          {supportingText ? (
            <p className="mt-3 text-[13px] font-bold leading-relaxed text-zinc-500 max-w-[200px]">
              {supportingText}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
