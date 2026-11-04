/**
 * Badge: a small status pill (Paid, Overdue, Pending). Used for state only, never for categories.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import type { ReactNode } from "react";

/** Status tone. Shown as a coloured dot or icon; the text label always carries the meaning too. */
export type BadgeTone = "neutral" | "accent" | "good" | "warning" | "serious" | "critical";

/** Badge content and tone. Pass an `icon` to replace the default dot, or `null` for a plain label. */
export type BadgeProps = {
  tone?: BadgeTone;
  /** Custom icon; `null` hides the mark entirely (plain label). Defaults to a dot. */
  icon?: ReactNode | null;
  children: ReactNode;
};

/** Pill background and mark colour per tone (design tokens only). */
const tones: Record<BadgeTone, { bg: string; mark: string }> = {
  neutral: { bg: "bg-surface-2", mark: "text-muted" },
  accent: { bg: "bg-accent/12", mark: "text-accent" },
  good: { bg: "bg-good/12", mark: "text-good" },
  warning: { bg: "bg-warning/18", mark: "text-warning" },
  serious: { bg: "bg-serious/15", mark: "text-serious" },
  critical: { bg: "bg-critical/12", mark: "text-critical" },
};

/** Tinted pill. Text stays in ink; the coloured dot/icon carries the tone, never colour alone. */
export function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  const t = tones[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap text-ink ${t.bg}`}
    >
      {icon !== null && (
        <span className={`${t.mark} inline-flex`} aria-hidden>
          {icon ?? <span className="size-1.5 rounded-full bg-current" />}
        </span>
      )}
      {children}
    </span>
  );
}
