import type { ReactNode } from "react";
import AppBrand from "@/components/ui/AppBrand";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  panelLabel: string;
  panelTitle: string;
  panelDescription: string;
  highlights: string[];
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  panelLabel,
  panelTitle,
  panelDescription,
  highlights,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(150deg,rgba(20,24,28,0.97),rgba(22,79,86,0.96)_58%,rgba(193,132,37,0.9))] p-6 text-white shadow-[var(--shadow-soft)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_32%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-8">
              <AppBrand className="[&_span:last-child]:text-white [&_span:first-child]:text-white/70" />
              <div className="max-w-xl space-y-5">
                <p className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.4em] text-white/70">
                  {panelLabel}
                </p>
                <h1 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {panelTitle}
                </h1>
                <p className="max-w-lg text-sm leading-6 text-white/78 sm:text-base">
                  {panelDescription}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((item, index) => (
                <article
                  key={item}
                  className="rounded-[24px] border border-white/12 bg-white/10 p-5 backdrop-blur"
                >
                  <p className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
                    Insight {index + 1}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/74">{item}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:p-10">
            <div className="space-y-3">
              <p className="font-mono-display text-[11px] font-semibold uppercase tracking-[0.35em] text-[var(--color-primary)]">
                {eyebrow}
              </p>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text)] sm:text-4xl">
                {title}
              </h2>
              <p className="max-w-xl text-sm leading-6 text-[var(--color-text-soft)] sm:text-base">
                {description}
              </p>
            </div>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
