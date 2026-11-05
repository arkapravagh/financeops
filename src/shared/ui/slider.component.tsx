/**
 * Slider: labelled range input that shows its formatted value and an optional hint.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

/** Controlled numeric value and range. `display` is the formatted value shown beside the label. */
export type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Formatted current value shown at the right of the label. */
  display: string;
  note?: string;
  onChange: (v: number) => void;
};

/** Used for scenario levers. The label wraps the input so clicking it focuses the slider. */
export function Slider({ label, value, min, max, step, display, note, onChange }: SliderProps) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-ink">{label}</span>
        <span className="font-medium tabular-nums text-ink">{display}</span>
      </span>
      <input
        type="range"
        className="mt-2 w-full cursor-pointer"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {note && <span className="block text-xs text-muted">{note}</span>}
    </label>
  );
}
