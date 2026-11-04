import { useState } from "react";
import { formatCompact, formatMoney } from "../../lib/money";
import { ChartTooltip, Legend, type TooltipRow } from "./ChartParts";
import { columnPath, labelStep, niceTicks, useElementWidth } from "./chartUtils";

export type ColumnSeries = { name: string; color: string; values: number[] };

export type ColumnChartProps = {
  labels: string[];
  tooltipLabels?: string[];
  series: ColumnSeries[];
  ariaLabel: string;
  height?: number;
  /** Extra tooltip rows per index (e.g. net burn). */
  extraRows?: (index: number) => TooltipRow[];
};

const M = { top: 12, right: 8, bottom: 28, left: 56 };
const GAP = 2;
const MAX_BAR = 24;

export function ColumnChart({ labels, tooltipLabels, series, ariaLabel, height = 240, extraRows }: ColumnChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const n = labels.length;
  const k = series.length;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const all = series.flatMap((s) => s.values);
  const ticks = niceTicks(Math.min(0, ...all), Math.max(...all));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => M.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const band = n ? plotW / n : 0;
  const barW = Math.max(2, Math.min(MAX_BAR, (band * 0.7 - GAP * (k - 1)) / k));
  const groupW = barW * k + GAP * (k - 1);
  const step = labelStep(n, plotW, 44);

  return (
    <div>
      {k >= 2 && <Legend items={series} />}
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--axis)" : "var(--grid)"} />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                  {formatCompact(t)}
                </text>
              </g>
            ))}
            {labels.map((l, i) => (
              <g key={i}>
                {hover === i && (
                  <rect x={M.left + i * band} y={M.top} width={band} height={plotH} fill="var(--surface-2)" />
                )}
                {(n - 1 - i) % step === 0 && (
                  <text x={M.left + i * band + band / 2} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
                    {l}
                  </text>
                )}
                {series.map((s, si) => {
                  const bx = M.left + i * band + (band - groupW) / 2 + si * (barW + GAP);
                  return <path key={s.name} d={columnPath(bx, y(0), y(s.values[i]), barW)} fill={s.color} />;
                })}
                {/* hit target: the whole band, larger than the marks */}
                <rect
                  x={M.left + i * band}
                  y={M.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                />
              </g>
            ))}
          </svg>
        )}
        {hover !== null && (
          <ChartTooltip
            x={M.left + hover * band + band / 2}
            containerWidth={width}
            title={tooltipLabels?.[hover] ?? labels[hover]}
            rows={[
              ...series.map((s) => ({ label: s.name, value: formatMoney(s.values[hover]), color: s.color })),
              ...(extraRows?.(hover) ?? []),
            ]}
          />
        )}
      </div>
    </div>
  );
}
