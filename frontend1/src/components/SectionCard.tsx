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
    <section
      className={cn(
        "card-reveal flex flex-col gap-10 p-12 relative overflow-hidden",
        className
      )}
    >
      {/* Decorative High-End Background */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 opacity-[0.03] scale-110 blur-sm pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Precision Lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

      <header className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 transition-transform hover:translate-x-1 duration-300">
             <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
             <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
               {title}
             </h2>
          </div>
          {subtitle ? (
            <p className="text-[13px] text-slate-500 max-w-xl leading-relaxed font-bold tracking-widest uppercase">
              {subtitle}
            </p>
          ) : null}
        </div>
        
        {actions ? (
          <div className="flex flex-wrap items-center gap-4 lg:shrink-0 relative z-20">
            {actions}
          </div>
        ) : null}
      </header>

      <div className={cn("relative z-10 flex-1", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
