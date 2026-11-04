import { useElementWidth } from "./chart.util";

export type SparklineProps = {
  values: number[];
  height?: number;
  /** Accessible summary; omit when the adjacent text already states the trend. */
  label?: string;
};

/**
 * Trend sparkline for KPI cells: history in a recessive line, the current period as an accent dot.
 * No axes or labels — the KPI value and delta beside it carry the numbers.
 */
export function Sparkline({ values, height = 32, label }: SparklineProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const pad = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const last = values.length - 1;

  return (
    <div ref={ref} style={{ height }} className="w-full">
      {width > 0 && (
        <svg width={width} height={height} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
          <path d={d} fill="none" stroke="var(--axis)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={x(last)} cy={y(values[last])} r={3.5} fill="var(--series-1)" stroke="var(--surface)" strokeWidth={2} />
        </svg>
      )}
    </div>
  );
}
