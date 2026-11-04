/**
 * English labels for the Invoices page. Status names themselves live in `enums.lang.ts`.
 */

import { InvoiceStatus } from "../../enums/invoice-status.enum";

/** Text on the Invoices page: header, KPIs, table columns, quick views and actions. */
export const invoicesLabels = {
  title: "Invoices",
  subtitle: "Who owes you money, and who needs a nudge.",
  newInvoice: "New invoice",
  kpi: {
    outstanding: "Outstanding",
    outstandingContext: (open: number) => `across ${open} open invoices`,
    overdue: "Overdue",
    overdueContext: (count: number) => `${count} invoices past their due date`,
    collected: "Collected in the last 30 days",
    collectedContext: (count: number) => `${count} invoices paid`,
    timeToPay: "Average time to get paid",
    timeToPayValue: (days: number) => `${days} days`,
    timeToPayContext: "from invoice date to payment",
  },
  columns: {
    invoice: "Invoice",
    customer: "Customer",
    issued: "Issued",
    due: "Due",
    status: "Status",
    amount: "Amount",
    actions: "Actions",
  },
  rowCount: (count: number) => `${count} invoices`,
  daysLate: (days: number) => `${days} days late`,
  paidOn: (date: string) => `Paid ${date}`,
  /** Status filter wording: "Sent" reads as "Awaiting payment" when filtering. */
  statusFilter: {
    [InvoiceStatus.Overdue]: "Overdue",
    [InvoiceStatus.Sent]: "Awaiting payment",
    [InvoiceStatus.Paid]: "Paid",
    [InvoiceStatus.Draft]: "Draft",
  } satisfies Record<InvoiceStatus, string>,
  views: {
    all: "All",
    overdue: "Overdue",
    open: "Awaiting payment",
    paid: "Paid",
    drafts: "Drafts",
  },
  remind: "Remind",
  sendReminders: "Send reminders",
  searchPlaceholder: "Search invoice or customer",
  selectionTotal: (amount: string) => `Total ${amount}`,
  empty: "No invoices here.",
} as const;
