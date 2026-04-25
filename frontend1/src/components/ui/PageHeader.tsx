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
        "relative flex flex-col gap-4 overflow-hidden rounded-[28px] border p-5 shadow-lg transition-all duration-500 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:rounded-[32px] lg:p-8",
        isCommand
          ? "border-primary/20 bg-primary text-white shadow-primary/30"
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

      <div className="relative z-10 space-y-3 max-w-4xl">
        <div className="flex items-center gap-2">
          {isCommand && <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-brand)] shadow-[0_0_8px_var(--color-brand)] animate-pulse" />}
          <p className={cn(
            "text-[9px] font-bold uppercase tracking-[0.25em]",
            isCommand ? "text-secondary/75" : "text-primary/65"
          )}>
            {resolvedEyebrow}
          </p>
        </div>

        <div className="space-y-2">
          <h1 className={cn(
            "font-display text-2xl font-bold tracking-[-0.02em] sm:text-3xl lg:text-3xl",
            isCommand ? "text-white" : "text-primary"
          )}>
            {title}
          </h1>
          {description ? (
            <p className={cn(
              "max-w-2xl text-[13px] font-normal leading-6 sm:text-[13.5px]",
              isCommand ? "text-white/80" : "text-primary/75"
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
