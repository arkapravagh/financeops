import type { IsoDate, MonthKey } from "../types/finance";

/** Parse `YYYY-MM-DD` as a local calendar date (no timezone drift). */
export function parseIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d ?? 1);
}

export function toMonthKey(date: Date): MonthKey {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonths(date: Date, months: number): Date {
  const whole = Math.floor(months);
  const d = new Date(date.getFullYear(), date.getMonth() + whole, date.getDate());
  const fraction = months - whole;
  if (fraction > 0) d.setDate(d.getDate() + Math.round(fraction * 30.4));
  return d;
}

export function monthKeyAdd(key: MonthKey, months: number): MonthKey {
  return toMonthKey(addMonths(parseIso(`${key}-01`), months));
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" });
const longMonth = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const full = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** "2026-10" → "Oct" */
export const formatMonthShort = (key: MonthKey) => shortMonth.format(parseIso(`${key}-01`));
/** "2026-10" → "October 2026" */
export const formatMonthLong = (key: MonthKey) => longMonth.format(parseIso(`${key}-01`));
/** Date → "May 2028" */
export const formatMonthYear = (date: Date) => monthYear.format(date);
/** "2026-10-28" → "Oct 28" */
export const formatDayMonth = (iso: IsoDate) => dayMonth.format(parseIso(iso));
/** "2026-10-28" → "Oct 28, 2026" */
export const formatDate = (d: IsoDate | Date) => full.format(typeof d === "string" ? parseIso(d) : d);
