import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  variant?: "default" | "command";
  backgroundImage?: string;
};

export default function PageHeader({
  eyebrow,
  kicker,
  title,
  description,
  actions,
  meta,
  variant = "default",
  backgroundImage,
}: PageHeaderProps) {
  const resolvedEyebrow = eyebrow ?? kicker ?? "";
  const isCommand = variant === "command";

  return (
    <header
      className={cn(
        "relative flex flex-col gap-8 px-10 py-12 lg:flex-row lg:items-end lg:justify-between overflow-hidden",
        isCommand && "bg-[#111] border-b border-primary/20 shadow-[0_10px_40px_rgba(37,99,235,0.15)]"
      )}
    >
      {/* Decorative High-Tech Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#10b981]" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">
            {resolvedEyebrow}
          </p>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tighter text-white leading-none">
            {title}
          </h1>
          {description ? (
            <p className="text-[14px] text-slate-400 max-w-2xl leading-relaxed font-medium">
              {description}
            </p>
          ) : null}
        </div>

        {meta ? (
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <div className="h-px w-8 bg-slate-800" />
            <div className="flex flex-wrap items-center gap-3">
              {meta}
            </div>
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="relative z-10 flex flex-wrap items-center gap-4 lg:shrink-0 lg:pb-2">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
