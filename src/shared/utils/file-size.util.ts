/**
 * File size formatting for download buttons and file lists.
 *
 * Pure and locale-aware (Intl unit formatting); format only at render time, like money.
 */

const kb = new Intl.NumberFormat("en-US", { style: "unit", unit: "kilobyte", maximumFractionDigits: 0 });
const mb = new Intl.NumberFormat("en-US", { style: "unit", unit: "megabyte", maximumFractionDigits: 1 });

/** Bytes → "55 kB" / "1.2 MB" (decimal units, as operating systems show downloads). Minimum shown is 1 kB. */
export function formatFileSize(bytes: number): string {
  return bytes >= 1_000_000 ? mb.format(bytes / 1_000_000) : kb.format(Math.max(1, Math.round(bytes / 1_000)));
}
