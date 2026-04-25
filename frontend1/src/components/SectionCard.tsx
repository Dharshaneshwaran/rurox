import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  backgroundImage?: string;
};

export default function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
  backgroundImage,
}: SectionCardProps) {
  return (
    <section className={cn("relative overflow-hidden rounded-[24px] border border-border bg-surface shadow-sm transition-all duration-500 hover:shadow-md sm:rounded-[28px] lg:rounded-[32px]", className)}>
      {backgroundImage && (
        <div
          className="absolute inset-0 opacity-[0.03] grayscale pointer-events-none"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative z-10 flex flex-col gap-3 border-b border-border/10 bg-surface-subtle/80 px-5 py-4 backdrop-blur-sm sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between lg:gap-5 lg:px-7 lg:py-6 xl:px-8">
        <div className="min-w-0 space-y-1">
          <h2 className="font-display text-lg font-bold tracking-tight text-primary sm:text-lg">
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-xl text-[12.5px] font-normal leading-relaxed text-primary/75">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div className="w-full lg:w-auto lg:shrink-0">{actions}</div> : null}
      </div>
      <div className={cn("relative z-10 px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-7 xl:px-8", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
