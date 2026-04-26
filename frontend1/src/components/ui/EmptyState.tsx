import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] rounded-xl px-6 py-12 text-center animate-fade-in">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] shadow-sm mb-4">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h3 className="font-semibold text-[15px] text-[var(--color-text)] tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-[var(--color-text-muted)]">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
