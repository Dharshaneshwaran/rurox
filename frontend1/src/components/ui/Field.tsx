import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const inputClassName =
  "mt-3 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

export const textareaClassName =
  "mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

export const selectClassName =
  "mt-3 h-12 w-full rounded-2xl border border-border bg-white px-4 text-sm font-medium text-foreground transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  className?: string;
  children: ReactNode;
};

export default function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        >
          {label}
        </label>
        {hint ? <p className="text-[11px] font-medium text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm font-medium text-danger">{error}</p> : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function TextField({
  label,
  hint,
  className,
  id,
  ...props
}: TextFieldProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <input id={id} className={cn(inputClassName, className)} {...props} />
    </Field>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
};

export function TextAreaField({
  label,
  hint,
  className,
  id,
  ...props
}: TextAreaFieldProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <textarea id={id} className={cn(textareaClassName, className)} {...props} />
    </Field>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function SelectField({
  label,
  hint,
  className,
  id,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <select id={id} className={cn(selectClassName, className)} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function FieldNote({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm font-medium leading-6 text-muted-foreground", className)}>
      {children}
    </p>
  );
}
