/**
 * English labels shared across the app: generic actions, states and chart words.
 *
 * Language files hold only display text. Functions receive values that are already formatted
 * (money via `money.util`, dates via `dates.util`), so a translation never re-implements formatting.
 */

/** Generic UI text used by shared components and several features. */
export const commonLabels = {
  close: "Close",
  cancel: "Cancel",
  delete: "Delete",
  confirmDelete: "Click again to delete",
  exportCsv: "Export CSV",
  keyFigures: "Key figures",
  /** Marks projected (not actual) values on charts and tooltips. */
  projected: "Projected",
  notAvailableTitle: "Not available in the prototype",
  /** Screen-reader suffix on placeholder buttons, e.g. "Export (coming soon)". */
  comingSoon: " (coming soon)",
  /** "12 months" style durations. `n` is pre-formatted (e.g. "14.2"). */
  months: (n: string) => `${n} months`,
  /** Short duration for tables, e.g. "14.2 mo". */
  monthsShort: (n: string) => `${n} mo`,
} as const;
