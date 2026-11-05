/** Runway sensitivity: how many months each single change (cut 10%, hire one more, grow faster) adds or removes. */

import { DEFAULT_HIRE_COST_CENTS, FORECAST_MONTHS } from "../../../services/forecast.service";
import { projectCash, projectedRunway, type ForecastInput } from "../../../shared/utils/metrics.util";
import { toInput, type Scenario } from "../scenario.model";

type Lever = { label: string; apply: (s: Scenario) => Scenario };

const LEVERS: Lever[] = [
  { label: "Revenue grows 1 point faster", apply: (s) => ({ ...s, revenueGrowth: s.revenueGrowth + 0.01 }) },
  { label: "Revenue grows 1 point slower", apply: (s) => ({ ...s, revenueGrowth: Math.max(0, s.revenueGrowth - 0.01) }) },
  { label: "Cut spending by 10%", apply: (s) => ({ ...s, expenseAdjustment: s.expenseAdjustment - 0.1 }) },
  { label: "Spending grows 1 point faster", apply: (s) => ({ ...s, expenseGrowth: s.expenseGrowth + 0.01 }) },
  {
    label: "Hire one more engineer next month",
    apply: (s) => ({ ...s, hires: [...s.hires, { id: "lever", role: "Engineer", startMonth: 1, monthlyCostCents: DEFAULT_HIRE_COST_CENTS }] }),
  },
];

/**
 * "What moves runway most": months of runway gained or lost by nudging one assumption at a time.
 * A diverging bar per lever, sorted by size; numbers are always printed (colour is never the only signal).
 */
export function RunwaySensitivity({ base, scenario }: { base: ForecastInput; scenario: Scenario }) {
  const cap = FORECAST_MONTHS;
  const runwayOf = (s: Scenario) => projectedRunway(base.startCashCents, projectCash(toInput(base, s))) ?? cap;
  const r0 = runwayOf(scenario);
  const rows = LEVERS.map((l) => ({ label: l.label, delta: runwayOf(l.apply(scenario)) - r0 })).sort(
    (a, b) => Math.abs(b.delta) - Math.abs(a.delta),
  );
  const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r.delta)));
  const atCap = r0 >= cap;

  return (
    <div className="@container">
      {atCap && (
        <p className="mb-3 text-[13px] text-ink-2">
          This scenario already lasts beyond {cap} months, so gains can't be measured. Losses still show.
        </p>
      )}
      <ul className="flex flex-col gap-2.5" aria-label="Change in runway by lever">
        {rows.map((r) => {
          const w = `${(Math.abs(r.delta) / maxAbs) * 50}%`;
          const gain = r.delta > 0.05;
          const loss = r.delta < -0.05;
          return (
            <li
              key={r.label}
              className="grid grid-cols-[minmax(0,1fr)_4.25rem] items-center gap-x-3 gap-y-1 text-sm @lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_4.25rem]"
            >
              <span className="text-ink @lg:truncate">{r.label}</span>
              <span className="relative col-span-2 row-start-2 h-3 @lg:col-span-1 @lg:row-start-auto" aria-hidden>
                <span className="absolute inset-y-[-3px] left-1/2 w-px bg-[var(--axis)]" />
                {gain && <span className="absolute inset-y-0 left-1/2 rounded-r-[3px] bg-accent" style={{ width: w }} />}
                {loss && <span className="absolute inset-y-0 right-1/2 rounded-l-[3px] bg-critical/80" style={{ width: w }} />}
              </span>
              <span className={`text-right font-medium tabular-nums ${gain ? "text-good-ink" : loss ? "text-critical" : "text-muted"}`}>
                {gain ? "+" : loss ? "−" : "±"}
                {Math.abs(r.delta).toFixed(1)} mo
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-muted">Each row changes one assumption in your scenario and keeps everything else the same.</p>
    </div>
  );
}
