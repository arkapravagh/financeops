/**
 * Forecast service: the forecast's starting point, derived from actuals.
 *
 * Single source for the Forecast page **and** the AI assistant so both always agree (finance-domain rules).
 */

import { parseIso } from "../shared/utils/dates.util";
import { completeMonths, compoundGrowth, sumCents, type ForecastInput, type PlannedHire } from "../shared/utils/metrics.util";
import { getAccounts, getMonthlyFlows } from "./cash.service";
import { AS_OF } from "./company.service";

/** Model horizon in months. Runways beyond it show as "36+". */
export const FORECAST_MONTHS = 36;
/** Default fully loaded monthly cost of a new hire ($15K: salary, taxes, benefits, equipment). */
export const DEFAULT_HIRE_COST_CENTS = 15_000_00;

/**
 * The forecast's starting point and "current trajectory" assumptions, derived from actuals:
 * cash today, last complete month's cash in/out, and 6-month compound growth of each.
 * Single source for the Forecast page and the AI assistant, so both always agree.
 */
export function getForecastBase(): ForecastInput {
  const flows = completeMonths(getMonthlyFlows(), AS_OF);
  const last = flows[flows.length - 1];
  const sixAgo = flows[flows.length - 7];
  return {
    startCashCents: sumCents(getAccounts().map((a) => a.balanceCents)),
    startRevenueCents: last.inCents,
    startExpenseCents: last.outCents,
    revenueGrowth: Math.round(compoundGrowth(sixAgo.inCents, last.inCents, 6) * 1000) / 1000,
    expenseGrowth: Math.round(compoundGrowth(sixAgo.outCents, last.outCents, 6) * 1000) / 1000,
    expenseAdjustment: 0,
    revenueAdjustment: 0,
    hires: [],
    raise: null,
    months: FORECAST_MONTHS,
  };
}

/** `n` hires spread evenly across the next `overMonths` months. */
export function spreadHires(n: number, role = "Engineer", costCents = DEFAULT_HIRE_COST_CENTS, overMonths = 6): PlannedHire[] {
  return Array.from({ length: n }, (_, k) => ({
    id: `hire-${k + 1}`,
    role,
    startMonth: Math.max(1, Math.ceil(((k + 1) * overMonths) / n)),
    monthlyCostCents: costCents,
  }));
}

/**
 * Month 0 of the projection: the first day of the last complete month (its closing cash is the start).
 * Projection month i is `addMonths(getForecastOrigin(), i)` — month 1 is the current month.
 */
export function getForecastOrigin(): Date {
  const flows = completeMonths(getMonthlyFlows(), AS_OF);
  return parseIso(`${flows[flows.length - 1].month}-01`);
}
