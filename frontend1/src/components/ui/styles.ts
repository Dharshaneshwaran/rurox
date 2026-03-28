export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const panelClassName =
  "rounded-[28px] border border-border/80 bg-panel/90 shadow-[0_30px_90px_-48px_rgba(41,37,36,0.42)] backdrop-blur-sm";

export const subtlePanelClassName =
  "rounded-[24px] border border-border/70 bg-surface/90 shadow-[0_24px_70px_-44px_rgba(41,37,36,0.35)]";

export const badgeClassName =
  "inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface px-3 py-1 text-xs font-semibold text-foreground";

export const inputClassName =
  "w-full rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

export const selectClassName =
  "w-full rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-foreground transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

export const textareaClassName =
  "w-full rounded-2xl border border-border bg-panel px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10";

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
      ? "h-10 px-4 text-sm"
      : size === "lg"
        ? "h-14 px-6 text-base"
        : "h-12 px-5 text-sm";

  const variantClassName =
    variant === "secondary"
      ? "border border-border bg-surface text-foreground hover:border-accent/40 hover:bg-accent-soft"
      : variant === "ghost"
        ? "border border-transparent bg-transparent text-foreground hover:bg-surface"
        : variant === "danger"
          ? "border border-danger/15 bg-danger text-white hover:bg-danger/90"
          : "border border-accent bg-accent text-white hover:bg-accent/92";

  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    sizeClassName,
    variantClassName,
    fullWidth && "w-full"
  );
}
