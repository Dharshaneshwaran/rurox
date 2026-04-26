import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
  backgroundImage?: string;
}

export default function SectionCard({ 
  title, 
  subtitle, 
  children, 
  className, 
  actions,
  backgroundImage 
}: SectionCardProps) {
  return (
    <div className={cn("relative rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm overflow-hidden", className)}>
      {backgroundImage && (
        <div 
          className="absolute right-0 top-0 h-24 w-1/2 opacity-[0.04] pointer-events-none"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to left, black, transparent)'
          }}
        />
      )}
      <div className="relative z-10 flex items-center justify-between border-b border-[var(--color-surface-subtle)] px-5 py-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[var(--color-text)] leading-none">{title}</h2>
          {subtitle && <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{subtitle}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className="relative z-10 p-5">{children}</div>
    </div>
  );
}
