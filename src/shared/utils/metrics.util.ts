/**
 * Pure finance metrics. Definitions: .claude/rules/finance-domain.md
 * All money is integer cents. "Today" is always passed in as `asOf`.
 */

import { AiUsageKind } from "../../enums/ai-usage-kind.enum";
import { InvoiceStatus } from "../../enums/invoice-status.enum";
import { ReceivablesAge } from "../../enums/receivables-age.enum";
import type { AiSeatCharge, AiUsage, Budget, Invoice, MonthKey, MonthlyFlow } from "../../types/finance.types";
import type { ForecastInput, ForecastPoint } from "../../types/forecast.types";
import { addMonths, daysBetween, parseIso, toMonthKey } from "./dates.util";

/** Sum a list of cent amounts. */
export const sumCents = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** Net burn for one month: out − in. Positive = losing money. */
export const netBurnCents = (flow: MonthlyFlow) => flow.outCents - flow.inCents;

/** Months strictly before the month containing `asOf`, oldest first. */
export function completeMonths(flows: MonthlyFlow[], asOf: Date): MonthlyFlow[] {
  const current = toMonthKey(asOf);
  return flows.filter((f) => f.month < current).sort((a, b) => a.month.localeCompare(b.month));
}

/** Mean net burn of the last `n` complete months. */
export function averageNetBurnCents(flows: MonthlyFlow[], asOf: Date, n = 3): number {
  const recent = completeMonths(flows, asOf).slice(-n);
  if (recent.length === 0) return 0;
  return Math.round(sumCents(recent.map(netBurnCents)) / recent.length);
}

/** Runway in months, or null when the company is default alive (net burn ≤ 0). */
export function runwayMonths(cashCents: number, avgNetBurnCents: number): number | null {
  if (avgNetBurnCents <= 0) return null;
  return cashCents / avgNetBurnCents;
}

/** Zero-cash date: today + runway months; null when default alive (no runway). */
export function zeroCashDate(asOf: Date, runway: number | null): Date | null {
  return runway === null ? null : addMonths(asOf, runway);
}

/** Month-end balances, walking forward from the opening balance. */
export function cashHistory(openingCents: number, flows: MonthlyFlow[]): { month: MonthKey; balanceCents: number }[] {
  let balance = openingCents;
  return flows.map((f) => {
    balance += f.inCents - f.outCents;
    return { month: f.month, balanceCents: balance };
  });
}

/** (current − previous) / previous; null when previous is 0. */
export function growthRate(current: number, previous: number): number | null {
  return previous === 0 ? null : (current - previous) / previous;
}

// ---------- Invoices / receivables ----------

/** Display status: a sent invoice past its due date is "overdue"; otherwise the stored status. */
export function invoiceStatus(inv: Invoice, asOf: Date): InvoiceStatus {
  if (inv.status === InvoiceStatus.Sent && parseIso(inv.dueDate) < asOf) return InvoiceStatus.Overdue;
  return inv.status;
}

/** Days past the due date (0 if not yet due). */
export function daysOverdue(inv: Invoice, asOf: Date): number {
  return Math.max(0, daysBetween(parseIso(inv.dueDate), asOf));
}

/** Unpaid amounts on sent invoices (incl. overdue). Drafts excluded. */
export function receivablesCents(invoices: Invoice[]): number {
  return sumCents(invoices.filter((i) => i.status === InvoiceStatus.Sent).map((i) => i.amountCents));
}

/** One receivables ageing bucket (id from `ReceivablesAge`; label in `enums.lang.ts`): total unpaid and invoice count. */
export type AgingBucket = { age: ReceivablesAge; amountCents: number; count: number };

