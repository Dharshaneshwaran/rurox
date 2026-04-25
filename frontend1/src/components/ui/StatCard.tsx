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
        "relative group overflow-hidden rounded-[24px] border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] sm:rounded-[28px] sm:p-6 lg:rounded-[32px] lg:p-7",
        toneClasses[tone],
        className
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

      <div className="relative z-10 flex h-full flex-col items-start justify-between gap-4 sm:gap-5">
        <div className="flex w-full items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary/65">
             {label}
           </p>
           {icon ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/10 bg-surface-subtle text-primary transition-colors group-hover:border-accent group-hover:text-accent">
                {icon}
              </div>
           ) : null}
        </div>
        
        <div>
          <p className="font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            {value}
          </p>
          {supportingText ? <p className="mt-2 max-w-[200px] text-[12px] font-medium leading-relaxed text-primary/75">{supportingText}</p> : null}
        </div>
      </div>
    </section>
  );
}
