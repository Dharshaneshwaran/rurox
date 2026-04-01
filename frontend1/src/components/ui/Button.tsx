import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  secondary: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
  accent: "bg-primary text-white hover:bg-primary-strong shadow-[0_10px_30px_rgba(59,130,246,0.3)]",
  ghost: "border-transparent bg-transparent text-slate-500 hover:text-white hover:bg-white/5",
  danger: "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white",
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
    "inline-flex items-center justify-center gap-2 rounded-full border font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
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
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export default Button;
