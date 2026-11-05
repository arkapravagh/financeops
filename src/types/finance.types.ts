/**
 * Domain types shared by data, services, utils and UI.
 *
 * Conventions: money is integer cents (`*Cents`), dates are ISO strings, months are `YYYY-MM`.
 * Mock files must `satisfies` these types (data-and-mocks rules).
 */

/** ISO date, `YYYY-MM-DD` */
export type IsoDate = string;
/** Month key, `YYYY-MM` */
export type MonthKey = string;

/** Categories money goes out under. Budgets exist per expense category. */
export type ExpenseCategory =
  | "Payroll"
  | "Software & cloud"
  | "Rent"
  | "Contractors"
  | "Marketing"
  | "Travel"
  | "Office & misc"
  | "Legal & accounting";

/** Every transaction category: expenses plus money in (Revenue) and moves between accounts (Transfer). */
export type Category = ExpenseCategory | "Revenue" | "Transfer";

/** Company profile. */
export type Company = {
  name: string;
  stage: string;
  headcount: number;
  currency: "USD";
  fiscalYearStart: string;
  lastRaise: { round: string; amountCents: number; date: IsoDate };
};

/** A bank account and its balance at `AS_OF`. */
export type BankAccount = {
  id: string;
  name: string;
  institution: string;
  mask: string;
  kind: "checking" | "savings" | "treasury";
  balanceCents: number;
};

/** Monthly bank totals (from statements). Positive cents for both fields. */
export type MonthlyFlow = {
  month: MonthKey;
  inCents: number;
  outCents: number;
};

/** A bank transaction. `amountCents` is positive for money in, negative for money out. */
export type Transaction = {
  id: string;
  date: IsoDate;
  description: string;
  counterparty: string;
  category: Category;
  accountId: string;
  /** Positive = money in, negative = money out */
  amountCents: number;
  status: "cleared" | "pending";
};

/** Stored status. "overdue" is derived from dueDate vs. today: see `invoiceStatus()` in shared/utils/metrics.util.ts. */
export type InvoiceStoredStatus = "draft" | "sent" | "paid";
/** Status shown in the UI: the stored status, or "overdue" when sent and past its due date. */
export type InvoiceStatus = InvoiceStoredStatus | "overdue";

/** A customer invoice. */
export type Invoice = {
  id: string;
  number: string;
  customer: string;
  issueDate: IsoDate;
  dueDate: IsoDate;
  amountCents: number;
  status: InvoiceStoredStatus;
  paidDate?: IsoDate;
};

/** One category's budget and actual spend for one month. */
export type Budget = {
  category: ExpenseCategory;
  month: MonthKey;
  budgetCents: number;
  actualCents: number;
};

/** Month-end MRR and paying customers. */
export type MrrPoint = {
  month: MonthKey;
  mrrCents: number;
  customers: number;
};

/** A scheduled bill (future cash out). */
export type Bill = {
  id: string;
  vendor: string;
  category: ExpenseCategory;
  dueDate: IsoDate;
  amountCents: number;
  autopay: boolean;
};

/** A workspace member. */
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Finance" | "Viewer";
};

/** A bank, billing or accounting connection (placeholder in the prototype). */
export type Integration = {
  id: string;
  name: string;
  purpose: string;
  status: "connected" | "available";
};

// ---------- AI spend ----------

/** Where AI is used in the business. */
export type AiFeature = "In-app assistant" | "Support triage" | "Search" | "Document parsing" | "Internal tools";

/** "api" = billed per token by a model provider; "compute" = self-hosted model on rented GPUs (billed per GPU hour). */
export type AiUsageKind = "api" | "compute";

/** One month of usage for one model in one feature, as billed by the provider. */
export type AiUsage = {
  id: string;
  month: MonthKey;
  vendor: string;
  model: string;
  kind: AiUsageKind;
  feature: AiFeature;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
};

/** Per-seat AI tools the team uses (coding assistant, chat workspace), one row per month. */
export type AiSeatCharge = {
  id: string;
  month: MonthKey;
  vendor: string;
  product: string;
  seats: number;
  /** Seats used at least once in the month. */
  activeSeats: number;
  costCents: number;
};

/** An AI feature and whether customers use it (drives "AI cost per customer"). */
export type AiFeatureInfo = {
  feature: AiFeature;
  description: string;
  /** Serves customers (counts toward AI cost per customer) vs. internal use. */
  customerFacing: boolean;
};

/** The monthly AI spend budget. */
export type AiBudget = { month: MonthKey; budgetCents: number };
