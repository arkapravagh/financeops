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
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {note && <span className="block text-xs text-muted">{note}</span>}
    </label>
  );
}
