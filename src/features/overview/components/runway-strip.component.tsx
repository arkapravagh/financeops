/**
 * Runway strip: the Overview's hero, showing cash, runway and the zero-cash and start-raising dates on one line.
 */

import { addMonths, formatMonthYear, toMonthKey } from "../../../shared/utils/dates.util";
import { formatCompact, formatMoney } from "../../../shared/utils/money.util";
import type { BankAccount } from "../../../types/finance.types";

/** Cash, runway (null = default alive), average burn, accounts and `asOf` ("today"). */
export type RunwayStripProps = {
  runwayMonths: number | null;
  cashCents: number;
  avgNetBurnCents: number;
  accounts: BankAccount[];
  asOf: Date;
  /** Months before zero cash to start a raise (rounds take ~6–9 months). */
  raiseLeadMonths?: number;
};

const shortMonth = new Intl.DateTimeFormat("en-US", { month: "short" });

/**
 * The Overview's signature element (design-system: one bold element per page):
 * runway as a literal horizon — today → start-raising → zero cash.
 */
export function RunwayStrip({ runwayMonths, cashCents, avgNetBurnCents, accounts, asOf, raiseLeadMonths = 9 }: RunwayStripProps) {
  const alive = runwayMonths === null;
  const runway = runwayMonths ?? 0;
  const horizon = alive ? 24 : Math.max(24, Math.ceil(runway / 3) * 3 + 3);
  const raiseAt = alive ? 0 : Math.max(0, runway - raiseLeadMonths);
  const pct = (m: number) => `${(Math.min(m, horizon) / horizon) * 100}%`;
  const zeroDate = alive ? null : addMonths(asOf, runway);
  const raiseDate = alive ? null : addMonths(asOf, raiseAt);

  const ticks = Array.from({ length: horizon / 3 + 1 }, (_, k) => k * 3);
  const tickLabel = (m: number) => {
    const d = addMonths(asOf, m);
    const yy = toMonthKey(d).slice(2, 4);
    return m === 0 ? "Today" : `${shortMonth.format(d)} ’${yy}`;
  };

  return (
    <section className="@container min-w-0 rounded-[14px] border border-line bg-surface p-6" aria-labelledby="runway-title">
      <div className="flex flex-col gap-6 @3xl:flex-row @3xl:items-end @3xl:justify-between">
        <div className="min-w-0">
          <h2 id="runway-title" className="text-[13px] text-muted">
            Runway at current burn
          </h2>
          {alive ? (
            <p className="mt-1 text-[56px] leading-none font-semibold tracking-[-0.035em] text-ink">Profitable</p>
          ) : (
            <p className="mt-1 leading-none text-ink">
              <span className="text-[56px] font-semibold tracking-[-0.035em]">{runway.toFixed(1)}</span>
              <span className="ml-2 text-2xl font-medium tracking-[-0.02em] text-ink-2">months</span>
            </p>
          )}
          <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-ink-2">
            {alive ? (
              "Revenue covers spending, so there's no runway clock."
            ) : (
              <>
                Cash lasts until about <span className="font-medium text-ink">{formatMonthYear(zeroDate as Date)}</span>. Start
                raising by <span className="font-medium text-ink">{formatMonthYear(raiseDate as Date)}</span> to leave time to close.
              </>
            )}
          </p>
        </div>

        <dl className="grid shrink-0 grid-cols-2 gap-x-10 gap-y-1">
          <dt className="text-[13px] text-muted">Cash in the bank</dt>
          <dt className="text-[13px] text-muted">Net burn</dt>
          <dd className="text-xl font-semibold tracking-[-0.015em] text-ink">{formatMoney(cashCents)}</dd>
          <dd className="text-xl font-semibold tracking-[-0.015em] text-ink">
            {formatCompact(avgNetBurnCents)}
            <span className="text-sm font-normal text-ink-2">/mo</span>
          </dd>
          <dd className="col-span-2 mt-1.5">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              {accounts.map((a) => (
                <li key={a.id}>
                  {a.name} <span className="text-ink-2">{formatCompact(a.balanceCents)}</span>
                </li>
              ))}
            </ul>
          </dd>
        </dl>
      </div>

      {/* Horizon track */}
      {!alive && (
        <div className="mt-9" role="img" aria-label={`Runway timeline: today, start raising ${formatMonthYear(raiseDate as Date)}, zero cash ${formatMonthYear(zeroDate as Date)}.`}>
          <div className="relative h-5">
            {/* marker labels above the track */}
            <span
              className="absolute bottom-0 -translate-x-1/2 text-xs font-medium whitespace-nowrap text-ink"
              style={{ left: pct(raiseAt) }}
              aria-hidden
            >
              Start raising
            </span>
            <span
              className="absolute bottom-0 -translate-x-1/2 text-xs font-medium whitespace-nowrap text-ink"
              style={{ left: pct(runway) }}
              aria-hidden
            >
              Zero cash
            </span>
          </div>

          <div className="relative mt-2 h-3" aria-hidden>
            <div className="absolute inset-0 rounded-full bg-surface-2" />
            {/* before raising */}
            <div className="absolute inset-y-0 left-0 rounded-l-full bg-accent" style={{ width: pct(raiseAt) }} />
            {/* fundraising window (2px surface gap before it) */}
            <div
              className="absolute inset-y-0 rounded-r-full bg-accent/35"
              style={{ left: `calc(${pct(raiseAt)} + 2px)`, width: `calc(${pct(runway)} - ${pct(raiseAt)} - 2px)` }}
            />
            {/* markers */}
            {[raiseAt, runway].map((m) => (
              <span
                key={m}
                className="absolute -top-1.5 -bottom-1.5 w-[3px] -translate-x-1/2 rounded-full bg-ink ring-2 ring-surface"
                style={{ left: pct(m) }}
              />
            ))}
            <span className="absolute top-1/2 left-0 size-3 -translate-y-1/2 rounded-full bg-accent ring-2 ring-surface" />
          </div>

          {/* axis */}
          <div className="relative mt-2.5 h-4" aria-hidden>
            {ticks.map((m, i) => (
              <span
                key={m}
                className={`absolute text-[11px] whitespace-nowrap text-muted tabular-nums ${
                  i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"
                } ${i % 2 === 1 ? "hidden @3xl:inline" : ""}`}
                style={{ left: pct(m) }}
              >
                {tickLabel(m)}
              </span>
            ))}
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-2" aria-hidden>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-accent" /> Runway before you need to raise
            </li>
            <li className="inline-flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full bg-accent/35" /> Fundraising window ({raiseLeadMonths} months)
            </li>
          </ul>
        </div>
      )}
    </section>
  );
}
