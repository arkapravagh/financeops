import type { ForecastInput, PlannedHire } from "../../lib/metrics";
import { fromBase, LIMITS, type LibraryScenario, type Scenario } from "./scenario";

/**
 * Predefined scenarios for the Forecast picker. Every recipe is written *relative to the current trajectory*
 * (getForecastBase), so "growth halves" means half of whatever growth the actuals show today.
 * Recipes only use the model's levers: growth rates, one-off revenue/spend changes, hires and one raise.
 */

type Levers = Partial<Pick<Scenario, "revenueGrowth" | "expenseGrowth" | "expenseAdjustment" | "revenueAdjustment" | "hires" | "raise">>;
type Recipe = { id: string; name: string; description: string; make: (b: ForecastInput) => Levers };
type HireSpec = [role: string, startMonth: number, costK: number];

const K = 100_000; // $1K in cents
const M = 100_000_000; // $1M in cents

const clamp = (v: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, Math.round(v * 10_000) / 10_000));

/** Hire list from compact specs: [role, start month, fully loaded $K a month]. */
const team = (...specs: HireSpec[]): PlannedHire[] =>
  specs.map(([role, startMonth, costK], k) => ({ id: `h${k + 1}`, role, startMonth, monthlyCostCents: costK * K }));

/** `n` hires of one role, one every `gap` months starting at month `from`. */
const series = (n: number, role: string, from: number, gap: number, costK = 15): HireSpec[] =>
  Array.from({ length: n }, (_, k): HireSpec => [n > 1 ? `${role} ${k + 1}` : role, Math.min(24, from + k * gap), costK]);

const raise = (month: number, amountCents: number) => ({ month, amountCents });

