/**
 * English labels for the Runway & forecast page and its components (verdict, chart, comparison, sensitivity,
 * scenario panel, picker, levers, custom-scenario drawer, projection table).
 *
 * Scenario names and descriptions live in `scenario-library.lang.ts`; picker group headings in `enums.lang.ts`.
 * Amounts, percentages and dates arrive pre-formatted.
 */

/** Names of the two built-in scenario states. */
export const scenarioNames = {
  current: "Current trajectory",
  working: "Your scenario",
  untitled: "Untitled scenario",
} as const;

/** Text on the Forecast page itself (header, chart, cards). */
export const forecastLabels = {
  title: "Runway & forecast",
  subtitle: "Model hiring, growth and fundraising to see how long the money lasts. Everything here is a projection, not a promise.",
  horizon: "Forecast horizon",
  basedOn: (name: string) => `Based on ${name}.`,
  chart: {
    title: "Projected cash balance",
    subtitle: (months: number) => `12 months of actuals, then ${months} months projected. Solid is actual; dashed is projected.`,
    raiseMarker: (amount: string) => `Raise ${amount}`,
    startRaising: "Start raising",
    zeroCash: "Zero cash",
    runwayBeyond: (months: number) => `more than ${months} months`,
    summary: (name: string, runway: string) => `Projected cash. ${name}: runway ${runway}.`,
    summaryOther: (name: string, runway: string) => ` ${name}: runway ${runway}.`,
  },
  compare: {
    title: "Compare scenarios",
    savedSubtitle: (max: number) => `Saved scenarios stay on the chart until you delete them (up to ${max}).`,
    emptySubtitle: "Pick a scenario and press Compare in the panel to keep it here and on the chart.",
  },
  sensitivity: {
    title: "What moves your runway most",
    subtitle: (target: string) => `Months gained or lost from one change to ${target}.`,
    targetCurrent: "the current trajectory",
    targetScenario: "your scenario",
  },
  panel: {
    title: "Scenario",
    subtitle: "Change the assumptions. The chart and numbers update as you go.",
  },
  table: {
    title: "Month by month",
    subtitle: (name: string, months: number) => `${name}, next ${months} months.`,
  },
} as const;

/** Text in the Forecast hero (verdict). */
export const verdictLabels = {
  heading: (name: string) => `Projected runway, ${name}`,
  currentName: "current trajectory",
  alive: "Default alive",
  dead: "Default dead",
  months: "months",
  diff: (months: string) => `${months} months vs current trajectory`,
  /** Alive sentence, split around the emphasised break-even month. */
  aliveLead: "Revenue overtakes spending around",
  aliveTail: (beforeRaise: boolean) =>
    `, while there's still cash in the bank. You can reach profitability without new money${beforeRaise ? ", even before the planned raise" : ""}.`,
  deadLead: "At these growth rates, spending stays ahead of revenue",
  runsOut: "and cash runs out around",
  dependsOnRaise: ", so the business depends on the planned raise",
  startRaisingBy: "Start raising by",
  orCut: ", or cut spending.",
  raiseLead: (amount: string, month: string) => `The ${amount} raise in ${month}`,
  raiseNotEnough: "isn't enough on its own.",
  raiseCarries: (months: number) => `carries you past ${months} months.`,
  facts: {
    zeroCash: "Zero-cash date",
    startRaising: "Start raising by",
    cash12: "Cash in 12 months",
    breakEven: "Break-even month",
    peakBurn: "Peak monthly burn",
    peakIn: "Peak burn in",
    beyond: (months: number) => `Beyond ${months} months`,
    notNeeded: "Not needed",
    none: "None",
  },
} as const;

/** Text in the scenario panel (builder) and its actions. */
export const scenarioBuilderLabels = {
  startFrom: "Start from",
  count: (n: number) => `${n} scenarios`,
  editCustom: "Edit custom scenario",
  saveAsCustom: "Save as custom scenario",
  customiseCopy: "Customise a copy",
  compareName: "Name for the comparison",
  pickFirst: "Pick a scenario first",
  compareTitle: "Pin this scenario to the chart and comparison table",
  compareFull: "You can compare two scenarios. Remove one first.",
  compare: "Compare",
  reset: "Reset",
} as const;

