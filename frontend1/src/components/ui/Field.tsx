import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

export const inputClassName =
  "mt-2 h-10 w-full rounded-lg border border-slate-200 px-4 text-sm text-slate-900 placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export const textareaClassName =
  "mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export const selectClassName =
  "mt-2 h-10 w-full rounded-lg border border-slate-200 px-4 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white";

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
          className="text-sm font-semibold text-slate-900"
        >
          {label}
        </label>
        {hint ? <p className="text-xs text-slate-600 font-medium">{hint}</p> : null}
      </div>
      {children}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
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
    <p className={cn("text-sm leading-6 text-muted-foreground", className)}>
      {children}
    </p>
  );
}
