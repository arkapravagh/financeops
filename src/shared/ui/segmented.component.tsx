/**
 * Segmented control: pick one of a few options (e.g. forecast horizon 12 / 24 / 36 months).
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

/** One option: value and visible label. */
export type SegmentedOption<T extends string> = { value: T; label: string };

/** Controlled value, options and an accessible group `label`. */
export type SegmentedProps<T extends string> = {
  label: string;
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  size?: "sm" | "md";
};

/** Pill-style single choice (radio group). For switching a view, not for navigation. */
export function Segmented<T extends string>({ label, value, options, onChange, size = "sm" }: SegmentedProps<T>) {
  const pad = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 font-medium">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`rounded-md outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${pad} ${
              active ? "bg-surface text-ink ring-1 ring-line" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
