/**
 * English labels for the Transactions page. Category and status names live in `enums.lang.ts`.
 */

/** Money-flow type of a transaction (the "Type" column). Keys are the column's raw values. */
export const flowLabels = {
  in: "Money in",
  out: "Money out",
  transfer: "Transfer",
} as const;

/** A transaction's flow type: a key of {@link flowLabels}. */
export type TransactionFlow = keyof typeof flowLabels;

/** Text on the Transactions page. */
export const transactionsLabels = {
  title: "Transactions",
  subtitle: "Every dollar in and out, auto-categorised from your bank feeds.",
  importCsv: "Import CSV",
  recategorize: "Recategorize",
  searchPlaceholder: "Search description or vendor",
  empty: "No transactions match these filters.",
  columns: {
    date: "Date",
    description: "Description",
    counterparty: "Counterparty",
    category: "Category",
    type: "Type",
    account: "Account",
    status: "Status",
    amount: "Amount",
  },
  rowCount: (count: number) => `${count} transactions`,
  /** Net of selected or listed rows; amount arrives formatted and signed. */
  net: (amount: string) => `Net ${amount}`,
  inOut: (inAmount: string, outAmount: string) => `In ${inAmount}, out ${outAmount}`,
} as const;
