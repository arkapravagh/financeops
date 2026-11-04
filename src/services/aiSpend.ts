import { aiBudgets, aiFeatures, aiSeatCharges, aiUsage } from "../data/aiSpend";
import type { AiBudget, AiFeature, AiFeatureInfo, AiSeatCharge, AiUsage, MonthKey } from "../types/finance";

/** Months with AI usage data, oldest first. */
export const getAiMonths = (): MonthKey[] =>
  [...new Set([...aiUsage.map((u) => u.month), ...aiSeatCharges.map((s) => s.month)])].sort();

export function getAiUsage(filter: { month?: MonthKey; feature?: AiFeature; vendor?: string } = {}): AiUsage[] {
  return aiUsage
    .filter((u) => (!filter.month || u.month === filter.month) && (!filter.feature || u.feature === filter.feature) && (!filter.vendor || u.vendor === filter.vendor))
    .sort((a, b) => a.month.localeCompare(b.month) || b.costCents - a.costCents);
}

export function getAiSeatCharges(filter: { month?: MonthKey } = {}): AiSeatCharge[] {
  return aiSeatCharges
    .filter((s) => !filter.month || s.month === filter.month)
    .sort((a, b) => a.month.localeCompare(b.month) || b.costCents - a.costCents);
}

export const getAiFeatures = (): AiFeatureInfo[] => aiFeatures;

/** The AI budget for a month, if one was set (budgets start in August 2026). */
export const getAiBudget = (month: MonthKey): AiBudget | undefined => aiBudgets.find((b) => b.month === month);
