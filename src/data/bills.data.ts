/**
 * Mock data: upcoming bills (scheduled cash out) shown on the Overview.
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import { Category } from "../enums/category.enum";
import type { Bill } from "../types/finance.types";

/** Bills due after `AS_OF`, unsorted. `getUpcomingBills()` sorts them by due date. */
export const upcomingBills = [
  { id: "bill_101", vendor: "Fulton Works (office)", category: Category.Rent, dueDate: "2026-11-03", amountCents: 8_500_00, autopay: false },
  { id: "bill_102", vendor: "Nimbus Cloud", category: Category.SoftwareCloud, dueDate: "2026-11-05", amountCents: 9_240_00, autopay: true },
  { id: "bill_103", vendor: "Gridline CRM", category: Category.SoftwareCloud, dueDate: "2026-11-08", amountCents: 1_450_00, autopay: true },
  { id: "bill_104", vendor: "Ledger & Lane CPAs", category: Category.LegalAccounting, dueDate: "2026-11-10", amountCents: 2_300_00, autopay: false },
  { id: "bill_105", vendor: "Atlas Mutual Insurance", category: Category.OfficeMisc, dueDate: "2026-11-12", amountCents: 1_980_00, autopay: false },
  { id: "bill_106", vendor: "Payroll run (semi-monthly)", category: Category.Payroll, dueDate: "2026-11-14", amountCents: 66_000_00, autopay: true },
] satisfies Bill[];
