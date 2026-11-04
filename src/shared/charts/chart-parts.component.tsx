/** Shared chart pieces: legend and hover tooltip, used by LineChart and ColumnChart. */

import type { ReactNode } from "react";

/** Legend entry: name, colour token and whether the line is dashed (projected). */
export type SeriesKey = { name: string; color: string; dashed?: boolean };

/** Series legend. Shown whenever a chart has two or more series (chart rules). */
export function Legend({ items }: { items: SeriesKey[] }) {
  return (
    <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
      {items.map((s) => (
        <li key={s.name} className="inline-flex items-center gap-1.5">
          <svg width="16" height="8" aria-hidden>
            <line
              x1="1"
              x2="15"
              y1="4"
              y2="4"
              stroke={s.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={s.dashed ? "3 3" : undefined}
            />
          </svg>
          {s.name}
        </li>
      ))}
    </ul>
  );
}

/** One line in a tooltip: label, formatted value, optional colour swatch. */
export type TooltipRow = { label: string; value: string; color?: string };

/** Floating tooltip positioned next to the hovered point, kept inside the chart bounds. */
export function ChartTooltip({
  x,
  containerWidth,
  title,
  rows,
}: {
  x: number;
  containerWidth: number;
  title: ReactNode;
  rows: TooltipRow[];
}) {
  const w = 200;
  const left = Math.min(Math.max(x + 12, 0), containerWidth - w);
  const flip = x + 12 + w > containerWidth;
  return (
    <div
      className="pointer-events-none absolute top-2 z-10 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-[var(--shadow-float)]"
      style={{ left: flip ? Math.max(0, x - w - 12) : left, width: w }}
      role="presentation"
    >
      <div className="mb-1 font-medium text-ink">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-3 py-0.5">
          <span className="inline-flex items-center gap-1.5 text-ink-2">
            {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} aria-hidden />}
            {r.label}
          </span>
          <span className="font-medium text-ink tabular-nums">{r.value}</span>
        </div>
      ))}
    </div>
  );
}
