import Link from "next/link";
import type { ReactNode } from "react";
import { AppMark, ArrowRightIcon, ShieldIcon, SparkIcon } from "@/components/icons";

type Highlight = {
  label: string;
  value: string;
  description: string;
};

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  panelTitle: string;
  panelDescription: string;
  highlights: Highlight[];
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  panelTitle,
  panelDescription,
  highlights,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1500px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative flex flex-col justify-between border-b border-[var(--color-border)] bg-[linear-gradient(180deg,var(--auth-gradient-1),var(--auth-gradient-2))] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(var(--auth-pattern)_1px,transparent_1px),linear-gradient(90deg,var(--auth-pattern)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 text-foreground transition hover:text-accent">
              <AppMark className="h-10 w-10" />
              <div>
                <p className="font-display text-lg tracking-[-0.03em]">
                  Smart Teacher Assignment
                </p>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Scheduling workspace
                </p>
              </div>
            </Link>
          </div>

          <div className="relative mt-12 max-w-2xl lg:mt-0">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
              {panelTitle}
            </p>
            <h1 className="mt-5 font-display text-5xl tracking-[-0.06em] text-foreground sm:text-6xl">
              {panelDescription}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
              Coordinate teacher schedules, absence coverage, approvals, and
              weekly plans from a single operational workspace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-3 font-display text-3xl tracking-[-0.04em] text-[var(--color-text)]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-12 grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="flex h-11 w-11 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
              <ShieldIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text)]">
                Approved access only
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Role-aware access keeps admin operations and teacher views scoped
                correctly.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Verified <SparkIcon className="h-4 w-4" />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-xl">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-accent">
              {eyebrow}
            </p>
            <h2 className="mt-4 font-display text-4xl tracking-[-0.05em] text-foreground">
              {title}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="mt-10 border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-6 sm:p-8">
              {children}
            </div>

            {footer ? (
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {footer}
                <ArrowRightIcon className="h-4 w-4" />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
