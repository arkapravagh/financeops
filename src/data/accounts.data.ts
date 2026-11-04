/**
 * Mock data: the company's bank accounts and their balances.
 *
 * Static and deterministic (no clock, no randomness), anchored to `AS_OF` in company.service.ts.
 * Never import this file from a page or component; read it through `services/` (data-and-mocks rules).
 */

import { AccountKind } from "../enums/account-kind.enum";
import type { BankAccount } from "../types/finance.types";

/** Balances as of AS_OF (end of October; November activity is still pending). */
export const accounts = [
  { id: "acc_op", name: "Operating", institution: "Northbank", mask: "4821", kind: AccountKind.Checking, balanceCents: 1_312_270_00 },
  { id: "acc_pay", name: "Payroll reserve", institution: "Northbank", mask: "9013", kind: AccountKind.Savings, balanceCents: 168_000_00 },
  { id: "acc_tre", name: "Treasury (T-bills)", institution: "Harbor Treasury", mask: "7720", kind: AccountKind.Treasury, balanceCents: 850_000_00 },
] satisfies BankAccount[];
