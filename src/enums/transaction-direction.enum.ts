/**
 * Transaction direction filter.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Filter transactions by money in, money out, or both. */
export enum TransactionDirection {
  /** Both directions. */
  All = "all",
  /** Money in (positive amounts). */
  In = "in",
  /** Money out (negative amounts). */
  Out = "out",
}
