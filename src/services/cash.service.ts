/**
 * Cash service: bank accounts, monthly cash flows, cash history and upcoming bills.
 *
 * Mock-backed today; when the API lands only this file changes.
 */

import { accounts } from "../data/accounts.data";
import { upcomingBills } from "../data/bills.data";
import { monthlyFlows, OPENING_BALANCE_CENTS } from "../data/flows.data";
import { cashHistory } from "../shared/utils/metrics.util";
import type { MonthKey } from "../types/finance.types";

/** All bank accounts with their current balances. */
export const getAccounts = () => accounts;

/** Monthly cash in/out totals, optionally limited to a `from`/`to` month range (inclusive). */
export const getMonthlyFlows = (filter: { from?: MonthKey; to?: MonthKey } = {}) =>
  monthlyFlows.filter((f) => (!filter.from || f.month >= filter.from) && (!filter.to || f.month <= filter.to));

/** Month-end cash balance for every month of flows, oldest first. */
export const getCashHistory = () => cashHistory(OPENING_BALANCE_CENTS, monthlyFlows);

/** Upcoming bills, soonest due first. */
export const getUpcomingBills = () => [...upcomingBills].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
