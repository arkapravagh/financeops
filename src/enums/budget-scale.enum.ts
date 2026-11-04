/**
 * Budget table scale.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Scale for budget bullet bars. */
export enum BudgetScale {
  /** Each row as % of its own budget. */
  Percent = "percent",
  /** Dollars on one shared axis. */
  Amount = "amount",
}
