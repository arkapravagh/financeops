/**
 * Bullet bar: actual vs. target on one row (budgets, AI budget).
 *
 * House SVG chart; follows .claude/rules/charts.md.
 */

/** Actual and target in the same unit, plus the shared scale `max` so rows line up. */
export type BulletBarProps = {
  /** Actual value, in the same unit as `target` and `max`. */
  actual: number;
  target: number;
  /** Right edge of the shared scale (so rows are comparable). */
  max: number;
  /** Shared tick positions, drawn as faint gridlines. */
  ticks?: number[];
  height?: number;
};

/**
 * One bullet-chart row: light band = target, bar = actual, ink tick = target line,
 * the over-target part drawn in the critical status colour after a 2px surface gap.
 * Pair it with a text label for over/under — colour is never the only signal.
 */
export function BulletBar({ actual, target, max, ticks = [], height = 22 }: BulletBarProps) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  const over = actual > target;
  const bar = Math.round(height * 0.5);
  const top = (height - bar) / 2;
  return (
    <div className="relative w-full" style={{ height }} aria-hidden>
      {ticks.map((t) => (
        <span key={t} className="absolute inset-y-0 w-px bg-[var(--grid)]" style={{ left: pct(t) }} />
      ))}
      <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-[var(--series-1-soft)]" style={{ width: pct(target) }} />
      <span
        className={`absolute left-0 bg-[var(--series-1)] transition-[width] duration-500 ease-out motion-reduce:transition-none ${over ? "" : "rounded-r-[4px]"}`}
        style={{ width: pct(Math.min(actual, target)), top, height: bar }}
      />
      {over && (
        <span
          className="absolute rounded-r-[4px] bg-critical transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ left: `calc(${pct(target)} + 2px)`, width: `calc(${pct(actual)} - ${pct(target)} - 2px)`, top, height: bar }}
        />
      )}
      <span className="absolute -top-0.5 -bottom-0.5 w-[3px] -translate-x-1/2 rounded-full bg-ink" style={{ left: pct(target) }} />
    </div>
  );
}
