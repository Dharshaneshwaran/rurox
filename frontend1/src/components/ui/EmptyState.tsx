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
    <div className="border border-dashed border-border bg-background px-6 py-12 text-center">
      <h3 className="font-display text-2xl tracking-[-0.03em] text-foreground">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
