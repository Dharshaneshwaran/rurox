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
  backgroundImage,
}: StatCardProps) {
  const supportingText = helper ?? detail;

  return (
    <section
      className={cn(
        "relative group overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px]",
        toneClasses[tone],
        className
      )}
    >
      {/* Subtle Background Texture Implementation */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-[0.04] grayscale pointer-events-none transition-opacity duration-700 group-hover:opacity-[0.08]"
          style={{ 
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative z-10 flex flex-col items-start justify-between gap-6 h-full">
        <div className="flex w-full items-center justify-between">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
             {label}
           </p>
           {icon ? (
             <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 text-zinc-900 transition-colors group-hover:border-[var(--color-brand)] group-hover:text-[var(--color-brand)]">
               {icon}
             </div>
           ) : null}
        </div>
        
        <div>
          <p className="font-display text-5xl font-extrabold tracking-tighter text-zinc-900">
            {value}
          </p>
          {supportingText ? (
            <p className="mt-3 text-[13px] font-medium leading-relaxed text-zinc-500 max-w-[200px]">{supportingText}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
