import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export default function PageHeader({
  eyebrow,
  kicker,
  title,
  description,
  actions,
  meta,
}: PageHeaderProps) {
  const resolvedEyebrow = eyebrow ?? kicker ?? "";

  return (
    <header className="flex flex-col gap-5 rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)]/90 p-6 shadow-[var(--shadow-card)] sm:p-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        <p className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--color-primary)]">
          {resolvedEyebrow}
        </p>
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-3xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {meta ? <div className="flex flex-wrap gap-2 pt-1">{meta}</div> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      ) : null}
    </header>
  );
}
