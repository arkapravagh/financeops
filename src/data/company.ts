import type { Company } from "../types/finance";

export const company = {
  name: "Brightloop Labs",
  stage: "Seed",
  headcount: 12,
  currency: "USD",
  fiscalYearStart: "January",
  lastRaise: { round: "Seed", amountCents: 3_500_000_00, date: "2025-06-12" },
} satisfies Company;
