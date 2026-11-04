/**
 * Button: primary, secondary and ghost actions with an optional leading icon.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Visual weight: primary = the one main action, secondary = bordered, ghost = text only. */
export type ButtonVariant = "primary" | "secondary" | "ghost";

/** Native button attributes plus variant and icon. `type` defaults to "button" (pass "submit" in forms). */
export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-ink hover:brightness-110",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

/** Labels say exactly what happens ("Export CSV"). Disabled buttons dim and show a not-allowed cursor. */
export function Button({ variant = "secondary", icon, children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
