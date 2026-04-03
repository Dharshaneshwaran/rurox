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
        "card-reveal p-10 group relative transition-all duration-500",
        tone === "accent" ? "bg-primary/10 border-primary/20" : "",
        className
      )}
    >
      {/* Precision Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]" />

      <div className="relative z-10 flex flex-col items-start justify-between gap-12 h-full">
        <div className="flex w-full items-start justify-between">
            <div className="space-y-1.5 focus-ring transition-transform group-hover:translate-x-1 duration-300">
               <p className={cn(
                 "text-[9px] font-black uppercase tracking-[0.4em]",
                 tone === "accent" ? "text-primary" : "text-slate-300"
               )}>
                 {label}
               </p>
               <div className={cn("h-1 w-6 rounded-full", tone === "accent" ? "bg-primary" : "bg-slate-800")} />
            </div>

           {icon ? (
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-[20px] transition-all duration-700 bg-white/[0.03] border border-white/5",
                tone === "accent" ? "text-primary shadow-[0_0_30px_rgba(59,130,246,0.2)]" : "text-slate-300 group-hover:text-white group-hover:bg-primary/5"
              )}>
                {icon}
              </div>
           ) : null}
        </div>
        
        <div className="space-y-2">
          <p className={cn(
            "text-5xl font-black tracking-tighter leading-none italic",
            tone === "accent" ? "text-primary" : "text-slate-900"
          )}>
            {value}
          </p>
          {supportingText ? (
            <div className="flex items-center gap-2">
               <div className="h-1 w-1 rounded-full bg-accent" />
               <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">{supportingText}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
