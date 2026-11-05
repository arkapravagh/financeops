/**
 * Page sections Elisa can point at in cursor mode.
 *
 * Each value is rendered as `data-ai-target` on one section of one page, and sent by the assistant in a `navigate`
 * reply event. English display text lives in `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** A section on a page that the AI cursor can scroll to and highlight. */
export enum PageSection {
  /** Overview: runway strip (cash, burn, zero-cash date). */
  Runway = "runway",
  /** Overview: the KPI row (net burn, MRR, owed, bills). */
  OverviewKeyFigures = "overview-key-figures",
  /** Overview: "Needs your attention" list. */
  Attention = "attention",
  /** Overview: bills due soon. */
  Bills = "bills",
  /** Transactions: the transactions table. */
  TransactionList = "transaction-list",
  /** Invoices: KPI row (outstanding, overdue, days to pay). */
  InvoiceKeyFigures = "invoice-key-figures",
  /** Invoices: the invoices table. */
  InvoiceList = "invoice-list",
  /** Reports: the newest published month-end report. */
  LatestReport = "latest-report",
  /** Budgets: budget vs actual by category. */
  BudgetTable = "budget-table",
  /** Forecast: projected cash chart. */
  CashProjection = "cash-projection",
  /** Forecast: the scenario builder (hires, raise, growth). */
  ScenarioBuilder = "scenario-builder",
  /** AI spend: monthly AI spend chart. */
  AiSpendByMonth = "ai-spend-by-month",
}
