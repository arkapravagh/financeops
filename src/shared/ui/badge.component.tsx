import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "good" | "warning" | "serious" | "critical";

export type BadgeProps = {
  tone?: BadgeTone;
  /** Custom icon; `null` hides the mark entirely (plain label). Defaults to a dot. */
  icon?: ReactNode | null;
  children: ReactNode;
};

/** Tinted pill. Text stays in ink; the colored dot/icon carries the tone — never color alone. */
const tones: Record<BadgeTone, { bg: string; mark: string }> = {
  neutral: { bg: "bg-surface-2", mark: "text-muted" },
  accent: { bg: "bg-accent/12", mark: "text-accent" },
  good: { bg: "bg-good/12", mark: "text-good" },
  warning: { bg: "bg-warning/18", mark: "text-warning" },
  serious: { bg: "bg-serious/15", mark: "text-serious" },
  critical: { bg: "bg-critical/12", mark: "text-critical" },
};

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
