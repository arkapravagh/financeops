/**
 * Scenario library: 70+ predefined scenarios (Baseline, Hiring, Cost control, Revenue, Risks and shocks,
 * Fundraising, Strategic plays) for the Forecast picker.
 *
 * This file holds only ids and maths. To add a scenario, append a recipe to its category here and add its
 * name and description under the same id in `language/en/scenario-library.lang.ts`.
 */

import { ScenarioCategory } from "../../enums/scenario-category.enum";
import { hireRoleLabels as R, scenarioLibraryLabels } from "../../language/en/scenario-library.lang";
import type { ForecastInput, PlannedHire, LibraryScenario, Scenario } from "../../types/forecast.types";
import { fromBase, LIMITS } from "./scenario.model";

/**
 * Predefined scenarios for the Forecast picker. Every recipe is written *relative to the current trajectory*
 * (getForecastBase), so "growth halves" means half of whatever growth the actuals show today.
 * Recipes only use the model's levers: growth rates, one-off revenue/spend changes, hires and one raise.
 */

type Levers = Partial<Pick<Scenario, "revenueGrowth" | "expenseGrowth" | "expenseAdjustment" | "revenueAdjustment" | "hires" | "raise">>;
/** A scenario recipe: its id (keys the language file) and how it changes the levers relative to the base. */
type Recipe = { id: string; make: (b: ForecastInput) => Levers };
type HireSpec = [role: string, startMonth: number, costK: number];

const K = 100_000; // $1K in cents
const M = 100_000_000; // $1M in cents

const clamp = (v: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, Math.round(v * 10_000) / 10_000));

/** Hire list from compact specs: [role, start month, fully loaded $K a month]. */
const team = (...specs: HireSpec[]): PlannedHire[] =>
  specs.map(([role, startMonth, costK], k) => ({ id: `h${k + 1}`, role, startMonth, monthlyCostCents: costK * K }));

/** `n` hires of one role, one every `gap` months starting at month `from`. */
const series = (n: number, role: string, from: number, gap: number, costK = 15): HireSpec[] =>
  Array.from({ length: n }, (_, k): HireSpec => [n > 1 ? R.numbered(role, k + 1) : role, Math.min(24, from + k * gap), costK]);

const raise = (month: number, amountCents: number) => ({ month, amountCents });

