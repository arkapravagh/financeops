/**
 * Scenario model for the Runway & forecast feature.
 *
 * A {@link Scenario} is the *editable* part of a forecast: growth rates, one-off changes, hires and a raise.
 * Everything else (cash today, base revenue and spend) comes from actuals via `services/forecast.service.ts`.
 * This file is pure: no React, no storage. Persistence lives in `use-scenario-storage.hook.ts`.
 */

import { addMonths } from "../../shared/utils/dates.util";
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
} from "../../shared/utils/metrics.util";

/** The editable part of a forecast. Everything else (cash, base revenue/spend) comes from actuals. */
export type Scenario = {
  /** "current" for the trajectory, "working" for unsaved edits, `lib-*` for library, `custom-*` for user-made. */
  id: string;
  name: string;
  /** Month-over-month revenue growth, e.g. 0.046. May be negative (net churn). */
  revenueGrowth: number;
  /** Month-over-month spending growth, e.g. 0.017. */
  expenseGrowth: number;
  /** One-off change to the spending base from month 1, e.g. -0.15 for a 15% cut. */
  expenseAdjustment: number;
  /** One-off change to the revenue base from month 1, e.g. -0.2 when a big customer churns. */
  revenueAdjustment: number;
  hires: PlannedHire[];
  raise: PlannedRaise | null;
};

/** A scenario offered in the picker: a predefined one from the library, or one the user built. */
export type LibraryScenario = Scenario & {
  /** Picker group heading, e.g. "Hiring". */
  category: string;
  /** One sentence on what the scenario assumes. */
  description: string;
  /** True for scenarios the user created (editable and deletable). */
  custom?: boolean;
};

/** Picker group that holds user-made scenarios; always listed first. */
export const CUSTOM_CATEGORY = "My scenarios";

/** Everything the page shows for one scenario, computed once by {@link evaluateScenario}. */
export type ScenarioResult = {
  scenario: Scenario;
  /** Month-by-month projection, month 1 = current month. */
  points: ForecastPoint[];
  /** Months until cash < 0, or null if it lasts past the model horizon. */
  runway: number | null;
  /** Projected zero-cash date, or null if cash lasts past the horizon. */
  zeroDate: Date | null;
  /** Start of a 9-month fundraising window before zero cash (null when no raise is needed). */
  raiseBy: Date | null;
  /** First projected month where revenue ≥ spending, or null if never within the horizon. */
  breakEven: number | null;
  /** Default alive: revenue overtakes spending before cash runs out, ignoring any planned raise. */
  alive: boolean;
  /** Projected cash balance 12 months out, in cents. */
  cash12: number;
  /** Highest monthly net burn in the projection, with its month index. */
  peak: { index: number; cents: number } | null;
};

/** Months a round takes to close; "Start raising by" = zero-cash date minus this (finance-domain rules). */
export const RAISE_LEAD_MONTHS = 9;

/** Lever ranges shared by the panel, the custom-scenario drawer and the library (so presets never sit off-scale). */
export const LIMITS = {
  revenueGrowth: { min: -0.05, max: 0.15, step: 0.005 },
  expenseGrowth: { min: 0, max: 0.05, step: 0.0025 },
  expenseAdjustment: { min: -0.3, max: 0.3, step: 0.01 },
  revenueAdjustment: { min: -0.5, max: 0.5, step: 0.01 },
} as const;

/**
 * The "Current trajectory" scenario: the base's own growth rates with no hires, raise or one-off changes.
 * @param base Forecast starting point from `getForecastBase()`.
 */
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

/** Combine the actuals-derived base with a scenario's levers into a full model input for `projectCash`. */
export const toInput = (base: ForecastInput, s: Scenario): ForecastInput => ({
  ...base,
  revenueGrowth: s.revenueGrowth,
  expenseGrowth: s.expenseGrowth,
  expenseAdjustment: s.expenseAdjustment,
  revenueAdjustment: s.revenueAdjustment,
  hires: s.hires,
  raise: s.raise,
});

/**
 * Project a scenario and derive every headline number the page shows.
 * @param base Forecast starting point from `getForecastBase()`.
 * @param s The scenario to evaluate.
 * @param origin Month 0 of the projection (`getForecastOrigin()`); month i is `addMonths(origin, i)`.
 */
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

/** Scenarios are equal when every assumption matches (ignores id, name and hire role labels). */
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
