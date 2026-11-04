import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

const control =
  "h-9 rounded-lg border border-line bg-surface px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode };

/** Labelled select; label is visually hidden but available to screen readers. */
export function Select({ label, children, className = "", ...rest }: SelectProps) {
  return (
    <label className="inline-flex">
      <span className="sr-only">{label}</span>
      <select className={`${control} pr-8 ${className}`} {...rest}>
        {children}
      </select>
    </label>
  );
}

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; icon?: ReactNode };

export function TextInput({ label, icon, className = "", ...rest }: TextInputProps) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      {icon && <span className="pointer-events-none absolute left-3 text-muted">{icon}</span>}
      <input className={`${control} ${icon ? "pl-9" : ""} ${className}`} {...rest} />
    </label>
  );
}
