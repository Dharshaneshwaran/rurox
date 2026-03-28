import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <section className={cn("border border-border bg-white", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(241,236,229,0.6))] px-6 py-5 sm:px-8">
        <div>
          <h2 className="font-display text-2xl tracking-[-0.04em] text-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className={cn("border-t border-border px-6 py-6 sm:px-8", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
