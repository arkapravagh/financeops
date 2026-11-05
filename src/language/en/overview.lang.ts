/**
 * English labels for the Overview page and its runway strip.
 *
 * Amounts and dates arrive pre-formatted; the functions only place them in a sentence.
 */

/** Text on the Overview page. */
export const overviewLabels = {
  greeting: (firstName: string) => `Good morning, ${firstName}`,
  subtitle: (company: string, date: string) => `Here's where ${company} stands on ${date}.`,
  export: "Export",
  addTransaction: "Add transaction",
  kpi: {
    netBurn: "Net burn, 3-month average",
    perMonth: (amount: string) => `${amount}/mo`,
    netBurnContext: "vs the 3 months before",
    mrr: "Monthly recurring revenue",
    mrrContext: (customers: number) => `from ${customers} customers`,
    owed: "Owed to you",
    owedContext: (overdue: string) => `${overdue} of it overdue`,
    bills: "Bills in the next 14 days",
    billsManual: (count: number) => `${count} need a manual payment`,
    billsAutopay: "All on autopay",
  },
  cash: {
    title: "Cash balance",
    subtitle: (drop: string) => `Down ${drop} over 12 months. The dashed line projects the next 6 months at current burn.`,
    series: "Cash balance",
    chartSummary: (start: string, now: string, projected: string) =>
      `Cash balance fell from ${start} to ${now} over 12 months, projected ${projected} in 6 months at current burn.`,
  },
  attention: {
    title: "Needs your attention",
    askAi: "Ask Elisa",
    /** Prompt sent to the AI panel from the "Ask Elisa" link. */
    askPrompt: "Summarize last month",
    overdueTitle: (count: number, total: string) => `${count} invoices overdue, ${total} in total`,
    reviewInvoices: "Review invoices",
    oldestOverdue: (customer: string, days: number) => `The oldest is ${customer}, ${days} days late.`,
    overBudgetTitle: (category: string, over: string) => `${category} is ${over} over budget`,
    overBudgetDetail: (actual: string, budget: string, month: string) => `${actual} spent against ${budget} planned in ${month}.`,
    manualBillsTitle: (count: number) => `${count} bills need a manual payment`,
    firstDue: (date: string) => `The first is due ${date}.`,
  },
  flows: {
    title: "Cash in and out",
    subtitle: "Revenue is growing faster than spending, so net burn is holding near $125K a month.",
    cashIn: "Cash in",
    cashOut: "Cash out",
    netBurn: "Net burn",
    chartSummary: "Monthly cash in rose from $41K to $68K while cash out rose from $158K to $194K over the last 12 months.",
  },
  bills: {
    title: "Upcoming bills",
    subtitle: (total: string) => `${total} due in the next 14 days`,
    due: (date: string) => `Due ${date}. `,
    autopay: "Autopay",
    payManually: "Pay manually",
  },
  recent: {
    title: "Recent transactions",
    viewAll: "View all",
    date: "Date",
    description: "Description",
    category: "Category",
    amount: "Amount",
  },
  owed: {
    title: "Who owes you",
    subtitle: (total: string, open: number) => `${total} across ${open} open invoices`,
    /** e.g. "2 invoices, 35% of the total". */
    bucketDetail: (count: number, share: string) => `${count} ${count === 1 ? "invoice" : "invoices"}, ${share} of the total`,
  },
} as const;

/** Text in the Overview's runway strip. */
export const runwayStripLabels = {
  title: "Runway at current burn",
  profitable: "Profitable",
  months: "months",
  aliveNote: "Revenue covers spending, so there's no runway clock.",
  /** Sentence split around the two dates so they can be emphasised. */
  cashLastsUntil: "Cash lasts until about",
  startRaisingBy: ". Start raising by",
  toLeaveTime: "to leave time to close.",
  cashInBank: "Cash in the bank",
  netBurn: "Net burn",
  perMonth: "/mo",
  timeline: (raise: string, zero: string) => `Runway timeline: today, start raising ${raise}, zero cash ${zero}.`,
  startRaising: "Start raising",
  zeroCash: "Zero cash",
  today: "Today",
  /** Axis tick, e.g. "Mar ’27". */
  tick: (month: string, yy: string) => `${month} ’${yy}`,
  legendRunway: "Runway before you need to raise",
  legendWindow: (months: number) => `Fundraising window (${months} months)`,
} as const;
