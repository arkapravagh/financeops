/** AI usage table: the month's token and GPU spend grouped by feature or by model. */

import { AiUsageView } from "../../../enums/ai-usage-view.enum";
import { aiUsageTableLabels as L } from "../../../language/en/ai-spend.lang";
import { Table, Td, Th } from "../../../shared/ui/table.component";
import { costPerMillionTokensCents, costPerThousandRequestsCents, type AiUsageGroup } from "../../../shared/utils/metrics.util";
import { formatCount, formatMoney, formatPercent } from "../../../shared/utils/money.util";

/** Grouped rows, the view, and lookups for row detail and whether a feature is customer-facing. */
export type AiUsageTableProps = {
  view: AiUsageView;
  rows: AiUsageGroup[];
  /** Display name for a row's group key (feature label in feature view, model name in model view). */
  nameFor: (key: string) => string;
  /** Secondary line under each row name (feature description, or vendor + billing). */
  detailFor: (key: string) => string;
  /** Only shown in feature view: "Customers" or "Team". */
  audienceFor?: (key: string) => string;
};

/** Where the month's token spend goes, by feature or by model. Seats are listed separately. */
export function AiUsageTable({ view, rows, nameFor, detailFor, audienceFor }: AiUsageTableProps) {
  const total = rows.reduce((a, r) => a + r.costCents, 0);
  const byFeature = view === AiUsageView.Feature;
  const rate = (cents: number | null) => (cents === null ? "—" : formatMoney(cents, { cents: true }));

  return (
    <Table caption={byFeature ? L.captionByFeature : L.captionByModel}>
      <thead>
        <tr>
          <Th>{byFeature ? L.feature : L.model}</Th>
          {byFeature && <Th className="hidden lg:table-cell">{L.usedBy}</Th>}
          <Th align="right" className="hidden md:table-cell">
            {L.requests}
          </Th>
          <Th align="right">{L.tokens}</Th>
          <Th align="right" className="hidden sm:table-cell">
            {byFeature ? L.perThousandRequests : L.perMillionTokens}
          </Th>
          <Th align="right">{L.cost}</Th>
          <Th className="hidden w-40 md:table-cell">{L.share}</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const tokens = r.inputTokens + r.outputTokens;
          const share = total ? r.costCents / total : 0;
          return (
            <tr key={r.key}>
              <Td>
                <span className="block font-medium">{nameFor(r.key)}</span>
                <span className="block text-xs text-muted">{detailFor(r.key)}</span>
              </Td>
              {byFeature && <Td className="hidden text-ink-2 lg:table-cell">{audienceFor?.(r.key)}</Td>}
              <Td align="right" className="hidden text-ink-2 md:table-cell">
                {formatCount(r.requests)}
              </Td>
              <Td align="right" className="text-ink-2">
                <span title={L.tokenSplit(formatCount(r.inputTokens), formatCount(r.outputTokens))}>{formatCount(tokens)}</span>
              </Td>
              <Td align="right" className="hidden text-ink-2 sm:table-cell">
                {byFeature
                  ? rate(costPerThousandRequestsCents(r.costCents, r.requests))
                  : rate(costPerMillionTokensCents(r.costCents, tokens))}
              </Td>
              <Td align="right" className="font-medium">
                {formatMoney(r.costCents)}
              </Td>
              <Td className="hidden md:table-cell">
                <span className="flex items-center gap-2">
                  <span className="h-2 flex-1 rounded-full bg-surface-2" aria-hidden>
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(share * 100, 1)}%` }} />
                  </span>
                  <span className="w-9 text-right text-xs text-ink-2 tabular-nums">{formatPercent(share)}</span>
                </span>
              </Td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <Td className="border-b-0 font-medium">{L.total}</Td>
          {byFeature && <Td className="hidden border-b-0 lg:table-cell" />}
          <Td align="right" className="hidden border-b-0 text-ink-2 md:table-cell">
            {formatCount(rows.reduce((a, r) => a + r.requests, 0))}
          </Td>
          <Td align="right" className="border-b-0 text-ink-2">
            {formatCount(rows.reduce((a, r) => a + r.inputTokens + r.outputTokens, 0))}
          </Td>
          <Td className="hidden border-b-0 sm:table-cell" />
          <Td align="right" className="border-b-0 font-semibold">
            {formatMoney(total)}
          </Td>
          <Td className="hidden border-b-0 md:table-cell" />
        </tr>
      </tfoot>
    </Table>
  );
}