const LIBRARY: { category: ScenarioCategory; recipes: Recipe[] }[] = [
  {
    category: ScenarioCategory.Baseline,
    recipes: [
      { id: "current", make: () => ({}) },
      { id: "flat", make: () => ({ revenueGrowth: 0, expenseGrowth: 0 }) },
      { id: "spend-frozen", make: () => ({ expenseGrowth: 0 }) },
      { id: "revenue-frozen", make: () => ({ revenueGrowth: 0 }) },
      { id: "conservative", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.7, expenseGrowth: b.expenseGrowth * 1.2 }) },
      { id: "optimistic", make: (b) => ({ revenueGrowth: b.revenueGrowth * 1.3 }) },
    ],
  },
  {
    category: ScenarioCategory.Hiring,
    recipes: [
      { id: "hire-1-eng", make: () => ({ hires: team([R.engineer, 1, 15]) }) },
      { id: "hire-2-eng", make: () => ({ hires: team(...series(2, R.engineer, 1, 2)) }) },
      { id: "hire-4-eng", make: () => ({ hires: team([R.numbered(R.engineer, 1), 2, 15], [R.numbered(R.engineer, 2), 3, 15], [R.numbered(R.engineer, 3), 5, 15], [R.numbered(R.engineer, 4), 6, 15]) }) },
      { id: "hire-first-ae", make: (b) => ({ hires: team([R.accountExecutive, 2, 13]), revenueGrowth: b.revenueGrowth + 0.005 }) },
      { id: "hire-sales-team", make: (b) => ({ hires: team([R.numbered(R.accountExecutive, 1), 1, 13], [R.sdr, 2, 8], [R.numbered(R.accountExecutive, 2), 4, 13]), revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "hire-designer", make: () => ({ hires: team([R.productDesigner, 2, 13]) }) },
      { id: "hire-head-eng", make: () => ({ hires: team([R.headOfEngineering, 3, 24]) }) },
      { id: "hire-vp-sales", make: (b) => ({ hires: team([R.vpOfSales, 3, 25]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "hire-cs", make: (b) => ({ hires: team([R.customerSuccessManager, 2, 10]), revenueGrowth: b.revenueGrowth + 0.005 }) },
      { id: "hire-ops", make: () => ({ hires: team([R.operationsLead, 4, 12]) }) },
      { id: "hire-double", make: (b) => ({ hires: team(...series(12, R.newHire, 1, 1, 14)), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "hire-contractors", make: () => ({ expenseAdjustment: -0.06, hires: team(...series(2, R.engineer, 1, 1)) }) },
      { id: "hire-freeze", make: (b) => ({ expenseGrowth: b.expenseGrowth * 0.5 }) },
      { id: "hire-offshore", make: () => ({ hires: team(...series(4, R.offshoreEngineer, 1, 1, 7)) }) },
    ],
  },
  {
    category: ScenarioCategory.CostControl,
    recipes: [
      { id: "lean", make: () => ({ expenseAdjustment: -0.15, expenseGrowth: 0.005 }) },
      { id: "cut-tools", make: () => ({ expenseAdjustment: -0.04 }) },
      { id: "cut-10", make: () => ({ expenseAdjustment: -0.1 }) },
      { id: "cut-25", make: () => ({ expenseAdjustment: -0.25, expenseGrowth: 0.005 }) },
      { id: "cut-marketing", make: (b) => ({ expenseAdjustment: -0.08, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "remote", make: () => ({ expenseAdjustment: -0.07 }) },
      { id: "layoff-20", make: (b) => ({ expenseAdjustment: -0.15, expenseGrowth: 0.0075, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "survival", make: (b) => ({ expenseAdjustment: -0.3, expenseGrowth: 0, revenueGrowth: b.revenueGrowth * 0.5 }) },
      { id: "cloud-optimise", make: (b) => ({ expenseAdjustment: -0.05, expenseGrowth: b.expenseGrowth * 0.8 }) },
      { id: "founder-pay-cut", make: () => ({ expenseAdjustment: -0.03 }) },
    ],
  },
  {
    category: ScenarioCategory.Revenue,
    recipes: [
      { id: "growth-slows", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.5 }) },
      { id: "growth-stalls", make: () => ({ revenueGrowth: 0.01 }) },
      { id: "growth-doubles", make: (b) => ({ revenueGrowth: b.revenueGrowth * 2 }) },
      { id: "hypergrowth", make: () => ({ revenueGrowth: 0.12, expenseGrowth: 0.03 }) },
      { id: "price-up", make: (b) => ({ revenueAdjustment: 0.1, revenueGrowth: b.revenueGrowth - 0.002 }) },
      { id: "annual-plans", make: () => ({ revenueAdjustment: 0.25 }) },
      { id: "enterprise-deal", make: () => ({ revenueAdjustment: 0.3 }) },
      { id: "new-product", make: (b) => ({ hires: team(...series(3, R.engineer, 1, 1)), revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "plg", make: (b) => ({ expenseAdjustment: 0.05, revenueGrowth: b.revenueGrowth + 0.02 }) },
      { id: "usage-pricing", make: (b) => ({ revenueAdjustment: -0.1, revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "services", make: () => ({ revenueAdjustment: 0.08, hires: team([R.implementationLead, 1, 11]) }) },
    ],
  },
  {
    category: ScenarioCategory.Risks,
    recipes: [
      { id: "lose-top-customer", make: () => ({ revenueAdjustment: -0.2 }) },
      { id: "churn-spike", make: () => ({ revenueGrowth: -0.02 }) },
      { id: "recession", make: () => ({ revenueAdjustment: -0.1, revenueGrowth: 0.01 }) },
      { id: "cloud-spike", make: (b) => ({ expenseAdjustment: 0.08, expenseGrowth: b.expenseGrowth + 0.005 }) },
      { id: "inflation", make: (b) => ({ expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "slow-sales", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.6 }) },
      { id: "competitor", make: (b) => ({ revenueAdjustment: -0.1, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "late-payers", make: () => ({ revenueAdjustment: -0.15 }) },
      { id: "legal", make: () => ({ expenseAdjustment: 0.06 }) },
      { id: "perfect-storm", make: (b) => ({ revenueAdjustment: -0.2, revenueGrowth: 0.005, expenseGrowth: b.expenseGrowth + 0.005 }) },
    ],
  },
  {
    category: ScenarioCategory.Fundraising,
    recipes: [
      { id: "bridge", make: () => ({ raise: raise(3, 0.75 * M) }) },
      { id: "seed-extension", make: () => ({ raise: raise(6, 1.5 * M), hires: team([R.numbered(R.engineer, 1), 7, 15], [R.numbered(R.engineer, 2), 8, 15]) }) },
      { id: "series-a", make: () => ({ raise: raise(9, 4 * M), hires: team(...series(6, R.engineer, 11, 2)) }) },
      { id: "series-a-big", make: (b) => ({ raise: raise(12, 8 * M), hires: team(...series(10, R.newHire, 13, 1)), expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "series-a-late", make: () => ({ raise: raise(15, 4 * M) }) },
      { id: "raise-fails", make: () => ({ expenseAdjustment: -0.15, expenseGrowth: 0.0025 }) },
      { id: "venture-debt", make: () => ({ raise: raise(4, 1 * M) }) },
      { id: "down-round", make: () => ({ raise: raise(12, 2 * M), expenseAdjustment: -0.15 }) },
      { id: "rbf", make: (b) => ({ raise: raise(2, 0.5 * M), expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "grant", make: () => ({ raise: raise(5, 0.25 * M) }) },
    ],
  },
  {
    category: ScenarioCategory.Strategy,
    recipes: [
      { id: "default-alive", make: (b) => ({ expenseAdjustment: -0.15, revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "profitability", make: () => ({ expenseAdjustment: -0.25, expenseGrowth: 0, revenueAdjustment: 0.1 }) },
      { id: "upmarket", make: (b) => ({ hires: team([R.numbered(R.accountExecutive, 1), 2, 14], [R.salesEngineer, 3, 16], [R.numbered(R.accountExecutive, 2), 5, 14]), revenueGrowth: b.revenueGrowth + 0.02 }) },
      { id: "international", make: (b) => ({ expenseAdjustment: 0.1, hires: team([R.countryLead, 3, 16], [R.accountExecutive, 4, 12]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "ai-feature", make: (b) => ({ expenseAdjustment: 0.06, expenseGrowth: b.expenseGrowth + 0.0025, revenueAdjustment: 0.05, revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "pivot", make: () => ({ revenueAdjustment: -0.4, revenueGrowth: 0.08, expenseAdjustment: -0.1 }) },
      { id: "acquisition-prep", make: () => ({ expenseAdjustment: -0.2, expenseGrowth: 0 }) },
      { id: "partner-channel", make: (b) => ({ hires: team([R.partnershipsManager, 2, 13]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "growth-at-all-costs", make: (b) => ({ expenseAdjustment: 0.2, expenseGrowth: b.expenseGrowth + 0.005, revenueGrowth: b.revenueGrowth + 0.03 }) },
      { id: "efficient-growth", make: (b) => ({ expenseAdjustment: -0.1, expenseGrowth: 0, hires: team(...series(2, R.accountExecutive, 2, 2, 13)), revenueGrowth: b.revenueGrowth + 0.01 }) },
    ],
  },
];

/** Every predefined scenario for this company's base, in picker order. Values are clamped to the levers' ranges. */
export function scenarioLibrary(base: ForecastInput): LibraryScenario[] {
  const current = fromBase(base);
  return LIBRARY.flatMap(({ category, recipes }) =>
    recipes.map(({ id, make }): LibraryScenario => {
      const l = make(base);
      return {
        ...current,
        ...l,
        id: id === "current" ? "current" : `lib-${id}`,
        name: scenarioLibraryLabels[id]?.name ?? id,
        description: scenarioLibraryLabels[id]?.description ?? "",
        category,
        revenueGrowth: clamp(l.revenueGrowth ?? current.revenueGrowth, LIMITS.revenueGrowth),
        expenseGrowth: clamp(l.expenseGrowth ?? current.expenseGrowth, LIMITS.expenseGrowth),
        expenseAdjustment: clamp(l.expenseAdjustment ?? 0, LIMITS.expenseAdjustment),
        revenueAdjustment: clamp(l.revenueAdjustment ?? 0, LIMITS.revenueAdjustment),
        hires: (l.hires ?? []).map((h) => ({ ...h, id: `${id}-${h.id}` })),
      };
    }),
  );
}
