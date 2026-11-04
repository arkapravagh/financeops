import { AlertCircle, CheckCircle2, PencilLine, Send } from "lucide-react";
import type { InvoiceStatus } from "../../../types/finance.types";
import { Badge, type BadgeTone } from "../../../shared/ui/badge.component";

const map: Record<InvoiceStatus, { tone: BadgeTone; label: string; Icon: typeof Send }> = {
  paid: { tone: "good", label: "Paid", Icon: CheckCircle2 },
  sent: { tone: "accent", label: "Sent", Icon: Send },
  overdue: { tone: "critical", label: "Overdue", Icon: AlertCircle },
  draft: { tone: "neutral", label: "Draft", Icon: PencilLine },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { tone, label, Icon } = map[status];
  return (
    <Badge tone={tone} icon={<Icon size={12} />}>
      {label}
    </Badge>
  );
}
