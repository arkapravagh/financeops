/**
 * Scenario levers: growth, one-off changes, hiring plan and fundraise controls.
 *
 * Shared by the scenario panel and the custom scenario drawer, so both edit scenarios the same way.
 */

import { Plus, X } from "lucide-react";
import { leverLabels as L } from "../../../language/en/forecast.lang";
import { hireRoleLabels } from "../../../language/en/scenario-library.lang";
import { DEFAULT_HIRE_COST_CENTS } from "../../../services/forecast.service";
import { Slider } from "../../../shared/ui/slider.component";
import { addMonths, formatMonthYear } from "../../../shared/utils/dates.util";
import { sumCents } from "../../../shared/utils/metrics.util";
import { formatCompact, formatMoney, formatPercent } from "../../../shared/utils/money.util";
import type { Scenario } from "../../../types/forecast.types";
import { LIMITS } from "../scenario.model";
import { ScenarioSection } from "./scenario-section.component";

/** The scenario to edit, the current trajectory (for reference notes), the origin and a patch callback. */
export type ScenarioLeversProps = {
  scenario: Scenario;
  /** The current trajectory, shown as the reference under each growth slider. */
  current: Scenario;
  origin: Date;
  onChange: (patch: Partial<Scenario>) => void;
};

const field =
  "h-8 rounded-md border border-line bg-surface px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent";

const growthText = (v: number) => (v < 0 ? L.shrinks(formatPercent(-v, 1)) : L.perMonth(formatPercent(v, 1)));
const changeText = (v: number) => (v < 0 ? `−${formatPercent(-v, 0)}` : formatPercent(v, 0, true));

/** The editable assumptions of a scenario: growth, one-off changes, hiring plan and fundraise. */
export function ScenarioLevers({ scenario: s, current, origin, onChange }: ScenarioLeversProps) {
  const monthLabel = (m: number) => formatMonthYear(addMonths(origin, m));
  const hiringCost = sumCents(s.hires.map((h) => h.monthlyCostCents));
  const updateHire = (id: string, patch: Partial<Scenario["hires"][number]>) =>
    onChange({ hires: s.hires.map((h) => (h.id === id ? { ...h, ...patch } : h)) });

  return (
    <>
      <ScenarioSection title={L.growth}>
        <div className="flex flex-col gap-4">
          <Slider
            label={L.revenueGrowth}
            {...LIMITS.revenueGrowth}
            value={s.revenueGrowth}
            display={growthText(s.revenueGrowth)}
            note={L.lastSixMonths(formatPercent(current.revenueGrowth, 1))}
            onChange={(v) => onChange({ revenueGrowth: v })}
          />
          <Slider
            label={L.spendingGrowth}
            {...LIMITS.expenseGrowth}
            value={s.expenseGrowth}
            display={growthText(s.expenseGrowth)}
            note={L.lastSixMonths(formatPercent(current.expenseGrowth, 1))}
            onChange={(v) => onChange({ expenseGrowth: v })}
          />
        </div>
      </ScenarioSection>

      <ScenarioSection title={L.oneOff} aside={L.fromNextMonth}>
        <div className="flex flex-col gap-4">
          <Slider
            label={L.spending}
            {...LIMITS.expenseAdjustment}
            value={s.expenseAdjustment}
            display={changeText(s.expenseAdjustment)}
            note={L.spendingNote}
            onChange={(v) => onChange({ expenseAdjustment: v })}
          />
          <Slider
            label={L.revenue}
            {...LIMITS.revenueAdjustment}
            value={s.revenueAdjustment}
            display={changeText(s.revenueAdjustment)}
            note={L.revenueNote}
            onChange={(v) => onChange({ revenueAdjustment: v })}
          />
        </div>
      </ScenarioSection>

      <ScenarioSection title={L.hiring} aside={s.hires.length ? L.hiringCost(formatMoney(hiringCost)) : L.noHires}>
        {s.hires.length > 0 && (
          <ul className="mb-2 flex flex-col gap-1.5">
            {s.hires.map((h, i) => (
              <li key={h.id} className="grid grid-cols-[minmax(0,1fr)_7.5rem_5.5rem_1.75rem] items-center gap-1.5">
                <label className="min-w-0">
                  <span className="sr-only">{L.hireRole(i + 1)}</span>
                  <input className={`${field} w-full`} value={h.role} onChange={(e) => updateHire(h.id, { role: e.target.value })} />
                </label>
                <label>
                  <span className="sr-only">{L.hireStart(i + 1)}</span>
                  <select
                    className={`${field} w-full`}
                    value={h.startMonth}
                    onChange={(e) => updateHire(h.id, { startMonth: Number(e.target.value) })}
                  >
                    {Array.from({ length: 24 }, (_, k) => k + 1).map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="sr-only">{L.hireCost(i + 1)}</span>
                  <span className="relative block">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      step={0.5}
                      className={`${field} w-full pr-6 text-right tabular-nums`}
                      value={h.monthlyCostCents / 100_000}
                      onChange={(e) => updateHire(h.id, { monthlyCostCents: Math.max(0, Math.round(Number(e.target.value) * 100_000)) })}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted">{L.thousands}</span>
                  </span>
                </label>
                <button
                  type="button"
                  aria-label={L.removeHire(h.role)}
                  onClick={() => onChange({ hires: s.hires.filter((x) => x.id !== h.id) })}
                  className="grid size-7 place-items-center rounded-md text-muted outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() =>
            onChange({
              hires: [
                ...s.hires,
                {
                  id: crypto.randomUUID(),
                  role: hireRoleLabels.engineer,
                  startMonth: Math.min(24, (s.hires.at(-1)?.startMonth ?? 0) + 1),
                  monthlyCostCents: DEFAULT_HIRE_COST_CENTS,
                },
              ],
            })
          }
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[13px] font-medium text-accent outline-none hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus size={14} aria-hidden /> {L.addHire}
        </button>
        <p className="mt-1 text-xs text-muted">{L.fullyLoaded}</p>
      </ScenarioSection>

      <ScenarioSection title={L.fundraise} aside={s.raise ? L.raiseSummary(formatCompact(s.raise.amountCents), monthLabel(s.raise.month)) : L.notPlanned}>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            className="size-4 accent-accent"
            checked={!!s.raise}
            onChange={(e) => onChange({ raise: e.target.checked ? { month: 9, amountCents: 3_000_000_00 } : null })}
          />
          {L.includeRaise}
        </label>
        {s.raise && (
          <div className="mt-4 flex flex-col gap-4">
            <Slider
              label={L.amount}
              value={s.raise.amountCents}
              min={250_000_00}
              max={10_000_000_00}
              step={250_000_00}
              display={formatCompact(s.raise.amountCents)}
              onChange={(v) => onChange({ raise: { ...s.raise!, amountCents: v } })}
            />
            <Slider
              label={L.moneyInBank}
              value={s.raise.month}
              min={1}
              max={24}
              step={1}
              display={monthLabel(s.raise.month)}
              note={L.moneyInBankNote}
              onChange={(v) => onChange({ raise: { ...s.raise!, month: v } })}
            />
          </div>
        )}
      </ScenarioSection>
    </>
  );
}
