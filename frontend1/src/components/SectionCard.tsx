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
    <section className={cn("relative overflow-hidden rounded-[40px] border border-zinc-200 bg-white shadow-sm transition-all duration-500 hover:shadow-md", className)}>
      {/* Subtle Integrated Imagery */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-[0.08] grayscale pointer-events-none transition-opacity duration-700 hover:opacity-[0.18] scale-105 hover:scale-100"
          style={{ 
            backgroundImage: `url('${backgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      <div className="relative z-10 flex flex-wrap items-start justify-between gap-6 border-b border-zinc-100 bg-white/80 px-8 py-7 backdrop-blur-sm sm:px-10">
        <div className="space-y-1.5">
          <h2 className="font-display text-2xl font-black tracking-tight text-zinc-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-xl text-[13.5px] font-semibold leading-relaxed text-zinc-600">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className={cn("relative z-10 px-8 py-8 sm:px-10", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
