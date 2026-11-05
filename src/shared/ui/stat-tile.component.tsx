/**
 * Stat tile: one headline number with label, change indicator and hint.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

/** Change vs. a previous period. `good` says whether this direction is good news (sets the tone). */
export type Delta = {
  text: string;
  direction: "up" | "down" | "flat";
  /** Is this movement good for the company? Drives color. */
  good: boolean;
};

/** Tile content. `value` is pre-formatted text; numbers go through `money.util` first. */
export type StatTileProps = {
  label: string;
  value: ReactNode;
  delta?: Delta;
  hint?: ReactNode;
  icon?: ReactNode;
};

const arrows = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

/** A single headline number. For several numbers side by side use KpiRow instead. */
export function StatTile({ label, value, delta, hint, icon }: StatTileProps) {
  const Arrow = delta ? arrows[delta.direction] : null;
  return (
    <div className="min-w-0 rounded-[14px] border border-line bg-surface p-5">
      <div className="flex items-center justify-between text-sm text-ink-2">
        <span>{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-ink">{value}</div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {delta && Arrow && (
          <span
            className={`inline-flex items-center gap-0.5 font-medium ${
              delta.direction === "flat" ? "text-ink-2" : delta.good ? "text-good-ink" : "text-critical"
            }`}
          >
            <Arrow size={14} aria-hidden />
            {delta.text}
          </span>
        )}
        {hint && <span className="text-muted">{hint}</span>}
      </div>
    </div>
  );
}
