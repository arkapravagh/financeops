/**
 * English labels for the AI spend page and its usage and seats tables.
 *
 * AI feature names live in `enums.lang.ts`. Amounts, percentages, counts and months arrive pre-formatted.
 */

/** Text on the AI spend page. */
export const aiSpendLabels = {
  title: "AI spend",
  subtitle: "What is AI costing us, and is it growing faster than revenue?",
  month: "Month",
  askAi: "Ask Elisa",
  /** Prompt sent to the AI panel from the header button. */
  askPrompt: "Where is our AI spend going, and how can we cut it?",
  kpi: {
    spend: "AI spend",
    versus: (month: string) => `vs ${month}`,
    firstMonth: "first month tracked",
    share: "Share of revenue",
    sharePoints: (points: string) => `${points} pts`,
    shareContext: (mrr: string) => `of ${mrr} MRR`,
    tokens: "Tokens processed",
    requests: (count: string) => `${count} requests`,
    perCustomer: "AI cost per customer",
    customers: (count: number) => `${count} paying customers`,
  },
  byMonth: {
    title: "AI spend by month",
    growthSubtitle: (ai: string, since: string, mrr: string) => `Up ${ai} since ${since}, while revenue grew ${mrr}.`,
    defaultSubtitle: "Model APIs, self-hosted GPUs and per-seat team tools.",
    api: "Model APIs",
    gpu: "GPU hosting",
    seats: "Team seats",
    total: "Total",
    summaryItem: (month: string, total: string) => `${month}: ${total} total`,
  },
  budget: {
    title: (month: string) => `${month} budget`,
    over: "over budget",
    under: "under budget",
    spent: "Spent",
    budget: "Budget",
    none: "No AI budget for this month. AI budgets start in August 2026.",
  },
  insights: {
    fasterTitle: "AI spend is growing faster than revenue",
    fasterBody: (ai: string, mrr: string, share: string) => `${ai} in three months against ${mrr} for MRR. AI is now ${share} of revenue.`,
    biggestTitle: (feature: string) => `${feature} is the biggest cost`,
    biggestBody: (amount: string, share: string) => `${amount}, ${share} of usage-based AI spend this month.`,
    idleTitle: (count: number) => `${count} AI seats went unused`,
    idleBody: (amount: string) => `That is ${amount} this month. Remove them before the next renewal.`,
  },
  tokens: {
    title: "Where the tokens go",
    subtitle: (month: string) => `Usage-based AI in ${month}, as billed by each provider. Hover tokens for the input and output split.`,
    groupBy: "Group by",
    billedPerToken: "billed per token",
    billedPerGpuHour: "billed per GPU hour",
    /** Model row detail, e.g. "Lumen Labs, billed per token". */
    modelDetail: (vendor: string, billing: string) => `${vendor}, ${billing}`,
    customers: "Customers",
    team: "Team",
  },
  share: {
    title: "AI spend as a share of revenue",
    subtitle: "AI spend divided by that month's MRR. Lower means AI pays for itself more easily.",
    series: "Share of revenue",
    noRevenue: "no revenue",
    summaryItem: (month: string, value: string) => `${month}: ${value}`,
  },
  seats: {
    title: "Team AI tools",
    subtitle: (amount: string) => `${amount} in per-seat tools this month.`,
    none: "No per-seat AI tools this month.",
    note: "AI spend is booked under Software & cloud in Budgets. Figures are as billed.",
  },
} as const;

/** Text in the AI usage table. */
export const aiUsageTableLabels = {
  captionByFeature: "AI usage by feature",
  captionByModel: "AI usage by model",
  feature: "Feature",
  model: "Model",
  usedBy: "Used by",
  requests: "Requests",
  tokens: "Tokens",
  perThousandRequests: "Per 1K requests",
  perMillionTokens: "Per 1M tokens",
  cost: "Cost",
  share: "Share",
  tokenSplit: (input: string, output: string) => `${input} in, ${output} out`,
  total: "Usage total",
} as const;

/** Text in the team AI seats table. */
export const aiSeatsTableLabels = {
  caption: "Team AI tools",
  tool: "Tool",
  seatsUsed: "Seats used",
  cost: "Cost",
  unusedSeats: "Unused seats",
  usedOf: (active: number, total: number) => `${active} of ${total}`,
  unused: (count: number, amount: string) => `${count} unused, ${amount}`,
  allInUse: "All in use",
} as const;
