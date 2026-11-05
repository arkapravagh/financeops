/**
 * Meter: one progress value against a limit (e.g. budget used). Turns warning at 90% and critical over 100%.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

/** Ratio used (may exceed 1) and the accessible label. */
export type MeterProps = {
  /** Ratio used, may exceed 1. */
  value: number;
  label: string;
};

/** Progress meter: fill carries severity, track is a lighter step of the same hue. */
export function Meter({ value, label }: MeterProps) {
  const tone = value > 1 ? "critical" : value >= 0.9 ? "warning" : "accent";
  const fill = { accent: "bg-accent", warning: "bg-warning", critical: "bg-critical" }[tone];
  const track = { accent: "bg-accent/15", warning: "bg-warning/20", critical: "bg-critical/15" }[tone];
  const pct = Math.min(value, 1) * 100;
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      className={`h-2 w-full overflow-hidden rounded-full ${track}`}
    >
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
