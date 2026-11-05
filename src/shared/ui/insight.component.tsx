/**
 * Insight: a plain-language callout (what's happening and what to do), e.g. "Runway under 12 months".
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import type { ReactNode } from "react";

/** Severity, shown as a small icon next to the title. */
export type InsightTone = "info" | "good" | "warning" | "critical";

/** Callout content. `framed` adds a border for standalone use; inside lists leave it off. */
export type InsightProps = {
  tone?: InsightTone;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  /** Standalone use: draws its own bordered panel. In lists, leave false and use dividers. */
  framed?: boolean;
};

const config: Record<InsightTone, { Icon: typeof Info; mark: string }> = {
  info: { Icon: Info, mark: "text-accent" },
  good: { Icon: CheckCircle2, mark: "text-good" },
  warning: { Icon: AlertTriangle, mark: "text-warning" },
  critical: { Icon: OctagonAlert, mark: "text-critical" },
};

/**
 * A plain-language flag: what's happening and what to do. The status colour is only a small icon —
 * never a tinted box (design-system: alert list).
 */
export function Insight({ tone = "info", title, children, action, framed = false }: InsightProps) {
  const { Icon, mark } = config[tone];
  return (
    <div className={`flex gap-3 ${framed ? "rounded-[14px] border border-line bg-surface p-4" : "py-3.5"}`}>
      <Icon size={16} className={`mt-0.5 shrink-0 ${mark}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {children && <div className="mt-0.5 text-[13px] leading-relaxed text-ink-2">{children}</div>}
        {action && <div className="mt-1.5">{action}</div>}
      </div>
    </div>
  );
}
