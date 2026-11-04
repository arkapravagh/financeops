/**
 * Mock data: monthly budget vs. actual per expense category (Aug–Oct 2026).
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import type { Budget } from "../types/finance.types";

/**
 * Monthly budgets, Aug–Oct 2026 (budgeting started in August).
 * Each month's actuals sum to that month's cash out in flows.data.ts:
 *   Aug $186,350 · Sep $190,180 · Oct $194,000
 */
export const budgets = [
  // August 2026 — budget $190,500
  { category: "Payroll", month: "2026-08", budgetCents: 130_000_00, actualCents: 128_000_00 },
  { category: "Software & cloud", month: "2026-08", budgetCents: 15_000_00, actualCents: 15_900_00 },
  { category: "Contractors", month: "2026-08", budgetCents: 15_000_00, actualCents: 13_500_00 },
  { category: "Marketing", month: "2026-08", budgetCents: 10_000_00, actualCents: 9_800_00 },
  { category: "Rent", month: "2026-08", budgetCents: 8_500_00, actualCents: 8_500_00 },
  { category: "Legal & accounting", month: "2026-08", budgetCents: 5_000_00, actualCents: 4_950_00 },
  { category: "Travel", month: "2026-08", budgetCents: 4_000_00, actualCents: 3_400_00 },
  { category: "Office & misc", month: "2026-08", budgetCents: 3_000_00, actualCents: 2_300_00 },

  // September 2026 — budget $193,500
  { category: "Payroll", month: "2026-09", budgetCents: 132_000_00, actualCents: 130_000_00 },
  { category: "Software & cloud", month: "2026-09", budgetCents: 16_000_00, actualCents: 17_100_00 },
  { category: "Contractors", month: "2026-09", budgetCents: 15_000_00, actualCents: 14_200_00 },
  { category: "Marketing", month: "2026-09", budgetCents: 10_000_00, actualCents: 10_400_00 },
  { category: "Rent", month: "2026-09", budgetCents: 8_500_00, actualCents: 8_500_00 },
  { category: "Legal & accounting", month: "2026-09", budgetCents: 5_000_00, actualCents: 4_580_00 },
  { category: "Travel", month: "2026-09", budgetCents: 4_000_00, actualCents: 2_900_00 },
  { category: "Office & misc", month: "2026-09", budgetCents: 3_000_00, actualCents: 2_500_00 },

  // October 2026 — budget $196,500 (last closed month)
  { category: "Payroll", month: "2026-10", budgetCents: 135_000_00, actualCents: 132_000_00 },
  { category: "Software & cloud", month: "2026-10", budgetCents: 16_000_00, actualCents: 18_400_00 },
  { category: "Contractors", month: "2026-10", budgetCents: 15_000_00, actualCents: 14_000_00 },
  { category: "Marketing", month: "2026-10", budgetCents: 10_000_00, actualCents: 11_000_00 },
  { category: "Rent", month: "2026-10", budgetCents: 8_500_00, actualCents: 8_500_00 },
  { category: "Legal & accounting", month: "2026-10", budgetCents: 5_000_00, actualCents: 4_600_00 },
  { category: "Travel", month: "2026-10", budgetCents: 4_000_00, actualCents: 3_100_00 },
  { category: "Office & misc", month: "2026-10", budgetCents: 3_000_00, actualCents: 2_400_00 },
] satisfies Budget[];
