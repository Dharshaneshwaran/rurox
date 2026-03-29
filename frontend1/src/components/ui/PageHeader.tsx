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
        "relative flex flex-col gap-6 overflow-hidden rounded-[40px] border p-8 shadow-2xl transition-all duration-500 lg:flex-row lg:items-center lg:justify-between lg:p-10",
        isCommand
          ? "border-zinc-800 bg-zinc-950 text-white shadow-black/40"
          : "border-zinc-200 bg-white shadow-zinc-200/50"
      )}
    >
      {/* Dynamic Background Image Implementation */}
      {backgroundImage && (
        <div 
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-700",
            isCommand ? "opacity-30 mix-blend-screen scale-110" : "opacity-[0.08] grayscale"
          )}
          style={{ 
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Decorative Gradient Overlays */}
      {isCommand && (
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(var(--color-brand-rgb),0.05)] to-transparent pointer-events-none" />
      )}

      <div className="relative z-10 space-y-4 max-w-4xl">
        <div className="flex items-center gap-3">
          {isCommand && <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)] animate-pulse" />}
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.4em]",
            isCommand ? "text-zinc-500" : "text-[var(--color-primary)]"
          )}>
            {resolvedEyebrow}
          </p>
        </div>
        
        <div className="space-y-3">
          <h1 className={cn(
            "font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl",
            isCommand ? "text-white" : "text-zinc-900"
          )}>
            {title}
          </h1>
          {description ? (
            <p className={cn(
              "text-[15px] font-medium leading-relaxed max-w-2xl",
              isCommand ? "text-zinc-400" : "text-zinc-500"
            )}>
              {description}
            </p>
          ) : null}
        </div>

        {meta ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {meta}
          </div>
        ) : null}
      </div>

      {actions ? (
        <div className="relative z-10 flex flex-wrap items-center gap-4 lg:shrink-0">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
