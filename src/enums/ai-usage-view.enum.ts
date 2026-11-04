/**
 * AI usage table grouping.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** How the AI usage table groups its rows. */
export enum AiUsageView {
  /** One row per AI feature. */
  Feature = "feature",
  /** One row per model. */
  Model = "model",
}
