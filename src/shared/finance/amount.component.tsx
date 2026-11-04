import { formatMoney } from "../utils/money.util";

export type AmountProps = {
  cents: number;
  /** Show cents (ledger view). */
  exact?: boolean;
};

/** Signed amount: money in gets "+" and success ink; money out stays primary ink. */
export function Amount({ cents, exact = true }: AmountProps) {
  return (
    <span className={`font-medium tabular-nums ${cents > 0 ? "text-good-ink" : "text-ink"}`}>
      {formatMoney(cents, { cents: exact, signed: true })}
    </span>
  );
}
