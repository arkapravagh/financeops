/**
 * Bank transaction settlement status.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Whether the bank has settled a transaction. */
export enum TransactionStatus {
  /** Settled by the bank. */
  Cleared = "cleared",
  /** Authorised but not yet settled. */
  Pending = "pending",
}
