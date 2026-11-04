import { AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { addMonths, formatMonthYear } from "../../lib/dates";
import { formatCompact } from "../../lib/money";
import { FORECAST_MONTHS } from "../../services/forecast";
import type { ScenarioResult } from "./scenario";

export type CompareRow = { result: ScenarioResult; color: string; dashed?: boolean; removable?: boolean; label?: string };

export type ScenarioCompareProps = {
  rows: CompareRow[];
  origin: Date;
  onRemove: (id: string) => void;
};

/** Side-by-side outcomes for the scenarios on the chart. The line key matches the chart's legend. */
export function ScenarioCompare({ rows, origin, onRemove }: ScenarioCompareProps) {
  const best = Math.max(...rows.map((r) => r.result.runway ?? FORECAST_MONTHS + 1));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[35rem] border-separate border-spacing-0 text-sm">
        <caption className="sr-only">Scenario comparison</caption>
        <thead>
          <tr className="text-xs text-muted">
            {["Scenario", "Runway", "Zero cash", "Break-even", "Cash in 12 months", "Verdict", ""].map((h, i) => (
              <th key={i} scope="col" className={`border-b border-line px-4 py-2.5 font-medium whitespace-nowrap ${i === 0 ? "text-left" : i === 6 ? "w-10" : "text-right"}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ result: r, color, dashed, removable, label }) => {
            const runway = r.runway ?? FORECAST_MONTHS + 1;
            return (
              <tr key={r.scenario.id} className="[&:last-child>td]:border-b-0">
                <td className="border-b border-line px-4 py-3 whitespace-nowrap">
                  <span className="flex items-center gap-2.5">
                    <svg width="18" height="8" aria-hidden className="shrink-0">
                      <line x1="1" x2="17" y1="4" y2="4" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={dashed ? "3 3" : undefined} />
                    </svg>
                    <span className="font-medium text-ink">{label ?? r.scenario.name}</span>
                  </span>
                </td>
                <td className="border-b border-line px-4 py-3 text-right whitespace-nowrap tabular-nums">
                  <span className={runway === best && rows.length > 1 ? "font-semibold text-ink" : "text-ink"}>
                    {r.runway === null ? `${FORECAST_MONTHS}+` : r.runway.toFixed(1)} mo
                  </span>
                </td>
                <td className="border-b border-line px-4 py-3 text-right whitespace-nowrap text-ink-2">{r.zeroDate ? formatMonthYear(r.zeroDate) : "—"}</td>
                <td className="border-b border-line px-4 py-3 text-right whitespace-nowrap text-ink-2">
                  {r.breakEven ? formatMonthYear(addMonths(origin, r.breakEven)) : "—"}
                </td>
                <td className="border-b border-line px-4 py-3 text-right whitespace-nowrap tabular-nums text-ink">{formatCompact(Math.max(0, r.cash12))}</td>
                <td className="border-b border-line px-4 py-3 text-right whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.alive ? "text-good-ink" : "text-critical"}`}>
                    {r.alive ? <CheckCircle2 size={12} aria-hidden /> : <AlertTriangle size={12} aria-hidden />}
                    {r.alive ? "Alive" : "Dead"}
                  </span>
                </td>
                <td className="border-b border-line px-3 py-3 text-right">
                  {removable && (
                    <button
                      type="button"
                      onClick={() => onRemove(r.scenario.id)}
                      aria-label={`Delete saved scenario ${r.scenario.name}`}
                      className="grid size-7 place-items-center rounded-md text-muted outline-none hover:bg-critical/10 hover:text-critical focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
