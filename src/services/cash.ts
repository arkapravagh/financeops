import { accounts } from "../data/accounts";
import { upcomingBills } from "../data/bills";
import { monthlyFlows, OPENING_BALANCE_CENTS } from "../data/flows";
import { cashHistory } from "../lib/metrics";
import type { MonthKey } from "../types/finance";

export const getAccounts = () => accounts;

export const getMonthlyFlows = (filter: { from?: MonthKey; to?: MonthKey } = {}) =>
  monthlyFlows.filter((f) => (!filter.from || f.month >= filter.from) && (!filter.to || f.month <= filter.to));

export const getCashHistory = () => cashHistory(OPENING_BALANCE_CENTS, monthlyFlows);

export const getUpcomingBills = () => [...upcomingBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
