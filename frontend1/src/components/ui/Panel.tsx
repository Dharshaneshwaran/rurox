import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  children: ReactNode;
  className?: string;
  tone?: "default" | "muted" | "highlight";
};

const tones = {
  default:
    "border-[var(--color-stroke)] bg-[var(--color-panel)] shadow-[var(--shadow-panel)]",
  muted:
    "border-[var(--color-stroke)] bg-[var(--color-panel-muted)] shadow-[var(--shadow-soft)]",
  highlight:
    "border-[color:color-mix(in_oklab,var(--color-brand)_18%,white)] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-brand-soft)_55%,white),white)] shadow-[0_32px_70px_-48px_rgba(36,88,230,0.6)]",
};

export default function Panel({
  children,
  className,
  tone = "default",
}: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-panel)] border backdrop-blur-xl",
        tones[tone],
        className
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1.5">
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
          {title}
        </h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
