import type { BankAccount } from "../types/finance";

/** Balances as of AS_OF (end of October; November activity is still pending). */
export const accounts = [
  { id: "acc_op", name: "Operating", institution: "Northbank", mask: "4821", kind: "checking", balanceCents: 1_312_270_00 },
  { id: "acc_pay", name: "Payroll reserve", institution: "Northbank", mask: "9013", kind: "savings", balanceCents: 168_000_00 },
  { id: "acc_tre", name: "Treasury (T-bills)", institution: "Harbor Treasury", mask: "7720", kind: "treasury", balanceCents: 850_000_00 },
] satisfies BankAccount[];
