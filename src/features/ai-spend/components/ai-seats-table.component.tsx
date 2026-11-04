/** AI seats table: per-seat AI tools, seats used vs. bought, and the cost of unused seats. */

import { CircleCheck, CircleAlert } from "lucide-react";
import { aiSeatsTableLabels as L } from "../../../language/en/ai-spend.lang";
import { Badge } from "../../../shared/ui/badge.component";
import { Table, Td, Th } from "../../../shared/ui/table.component";
import { idleSeatCostCents } from "../../../shared/utils/metrics.util";
import { formatMoney } from "../../../shared/utils/money.util";
import type { AiSeatCharge } from "../../../types/finance.types";

/** Seat charges for the selected month. */
export type AiSeatsTableProps = { seats: AiSeatCharge[] };

/** Per-seat AI tools with how many seats were actually used. Status is icon + text, never colour alone. */
export function AiSeatsTable({ seats }: AiSeatsTableProps) {
  return (
    <Table caption={L.caption}>
      <thead>
        <tr>
          <Th>{L.tool}</Th>
          <Th align="right">{L.seatsUsed}</Th>
          <Th align="right">{L.cost}</Th>
          <Th align="right">{L.unusedSeats}</Th>
        </tr>
      </thead>
      <tbody>
        {seats.map((s) => {
          const unused = s.seats - s.activeSeats;
          const idle = idleSeatCostCents(s);
          return (
            <tr key={s.id}>
              <Td>
                <span className="block font-medium">{s.product}</span>
                <span className="block text-xs text-muted">{s.vendor}</span>
              </Td>
              <Td align="right" className="text-ink-2">
                {L.usedOf(s.activeSeats, s.seats)}
              </Td>
              <Td align="right" className="font-medium">
                {formatMoney(s.costCents)}
              </Td>
              <Td align="right">
                {unused > 0 ? (
                  <Badge tone="warning" icon={<CircleAlert size={12} />}>
                    {L.unused(unused, formatMoney(idle))}
                  </Badge>
                ) : (
                  <Badge tone="good" icon={<CircleCheck size={12} />}>
                    {L.allInUse}
                  </Badge>
                )}
              </Td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
