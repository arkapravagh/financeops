import { accounts } from "../data/accounts.data";
import { upcomingBills } from "../data/bills.data";
import { monthlyFlows, OPENING_BALANCE_CENTS } from "../data/flows.data";
import { cashHistory } from "../shared/utils/metrics.util";
import type { MonthKey } from "../types/finance.types";

export const getAccounts = () => accounts;

export const getMonthlyFlows = (filter: { from?: MonthKey; to?: MonthKey } = {}) =>
  monthlyFlows.filter((f) => (!filter.from || f.month >= filter.from) && (!filter.to || f.month <= filter.to));

export const getCashHistory = () => cashHistory(OPENING_BALANCE_CENTS, monthlyFlows);

export const getUpcomingBills = () => [...upcomingBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
