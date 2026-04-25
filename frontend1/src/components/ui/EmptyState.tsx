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
    <div className="border border-dashed border-border bg-background px-6 py-10 text-center">
      <h3 className="font-display text-lg tracking-tight text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
