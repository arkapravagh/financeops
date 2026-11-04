/**
 * Bank account types.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** What a bank account is used for. */
export enum AccountKind {
  /** Day-to-day operating account. */
  Checking = "checking",
  /** Reserve account. */
  Savings = "savings",
  /** Money-market or treasury bills holding idle cash. */
  Treasury = "treasury",
}
