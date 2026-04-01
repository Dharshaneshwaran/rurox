export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const panelClassName =
  "rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] transition-all";

export const subtlePanelClassName =
  "rounded-md border border-[var(--color-border)] bg-[var(--color-surface-subtle)]";

export const badgeClassName =
  "inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--color-text-soft)]";

export const inputClassName =
  "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-[14px] font-black tracking-tight text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all";

export const selectClassName =
  "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-[14px] font-black tracking-tight text-[var(--color-text)] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none";

export const textareaClassName =
  "w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 text-[14px] font-black tracking-tight text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all";

export function getButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}) {
  const sizeClassName =
    size === "sm"
      ? "h-9 px-4 text-[11px]"
      : size === "lg"
        ? "h-12 px-8 text-sm"
        : "h-11 px-6 text-[13px]";

  const variantClassName =
    variant === "secondary"
      ? "border border-white/10 bg-white/5 text-white hover:bg-white/10"
      : variant === "ghost"
        ? "text-[var(--color-text-soft)] hover:bg-white/5 hover:text-white"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.3)]"
          : variant === "accent"
            ? "bg-accent text-white hover:bg-accent-strong shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
            : "bg-primary text-white hover:bg-primary-strong shadow-[0_4px_12px_rgba(59,130,246,0.3)]";

  return cn(
    "inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-30 active:scale-95",
    sizeClassName,
    variantClassName,
    fullWidth && "w-full"
  );
}
