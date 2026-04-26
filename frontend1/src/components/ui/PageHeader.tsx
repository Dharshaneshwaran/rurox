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

  if (variant === "command") {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
        {backgroundImage && (
          <div 
            className="absolute right-0 top-0 h-full w-1/3 opacity-10 pointer-events-none"
            style={{ 
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              maskImage: 'linear-gradient(to left, black, transparent)'
            }}
          />
        )}
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            {resolvedEyebrow && (
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">
                {resolvedEyebrow}
              </p>
            )}
            <h1 className="text-4xl font-black tracking-tight text-[var(--color-text)] sm:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-base font-medium leading-relaxed text-[var(--color-text-muted)]">
                {description}
              </p>
            )}
            {meta && (
              <div className="flex flex-wrap items-center gap-3 pt-2">{meta}</div>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">{actions}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in">
      <div className="min-w-0 flex-1">
        {resolvedEyebrow && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--color-primary)]">
            {resolvedEyebrow}
          </p>
        )}
        <h1 className="text-[22px] font-bold text-[var(--color-text)] leading-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-[13px] text-[var(--color-text-muted)] leading-relaxed max-w-2xl">{description}</p>
        )}
        {meta && (
          <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  );
}
