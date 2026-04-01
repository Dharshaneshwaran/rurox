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
  neutral: "border-slate-100 bg-white",
  brand: "border-slate-200 bg-slate-50/50",
  accent: "border-slate-200 bg-slate-50/50",
  success: "border-slate-200 bg-slate-50/50",
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
        "card-reveal p-10 group relative transition-all duration-500 overflow-hidden",
        tone === "brand" ? "bg-primary/10 border-primary/20" : ""
      )}
    >
      {/* Dynamic Scan Line Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent h-[200%] -top-full group-hover:top-full transition-all duration-1000 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between h-full gap-12">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
             <div className="space-y-1.5 focus-ring transition-transform group-hover:translate-x-1 duration-300">
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">
                  {label}
                </p>
                <div className="h-1 w-6 rounded-full bg-slate-800" />
             </div>
            {badge ? <Badge tone={badgeTone}>{badge}</Badge> : null}
          </div>
          {icon ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/[0.03] border border-white/5 text-slate-500 transition-all duration-700 group-hover:text-primary group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              {icon}
            </div>
          ) : null}
        </div>
        
        <div className="space-y-2">
          <p className="text-5xl font-black tracking-tighter text-white leading-none italic">
            {value}
          </p>
          {supportingText ? (
            <div className="flex items-center gap-2">
               <div className="h-1 w-1 rounded-full bg-accent" />
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                 {supportingText}
               </p>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
