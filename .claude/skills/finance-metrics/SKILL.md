---
name: finance-metrics
description: Add or change a financial calculation (burn, runway, MRR/ARR, AR ageing, budget variance, scenario forecast). Use whenever a number shown in the UI is derived rather than read straight from data.
---

# Add or change a finance metric

1. **Definition first.** Check `.claude/rules/finance-domain.md`. If the metric isn't defined there, add a one-line
   definition to that table *before* writing code, and tell the user the definition you chose.
2. **Implement** in `src/lib/metrics.ts` as a pure function:
   - Inputs: typed data + `asOf: Date` (never read the clock).
   - Work in integer cents; convert floats back with `Math.round` only at the end.
   - Handle edge cases explicitly: empty data, zero/negative burn (→ "default alive", return `null` runway),
     partial current month (exclude from averages), division by zero.
3. **Sanity-check by hand** with the mock data: compute the expected value in a comment-free scratch calculation
   and confirm the UI matches. E.g. runway = cash ÷ avg net burn of last 3 complete months.
4. **Display** through `src/lib/money.ts` formatters. Show units in words ("14 months", "$1.2M"), and label
   any forward-looking number as *Projected*.
5. **Common formulas**
   | Metric | Formula |
   |---|---|
   | Net burn (month) | `-(sum of amountCents in month)` |
   | Runway | `cashCents / avgNetBurnCents` (null if avg ≤ 0) |
   | MRR | `Σ monthly plans + Σ annual plans / 12` (active only) |
   | MoM growth | `(this − last) / last` |
   | DSO | `AR / revenue last 90 days × 90` |
   | Budget used | `actualCents / budgetCents` (ratio, may exceed 1) |
   | Forecast month n | `cash(n-1) + revenue(n) − (expenses(n) + newHires(n) × loadedCost)` |
6. Run `npm run build`.
