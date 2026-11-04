import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";

export type Delta = {
  text: string;
  direction: "up" | "down" | "flat";
  /** Is this movement good for the company? Drives color. */
  good: boolean;
};

export type StatTileProps = {
  label: string;
  value: ReactNode;
  delta?: Delta;
  hint?: ReactNode;
  icon?: ReactNode;
};

const arrows = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

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