/** Unpaid sent invoices bucketed by days late: not yet due, 1–30, 31–60, 60+. */
export function receivablesAging(invoices: Invoice[], asOf: Date): AgingBucket[] {
  const buckets: AgingBucket[] = [
    { age: ReceivablesAge.Current, amountCents: 0, count: 0 },
    { age: ReceivablesAge.Late1To30, amountCents: 0, count: 0 },
    { age: ReceivablesAge.Late31To60, amountCents: 0, count: 0 },
    { age: ReceivablesAge.Late60Plus, amountCents: 0, count: 0 },
  ];
  for (const inv of invoices) {
    if (inv.status !== InvoiceStatus.Sent) continue;
    const late = daysBetween(parseIso(inv.dueDate), asOf);
    const idx = late <= 0 ? 0 : late <= 30 ? 1 : late <= 60 ? 2 : 3;
    buckets[idx].amountCents += inv.amountCents;
    buckets[idx].count += 1;
  }
  return buckets;
}

// ---------- Budgets ----------

/** Share of budget used (may exceed 1). */
export const budgetUsed = (b: Budget) => (b.budgetCents === 0 ? 0 : b.actualCents / b.budgetCents);
/** Actual − budget. Positive = over budget. */
export const budgetVarianceCents = (b: Budget) => b.actualCents - b.budgetCents;

// ---------- Forecast ----------

/**
 * Project cash month by month: revenue and spending compound from their (adjusted) bases, plus hires and a raise.
 * Forecast month n = cash(n−1) + revenue(n) − (spending(n) + hires active in n) + raise(n).
 */
export function projectCash(input: ForecastInput): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  let cash = input.startCashCents;
  const baseExpense = input.startExpenseCents * (1 + input.expenseAdjustment);
  const baseRevenue = input.startRevenueCents * (1 + input.revenueAdjustment);
  for (let i = 1; i <= input.months; i++) {
    const revenue = baseRevenue * Math.pow(1 + input.revenueGrowth, i);
    const hiring = sumCents(input.hires.filter((h) => h.startMonth <= i).map((h) => h.monthlyCostCents));
    const expense = baseExpense * Math.pow(1 + input.expenseGrowth, i) + hiring;
    const raise = input.raise && input.raise.month === i ? input.raise.amountCents : 0;
    cash += revenue - expense + raise;
    points.push({
      index: i,
      cashCents: Math.round(cash),
      revenueCents: Math.round(revenue),
      expenseCents: Math.round(expense),
      hiringCents: Math.round(hiring),
      raiseCents: raise,
    });
  }
  return points;
}

/**
 * "Default alive" (Paul Graham): at current growth and spend, does revenue overtake expenses
 * before the money runs out? A planned raise is excluded — the question is about the business itself.
 */
export function isDefaultAlive(input: ForecastInput): boolean {
  const points = projectCash({ ...input, raise: null });
  const breakEven = breakEvenIndex(points);
  const runway = projectedRunway(input.startCashCents, points);
  return breakEven !== null && (runway === null || breakEven <= runway);
}

/** Highest monthly net burn in the projection, with its month index. */
export function peakBurn(points: ForecastPoint[]): { index: number; cents: number } | null {
  let best: { index: number; cents: number } | null = null;
  for (const p of points) {
    const burn = p.expenseCents - p.revenueCents;
    if (!best || burn > best.cents) best = { index: p.index, cents: burn };
  }
  return best && best.cents > 0 ? best : null;
}

/** Months until projected cash first goes below zero (linear interpolation); null if never within horizon. */
export function projectedRunway(startCashCents: number, points: ForecastPoint[]): number | null {
  let prev = startCashCents;
  for (const p of points) {
    if (p.cashCents < 0) {
      const fraction = prev / (prev - p.cashCents);
      return p.index - 1 + fraction;
    }
    prev = p.cashCents;
  }
  return null;
}

/** First month index where monthly revenue ≥ expenses (break-even), or null. */
export function breakEvenIndex(points: ForecastPoint[]): number | null {
  return points.find((p) => p.revenueCents >= p.expenseCents)?.index ?? null;
}

/** Mean days from issue to payment across paid invoices; null if none paid. */
export function averageDaysToPay(invoices: Invoice[]): number | null {
  const paid = invoices.filter((i) => i.status === InvoiceStatus.Paid && i.paidDate);
  if (paid.length === 0) return null;
  const days = paid.map((i) => daysBetween(parseIso(i.issueDate), parseIso(i.paidDate as string)));
  return Math.round(days.reduce((a, b) => a + b, 0) / days.length);
}

