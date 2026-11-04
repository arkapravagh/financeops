/**
 * Checkbox: native checkbox with token styling and an indeterminate ("some selected") state.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import { useEffect, useRef } from "react";

/** Controlled checkbox. `label` is the accessible name (visually hidden). */
export type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
};

/** Used for row and "select all" selection in DataTable and for facet filter options. */
export function Checkbox({ checked, indeterminate = false, onChange, label }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      className="size-4 cursor-pointer rounded border-line accent-accent outline-none focus-visible:ring-2 focus-visible:ring-accent"
    />
  );
}
