/** Invoice status badge: Draft, Sent, Paid or Overdue, always with an icon and text (never colour alone). */

import { AlertCircle, CheckCircle2, PencilLine, Send } from "lucide-react";
import { InvoiceStatus } from "../../../enums/invoice-status.enum";
import { invoiceStatusLabels } from "../../../language/en/enums.lang";
import { Badge, type BadgeTone } from "../../../shared/ui/badge.component";

/** Tone and icon per status; the text comes from `invoiceStatusLabels`. */
const look: Record<InvoiceStatus, { tone: BadgeTone; Icon: typeof Send }> = {
  [InvoiceStatus.Paid]: { tone: "good", Icon: CheckCircle2 },
  [InvoiceStatus.Sent]: { tone: "accent", Icon: Send },
  [InvoiceStatus.Overdue]: { tone: "critical", Icon: AlertCircle },
  [InvoiceStatus.Draft]: { tone: "neutral", Icon: PencilLine },
};

/** Badge for an invoice's display status (see `invoiceStatus()` in metrics.util). */
export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { tone, Icon } = look[status];
  return (
    <Badge tone={tone} icon={<Icon size={12} />}>
      {invoiceStatusLabels[status]}
    </Badge>
  );
}
