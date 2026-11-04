import { CircleCheck, CircleAlert } from "lucide-react";
import { idleSeatCostCents } from "../../lib/metrics";
import { formatMoney } from "../../lib/money";
import type { AiSeatCharge } from "../../types/finance";
import { Badge } from "../ui/Badge";
import { Table, Td, Th } from "../ui/Table";

export type AiSeatsTableProps = { seats: AiSeatCharge[] };

/** Per-seat AI tools with how many seats were actually used. Status is icon + text, never colour alone. */
export function AiSeatsTable({ seats }: AiSeatsTableProps) {
  return (
    <Table caption="Team AI tools">
      <thead>
        <tr>
          <Th>Tool</Th>
          <Th align="right">Seats used</Th>
          <Th align="right">Cost</Th>
          <Th align="right">Unused seats</Th>
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
                {s.activeSeats} of {s.seats}
              </Td>
              <Td align="right" className="font-medium">
                {formatMoney(s.costCents)}
              </Td>
              <Td align="right">
                {unused > 0 ? (
                  <Badge tone="warning" icon={<CircleAlert size={12} />}>
                    {unused} unused, {formatMoney(idle)}
                  </Badge>
                ) : (
                  <Badge tone="good" icon={<CircleCheck size={12} />}>
                    All in use
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
