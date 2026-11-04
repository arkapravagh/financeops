import type { MonthlyFlow } from "../types/finance.types";

/** Cash balance before the first month below (end of Oct 2025). */
export const OPENING_BALANCE_CENTS = 3_800_000_00;

/** Monthly bank totals, Nov 2025 – Oct 2026 (12 complete months). */
export const monthlyFlows = [
  { month: "2025-11", inCents: 41_230_00, outCents: 158_410_00 },
  { month: "2025-12", inCents: 43_080_00, outCents: 162_250_00 },
  { month: "2026-01", inCents: 44_610_00, outCents: 165_020_00 },
  { month: "2026-02", inCents: 47_150_00, outCents: 167_880_00 },
  { month: "2026-03", inCents: 49_320_00, outCents: 171_340_00 },
  { month: "2026-04", inCents: 52_010_00, outCents: 175_760_00 },
  { month: "2026-05", inCents: 54_470_00, outCents: 178_290_00 },
  { month: "2026-06", inCents: 57_120_00, outCents: 180_940_00 },
  { month: "2026-07", inCents: 59_380_00, outCents: 183_120_00 },
  { month: "2026-08", inCents: 62_240_00, outCents: 186_350_00 },
  { month: "2026-09", inCents: 65_060_00, outCents: 190_180_00 },
  { month: "2026-10", inCents: 68_140_00, outCents: 194_000_00 },
] satisfies MonthlyFlow[];
