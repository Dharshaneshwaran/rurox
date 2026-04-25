import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-foreground bg-foreground text-white hover:bg-foreground/92",
  secondary: "border-border bg-white text-foreground hover:bg-background",
  accent: "border-primary bg-primary text-white hover:bg-primary-strong",
  ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-white",
  danger: "border-danger bg-danger-soft text-danger hover:bg-red-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-full border text-center align-middle font-medium leading-none whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return buttonClasses({ variant, size, className });
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      fullWidth = false,
      icon,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses({
        variant,
        size,
        className: cn(fullWidth && "w-full", className),
      })}
      {...props}
    >
      {icon ? <span className="flex shrink-0 items-center justify-center">{icon}</span> : null}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;
