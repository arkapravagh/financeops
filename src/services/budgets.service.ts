import { budgets } from "../data/budgets.data";
import type { Budget, ExpenseCategory, MonthKey } from "../types/finance.types";

/** Months that have budgets, oldest first. */
export const getBudgetMonths = (): MonthKey[] => [...new Set(budgets.map((b) => b.month))].sort();

/** The latest month with budgets (the default view). */
export const getLatestBudgetMonth = (): MonthKey => getBudgetMonths().slice(-1)[0];

export const getBudgets = (month: MonthKey = getLatestBudgetMonth()): Budget[] =>
  budgets.filter((b) => b.month === month).sort((a, b) => b.budgetCents - a.budgetCents);

/** One category's budget rows up to and including `month`, oldest first. */
export const getBudgetHistory = (category: ExpenseCategory, upTo: MonthKey = getLatestBudgetMonth()): Budget[] =>
  budgets.filter((b) => b.category === category && b.month <= upTo).sort((a, b) => a.month.localeCompare(b.month));
