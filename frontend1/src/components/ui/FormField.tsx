import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export default function FormField({
  label,
  hint,
  children,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-2.5">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}
