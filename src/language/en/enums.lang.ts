/**
 * English display labels for every enum value.
 *
 * Enum values are ids (`software-cloud`); this is the only place they become words. Each map is a
 * `Record<Enum, string>`, so adding an enum member without a label is a compile error.
 */

import { AccountKind } from "../../enums/account-kind.enum";
import { AiFeature } from "../../enums/ai-feature.enum";
import { AiUsageKind } from "../../enums/ai-usage-kind.enum";
import { AiUsageView } from "../../enums/ai-usage-view.enum";
import { BudgetScale } from "../../enums/budget-scale.enum";
import { Category } from "../../enums/category.enum";
import { ForecastHorizon } from "../../enums/forecast-horizon.enum";
import { IntegrationStatus } from "../../enums/integration-status.enum";
import { InvoiceStatus } from "../../enums/invoice-status.enum";
import { ReceivablesAge } from "../../enums/receivables-age.enum";
import { ScenarioCategory } from "../../enums/scenario-category.enum";
import { TeamRole } from "../../enums/team-role.enum";
import { TransactionDirection } from "../../enums/transaction-direction.enum";
import { TransactionStatus } from "../../enums/transaction-status.enum";

/** Transaction and budget categories. */
export const categoryLabels: Record<Category, string> = {
  [Category.Payroll]: "Payroll",
  [Category.SoftwareCloud]: "Software & cloud",
  [Category.Rent]: "Rent",
  [Category.Contractors]: "Contractors",
  [Category.Marketing]: "Marketing",
  [Category.Travel]: "Travel",
  [Category.OfficeMisc]: "Office & misc",
  [Category.LegalAccounting]: "Legal & accounting",
  [Category.Revenue]: "Revenue",
  [Category.Transfer]: "Transfer",
};

/** Invoice statuses (badge text and filters). */
export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.Draft]: "Draft",
  [InvoiceStatus.Sent]: "Sent",
  [InvoiceStatus.Paid]: "Paid",
  [InvoiceStatus.Overdue]: "Overdue",
};

/** Bank transaction settlement status. */
export const transactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.Cleared]: "Cleared",
  [TransactionStatus.Pending]: "Pending",
};

/** Transaction direction filter. */
export const transactionDirectionLabels: Record<TransactionDirection, string> = {
  [TransactionDirection.All]: "All",
  [TransactionDirection.In]: "Money in",
  [TransactionDirection.Out]: "Money out",
};

/** Bank account types. */
export const accountKindLabels: Record<AccountKind, string> = {
  [AccountKind.Checking]: "Checking",
  [AccountKind.Savings]: "Savings",
  [AccountKind.Treasury]: "Treasury",
};

/** Workspace roles. */
export const teamRoleLabels: Record<TeamRole, string> = {
  [TeamRole.Owner]: "Owner",
  [TeamRole.Finance]: "Finance",
  [TeamRole.Viewer]: "Viewer",
};

/** Integration connection states. */
export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  [IntegrationStatus.Connected]: "Connected",
  [IntegrationStatus.Available]: "Available",
};

/** AI features. */
export const aiFeatureLabels: Record<AiFeature, string> = {
  [AiFeature.InAppAssistant]: "In-app assistant",
  [AiFeature.SupportTriage]: "Support triage",
  [AiFeature.Search]: "Search",
  [AiFeature.DocumentParsing]: "Document parsing",
  [AiFeature.InternalTools]: "Internal tools",
};

/** How AI usage is billed. */
export const aiUsageKindLabels: Record<AiUsageKind, string> = {
  [AiUsageKind.Api]: "API",
  [AiUsageKind.Compute]: "GPU",
};

/** AI usage table grouping options. */
export const aiUsageViewLabels: Record<AiUsageView, string> = {
  [AiUsageView.Feature]: "By feature",
  [AiUsageView.Model]: "By model",
};

/** Budget table scale options. */
export const budgetScaleLabels: Record<BudgetScale, string> = {
  [BudgetScale.Percent]: "% of budget",
  [BudgetScale.Amount]: "Amount",
};

/** Forecast horizon options. */
export const forecastHorizonLabels: Record<ForecastHorizon, string> = {
  [ForecastHorizon.Year]: "12 months",
  [ForecastHorizon.TwoYears]: "24 months",
  [ForecastHorizon.ThreeYears]: "36 months",
};

/** Scenario picker group headings. */
export const scenarioCategoryLabels: Record<ScenarioCategory, string> = {
  [ScenarioCategory.Custom]: "My scenarios",
  [ScenarioCategory.Baseline]: "Baseline",
  [ScenarioCategory.Hiring]: "Hiring",
  [ScenarioCategory.CostControl]: "Cost control",
  [ScenarioCategory.Revenue]: "Revenue",
  [ScenarioCategory.Risks]: "Risks and shocks",
  [ScenarioCategory.Fundraising]: "Fundraising",
  [ScenarioCategory.Strategy]: "Strategic plays",
};

/** Receivables ageing buckets ("Who owes you"). */
export const receivablesAgeLabels: Record<ReceivablesAge, string> = {
  [ReceivablesAge.Current]: "Not yet due",
  [ReceivablesAge.Late1To30]: "1–30 days late",
  [ReceivablesAge.Late31To60]: "31–60 days late",
  [ReceivablesAge.Late60Plus]: "60+ days late",
};
