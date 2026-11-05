/**
 * Mock data: workspace members and integration placeholders for the Settings page.
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import type { Integration, TeamMember } from "../types/finance.types";

/** Workspace members and their roles (fictional people). */
export const team = [
  { id: "usr_1", name: "Alex Rivera", email: "alex@brightloop.example", role: "Owner" },
  { id: "usr_2", name: "Priya Nair", email: "priya@brightloop.example", role: "Finance" },
  { id: "usr_3", name: "Sam Okafor", email: "sam@brightloop.example", role: "Viewer" },
] satisfies TeamMember[];

/** Bank, billing and accounting connections. Visual placeholders only in the prototype (security rules). */
export const integrations = [
  { id: "int_bank", name: "Bank feeds", purpose: "Sync balances and transactions from your banks", status: "connected" },
  { id: "int_stripe", name: "Stripe", purpose: "MRR, payouts and churn", status: "connected" },
  { id: "int_acct", name: "Accounting (QuickBooks / Xero)", purpose: "Two-way sync of your categorised ledger", status: "available" },
  { id: "int_payroll", name: "Payroll (Gusto / Rippling)", purpose: "Headcount and payroll cost by team", status: "available" },
  { id: "int_slack", name: "Slack alerts", purpose: "Weekly cash digest and overdue-invoice nudges", status: "available" },
] satisfies Integration[];
