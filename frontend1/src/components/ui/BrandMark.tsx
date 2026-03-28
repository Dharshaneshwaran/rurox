type BrandMarkProps = {
  className?: string;
};

export default function BrandMark({ className = "" }: BrandMarkProps) {
  return (
    <span
      className={`grid h-11 w-11 grid-cols-2 gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-[var(--shadow-card)] ${className}`}
      aria-hidden
    >
      <span className="rounded-xl bg-[var(--color-primary)]" />
      <span className="rounded-xl bg-[var(--color-accent)]" />
      <span className="rounded-xl bg-[var(--color-text)]" />
      <span className="rounded-xl bg-[var(--color-surface-muted)]" />
    </span>
  );
}
