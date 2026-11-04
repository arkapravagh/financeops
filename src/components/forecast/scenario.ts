import { useCallback, useEffect, useState } from "react";
import { addMonths } from "../../lib/dates";
import {
  breakEvenIndex,
  isDefaultAlive,
  peakBurn,
  projectCash,
  projectedRunway,
  type ForecastInput,
  type ForecastPoint,
  type PlannedHire,
  type PlannedRaise,
} from "../../lib/metrics";

/** The editable part of a forecast. Everything else (cash, base revenue/spend) comes from actuals. */
export type Scenario = {
  id: string;
  name: string;
  revenueGrowth: number;
  expenseGrowth: number;
  expenseAdjustment: number;
  revenueAdjustment: number;
  hires: PlannedHire[];
  raise: PlannedRaise | null;
};

/** A scenario offered in the picker: a predefined one from the library, or one the user built. */
export type LibraryScenario = Scenario & {
  category: string;
  description: string;
  custom?: boolean;
};

export const CUSTOM_CATEGORY = "My scenarios";

export type ScenarioResult = {
  scenario: Scenario;
  points: ForecastPoint[];
  /** Months until cash < 0, or null if it lasts past the model horizon. */
  runway: number | null;
  zeroDate: Date | null;
  /** Start of a 9-month fundraising window before zero cash (null when no raise is needed). */
  raiseBy: Date | null;
  breakEven: number | null;
  alive: boolean;
  cash12: number;
  peak: { index: number; cents: number } | null;
};

export const RAISE_LEAD_MONTHS = 9;

/** Lever ranges shared by the panel, the custom-scenario dialog and the library (so presets never sit off-scale). */
export const LIMITS = {
  revenueGrowth: { min: -0.05, max: 0.15, step: 0.005 },
  expenseGrowth: { min: 0, max: 0.05, step: 0.0025 },
  expenseAdjustment: { min: -0.3, max: 0.3, step: 0.01 },
  revenueAdjustment: { min: -0.5, max: 0.5, step: 0.01 },
} as const;

export function fromBase(base: ForecastInput): Scenario {
  return {
    id: "current",
    name: "Current trajectory",
    revenueGrowth: base.revenueGrowth,
    expenseGrowth: base.expenseGrowth,
    expenseAdjustment: base.expenseAdjustment,
    revenueAdjustment: base.revenueAdjustment,
    hires: [],
    raise: null,
  };
}

export const toInput = (base: ForecastInput, s: Scenario): ForecastInput => ({
  ...base,
  revenueGrowth: s.revenueGrowth,
  expenseGrowth: s.expenseGrowth,
  expenseAdjustment: s.expenseAdjustment,
  revenueAdjustment: s.revenueAdjustment,
  hires: s.hires,
  raise: s.raise,
});

export function evaluateScenario(base: ForecastInput, s: Scenario, origin: Date): ScenarioResult {
  const input = toInput(base, s);
  const points = projectCash(input);
  const runway = projectedRunway(base.startCashCents, points);
  return {
    scenario: s,
    points,
    runway,
    zeroDate: runway === null ? null : addMonths(origin, runway),
    raiseBy: runway === null ? null : addMonths(origin, Math.max(0, runway - RAISE_LEAD_MONTHS)),
    breakEven: breakEvenIndex(points),
    alive: isDefaultAlive(input),
    cash12: points[11]?.cashCents ?? 0,
    peak: peakBurn(points),
  };
}

/** Scenarios are equal when every assumption matches (ignores id/name). */
export function sameAssumptions(a: Scenario, b: Scenario) {
  const key = (s: Scenario) =>
    JSON.stringify([
      s.revenueGrowth,
      s.expenseGrowth,
      s.expenseAdjustment,
      s.revenueAdjustment,
      s.raise,
      s.hires.map((h) => [h.startMonth, h.monthlyCostCents]),
    ]);
  return key(a) === key(b);
}

// ---------- persistence (localStorage) ----------

/** Fill fields added after a scenario was stored, so older saves keep working. */
function normalize<T extends Scenario>(s: T): T {
  return { ...s, revenueAdjustment: s.revenueAdjustment ?? 0, hires: s.hires ?? [], raise: s.raise ?? null };
}

function useStoredList<T extends Scenario>(key: string, max: number) {
  const [list, setList] = useState<T[]>(() => {
    try {
      return (JSON.parse(localStorage.getItem(key) ?? "[]") as T[]).slice(0, max).map(normalize);
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* storage unavailable */
    }
  }, [key, list]);
  return [list, setList] as const;
}

export const MAX_SAVED = 2; // + current + working = the 3-series cap the chart palette is validated for

/** Scenarios pinned to the chart and comparison table. */
export function useSavedScenarios() {
  const [saved, setSaved] = useStoredList<Scenario>("fo-scenarios", MAX_SAVED);
  const save = useCallback(
    (s: Scenario, name: string) =>
      setSaved((list) => [{ ...s, id: crypto.randomUUID(), name: name.trim() || "Untitled scenario" }, ...list].slice(0, MAX_SAVED)),
    [setSaved],
  );
  const remove = useCallback((id: string) => setSaved((list) => list.filter((s) => s.id !== id)), [setSaved]);
  return { saved, save, remove };
}

export const MAX_CUSTOM = 50;

/** Scenarios the user built with "Create custom scenario". They appear at the top of the picker. */
export function useCustomScenarios() {
  const [custom, setCustom] = useStoredList<LibraryScenario>("fo-custom-scenarios", MAX_CUSTOM);
  /** Insert or update (matched by id). Returns the stored scenario. */
  const upsert = useCallback(
    (s: Omit<LibraryScenario, "id" | "category" | "custom"> & { id?: string }): LibraryScenario => {
      const stored: LibraryScenario = {
        ...s,
        id: s.id ?? `custom-${crypto.randomUUID()}`,
        name: s.name.trim() || "Untitled scenario",
        description: s.description.trim(),
        category: CUSTOM_CATEGORY,
        custom: true,
      };
      setCustom((list) =>
        list.some((x) => x.id === stored.id) ? list.map((x) => (x.id === stored.id ? stored : x)) : [stored, ...list].slice(0, MAX_CUSTOM),
      );
      return stored;
    },
    [setCustom],
  );
  const remove = useCallback((id: string) => setCustom((list) => list.filter((s) => s.id !== id)), [setCustom]);
  return { custom, upsert, remove };
}
