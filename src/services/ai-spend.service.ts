/**
 * AI spend service: the only way pages read AI usage, seat, feature and budget data.
 *
 * Mock-backed today; when the API lands only this file changes (connect-api skill).
 */

import { aiBudgets, aiFeatures, aiSeatCharges, aiUsage } from "../data/ai-spend.data";
import type { AiBudget, AiFeature, AiFeatureInfo, AiSeatCharge, AiUsage, MonthKey } from "../types/finance.types";

/** Months with AI usage data, oldest first. */
export const getAiMonths = (): MonthKey[] =>
  [...new Set([...aiUsage.map((u) => u.month), ...aiSeatCharges.map((s) => s.month)])].sort();

/** Usage rows, optionally filtered by month, feature and/or vendor. */
export function getAiUsage(filter: { month?: MonthKey; feature?: AiFeature; vendor?: string } = {}): AiUsage[] {
  return aiUsage
    .filter((u) => (!filter.month || u.month === filter.month) && (!filter.feature || u.feature === filter.feature) && (!filter.vendor || u.vendor === filter.vendor))
    .sort((a, b) => a.month.localeCompare(b.month) || b.costCents - a.costCents);
}

/** Per-seat AI tool charges, optionally for one month. */
export function getAiSeatCharges(filter: { month?: MonthKey } = {}): AiSeatCharge[] {
  return aiSeatCharges
    .filter((s) => !filter.month || s.month === filter.month)
    .sort((a, b) => a.month.localeCompare(b.month) || b.costCents - a.costCents);
}

/** Every AI feature with its customer-facing flag and description. */
export const getAiFeatures = (): AiFeatureInfo[] => aiFeatures;

/** The AI budget for a month, if one was set (budgets start in August 2026). */
export const getAiBudget = (month: MonthKey): AiBudget | undefined => aiBudgets.find((b) => b.month === month);
