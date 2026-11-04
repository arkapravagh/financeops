/** Forecast verdict: the Forecast page hero (default alive or not, projected runway and key dates). */

import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { FORECAST_MONTHS } from "../../../services/forecast.service";
import { addMonths, formatMonthYear } from "../../../shared/utils/dates.util";
import { formatCompact, formatMoney } from "../../../shared/utils/money.util";
import type { ScenarioResult } from "../scenario.model";

/** Results for the scenario being edited and the current trajectory, plus the projection origin. */
export type ForecastVerdictProps = {
  result: ScenarioResult;
  current: ScenarioResult;
  isCurrent: boolean;
  origin: Date;
};

const runwayLabel = (r: number | null) => (r === null ? `${FORECAST_MONTHS}+` : r.toFixed(1));

/**
 * Forecast page signature element: the "default alive?" verdict and projected runway for the
 * scenario being edited, compared with the current trajectory.
 */
export function ForecastVerdict({ result, current, isCurrent, origin }: ForecastVerdictProps) {
  const { runway, alive, breakEven, zeroDate, raiseBy, cash12, peak, scenario } = result;
  const diff = !isCurrent && runway !== null && current.runway !== null ? runway - current.runway : null;
  const breakEvenDate = breakEven ? addMonths(origin, breakEven) : null;
  const raise = scenario.raise;

  return (
    <section className="@container min-w-0 rounded-[14px] border border-line bg-surface p-6" aria-labelledby="verdict-title">
      <div className="flex flex-col gap-6 @4xl:flex-row @4xl:items-start @4xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="verdict-title" className="text-[13px] text-muted">
              Projected runway, {isCurrent ? "current trajectory" : scenario.name}
            </h2>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                alive ? "bg-good/12 text-good-ink" : "bg-critical/10 text-critical"
              }`}
            >
              {alive ? <CheckCircle2 size={12} aria-hidden /> : <AlertTriangle size={12} aria-hidden />}
              {alive ? "Default alive" : "Default dead"}
            </span>
          </div>

          <p className="mt-1 flex flex-wrap items-baseline gap-x-3 leading-none text-ink">
            <span>
              <span className="text-[44px] font-semibold tracking-[-0.035em] @lg:text-[56px]">{runwayLabel(runway)}</span>
              <span className="ml-2 text-xl font-medium tracking-[-0.02em] text-ink-2 @lg:text-2xl">months</span>
            </span>
            {diff !== null && Math.abs(diff) >= 0.05 && (
              <span className={`inline-flex items-center gap-0.5 text-sm font-medium ${diff > 0 ? "text-good-ink" : "text-critical"}`}>
                {diff > 0 ? <ArrowUpRight size={15} aria-hidden /> : <ArrowDownRight size={15} aria-hidden />}
                {Math.abs(diff).toFixed(1)} months vs current trajectory
              </span>
            )}
          </p>

          <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-ink-2">
            {alive ? (
              <>
                Revenue overtakes spending around{" "}
                <span className="font-medium text-ink">{formatMonthYear(breakEvenDate as Date)}</span>, while there's still cash in the
                bank. You can reach profitability without new money{raise ? ", even before the planned raise" : ""}.
              </>
            ) : (
              <>
                At these growth rates, spending stays ahead of revenue
                {zeroDate ? (
                  <>
                    {" "}
                    and cash runs out around <span className="font-medium text-ink">{formatMonthYear(zeroDate)}</span>
                  </>
                ) : raise ? (
                  ", so the business depends on the planned raise"
                ) : null}
                . {raiseBy && !raise ? <>Start raising by <span className="font-medium text-ink">{formatMonthYear(raiseBy)}</span>, or cut spending.</> : null}
                {raise && (
                  <>
                    {" "}
                    The {formatCompact(raise.amountCents)} raise in {formatMonthYear(addMonths(origin, raise.month))}{" "}
                    {zeroDate ? "isn't enough on its own." : `carries you past ${FORECAST_MONTHS} months.`}
                  </>
                )}
              </>
            )}
          </p>
        </div>

        <dl className="grid w-full shrink-0 grid-cols-2 overflow-hidden rounded-xl border border-line bg-line gap-px @4xl:w-[22rem]">
          {[
            ["Zero-cash date", zeroDate ? formatMonthYear(zeroDate) : `Beyond ${FORECAST_MONTHS} months`],
            ["Start raising by", raiseBy ? formatMonthYear(raiseBy) : "Not needed"],
            ["Cash in 12 months", formatMoney(Math.max(cash12, 0))],
            ["Break-even month", breakEvenDate ? formatMonthYear(breakEvenDate) : `Beyond ${FORECAST_MONTHS} months`],
            ["Peak monthly burn", peak ? formatCompact(peak.cents) : "None"],
            ["Peak burn in", peak ? formatMonthYear(addMonths(origin, peak.index)) : "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface px-4 py-3">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
