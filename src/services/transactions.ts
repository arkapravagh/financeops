import { transactions } from "../data/transactions";
import type { Category, MonthKey } from "../types/finance";

export type TransactionFilter = {
  search?: string;
  category?: Category | "All";
  direction?: "all" | "in" | "out";
  accountId?: string | "all";
  /** `YYYY-MM` */
  month?: MonthKey;
};

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

export const getRecentTransactions = (limit = 6) =>
  getTransactions().filter((t) => t.category !== "Transfer").slice(0, limit);
