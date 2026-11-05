/**
 * Domain types shared by data, services, utils and UI.
 *
 * Conventions: money is integer cents (`*Cents`), dates are ISO strings, months are `YYYY-MM`.
 * Mock files must `satisfies` these types (data-and-mocks rules). Enumerations live in `src/enums/`.
 */

import type { AccountKind } from "../enums/account-kind.enum";
import type { AiFeature } from "../enums/ai-feature.enum";
import type { AiUsageKind } from "../enums/ai-usage-kind.enum";
import type { Category, ExpenseCategory } from "../enums/category.enum";
import type { IntegrationStatus } from "../enums/integration-status.enum";
import type { InvoiceStoredStatus } from "../enums/invoice-status.enum";
import type { ReportStatus } from "../enums/report-status.enum";
import type { TeamRole } from "../enums/team-role.enum";
import type { TransactionStatus } from "../enums/transaction-status.enum";

/** ISO date, `YYYY-MM-DD` */
export type IsoDate = string;
/** Month key, `YYYY-MM` */
export type MonthKey = string;

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
  kind: AccountKind;
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
  status: TransactionStatus;
};

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
  role: TeamRole;
};

/** A bank, billing or accounting connection (placeholder in the prototype). */
export type Integration = {
  id: string;
  name: string;
  purpose: string;
  status: IntegrationStatus;
};

// ---------- AI spend ----------

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

/** A month-end financial report (management pack), downloadable as Excel and PDF once the books close. */
export type MonthlyReport = {
  id: string;
  month: MonthKey;
  status: ReportStatus;
  /** Publish date when ready; the expected date while in progress. */
  availableOn: IsoDate;
  /** PDF length; `null` until the report is ready. */
  pdfPages: number | null;
  /** Excel workbook size in bytes; `null` until the report is ready. */
  xlsxBytes: number | null;
};

/** The headline cash figures a monthly report summarises (all cents). */
export type ReportFigures = {
  inCents: number;
  outCents: number;
  /** Cash out − cash in. Positive = losing money. */
  netBurnCents: number;
  endingCashCents: number;
};

/** A monthly report joined with its headline figures; `figures` is `null` while the report is in progress. */
export type MonthlyReportSummary = MonthlyReport & { figures: ReportFigures | null };
