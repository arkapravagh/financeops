/**
 * Transactions service: bank transactions with server-style filtering.
 *
 * The filter object mirrors the future API's query parameters, so pages won't change when it lands.
 */

import { transactions } from "../data/transactions.data";
import type { Category, MonthKey } from "../types/finance.types";

/** Query for {@link getTransactions}. Omitted fields (or "All"/"all") don't filter. */
export type TransactionFilter = {
  search?: string;
  category?: Category | "All";
  direction?: "all" | "in" | "out";
  accountId?: string | "all";
  /** `YYYY-MM` */
  month?: MonthKey;
};

/** Transactions matching every given filter, newest first. Search matches description and counterparty. */
export function getTransactions(filter: TransactionFilter = {}) {
  const q = filter.search?.trim().toLowerCase();
  return transactions
    .filter((t) => !filter.month || t.date.startsWith(filter.month))
    .filter((t) => !filter.category || filter.category === "All" || t.category === filter.category)
    .filter((t) => !filter.accountId || filter.accountId === "all" || t.accountId === filter.accountId)
    .filter((t) =>
      filter.direction === "in" ? t.amountCents > 0 : filter.direction === "out" ? t.amountCents < 0 : true,
    )
    .filter((t) => !q || `${t.description} ${t.counterparty}`.toLowerCase().includes(q))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

/** The `limit` most recent transactions (Overview widget). */
export const getRecentTransactions = (limit = 6) =>
  getTransactions().filter((t) => t.category !== "Transfer").slice(0, limit);
