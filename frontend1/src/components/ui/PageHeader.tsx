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
        "relative flex flex-col gap-5 overflow-hidden rounded-[32px] border p-6 shadow-2xl transition-all duration-500 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:rounded-[40px] lg:p-10",
        isCommand
          ? "border-primary/20 bg-primary text-white shadow-primary/40"
          : "border-border bg-surface shadow-card"
      )}
    >
      {backgroundImage && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-700",
            isCommand ? "opacity-[0.06] grayscale" : "opacity-[0.04] grayscale"
          )}
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {isCommand && (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,35,18,0.14),rgba(15,35,18,0.02))] pointer-events-none" />
      )}

      <div className="relative z-10 space-y-4 max-w-4xl">
        <div className="flex items-center gap-3">
          {isCommand && <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)] animate-pulse" />}
          <p className={cn(
            "text-[10px] font-black uppercase tracking-[0.28em]",
            isCommand ? "text-secondary/85" : "text-primary/70"
          )}>
            {resolvedEyebrow}
          </p>
        </div>

        <div className="space-y-3">
          <h1 className={cn(
            "font-display text-3xl font-black tracking-[-0.04em] sm:text-4xl lg:text-5xl",
            isCommand ? "text-white" : "text-primary"
          )}>
            {title}
          </h1>
          {description ? (
            <p className={cn(
              "max-w-2xl text-[14px] font-medium leading-7 sm:text-[15px]",
              isCommand ? "text-white/86" : "text-primary/80"
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