const LIBRARY: { category: string; recipes: Recipe[] }[] = [
  {
    category: "Baseline",
    recipes: [
      { id: "current", name: "Current trajectory", description: "Last 6 months of growth in revenue and spending, continued.", make: () => ({}) },
      { id: "flat", name: "Flat line", description: "No growth in revenue or spending. Shows the pure cash cushion.", make: () => ({ revenueGrowth: 0, expenseGrowth: 0 }) },
      { id: "spend-frozen", name: "Spending frozen", description: "Revenue keeps its trend; spending stays at today's level.", make: () => ({ expenseGrowth: 0 }) },
      { id: "revenue-frozen", name: "Revenue frozen", description: "No new revenue growth; spending keeps its trend.", make: () => ({ revenueGrowth: 0 }) },
      { id: "conservative", name: "Conservative case", description: "Revenue grows at 70% of trend; spending grows 20% faster than trend.", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.7, expenseGrowth: b.expenseGrowth * 1.2 }) },
      { id: "optimistic", name: "Optimistic case", description: "Revenue grows 30% faster than trend; spending holds its trend.", make: (b) => ({ revenueGrowth: b.revenueGrowth * 1.3 }) },
    ],
  },
  {
    category: "Hiring",
    recipes: [
      { id: "hire-1-eng", name: "Hire 1 engineer", description: "One engineer from next month at $15K a month, fully loaded.", make: () => ({ hires: team(["Engineer", 1, 15]) }) },
      { id: "hire-2-eng", name: "Hire 2 engineers", description: "Two engineers over the next 3 months.", make: () => ({ hires: team(...series(2, "Engineer", 1, 2)) }) },
      { id: "hire-4-eng", name: "Hire 4 engineers", description: "Four engineers spread across the next 6 months.", make: () => ({ hires: team(["Engineer 1", 2, 15], ["Engineer 2", 3, 15], ["Engineer 3", 5, 15], ["Engineer 4", 6, 15]) }) },
      { id: "hire-first-ae", name: "First sales hire", description: "An account executive in month 2. Revenue growth picks up 0.5 points as pipeline builds.", make: (b) => ({ hires: team(["Account executive", 2, 13]), revenueGrowth: b.revenueGrowth + 0.005 }) },
      { id: "hire-sales-team", name: "Build a sales team", description: "Two AEs and an SDR over 4 months. Revenue growth up 1.5 points.", make: (b) => ({ hires: team(["Account executive 1", 1, 13], ["SDR", 2, 8], ["Account executive 2", 4, 13]), revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "hire-designer", name: "First designer", description: "A product designer from month 2.", make: () => ({ hires: team(["Product designer", 2, 13]) }) },
      { id: "hire-head-eng", name: "Hire a head of engineering", description: "A senior leader at $24K a month from month 3.", make: () => ({ hires: team(["Head of engineering", 3, 24]) }) },
      { id: "hire-vp-sales", name: "Hire a VP of sales", description: "VP of sales from month 3; growth up 1 point once they ramp.", make: (b) => ({ hires: team(["VP of sales", 3, 25]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "hire-cs", name: "First customer success hire", description: "A CS manager in month 2. Less churn lifts growth 0.5 points.", make: (b) => ({ hires: team(["Customer success manager", 2, 10]), revenueGrowth: b.revenueGrowth + 0.005 }) },
      { id: "hire-ops", name: "First ops and finance hire", description: "An operations lead in month 4 to own finance, people and vendors.", make: () => ({ hires: team(["Operations lead", 4, 12]) }) },
      { id: "hire-double", name: "Double the team", description: "Twelve hires over 12 months, one a month. Growth up 1 point.", make: (b) => ({ hires: team(...series(12, "New hire", 1, 1, 14)), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "hire-contractors", name: "Swap contractors for staff", description: "Cut contractor spend by 6% and hire 2 full-time engineers instead.", make: () => ({ expenseAdjustment: -0.06, hires: team(...series(2, "Engineer", 1, 1)) }) },
      { id: "hire-freeze", name: "Hiring freeze", description: "No new hires, backfills only. Spending grows at half the trend.", make: (b) => ({ expenseGrowth: b.expenseGrowth * 0.5 }) },
      { id: "hire-offshore", name: "Hire an offshore team", description: "Four engineers at $7K a month each over 4 months.", make: () => ({ hires: team(...series(4, "Offshore engineer", 1, 1, 7)) }) },
    ],
  },
  {
    category: "Cost control",
    recipes: [
      { id: "lean", name: "Lean mode", description: "Cut 15% of spending and hold spending growth to 0.5% a month.", make: () => ({ expenseAdjustment: -0.15, expenseGrowth: 0.005 }) },
      { id: "cut-tools", name: "Trim software and tools", description: "Cancel unused seats and tools: 4% less spending.", make: () => ({ expenseAdjustment: -0.04 }) },
      { id: "cut-10", name: "Cut spending 10%", description: "A broad 10% cut across vendors, contractors and marketing.", make: () => ({ expenseAdjustment: -0.1 }) },
      { id: "cut-25", name: "Deep cut 25%", description: "A cut this deep usually means touching payroll.", make: () => ({ expenseAdjustment: -0.25, expenseGrowth: 0.005 }) },
      { id: "cut-marketing", name: "Pause paid marketing", description: "Spending down 8%; revenue growth slows 1 point without paid acquisition.", make: (b) => ({ expenseAdjustment: -0.08, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "remote", name: "Go fully remote", description: "Give up the office: 7% less spending.", make: () => ({ expenseAdjustment: -0.07 }) },
      { id: "layoff-20", name: "Reduce headcount 20%", description: "Payroll is most of spending, so a 20% layoff cuts about 15%. Growth slows 1 point.", make: (b) => ({ expenseAdjustment: -0.15, expenseGrowth: 0.0075, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "survival", name: "Survival mode", description: "Cut 30%, freeze spending growth and accept half the revenue growth.", make: (b) => ({ expenseAdjustment: -0.3, expenseGrowth: 0, revenueGrowth: b.revenueGrowth * 0.5 }) },
      { id: "cloud-optimise", name: "Optimise cloud and AI costs", description: "Reserved instances and model routing: 5% less spending, slower spending growth.", make: (b) => ({ expenseAdjustment: -0.05, expenseGrowth: b.expenseGrowth * 0.8 }) },
      { id: "founder-pay-cut", name: "Founders take a pay cut", description: "Founder salaries halved: about 3% less spending.", make: () => ({ expenseAdjustment: -0.03 }) },
    ],
  },
  {
    category: "Revenue",
    recipes: [
      { id: "growth-slows", name: "Growth slows", description: "Revenue grows at half the current trend.", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.5 }) },
      { id: "growth-stalls", name: "Growth stalls", description: "Revenue growth drops to 1% a month.", make: () => ({ revenueGrowth: 0.01 }) },
      { id: "growth-doubles", name: "Growth doubles", description: "Revenue grows twice as fast as the current trend.", make: (b) => ({ revenueGrowth: b.revenueGrowth * 2 }) },
      { id: "hypergrowth", name: "Hypergrowth", description: "Revenue grows 12% a month; spending grows 3% to keep up.", make: () => ({ revenueGrowth: 0.12, expenseGrowth: 0.03 }) },
      { id: "price-up", name: "Raise prices 15%", description: "A 15% price rise. Some customers leave, so revenue nets out 10% higher.", make: (b) => ({ revenueAdjustment: 0.1, revenueGrowth: b.revenueGrowth - 0.002 }) },
      { id: "annual-plans", name: "Push annual prepay", description: "Customers prepay for a year at a discount, a one-off 25% lift in cash in.", make: () => ({ revenueAdjustment: 0.25 }) },
      { id: "enterprise-deal", name: "Land an enterprise deal", description: "One large customer adds 30% to monthly revenue from next month.", make: () => ({ revenueAdjustment: 0.3 }) },
      { id: "new-product", name: "Launch a second product", description: "Three engineers to build it; growth up 1.5 points once it ships.", make: (b) => ({ hires: team(...series(3, "Engineer", 1, 1)), revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "plg", name: "Product-led growth push", description: "A free tier and self-serve signup: 5% more spending, growth up 2 points.", make: (b) => ({ expenseAdjustment: 0.05, revenueGrowth: b.revenueGrowth + 0.02 }) },
      { id: "usage-pricing", name: "Move to usage pricing", description: "Revenue dips 10% at the switch, then grows 1.5 points faster.", make: (b) => ({ revenueAdjustment: -0.1, revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "services", name: "Add paid onboarding", description: "Services revenue adds 8% now, with one hire to deliver it.", make: () => ({ revenueAdjustment: 0.08, hires: team(["Implementation lead", 1, 11]) }) },
    ],
  },
  {
    category: "Risks and shocks",
    recipes: [
      { id: "lose-top-customer", name: "Lose the biggest customer", description: "20% of monthly revenue churns next month.", make: () => ({ revenueAdjustment: -0.2 }) },
      { id: "churn-spike", name: "Churn spike", description: "Revenue shrinks 2% a month as churn outpaces new sales.", make: () => ({ revenueGrowth: -0.02 }) },
      { id: "recession", name: "Recession", description: "Revenue dips 10% and then grows only 1% a month.", make: () => ({ revenueAdjustment: -0.1, revenueGrowth: 0.01 }) },
      { id: "cloud-spike", name: "Cloud and AI costs spike", description: "Infrastructure bills up 8%, and growing faster.", make: (b) => ({ expenseAdjustment: 0.08, expenseGrowth: b.expenseGrowth + 0.005 }) },
      { id: "inflation", name: "Cost inflation", description: "Salaries and vendor prices rise: spending grows 1 point faster.", make: (b) => ({ expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "slow-sales", name: "Sales cycles double", description: "Deals take twice as long. Revenue grows at 60% of the trend.", make: (b) => ({ revenueGrowth: b.revenueGrowth * 0.6 }) },
      { id: "competitor", name: "Competitor undercuts on price", description: "Revenue down 10% after matching prices; growth slows 1 point.", make: (b) => ({ revenueAdjustment: -0.1, revenueGrowth: b.revenueGrowth - 0.01 }) },
      { id: "late-payers", name: "Customers pay late", description: "Collections slip: 15% less cash in across the forecast.", make: () => ({ revenueAdjustment: -0.15 }) },
      { id: "legal", name: "Unplanned legal or compliance cost", description: "An audit, SOC 2 or a dispute: 6% more spending.", make: () => ({ expenseAdjustment: 0.06 }) },
      { id: "perfect-storm", name: "Perfect storm", description: "The biggest customer leaves, growth stalls and costs rise.", make: (b) => ({ revenueAdjustment: -0.2, revenueGrowth: 0.005, expenseGrowth: b.expenseGrowth + 0.005 }) },
    ],
  },
  {
    category: "Fundraising",
    recipes: [
      { id: "bridge", name: "Bridge round", description: "$750K from existing investors in month 3.", make: () => ({ raise: raise(3, 0.75 * M) }) },
      { id: "seed-extension", name: "Seed extension", description: "$1.5M in month 6, with two hires once it lands.", make: () => ({ raise: raise(6, 1.5 * M), hires: team(["Engineer 1", 7, 15], ["Engineer 2", 8, 15]) }) },
      { id: "series-a", name: "Raise a Series A", description: "$4M in month 9, then six engineers over the following year.", make: () => ({ raise: raise(9, 4 * M), hires: team(...series(6, "Engineer", 11, 2)) }) },
      { id: "series-a-big", name: "Large Series A", description: "$8M in month 12, then 10 hires and spending growth up 1 point.", make: (b) => ({ raise: raise(12, 8 * M), hires: team(...series(10, "New hire", 13, 1)), expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "series-a-late", name: "Series A takes longer", description: "$4M arrives in month 15 instead of month 9.", make: () => ({ raise: raise(15, 4 * M) }) },
      { id: "raise-fails", name: "Raise falls through", description: "No new money. Cut 15% and slow spending growth to stretch what's left.", make: () => ({ expenseAdjustment: -0.15, expenseGrowth: 0.0025 }) },
      { id: "venture-debt", name: "Venture debt", description: "$1M of debt in month 4. Repayments are not modelled.", make: () => ({ raise: raise(4, 1 * M) }) },
      { id: "down-round", name: "Down round", description: "$2M in month 12 at a lower valuation, plus a 15% cut.", make: () => ({ raise: raise(12, 2 * M), expenseAdjustment: -0.15 }) },
      { id: "rbf", name: "Revenue-based financing", description: "$500K in month 2. Repayments modelled as 1 point faster spending growth.", make: (b) => ({ raise: raise(2, 0.5 * M), expenseGrowth: b.expenseGrowth + 0.01 }) },
      { id: "grant", name: "Win a grant", description: "A $250K non-dilutive grant in month 5.", make: () => ({ raise: raise(5, 0.25 * M) }) },
    ],
  },
  {
    category: "Strategic plays",
    recipes: [
      { id: "default-alive", name: "Push for default alive", description: "Cut 15% and grow revenue 1.5 points faster.", make: (b) => ({ expenseAdjustment: -0.15, revenueGrowth: b.revenueGrowth + 0.015 }) },
      { id: "profitability", name: "Profitability sprint", description: "Cut 25%, freeze spending growth and add a price rise.", make: () => ({ expenseAdjustment: -0.25, expenseGrowth: 0, revenueAdjustment: 0.1 }) },
      { id: "upmarket", name: "Go upmarket", description: "Two AEs and a sales engineer; enterprise deals add 2 points of growth.", make: (b) => ({ hires: team(["Account executive 1", 2, 14], ["Sales engineer", 3, 16], ["Account executive 2", 5, 14]), revenueGrowth: b.revenueGrowth + 0.02 }) },
      { id: "international", name: "Expand to Europe", description: "10% more spending and two local hires; growth up 1 point.", make: (b) => ({ expenseAdjustment: 0.1, hires: team(["Country lead", 3, 16], ["Account executive", 4, 12]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "ai-feature", name: "Launch an AI feature", description: "Model costs add 6% to spending; the upsell adds 5% to revenue and 1 point of growth.", make: (b) => ({ expenseAdjustment: 0.06, expenseGrowth: b.expenseGrowth + 0.0025, revenueAdjustment: 0.05, revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "pivot", name: "Pivot", description: "Revenue drops 40% now; the new direction grows 8% a month on a 10% leaner budget.", make: () => ({ revenueAdjustment: -0.4, revenueGrowth: 0.08, expenseAdjustment: -0.1 }) },
      { id: "acquisition-prep", name: "Prepare for acquisition", description: "Cut 20% and hold spending flat to buy months for talks.", make: () => ({ expenseAdjustment: -0.2, expenseGrowth: 0 }) },
      { id: "partner-channel", name: "Sell through partners", description: "A partnerships hire; partner revenue adds 1 point of growth.", make: (b) => ({ hires: team(["Partnerships manager", 2, 13]), revenueGrowth: b.revenueGrowth + 0.01 }) },
      { id: "growth-at-all-costs", name: "Growth at all costs", description: "Spend 20% more on sales and marketing; growth up 3 points.", make: (b) => ({ expenseAdjustment: 0.2, expenseGrowth: b.expenseGrowth + 0.005, revenueGrowth: b.revenueGrowth + 0.03 }) },
      { id: "efficient-growth", name: "Efficient growth", description: "Hire two sellers, funded by a 10% cut elsewhere, and hold spending flat.", make: (b) => ({ expenseAdjustment: -0.1, expenseGrowth: 0, hires: team(...series(2, "Account executive", 2, 2, 13)), revenueGrowth: b.revenueGrowth + 0.01 }) },
    ],
  },
];

/** Every predefined scenario for this company's base, in picker order. Values are clamped to the levers' ranges. */
export function scenarioLibrary(base: ForecastInput): LibraryScenario[] {
  const current = fromBase(base);
  return LIBRARY.flatMap(({ category, recipes }) =>
    recipes.map(({ id, name, description, make }): LibraryScenario => {
      const l = make(base);
      return {
        ...current,
        ...l,
        id: id === "current" ? "current" : `lib-${id}`,
        name,
        description,
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
