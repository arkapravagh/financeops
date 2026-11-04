import { costPerMillionTokensCents, costPerThousandRequestsCents, type AiUsageGroup } from "../../lib/metrics";
import { formatCount, formatMoney, formatPercent } from "../../lib/money";
import { Table, Td, Th } from "../ui/Table";

export type AiUsageView = "feature" | "model";

export type AiUsageTableProps = {
  view: AiUsageView;
  rows: AiUsageGroup[];
  /** Secondary line under each row name (feature description, or vendor + billing). */
  detailFor: (key: string) => string;
  /** Only shown in feature view: "Customers" or "Team". */
  audienceFor?: (key: string) => string;
};

/** Where the month's token spend goes, by feature or by model. Seats are listed separately. */
export function AiUsageTable({ view, rows, detailFor, audienceFor }: AiUsageTableProps) {
  const total = rows.reduce((a, r) => a + r.costCents, 0);
  const byFeature = view === "feature";
  const rate = (cents: number | null) => (cents === null ? "—" : formatMoney(cents, { cents: true }));

  return (
    <Table caption={byFeature ? "AI usage by feature" : "AI usage by model"}>
      <thead>
        <tr>
          <Th>{byFeature ? "Feature" : "Model"}</Th>
          {byFeature && <Th className="hidden lg:table-cell">Used by</Th>}
          <Th align="right" className="hidden md:table-cell">
            Requests
          </Th>
          <Th align="right">Tokens</Th>
          <Th align="right" className="hidden sm:table-cell">
            {byFeature ? "Per 1K requests" : "Per 1M tokens"}
          </Th>
          <Th align="right">Cost</Th>
          <Th className="hidden w-40 md:table-cell">Share</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const tokens = r.inputTokens + r.outputTokens;
          const share = total ? r.costCents / total : 0;
          return (
            <tr key={r.key}>
              <Td>
                <span className="block font-medium">{r.key}</span>
                <span className="block text-xs text-muted">{detailFor(r.key)}</span>
              </Td>
              {byFeature && <Td className="hidden text-ink-2 lg:table-cell">{audienceFor?.(r.key)}</Td>}
              <Td align="right" className="hidden text-ink-2 md:table-cell">
                {formatCount(r.requests)}
              </Td>
              <Td align="right" className="text-ink-2">
                <span title={`${formatCount(r.inputTokens)} in, ${formatCount(r.outputTokens)} out`}>{formatCount(tokens)}</span>
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
          <Td className="border-b-0 font-medium">Usage total</Td>
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
