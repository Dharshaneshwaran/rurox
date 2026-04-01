import type { ReactNode } from "react";

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
    <div className="card-reveal border-dashed border-white/5 py-24 px-12 group overflow-hidden relative rounded-3xl">
      {/* Structural Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 bg-primary/5 rounded-full blur-3xl animate-pulse group-hover:scale-150 transition-transform duration-1000" />
      
      <div className="relative z-10 flex flex-col items-center text-center gap-10">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5 border border-white/5 shadow-2xl group-hover:rotate-12 transition-transform duration-500">
           <svg className="h-10 w-10 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
           </svg>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-[20px] font-black uppercase tracking-[0.5em] text-white italic leading-tight">{title}</h3>
          <p className="mx-auto max-w-sm text-[10px] font-black uppercase leading-relaxed tracking-[0.3em] text-slate-600">
            Node Status: {description}
          </p>
        </div>
        
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
