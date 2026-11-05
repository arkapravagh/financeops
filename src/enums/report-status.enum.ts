/**
 * Monthly report states.
 *
 * Values are stable ids (stored in data); English display text lives in `language/en/enums.lang.ts`.
 * Never render an enum value directly.
 */

/** Whether a month-end report can be downloaded yet. */
export enum ReportStatus {
  /** Books closed and the report published. */
  Ready = "ready",
  /** Month still open or books not yet reconciled. */
  InProgress = "in-progress",
}
