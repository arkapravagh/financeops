import { useId, useState } from "react";
import { formatCompact, formatMoney } from "../../lib/money";
import { ChartTooltip, Legend } from "./ChartParts";
import { labelStep, niceTicks, useElementWidth } from "./chartUtils";

export type LineSeries = {
  name: string;
  /** CSS color, e.g. "var(--series-1)" */
  color: string;
  values: (number | null)[];
  /** Draw the whole series dashed (e.g. a scenario). */
  dashed?: boolean;
  /** Soft gradient wash under the line (≈14% at the line fading to 0 at the baseline). */
  area?: boolean;
};

export type LineChartProps = {
  labels: string[];
  /** Optional longer labels for tooltips. */
  tooltipLabels?: string[];
  series: LineSeries[];
  ariaLabel: string;
  height?: number;
  /** Index from which values are projections: drawn dashed with a "Projected" marker. */
  projectedFrom?: number;
  formatTick?: (v: number) => string;
  formatValue?: (v: number) => string;
  /** Event annotations: a hairline at an x index with a short label (e.g. "Raise $3M", "Zero cash"). */
  markers?: ChartMarker[];
};

export type ChartMarker = { index: number; label: string; tone?: "neutral" | "critical" };

const M = { top: 12, right: 16, bottom: 28, left: 56 };

export function LineChart({
  labels,
  tooltipLabels,
  series,
  ariaLabel,
  height = 240,
  projectedFrom,
  formatTick = formatCompact,
  formatValue = (v) => formatMoney(v),
  markers = [],
}: LineChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gradId = useId().replace(/:/g, "");

  const n = labels.length;
  const plotW = Math.max(0, width - M.left - M.right);
  const plotH = height - M.top - M.bottom;
  const all = series.flatMap((s) => s.values.filter((v): v is number => v !== null));
  const ticks = niceTicks(Math.min(0, ...all), Math.max(...all));
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const x = (i: number) => M.left + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const y = (v: number) => M.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const step = labelStep(n, plotW, 52);

  const pathFor = (values: (number | null)[], from: number, to: number) => {
    let d = "";
    let pen = false;
    for (let i = from; i <= to && i < values.length; i++) {
      const v = values[i];
      if (v === null) {
        pen = false;
        continue;
      }
      d += `${pen ? "L" : "M"}${x(i)},${y(v)} `;
      pen = true;
    }
    return d.trim();
  };

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = Math.round((px / rect.width) * (n - 1));
    setHover(Math.max(0, Math.min(n - 1, i)));
  };

  const legendItems = series.map((s) => ({ name: s.name, color: s.color, dashed: s.dashed }));

  return (
    <div>
      {series.length >= 2 && <Legend items={legendItems} />}
      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} role="img" aria-label={ariaLabel} className="block overflow-visible">
            {/* grid + y ticks */}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} stroke={t === 0 ? "var(--axis)" : "var(--grid)"} />
                <text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                  {formatTick(t)}
                </text>
              </g>
            ))}

            {/* projected region */}
            {projectedFrom !== undefined && projectedFrom < n && (
              <g>
                <rect
                  x={x(projectedFrom)}
                  y={M.top}
                  width={x(n - 1) - x(projectedFrom)}
                  height={plotH}
                  fill="var(--surface-2)"
                  opacity={0.6}
                />
                <text x={x(projectedFrom) + 6} y={M.top + 12} className="fill-muted text-[11px] font-medium">
                  Projected
                </text>
              </g>
            )}

            {/* event markers: labels sit along the bottom, staggered, so they clear the "Projected" tag and rising lines */}
            {markers
              .filter((m) => m.index >= 0 && m.index < n)
              .map((m, k) => {
                const mx = x(m.index);
                const nearRight = mx > width - M.right - 90;
                const color = m.tone === "critical" ? "var(--critical)" : "var(--ink-2)";
                return (
                  <g key={`${m.index}-${m.label}`}>
                    <line x1={mx} x2={mx} y1={M.top} y2={M.top + plotH} stroke={color} strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
                    <text
                      x={nearRight ? mx - 5 : mx + 5}
                      y={M.top + plotH - 8 - k * 15}
                      textAnchor={nearRight ? "end" : "start"}
                      className="text-[11px] font-medium"
                      fill={color}
                      stroke="var(--surface)"
                      strokeWidth={4}
                      paintOrder="stroke"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}

            {/* x labels */}
            {labels.map((l, i) =>
              (n - 1 - i) % step === 0 ? (
                <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
                  {l}
                </text>
              ) : null,
            )}

            {/* series */}
            <defs>
              {series.map((s, si) => (
                <linearGradient key={s.name} id={`${gradId}-${si}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.16} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {series.map((s, si) => {
              const solidEnd = projectedFrom ?? n - 1;
              const solid = pathFor(s.values, 0, solidEnd);
              const projected = projectedFrom !== undefined ? pathFor(s.values, projectedFrom, n - 1) : "";
              const firstIdx = s.values.findIndex((v) => v !== null);
              const lastSolidIdx = Math.min(solidEnd, s.values.length - 1);
              const areaD =
                s.area && solid && firstIdx >= 0
                  ? `${solid} L${x(lastSolidIdx)},${y(Math.max(yMin, 0))} L${x(firstIdx)},${y(Math.max(yMin, 0))} Z`
                  : "";
              return (
                <g key={s.name}>
                  {areaD && <path d={areaD} fill={`url(#${gradId}-${si})`} />}
                  <path
                    d={solid}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={s.dashed ? "6 5" : undefined}
                  />
                  {projected && (
                    <path
                      d={projected}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray="6 5"
                    />
                  )}
                </g>
              );
            })}

            {/* hover layer */}
            {hover !== null && (
              <g>
                <line x1={x(hover)} x2={x(hover)} y1={M.top} y2={M.top + plotH} stroke="var(--axis)" />
                {series.map((s) =>
                  s.values[hover] !== null && s.values[hover] !== undefined ? (
                    <circle
                      key={s.name}
                      cx={x(hover)}
                      cy={y(s.values[hover] as number)}
                      r={4.5}
                      fill={s.color}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  ) : null,
                )}
              </g>
            )}
            <rect
              x={M.left}
              y={M.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}
        {hover !== null && (
          <ChartTooltip
            x={x(hover)}
            containerWidth={width}
            title={
              <>
                {tooltipLabels?.[hover] ?? labels[hover]}
                {projectedFrom !== undefined && hover > projectedFrom && (
                  <span className="ml-1.5 rounded bg-surface-2 px-1 py-px text-[10px] font-medium text-muted">Projected</span>
                )}
              </>
            }
            rows={series
              .filter((s) => s.values[hover] !== null && s.values[hover] !== undefined)
              .map((s) => ({ label: s.name, value: formatValue(s.values[hover] as number), color: s.color }))}
          />
        )}
      </div>
    </div>
  );
}
