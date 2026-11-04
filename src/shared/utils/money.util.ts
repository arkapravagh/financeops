/**
 * Money and number formatting. The only place amounts become strings (finance-domain rules).
 *
 * Inputs are integer cents; never build `"$" + n` by hand.
 */

const CURRENCY = "USD";
const LOCALE = "en-US";

const whole = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
const exact = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Display options for {@link formatMoney}. */
export type FormatMoneyOptions = {
  /** Show cents (default false). Use true in ledgers/tables of transactions. */
  cents?: boolean;
  /** Prefix positive values with "+" (for money-in rows). */
  signed?: boolean;
};

/** Format integer cents as currency, e.g. 123456 → "$1,235" or "$1,234.56". */
export function formatMoney(amountCents: number, opts: FormatMoneyOptions = {}): string {
  const value = amountCents / 100;
  const text = (opts.cents ? exact : whole).format(value);
  return opts.signed && amountCents > 0 ? `+${text}` : text;
}

/** Compact currency for tiles and axes, e.g. 233027000 → "$2.3M". */
export function formatCompact(amountCents: number): string {
  return compact.format(amountCents / 100);
}

/** Ratio → percent string, e.g. 0.0673 → "6.7%". */
export function formatPercent(ratio: number, digits = 0, signed = false): string {
  const text = `${(ratio * 100).toFixed(digits)}%`;
  return signed && ratio > 0 ? `+${text}` : text;
}

const compactCount = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

/** Large counts (tokens, requests), e.g. 1234567 → "1.2M". Not for money. */
export const formatCount = (n: number): string => compactCount.format(n);
