/**
 * English labels for the Budgets page, its summary and the category table.
 *
 * Category names live in `enums.lang.ts`. Amounts, percentages and months arrive pre-formatted.
 */

/** Text on the Budgets page. */
export const budgetsLabels = {
  title: "Budgets",
  subtitle: "Are we spending what we planned? A month closes once the books are reconciled.",
  month: "Month",
  editBudgets: "Edit budgets",
  byCategory: {
    title: "By category",
    /** e.g. "Software & cloud ($900 over) ran over." `overruns` is the joined list. */
    overSubtitle: (overruns: string) => `${overruns} ran over. Select a row to see what's behind it.`,
    overItem: (category: string, amount: string) => `${category} (${amount} over)`,
    overJoin: " and ",
    withinSubtitle: "Every category stayed within budget. Select a row to see what's behind it.",
    chartScale: "Chart scale",
  },
  legend: {
    label: "Legend",
    spent: "Spent",
    budget: "Budget",
    budgetLine: "Budget line",
    overBudget: "Over budget",
    trend: "Share of budget used, last 3 months",
  },
  monthly: {
    title: "Spent vs budget by month",
    subtitle: (firstMonth: string) => `Budgets are tracked from ${firstMonth}.`,
    budget: "Budget",
    spent: "Spent",
    difference: "Difference",
    summaryItem: (month: string, spent: string, budget: string) => `${month}: spent ${spent} of ${budget}`,
  },
  share: {
    title: "Where the money goes",
    subtitle: (month: string) => `Share of ${month} spending by category.`,
    payrollNote: "Payroll is shown as one total. Individual salaries will sit behind a permission.",
  },
} as const;

/** Text in the Budgets page hero. */
export const budgetSummaryLabels = {
  title: (month: string) => `${month} budget`,
  under: "under budget",
  over: "over budget",
  /** Sentence split around the emphasised amount. */
  youSpent: "You spent",
  ofPlanned: (budget: string, share: string) => `of the ${budget} planned, ${share} of the budget.`,
  momChange: (rose: boolean, change: string, month: string) => ` Spending ${rose ? "rose" : "fell"} ${change} from ${month}.`,
  spent: "Spent",
  budget: "Budget",
  overBudget: "Over budget",
  overCount: (over: number, total: number) => `${over} of ${total} categories`,
  noneOver: "None this month",
  biggestOverrun: "Biggest overrun",
  overrunDetail: (amount: string, used: string) => `, ${amount} over (${used} used)`,
  mostRoom: "Most room left",
  roomDetail: (amount: string) => `, ${amount} unspent`,
} as const;

/** Text in the budget category table and its expandable details. */
export const budgetTableLabels = {
  category: "Category",
  spendAgainstBudget: "Spend against budget",
  spent: "Spent",
  budget: "Budget",
  variance: "Variance",
  threeMonths: "3 months",
  trendLabel: (items: string) => `Share of budget used: ${items}`,
  trendItem: (month: string, used: string) => `${month} ${used}`,
  trendTitle: (month: string, used: string) => `${month}: ${used}`,
  spentOf: (spent: string, budget: string) => `${spent} spent of ${budget}`,
  over: (amount: string) => `${amount} over`,
  onBudget: "On budget",
  left: (amount: string) => `${amount} left`,
  largestTransactions: (month: string) => `Largest transactions in ${month}`,
  noDetail: "The sample data only has transaction detail for October. Budget totals above are complete.",
  openTransactions: "Open transactions",
  versus: (month: string) => `vs ${month}`,
  average: (months: number) => `${months}-month average`,
  used: (share: string) => `${share} used`,
  monthsOver: "Months over budget",
  monthsOverValue: (over: number, total: number) => `${over} of ${total}`,
  askWhy: "Ask AI why it's over",
  /** Prompt sent to the AI panel. */
  askPrompt: (category: string) => `Why is ${category} over budget?`,
} as const;
