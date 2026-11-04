/**
 * Scenario model for the Runway & forecast feature.
 *
 * A `Scenario` (types/forecast.types.ts) is the *editable* part of a forecast: growth rates, one-off changes, hires and a raise.
 * Everything else (cash today, base revenue and spend) comes from actuals via `services/forecast.service.ts`.
 * This file is pure: no React, no storage. Persistence lives in `hooks/use-scenario-storage.hook.ts`.
 */

import { scenarioNames } from "../../language/en/forecast.lang";
import { addMonths } from "../../shared/utils/dates.util";
import { breakEvenIndex, isDefaultAlive, peakBurn, projectCash, projectedRunway } from "../../shared/utils/metrics.util";
import type { ForecastInput, Scenario, ScenarioResult } from "../../types/forecast.types";

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
    name: scenarioNames.current,
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
