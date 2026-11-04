/**
 * How AI usage is billed.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Billing model of an AI usage row. */
export enum AiUsageKind {
  /** Billed per token by a model provider. */
  Api = "api",
  /** Self-hosted model on rented GPUs, billed per GPU hour. */
  Compute = "compute",
}
