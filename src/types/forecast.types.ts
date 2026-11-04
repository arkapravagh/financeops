/**
 * Forecast and scenario types: the cash projection model's inputs and outputs, and the scenarios users pick or build.
 *
 * Shared by `shared/utils/metrics.util.ts` (projection maths), `services/forecast.service.ts` (base from actuals),
 * the Forecast feature, the scenario storage hook and the AI assistant. Money is integer cents.
 */

import type { ScenarioCategory } from "../enums/scenario-category.enum";

/** Everything the cash projection needs: starting point from actuals plus scenario levers. */
export type ForecastInput = {
  startCashCents: number;
  /** Monthly cash in for the first projected month's base. */
  startRevenueCents: number;
  /** Monthly cash out for the first projected month's base. */
  startExpenseCents: number;
  /** Month-over-month growth, e.g. 0.05 */
  revenueGrowth: number;
  expenseGrowth: number;
  /** One-off cut (negative) or increase (positive) to the expense base, e.g. -0.1 */
  expenseAdjustment: number;
  /** One-off drop (negative) or lift (positive) to the revenue base, e.g. -0.2 when a big customer churns. */
  revenueAdjustment: number;
  /** Planned hires; each adds its fully loaded monthly cost from its start month (1 = next month). */
  hires: PlannedHire[];
  /** Optional equity raise landing in a given month. */
  raise: PlannedRaise | null;
  months: number;
};

/** One planned hire: role, start month (1 = current month) and fully loaded monthly cost. */
export type PlannedHire = { id: string; role: string; startMonth: number; monthlyCostCents: number };

/** A raise landing in a projection month. */
export type PlannedRaise = { month: number; amountCents: number };

/** One projected month. */
export type ForecastPoint = {
  index: number;
  cashCents: number;
  revenueCents: number;
  /** Total cash out, including hires. */
  expenseCents: number;
  /** Portion of expense from planned hires. */
  hiringCents: number;
  /** Raise proceeds landing this month (0 otherwise). */
  raiseCents: number;
};

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
  /** Picker group. Its English heading comes from `language/en/enums.lang.ts`. */
  category: ScenarioCategory;
  /** One sentence on what the scenario assumes. */
  description: string;
  /** True for scenarios the user created (editable and deletable). */
  custom?: boolean;
};

/** Everything the Forecast page shows for one scenario, computed once by `evaluateScenario`. */
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
