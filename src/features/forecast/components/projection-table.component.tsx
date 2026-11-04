/** Projection table and CSV export for the month-by-month forecast. */

import { projectionTableLabels as L } from "../../../language/en/forecast.lang";
import { downloadCsv, toCsv } from "../../../shared/data-table/csv.util";
import { addMonths, formatMonthYear } from "../../../shared/utils/dates.util";
import { formatCompact, formatMoney } from "../../../shared/utils/money.util";
import type { ColumnDef } from "../../../types/data-table.types";
import type { ForecastPoint } from "../../../types/forecast.types";

/** Projected months to show, the origin (for month labels) and the scenario name. */
export type ProjectionTableProps = {
  points: ForecastPoint[];
  origin: Date;
  scenarioName: string;
};

const dollars = (c: number) => (c / 100).toFixed(2);

/** Download the projection as CSV (dollars, 2 decimals). Wire to a button in the card header. */
export function exportProjectionCsv(points: ForecastPoint[], origin: Date, scenarioName: string) {
  const monthOf = (p: ForecastPoint) => formatMonthYear(addMonths(origin, p.index));
  const csvColumns: ColumnDef<ForecastPoint>[] = [
    { id: "month", header: L.month, accessor: monthOf },
    { id: "in", header: L.cashIn, accessor: (p) => p.revenueCents, csv: (p) => dollars(p.revenueCents) },
    { id: "out", header: L.cashOut, accessor: (p) => p.expenseCents, csv: (p) => dollars(p.expenseCents) },
    { id: "hiring", header: L.newHires, accessor: (p) => p.hiringCents, csv: (p) => dollars(p.hiringCents) },
    { id: "raise", header: L.raise, accessor: (p) => p.raiseCents, csv: (p) => dollars(p.raiseCents) },
    { id: "net", header: L.net, accessor: (p) => p.revenueCents - p.expenseCents + p.raiseCents, csv: (p) => dollars(p.revenueCents - p.expenseCents + p.raiseCents) },
    { id: "cash", header: L.endingCash, accessor: (p) => p.cashCents, csv: (p) => dollars(p.cashCents) },
  ];
  downloadCsv(`forecast-${scenarioName.toLowerCase().replace(/\W+/g, "-")}`, toCsv(points, csvColumns));
}

/** Month-by-month projection for the chosen horizon. */
export function ProjectionTable({ points, origin, scenarioName }: ProjectionTableProps) {
  const monthOf = (p: ForecastPoint) => formatMonthYear(addMonths(origin, p.index));
  const zeroIdx = points.find((p) => p.cashCents < 0)?.index ?? null;
  const hasHiring = points.some((p) => p.hiringCents > 0);
  const hasRaise = points.some((p) => p.raiseCents > 0);

  const th = "sticky top-0 z-10 bg-surface px-5 py-2.5 text-xs font-medium whitespace-nowrap text-muted shadow-[inset_0_-1px_0_var(--line)]";
  const td = "border-b border-line px-5 py-2.5 tabular-nums";

  return (
    <div>
      <div className="max-h-[28rem] overflow-auto border-t border-line">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{L.caption(scenarioName)}</caption>
          <thead>
            <tr>
              <th scope="col" className={`${th} text-left`}>{L.month}</th>
              <th scope="col" className={`${th} text-right`}>{L.cashIn}</th>
              <th scope="col" className={`${th} text-right`}>{L.cashOut}</th>
              {hasHiring && <th scope="col" className={`${th} hidden text-right md:table-cell`}>{L.newHires}</th>}
              {hasRaise && <th scope="col" className={`${th} text-right`}>{L.raise}</th>}
              <th scope="col" className={`${th} text-right`}>{L.net}</th>
              <th scope="col" className={`${th} text-right`}>{L.endingCash}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => {
              const net = p.revenueCents - p.expenseCents + p.raiseCents;
              const isZero = p.index === zeroIdx;
              const negative = p.cashCents < 0;
              return (
                <tr key={p.index} className={isZero ? "bg-critical/6" : p.raiseCents ? "bg-accent-soft/60" : ""}>
                  <td className={`${td} whitespace-nowrap text-ink`}>
                    {monthOf(p)}
                    {isZero && <span className="ml-2 text-xs font-medium text-critical">{L.runsOut}</span>}
                    {p.raiseCents > 0 && <span className="ml-2 text-xs font-medium text-accent">{L.raiseLands}</span>}
                  </td>
                  <td className={`${td} text-right text-ink`}>{formatMoney(p.revenueCents)}</td>
                  <td className={`${td} text-right text-ink`}>{formatMoney(p.expenseCents)}</td>
                  {hasHiring && <td className={`${td} hidden text-right text-ink-2 md:table-cell`}>{p.hiringCents ? formatMoney(p.hiringCents) : "—"}</td>}
                  {hasRaise && <td className={`${td} text-right text-ink`}>{p.raiseCents ? formatCompact(p.raiseCents) : "—"}</td>}
                  <td className={`${td} text-right ${net >= 0 ? "text-good-ink" : "text-ink"}`}>{formatMoney(net, { signed: true })}</td>
                  <td className={`${td} text-right font-medium ${negative ? "text-critical" : "text-ink"}`}>{formatMoney(p.cashCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
