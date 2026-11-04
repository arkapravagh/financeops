import { addMonths, formatMonthYear } from "../../lib/dates";
import type { ForecastPoint } from "../../lib/metrics";
import { formatCompact, formatMoney } from "../../lib/money";
import { downloadCsv, toCsv } from "../data-table/csv";
import type { ColumnDef } from "../data-table/types";

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
    { id: "month", header: "Month", accessor: monthOf },
    { id: "in", header: "Cash in", accessor: (p) => p.revenueCents, csv: (p) => dollars(p.revenueCents) },
    { id: "out", header: "Cash out", accessor: (p) => p.expenseCents, csv: (p) => dollars(p.expenseCents) },
    { id: "hiring", header: "Of which new hires", accessor: (p) => p.hiringCents, csv: (p) => dollars(p.hiringCents) },
    { id: "raise", header: "Raise", accessor: (p) => p.raiseCents, csv: (p) => dollars(p.raiseCents) },
    { id: "net", header: "Net", accessor: (p) => p.revenueCents - p.expenseCents + p.raiseCents, csv: (p) => dollars(p.revenueCents - p.expenseCents + p.raiseCents) },
    { id: "cash", header: "Ending cash", accessor: (p) => p.cashCents, csv: (p) => dollars(p.cashCents) },
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
          <caption className="sr-only">Projected monthly cash flow for {scenarioName}</caption>
          <thead>
            <tr>
              <th scope="col" className={`${th} text-left`}>Month</th>
              <th scope="col" className={`${th} text-right`}>Cash in</th>
              <th scope="col" className={`${th} text-right`}>Cash out</th>
              {hasHiring && <th scope="col" className={`${th} hidden text-right md:table-cell`}>Of which new hires</th>}
              {hasRaise && <th scope="col" className={`${th} text-right`}>Raise</th>}
              <th scope="col" className={`${th} text-right`}>Net</th>
              <th scope="col" className={`${th} text-right`}>Ending cash</th>
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
                    {isZero && <span className="ml-2 text-xs font-medium text-critical">Cash runs out</span>}
                    {p.raiseCents > 0 && <span className="ml-2 text-xs font-medium text-accent">Raise lands</span>}
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
