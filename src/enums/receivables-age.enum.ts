/**
 * Receivables ageing buckets.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** How late an unpaid sent invoice is, in buckets used by the "Who owes you" breakdown. */
export enum ReceivablesAge {
  /** Not yet past its due date. */
  Current = "current",
  /** 1 to 30 days past due. */
  Late1To30 = "late-1-30",
  /** 31 to 60 days past due. */
  Late31To60 = "late-31-60",
  /** More than 60 days past due. */
  Late60Plus = "late-60-plus",
}
