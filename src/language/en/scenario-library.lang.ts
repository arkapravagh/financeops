/**
 * English names and descriptions for the 71 predefined Forecast scenarios, plus default hire role names.
 *
 * Keyed by recipe id from `features/forecast/scenario-library.config.ts` (which holds only the maths).
 * Category headings live in `enums.lang.ts` (`scenarioCategoryLabels`).
 */

/** Name and one-sentence description per scenario recipe id. */
export const scenarioLibraryLabels: Record<string, { name: string; description: string }> = {
  "current": {
    name: "Current trajectory",
    description: "Last 6 months of growth in revenue and spending, continued.",
  },
  "flat": {
    name: "Flat line",
    description: "No growth in revenue or spending. Shows the pure cash cushion.",
  },
  "spend-frozen": {
    name: "Spending frozen",
    description: "Revenue keeps its trend; spending stays at today's level.",
  },
  "revenue-frozen": {
    name: "Revenue frozen",
    description: "No new revenue growth; spending keeps its trend.",
  },
  "conservative": {
    name: "Conservative case",
    description: "Revenue grows at 70% of trend; spending grows 20% faster than trend.",
  },
  "optimistic": {
    name: "Optimistic case",
    description: "Revenue grows 30% faster than trend; spending holds its trend.",
  },
  "hire-1-eng": {
    name: "Hire 1 engineer",
    description: "One engineer from next month at $15K a month, fully loaded.",
  },
  "hire-2-eng": {
    name: "Hire 2 engineers",
    description: "Two engineers over the next 3 months.",
  },
  "hire-4-eng": {
    name: "Hire 4 engineers",
    description: "Four engineers spread across the next 6 months.",
  },
  "hire-first-ae": {
    name: "First sales hire",
    description: "An account executive in month 2. Revenue growth picks up 0.5 points as pipeline builds.",
  },
  "hire-sales-team": {
    name: "Build a sales team",
    description: "Two AEs and an SDR over 4 months. Revenue growth up 1.5 points.",
  },
  "hire-designer": {
    name: "First designer",
    description: "A product designer from month 2.",
  },
  "hire-head-eng": {
    name: "Hire a head of engineering",
    description: "A senior leader at $24K a month from month 3.",
  },
  "hire-vp-sales": {
    name: "Hire a VP of sales",
    description: "VP of sales from month 3; growth up 1 point once they ramp.",
  },
  "hire-cs": {
    name: "First customer success hire",
    description: "A CS manager in month 2. Less churn lifts growth 0.5 points.",
  },
  "hire-ops": {
    name: "First ops and finance hire",
    description: "An operations lead in month 4 to own finance, people and vendors.",
  },
  "hire-double": {
    name: "Double the team",
    description: "Twelve hires over 12 months, one a month. Growth up 1 point.",
  },
  "hire-contractors": {
    name: "Swap contractors for staff",
    description: "Cut contractor spend by 6% and hire 2 full-time engineers instead.",
  },
  "hire-freeze": {
    name: "Hiring freeze",
    description: "No new hires, backfills only. Spending grows at half the trend.",
  },
  "hire-offshore": {
    name: "Hire an offshore team",
    description: "Four engineers at $7K a month each over 4 months.",
  },
  "lean": {
    name: "Lean mode",
    description: "Cut 15% of spending and hold spending growth to 0.5% a month.",
  },
  "cut-tools": {
    name: "Trim software and tools",
    description: "Cancel unused seats and tools: 4% less spending.",
  },
  "cut-10": {
    name: "Cut spending 10%",
    description: "A broad 10% cut across vendors, contractors and marketing.",
  },
  "cut-25": {
    name: "Deep cut 25%",
    description: "A cut this deep usually means touching payroll.",
  },
  "cut-marketing": {
    name: "Pause paid marketing",
    description: "Spending down 8%; revenue growth slows 1 point without paid acquisition.",
  },
  "remote": {
    name: "Go fully remote",
    description: "Give up the office: 7% less spending.",
  },
  "layoff-20": {
    name: "Reduce headcount 20%",
    description: "Payroll is most of spending, so a 20% layoff cuts about 15%. Growth slows 1 point.",
  },
  "survival": {
    name: "Survival mode",
    description: "Cut 30%, freeze spending growth and accept half the revenue growth.",
  },
  "cloud-optimise": {
    name: "Optimise cloud and AI costs",
    description: "Reserved instances and model routing: 5% less spending, slower spending growth.",
  },
  "founder-pay-cut": {
    name: "Founders take a pay cut",
    description: "Founder salaries halved: about 3% less spending.",
  },
  "growth-slows": {
    name: "Growth slows",
    description: "Revenue grows at half the current trend.",
  },
  "growth-stalls": {
    name: "Growth stalls",
    description: "Revenue growth drops to 1% a month.",
  },
  "growth-doubles": {
    name: "Growth doubles",
    description: "Revenue grows twice as fast as the current trend.",
  },
  "hypergrowth": {
    name: "Hypergrowth",
    description: "Revenue grows 12% a month; spending grows 3% to keep up.",
  },
  "price-up": {
    name: "Raise prices 15%",
    description: "A 15% price rise. Some customers leave, so revenue nets out 10% higher.",
  },
  "annual-plans": {
    name: "Push annual prepay",
    description: "Customers prepay for a year at a discount, a one-off 25% lift in cash in.",
  },
  "enterprise-deal": {
    name: "Land an enterprise deal",
    description: "One large customer adds 30% to monthly revenue from next month.",
  },
  "new-product": {
    name: "Launch a second product",
    description: "Three engineers to build it; growth up 1.5 points once it ships.",
  },
  "plg": {
    name: "Product-led growth push",
    description: "A free tier and self-serve signup: 5% more spending, growth up 2 points.",
  },
  "usage-pricing": {
    name: "Move to usage pricing",
    description: "Revenue dips 10% at the switch, then grows 1.5 points faster.",
  },
  "services": {
    name: "Add paid onboarding",
    description: "Services revenue adds 8% now, with one hire to deliver it.",
  },
  "lose-top-customer": {
    name: "Lose the biggest customer",
    description: "20% of monthly revenue churns next month.",
  },
  "churn-spike": {
    name: "Churn spike",
    description: "Revenue shrinks 2% a month as churn outpaces new sales.",
  },
  "recession": {
    name: "Recession",
    description: "Revenue dips 10% and then grows only 1% a month.",
  },
  "cloud-spike": {
    name: "Cloud and AI costs spike",
    description: "Infrastructure bills up 8%, and growing faster.",
  },
  "inflation": {
    name: "Cost inflation",
    description: "Salaries and vendor prices rise: spending grows 1 point faster.",
  },
  "slow-sales": {
    name: "Sales cycles double",
    description: "Deals take twice as long. Revenue grows at 60% of the trend.",
  },
  "competitor": {
    name: "Competitor undercuts on price",
    description: "Revenue down 10% after matching prices; growth slows 1 point.",
  },
  "late-payers": {
    name: "Customers pay late",
    description: "Collections slip: 15% less cash in across the forecast.",
  },
  "legal": {
    name: "Unplanned legal or compliance cost",
    description: "An audit, SOC 2 or a dispute: 6% more spending.",
  },
  "perfect-storm": {
    name: "Perfect storm",
    description: "The biggest customer leaves, growth stalls and costs rise.",
  },
  "bridge": {
    name: "Bridge round",
    description: "$750K from existing investors in month 3.",
  },
  "seed-extension": {
    name: "Seed extension",
    description: "$1.5M in month 6, with two hires once it lands.",
  },
  "series-a": {
    name: "Raise a Series A",
    description: "$4M in month 9, then six engineers over the following year.",
  },
  "series-a-big": {
    name: "Large Series A",
    description: "$8M in month 12, then 10 hires and spending growth up 1 point.",
  },
  "series-a-late": {
    name: "Series A takes longer",
    description: "$4M arrives in month 15 instead of month 9.",
  },
  "raise-fails": {
    name: "Raise falls through",
    description: "No new money. Cut 15% and slow spending growth to stretch what's left.",
  },
  "venture-debt": {
    name: "Venture debt",
    description: "$1M of debt in month 4. Repayments are not modelled.",
  },
  "down-round": {
    name: "Down round",
    description: "$2M in month 12 at a lower valuation, plus a 15% cut.",
  },
  "rbf": {
    name: "Revenue-based financing",
    description: "$500K in month 2. Repayments modelled as 1 point faster spending growth.",
  },
  "grant": {
    name: "Win a grant",
    description: "A $250K non-dilutive grant in month 5.",
  },
  "default-alive": {
    name: "Push for default alive",
    description: "Cut 15% and grow revenue 1.5 points faster.",
  },
  "profitability": {
    name: "Profitability sprint",
    description: "Cut 25%, freeze spending growth and add a price rise.",
  },
  "upmarket": {
    name: "Go upmarket",
    description: "Two AEs and a sales engineer; enterprise deals add 2 points of growth.",
  },
  "international": {
    name: "Expand to Europe",
    description: "10% more spending and two local hires; growth up 1 point.",
  },
  "ai-feature": {
    name: "Launch an AI feature",
    description: "Model costs add 6% to spending; the upsell adds 5% to revenue and 1 point of growth.",
  },
  "pivot": {
    name: "Pivot",
    description: "Revenue drops 40% now; the new direction grows 8% a month on a 10% leaner budget.",
  },
  "acquisition-prep": {
    name: "Prepare for acquisition",
    description: "Cut 20% and hold spending flat to buy months for talks.",
  },
  "partner-channel": {
    name: "Sell through partners",
    description: "A partnerships hire; partner revenue adds 1 point of growth.",
  },
  "growth-at-all-costs": {
    name: "Growth at all costs",
    description: "Spend 20% more on sales and marketing; growth up 3 points.",
  },
  "efficient-growth": {
    name: "Efficient growth",
    description: "Hire two sellers, funded by a 10% cut elsewhere, and hold spending flat.",
  },
};

/** Default role names for hires created by scenarios and the "Add a hire" button. */
export const hireRoleLabels = {
  accountExecutive: "Account executive",
  countryLead: "Country lead",
  customerSuccessManager: "Customer success manager",
  engineer: "Engineer",
  headOfEngineering: "Head of engineering",
  implementationLead: "Implementation lead",
  newHire: "New hire",
  offshoreEngineer: "Offshore engineer",
  operationsLead: "Operations lead",
  partnershipsManager: "Partnerships manager",
  productDesigner: "Product designer",
  salesEngineer: "Sales engineer",
  sdr: "SDR",
  vpOfSales: "VP of sales",
  /** "Engineer 2" style names when a scenario adds several of the same role. */
  numbered: (role: string, n: number) => `${role} ${n}`,
} as const;
