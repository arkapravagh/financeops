/**
 * Mock data: bank transactions. Positive cents = money in, negative = money out.
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import { Category } from "../enums/category.enum";
import { TransactionStatus } from "../enums/transaction-status.enum";
import type { Transaction } from "../types/finance.types";

/** Every bank transaction in the prototype, newest first, each tagged with an account and category. */
export const transactions = [
  { id: "txn_032", date: "2026-11-02", description: "Stripe payout", counterparty: "Stripe", category: Category.Revenue, accountId: "acc_op", amountCents: 4_812_40, status: TransactionStatus.Pending },
  { id: "txn_031", date: "2026-11-01", description: "Office rent — November", counterparty: "Fulton Works", category: Category.Rent, accountId: "acc_op", amountCents: -8_500_00, status: TransactionStatus.Pending },
  { id: "txn_030", date: "2026-11-01", description: "Design system contract", counterparty: "M. Okonkwo (contractor)", category: Category.Contractors, accountId: "acc_op", amountCents: -3_500_00, status: TransactionStatus.Pending },
  { id: "txn_029", date: "2026-10-31", description: "Payroll run — Oct 31", counterparty: "Payroll", category: Category.Payroll, accountId: "acc_pay", amountCents: -66_000_00, status: TransactionStatus.Cleared },
  { id: "txn_028", date: "2026-10-31", description: "Transfer to payroll reserve", counterparty: "Internal", category: Category.Transfer, accountId: "acc_op", amountCents: -66_000_00, status: TransactionStatus.Cleared },
  { id: "txn_027", date: "2026-10-31", description: "Transfer from operating", counterparty: "Internal", category: Category.Transfer, accountId: "acc_pay", amountCents: 66_000_00, status: TransactionStatus.Cleared },
  { id: "txn_026", date: "2026-10-30", description: "Stripe payout", counterparty: "Stripe", category: Category.Revenue, accountId: "acc_op", amountCents: 14_206_15, status: TransactionStatus.Cleared },
  { id: "txn_025", date: "2026-10-29", description: "Search ads — October", counterparty: "Beacon Ads", category: Category.Marketing, accountId: "acc_op", amountCents: -4_820_00, status: TransactionStatus.Cleared },
  { id: "txn_024", date: "2026-10-28", description: "GPU inference credits", counterparty: "Nimbus Cloud", category: Category.SoftwareCloud, accountId: "acc_op", amountCents: -2_640_00, status: TransactionStatus.Cleared },
  { id: "txn_023", date: "2026-10-27", description: "Team offsite flights", counterparty: "Skylane Air", category: Category.Travel, accountId: "acc_op", amountCents: -1_874_60, status: TransactionStatus.Cleared },
  { id: "txn_022", date: "2026-10-26", description: "Invoice INV-1046", counterparty: "Corvid Analytics", category: Category.Revenue, accountId: "acc_op", amountCents: 2_980_00, status: TransactionStatus.Cleared },
  { id: "txn_021", date: "2026-10-25", description: "Monthly bookkeeping", counterparty: "Ledger & Lane CPAs", category: Category.LegalAccounting, accountId: "acc_op", amountCents: -2_300_00, status: TransactionStatus.Cleared },
  { id: "txn_020", date: "2026-10-24", description: "Code hosting — team plan", counterparty: "Forgehub", category: Category.SoftwareCloud, accountId: "acc_op", amountCents: -588_00, status: TransactionStatus.Cleared },
  { id: "txn_019", date: "2026-10-23", description: "Stripe payout", counterparty: "Stripe", category: Category.Revenue, accountId: "acc_op", amountCents: 13_942_80, status: TransactionStatus.Cleared },
  { id: "txn_018", date: "2026-10-22", description: "Conference sponsorship", counterparty: "DevSummit East", category: Category.Marketing, accountId: "acc_op", amountCents: -3_500_00, status: TransactionStatus.Cleared },
  { id: "txn_017", date: "2026-10-21", description: "Coffee & snacks", counterparty: "Corner Pantry", category: Category.OfficeMisc, accountId: "acc_op", amountCents: -412_35, status: TransactionStatus.Cleared },
  { id: "txn_016", date: "2026-10-20", description: "Trademark filing", counterparty: "Hale & Brook LLP", category: Category.LegalAccounting, accountId: "acc_op", amountCents: -1_650_00, status: TransactionStatus.Cleared },
  { id: "txn_015", date: "2026-10-19", description: "Invoice INV-1042", counterparty: "Quillfeather Media", category: Category.Revenue, accountId: "acc_op", amountCents: 3_250_00, status: TransactionStatus.Cleared },
  { id: "txn_014", date: "2026-10-18", description: "Data contractor — sprint 2", counterparty: "T. Lindqvist (contractor)", category: Category.Contractors, accountId: "acc_op", amountCents: -5_200_00, status: TransactionStatus.Cleared },
  { id: "txn_013", date: "2026-10-16", description: "Stripe payout", counterparty: "Stripe", category: Category.Revenue, accountId: "acc_op", amountCents: 13_610_25, status: TransactionStatus.Cleared },
  { id: "txn_012", date: "2026-10-15", description: "Payroll run — Oct 15", counterparty: "Payroll", category: Category.Payroll, accountId: "acc_pay", amountCents: -66_000_00, status: TransactionStatus.Cleared },
  { id: "txn_011", date: "2026-10-14", description: "Laptops (2×)", counterparty: "Orchard Store", category: Category.OfficeMisc, accountId: "acc_op", amountCents: -1_120_00, status: TransactionStatus.Cleared },
  { id: "txn_010", date: "2026-10-12", description: "Product analytics", counterparty: "Signalpath", category: Category.SoftwareCloud, accountId: "acc_op", amountCents: -1_200_00, status: TransactionStatus.Cleared },
  { id: "txn_009", date: "2026-10-09", description: "Stripe payout", counterparty: "Stripe", category: Category.Revenue, accountId: "acc_op", amountCents: 12_998_60, status: TransactionStatus.Cleared },
  { id: "txn_008", date: "2026-10-08", description: "CRM seats", counterparty: "Gridline CRM", category: Category.SoftwareCloud, accountId: "acc_op", amountCents: -1_450_00, status: TransactionStatus.Cleared },
  { id: "txn_007", date: "2026-10-05", description: "Cloud infrastructure", counterparty: "Nimbus Cloud", category: Category.SoftwareCloud, accountId: "acc_op", amountCents: -9_120_00, status: TransactionStatus.Cleared },
  { id: "txn_006", date: "2026-10-03", description: "Treasury interest", counterparty: "Harbor Treasury", category: Category.Revenue, accountId: "acc_tre", amountCents: 3_140_00, status: TransactionStatus.Cleared },
  { id: "txn_005", date: "2026-10-01", description: "Office rent — October", counterparty: "Fulton Works", category: Category.Rent, accountId: "acc_op", amountCents: -8_500_00, status: TransactionStatus.Cleared },
] satisfies Transaction[];
