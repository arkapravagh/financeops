/**
 * KPI row: several headline numbers in one divided panel.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import type { PageSection } from "../../enums/page-section.enum";
import { commonLabels } from "../../language/en/common.lang";
import { Sparkline } from "../charts/sparkline.component";
import type { Delta } from "./stat-tile.component";

/** One KPI cell: label, value, optional change vs. last period, context line and sparkline. */
export type Kpi = {
  label: string;
  value: ReactNode;
  delta?: Delta;
  /** One short phrase of context, e.g. "vs prior 3 months". */
  context?: ReactNode;
  /** Optional history for a sparkline (oldest → newest). */
  trend?: number[];
};

const arrows = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

/**
 * One panel, split by hairlines — not N separate cards (design-system: KPI row).
 * Uses a container query so it wraps by its own width (works beside the AI panel).
 */
export function KpiRow({ items, className = "", aiTarget }: { items: Kpi[]; className?: string; aiTarget?: PageSection }) {
  return (
    <section
      data-ai-target={aiTarget}
      className={`@container min-w-0 overflow-hidden rounded-[14px] border border-line bg-line ${className}`}
      aria-label={commonLabels.keyFigures}
    >
      <dl className="grid grid-cols-1 gap-px @md:grid-cols-2 @4xl:grid-cols-4">
        {items.map((k) => {
          const Arrow = k.delta ? arrows[k.delta.direction] : null;
          return (
            <div key={k.label} className="@container flex min-w-0 flex-col bg-surface px-5 py-4">
              <dt className="text-[13px] text-muted">{k.label}</dt>
              <dd className="mt-1.5 flex items-end justify-between gap-4">
                <span className="min-w-0 text-[26px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap text-ink">{k.value}</span>
                {k.trend && (
                  // Only when the cell is wide enough — never squeezes the value (e.g. beside the AI panel).
                  <span className="hidden w-20 shrink-0 @[15rem]:block">
                    <Sparkline values={k.trend} height={28} />
                  </span>
                )}
              </dd>
              {(k.delta || k.context) && (
                <dd className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
                  {k.delta && Arrow && (
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        k.delta.direction === "flat" ? "text-ink-2" : k.delta.good ? "text-good-ink" : "text-critical"
                      }`}
                    >
                      <Arrow size={13} aria-hidden />
                      {k.delta.text}
                    </span>
                  )}
                  {k.context && <span>{k.context}</span>}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