/** Compound monthly growth between two values over `periods` months, e.g. 0.046. */
export function compoundGrowth(first: number, last: number, periods: number): number {
  if (first <= 0 || periods <= 0) return 0;
  return Math.pow(last / first, 1 / periods) - 1;
}

// ---------- AI spend ----------

/** AI spend for one month, split by billing kind. */
export type AiMonthSummary = {
  month: MonthKey;
  /** Per-token model APIs. */
  apiCents: number;
  /** Self-hosted models on rented GPUs. */
  computeCents: number;
  /** Per-seat AI tools for the team. */
  seatsCents: number;
  totalCents: number;
  tokens: number;
  requests: number;
};

/** Total AI spend per month (API + GPU + seats), oldest first. */
export function aiMonthlySummary(usage: AiUsage[], seats: AiSeatCharge[]): AiMonthSummary[] {
  const months = [...new Set([...usage.map((u) => u.month), ...seats.map((s) => s.month)])].sort();
  return months.map((month) => {
    const u = usage.filter((x) => x.month === month);
    const apiCents = sumCents(u.filter((x) => x.kind === AiUsageKind.Api).map((x) => x.costCents));
    const computeCents = sumCents(u.filter((x) => x.kind === AiUsageKind.Compute).map((x) => x.costCents));
    const seatsCents = sumCents(seats.filter((s) => s.month === month).map((s) => s.costCents));
    return {
      month,
      apiCents,
      computeCents,
      seatsCents,
      totalCents: apiCents + computeCents + seatsCents,
      tokens: u.reduce((a, x) => a + x.inputTokens + x.outputTokens, 0),
      requests: u.reduce((a, x) => a + x.requests, 0),
    };
  });
}

/** Usage summed for one group (feature, model or vendor). */
export type AiUsageGroup = {
  key: string;
  costCents: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
};

/** Sum usage rows by a key (feature, model, vendor), most expensive first. */
export function groupAiUsage(usage: AiUsage[], keyOf: (u: AiUsage) => string): AiUsageGroup[] {
  const groups = new Map<string, AiUsageGroup>();
  for (const u of usage) {
    const key = keyOf(u);
    const g = groups.get(key) ?? { key, costCents: 0, requests: 0, inputTokens: 0, outputTokens: 0 };
    g.costCents += u.costCents;
    g.requests += u.requests;
    g.inputTokens += u.inputTokens;
    g.outputTokens += u.outputTokens;
    groups.set(key, g);
  }
  return [...groups.values()].sort((a, b) => b.costCents - a.costCents);
}

/** Blended cost of 1M tokens (input + output), in cents; null with no tokens. */
export const costPerMillionTokensCents = (costCents: number, tokens: number): number | null =>
  tokens <= 0 ? null : Math.round((costCents * 1_000_000) / tokens);

/** Cost of 1,000 requests, in cents; null with no requests. */
export const costPerThousandRequestsCents = (costCents: number, requests: number): number | null =>
  requests <= 0 ? null : Math.round((costCents * 1_000) / requests);

/** AI spend as a share of the month's MRR (ratio); null when there is no revenue. */
export const aiRevenueShare = (aiCents: number, mrrCents: number): number | null => (mrrCents <= 0 ? null : aiCents / mrrCents);

/** Customer-facing AI cost ÷ paying customers that month, in cents; null with no customers. */
export const aiCostPerCustomerCents = (customerFacingCents: number, customers: number): number | null =>
  customers <= 0 ? null : Math.round(customerFacingCents / customers);

/** Cost of seats nobody used this month (pro-rated by seat). */
export const idleSeatCostCents = (s: AiSeatCharge): number =>
  s.seats <= 0 ? 0 : Math.round((s.costCents * Math.max(0, s.seats - s.activeSeats)) / s.seats);
