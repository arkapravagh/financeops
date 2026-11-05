/**
 * Mock data: company profile (name, stage, headcount, currency, last raise).
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import type { Company } from "../types/finance.types";

/** The fictional company the prototype models. Single currency: USD. */
export const company = {
  name: "Brightloop Labs",
  stage: "Seed",
  headcount: 12,
  currency: "USD",
  fiscalYearStart: "January",
  lastRaise: { round: "Seed", amountCents: 3_500_000_00, date: "2025-06-12" },
} satisfies Company;
