/**
 * Transaction and budget categories.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Every transaction category. Expense categories also have budgets; Revenue is money in; Transfer moves money between own accounts. */
export enum Category {
  /** Salaries, payroll taxes and benefits. */
  Payroll = "payroll",
  /** SaaS tools, cloud hosting and all AI spend. */
  SoftwareCloud = "software-cloud",
  /** Office rent. */
  Rent = "rent",
  /** Freelancers and agencies. */
  Contractors = "contractors",
  /** Ads, sponsorships and events. */
  Marketing = "marketing",
  /** Flights, hotels and ground transport. */
  Travel = "travel",
  /** Office supplies, food and everything else. */
  OfficeMisc = "office-misc",
  /** Lawyers, bookkeeping and accountants. */
  LegalAccounting = "legal-accounting",
  /** Money in from customers. */
  Revenue = "revenue",
  /** Moves between the company's own accounts (net to zero). */
  Transfer = "transfer",
}

/** Categories money goes out under (everything except Revenue and Transfer). Budgets exist per expense category. */
export type ExpenseCategory = Exclude<Category, Category.Revenue | Category.Transfer>;

/** Every expense category, in a stable order (used to iterate, e.g. by the AI assistant's category matcher). */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  Category.Payroll,
  Category.SoftwareCloud,
  Category.Rent,
  Category.Contractors,
  Category.Marketing,
  Category.Travel,
  Category.OfficeMisc,
  Category.LegalAccounting,
];
