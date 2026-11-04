/**
 * Budgets service: monthly budget vs. actual rows per expense category.
 *
 * Mock-backed today; when the API lands only this file changes.
 */

import { budgets } from "../data/budgets.data";
import { type ExpenseCategory } from "../enums/category.enum";
import type { Budget, MonthKey } from "../types/finance.types";

/** Months that have budgets, oldest first. */
export const getBudgetMonths = (): MonthKey[] => [...new Set(budgets.map((b) => b.month))].sort();

/** The latest month with budgets (the default view). */
export const getLatestBudgetMonth = (): MonthKey => getBudgetMonths().slice(-1)[0];

/** All category budgets for one month (defaults to the latest month with budgets). */
export const getBudgets = (month: MonthKey = getLatestBudgetMonth()): Budget[] =>
  budgets.filter((b) => b.month === month).sort((a, b) => b.budgetCents - a.budgetCents);

/** One category's budget rows up to and including `month`, oldest first. */
export const getBudgetHistory = (category: ExpenseCategory, upTo: MonthKey = getLatestBudgetMonth()): Budget[] =>
  budgets.filter((b) => b.category === category && b.month <= upTo).sort((a, b) => a.month.localeCompare(b.month));
