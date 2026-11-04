/**
 * Data table row density.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Row height of a data table. */
export enum TableDensity {
  /** Default row height. */
  Comfortable = "comfortable",
  /** Tighter rows for long lists. */
  Compact = "compact",
}
