# Finance domain rules

## Money representation
- Store and compute all monetary amounts as **integer cents** (`amountCents: number`). Never floats for money.
- Field names carry the unit: `amountCents`, `balanceCents`, `mrrCents`.
- Sign convention for transactions: **positive = money in, negative = money out.**
- Every amount has a currency; the prototype uses a single company currency (`USD`) from `services/company.service.ts`.
  Do not mix currencies in one sum — convert first (future phase) or refuse.
- Format only at render time via `src/shared/utils/money.util.ts` (`formatMoney`, `formatCompact`). Never hand-build `"$" + n`.
- Rounding: round half away from zero, only when converting a computed float (e.g. a percentage of a budget) back to cents.

## Metric definitions (use these exact meanings everywhere)
| Metric | Definition |
|---|---|
| Cash balance | Sum of all bank account balances at a point in time. |
| Gross burn | Total cash **out** in a calendar month (absolute value). |
| Net burn | Cash out − cash in for the month. Positive net burn = losing money. |
| Average net burn | Mean net burn of the last **3 complete months** (not the current partial month). |
| Runway (months) | Cash balance ÷ average net burn. If net burn ≤ 0, the company is **default alive** → show "Profitable", never a negative/infinite runway. |
| Zero-cash date | Today + runway months. |
| MRR | Sum of active monthly subscription revenue; annual plans contribute amount ÷ 12. |
| ARR | MRR × 12. |
| AR (receivables) | Sum of unpaid invoice amounts (sent + overdue). Drafts are excluded. |
| Overdue | Invoice unpaid and `dueDate` < today. |
| Budget variance | Actual − budget. Over budget = positive variance on an expense category. |
| Projected runway | Months until projected cash < 0 under a scenario (`metrics.util.ts` → `projectedRunway`), capped at the 36-month model horizon ("36+"). Differs from simple runway on purpose: it models growth, hires and raises. |
| Default alive | Revenue overtakes spending **before** projected cash runs out, **ignoring any planned raise** (Paul Graham's definition). `isDefaultAlive()`. |
| Start raising by | Zero-cash date − 9 months (rounds take 6–9 months to close). |
| AI spend | Model API (per-token) + self-hosted GPU + per-seat AI tool charges for a calendar month, as billed. Part of "Software & cloud". |
| AI share of revenue | AI spend ÷ that month's MRR. |
| AI cost per customer | Customer-facing AI spend (API + GPU for customer features; excludes internal tools and seats) ÷ paying customers that month. |
| Cost per 1M tokens | Cost ÷ (input + output tokens) × 1,000,000 — a blended rate. |
| Unused seat cost | Seat charge × (seats − active seats) ÷ seats; "active" = used at least once that month. |

## Forecast model
- Starting point and "current trajectory" come from `getForecastBase()` in `services/forecast.service.ts` (cash today, last complete
  month's cash in/out, 6-month compound growth). The Forecast page **and** the AI assistant must use it, never re-derive.
- Projection month `i` is `addMonths(getForecastOrigin(), i)`; month 1 is the current month. Use this for every month label.
- Hires are individual (`PlannedHire`: role, start month, fully loaded monthly cost). A raise is one `PlannedRaise`
  (month, amount) added to cash in that month.
- One-off adjustments (`expenseAdjustment`, `revenueAdjustment`) scale the month-0 base before growth compounds,
  e.g. `revenueAdjustment: -0.2` = 20% less monthly revenue from month 1 (a big customer churns).
  Revenue growth may be negative (net churn).
- Scenario library: 70+ predefined scenarios in `features/forecast/scenario-library.config.ts`, each expressed relative
  to `getForecastBase()` so they stay right as actuals change. Custom scenarios a user builds live in localStorage (`features/forecast/use-scenario-storage.hook.ts`).

All metric functions live in `src/shared/utils/metrics.util.ts`, are pure, and take "today" as a parameter
(`asOf: Date`) instead of reading the clock, so they're deterministic and testable.

## Dates
- Store dates as ISO strings (`YYYY-MM-DD`). Months as `YYYY-MM`.
- The prototype's "today" is fixed in `services/company.service.ts` (`AS_OF`) so mock data never goes stale.

## Language in the UI
- Plain founder language first, jargon second: "Runway — 14 months of cash left", not just "Runway: 14.2".
- Never present a forecast as fact; label projections "Projected" / "Estimate".
- This tool is not tax, legal or accounting advice — any tax-related UI must say so.
