/**
 * Invoice statuses.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Status shown in the UI. Draft, Sent and Paid are stored; Overdue is derived (sent and past its due date). */
export enum InvoiceStatus {
  /** Not yet sent to the customer; excluded from receivables. */
  Draft = "draft",
  /** Sent and awaiting payment, not yet due. */
  Sent = "sent",
  /** Paid in full. */
  Paid = "paid",
  /** Sent and past its due date. Derived by `invoiceStatus()`, never stored. */
  Overdue = "overdue",
}

/** Statuses that are stored on an invoice (Overdue is computed at read time). */
export type InvoiceStoredStatus = Exclude<InvoiceStatus, InvoiceStatus.Overdue>;