/** Text on the scenario levers (growth, one-off changes, hiring, fundraise). */
export const leverLabels = {
  growth: "Growth",
  revenueGrowth: "Revenue growth",
  spendingGrowth: "Spending growth",
  perMonth: (rate: string) => `${rate} a month`,
  shrinks: (rate: string) => `Shrinks ${rate} a month`,
  lastSixMonths: (rate: string) => `Last 6 months: ${rate} a month`,
  oneOff: "One-off changes",
  fromNextMonth: "Applied from next month",
  spending: "Spending",
  spendingNote: "For example −15% to cut tools, contractors and marketing",
  revenue: "Revenue",
  revenueNote: "For example −20% if your biggest customer leaves, +10% after a price rise",
  hiring: "Hiring plan",
  hiringCost: (amount: string) => `${amount} a month at full ramp`,
  noHires: "No new hires",
  hireRole: (n: number) => `Hire ${n} role`,
  hireStart: (n: number) => `Hire ${n} start month`,
  hireCost: (n: number) => `Hire ${n} monthly cost in thousands of dollars`,
  thousands: "K",
  removeHire: (role: string) => `Remove ${role}`,
  addHire: "Add a hire",
  fullyLoaded: "Monthly cost is fully loaded: salary, taxes, benefits and equipment.",
  fundraise: "Fundraise",
  raiseSummary: (amount: string, month: string) => `${amount} in ${month}`,
  notPlanned: "Not planned",
  includeRaise: "Include a raise in this scenario",
  amount: "Amount",
  moneyInBank: "Money in the bank",
  moneyInBankNote: "When the round closes and funds arrive, not when you start raising.",
} as const;

/** Text in the scenario picker dropdown. */
export const pickerLabels = {
  edited: "Edited. Save it as a custom scenario to reuse it.",
  search: "Search scenarios",
  searchPlaceholder: (n: number) => `Search ${n} scenarios`,
  list: "Scenarios",
  noMatch: (query: string) => `No scenarios match "${query}". Build your own instead.`,
  resultCount: (n: number) => `${n} ${n === 1 ? "scenario" : "scenarios"}`,
  create: "Create custom scenario",
} as const;

/** Text in the custom-scenario drawer. */
export const customScenarioLabels = {
  createTitle: "Create custom scenario",
  editTitle: "Edit custom scenario",
  description: "Set your own assumptions and save them. Custom scenarios appear at the top of the scenario list.",
  saveNew: "Save scenario",
  saveChanges: "Save changes",
  details: "Details",
  name: "Name",
  namePlaceholder: "For example: Hire 2 AEs after the bridge",
  duplicateName: "You already have a scenario with this name.",
  descriptionLabel: "Description",
  optional: "(optional)",
  descriptionPlaceholder: "What this scenario assumes, so you remember later",
  projectedRunway: "Projected runway",
  runsOut: (month: string) => ` (cash runs out ${month})`,
} as const;

/** Text in the scenario comparison table. */
export const compareLabels = {
  caption: "Scenario comparison",
  columns: ["Scenario", "Runway", "Zero cash", "Break-even", "Cash in 12 months", "Verdict", ""],
  alive: "Alive",
  dead: "Dead",
  deleteSaved: (name: string) => `Delete saved scenario ${name}`,
} as const;

/** Text in the "What moves your runway most" chart. */
export const sensitivityLabels = {
  revenueFaster: "Revenue grows 1 point faster",
  revenueSlower: "Revenue grows 1 point slower",
  cutSpending: "Cut spending by 10%",
  spendingFaster: "Spending grows 1 point faster",
  hireOne: "Hire one more engineer next month",
  atCap: (months: number) => `This scenario already lasts beyond ${months} months, so gains can't be measured. Losses still show.`,
  listLabel: "Change in runway by lever",
  /** Signed change in runway, e.g. "+7.1 mo" / "−2.4 mo" / "±0.0 mo". `months` is the formatted absolute value. */
  delta: (sign: "gain" | "loss" | "none", months: string) => `${sign === "gain" ? "+" : sign === "loss" ? "−" : "±"}${months} mo`,
  footnote: "Each row changes one assumption in your scenario and keeps everything else the same.",
} as const;

/** Text in the month-by-month projection table and its CSV export. */
export const projectionTableLabels = {
  caption: (name: string) => `Projected monthly cash flow for ${name}`,
  month: "Month",
  cashIn: "Cash in",
  cashOut: "Cash out",
  newHires: "Of which new hires",
  raise: "Raise",
  net: "Net",
  endingCash: "Ending cash",
  runsOut: "Cash runs out",
  raiseLands: "Raise lands",
} as const;
