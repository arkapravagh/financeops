import { BellRing, Plus } from "lucide-react";
import { DataTable } from "../components/data-table/DataTable";
import type { ColumnDef, QuickView } from "../components/data-table/types";
import { InvoiceStatusBadge } from "../components/finance/InvoiceStatusBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { KpiRow } from "../components/ui/KpiRow";
import { daysBetween, formatDate, parseIso } from "../lib/dates";
import { averageDaysToPay, daysOverdue, invoiceStatus, receivablesCents, sumCents } from "../lib/metrics";
import { formatCompact, formatMoney } from "../lib/money";
import { AS_OF } from "../services/company";
import { getInvoices } from "../services/invoices";
import type { Invoice, InvoiceStatus } from "../types/finance";

type InvoiceRow = Invoice & { derived: InvoiceStatus };

const statusLabels: Record<InvoiceStatus, string> = {
  overdue: "Overdue",
  sent: "Awaiting payment",
  paid: "Paid",
  draft: "Draft",
};

const columns: ColumnDef<InvoiceRow>[] = [
  {
    id: "number",
    header: "Invoice",
    accessor: (i) => i.number,
    cell: (i) => <span className="font-medium whitespace-nowrap">{i.number}</span>,
    hideable: false,
    footer: (rows) => <span className="text-ink-2">{rows.length} invoices</span>,
  },
  { id: "customer", header: "Customer", accessor: (i) => i.customer, facet: true },
  {
    id: "issued",
    header: "Issued",
    accessor: (i) => i.issueDate,
    cell: (i) => <span className="whitespace-nowrap text-ink-2">{formatDate(i.issueDate)}</span>,
    className: "hidden md:table-cell",
  },
  {
    id: "due",
    header: "Due",
    accessor: (i) => i.dueDate,
    cell: (i) => (
      <div className="whitespace-nowrap">
        <div className="text-ink-2">{formatDate(i.dueDate)}</div>
        {i.derived === "overdue" && <div className="text-xs font-medium text-critical">{daysOverdue(i, AS_OF)} days late</div>}
        {i.derived === "paid" && i.paidDate && <div className="text-xs text-muted">Paid {formatDate(i.paidDate)}</div>}
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessor: (i) => i.derived,
    facet: true,
    facetLabel: (v) => statusLabels[v as InvoiceStatus] ?? v,
    facetOptions: ["overdue", "sent", "paid", "draft"],
    cell: (i) => <InvoiceStatusBadge status={i.derived} />,
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    accessor: (i) => i.amountCents,
    cell: (i) => <span className="font-medium">{formatMoney(i.amountCents, { cents: true })}</span>,
    csv: (i) => (i.amountCents / 100).toFixed(2),
    footer: (rows) => formatMoney(sumCents(rows.map((r) => r.amountCents)), { cents: true }),
  },
  {
    id: "actions",
    header: "Actions",
    align: "right",
    accessor: () => null,
    sortable: false,
    hideable: false,
    csv: false,
    cell: (i) =>
      i.derived === "overdue" ? (
        <Button variant="ghost" icon={<BellRing size={14} />} className="h-8" title="Not available in the prototype">
          Remind
        </Button>
      ) : null,
  },
];

const quickViews: QuickView[] = [
  { id: "all", label: "All", filters: {} },
  { id: "overdue", label: "Overdue", filters: { status: ["overdue"] } },
  { id: "open", label: "Awaiting payment", filters: { status: ["sent"] } },
  { id: "paid", label: "Paid", filters: { status: ["paid"] } },
  { id: "draft", label: "Drafts", filters: { status: ["draft"] } },
];

const getRowId = (i: InvoiceRow) => i.id;
const invoices = getInvoices();
const rows: InvoiceRow[] = invoices.map((inv) => ({ ...inv, derived: invoiceStatus(inv, AS_OF) }));

export function InvoicesPage() {
  const ar = receivablesCents(invoices);
  const overdue = rows.filter((i) => i.derived === "overdue");
  const openCount = rows.filter((i) => i.derived === "sent" || i.derived === "overdue").length;
  const paidRecently = rows.filter((i) => i.status === "paid" && i.paidDate && daysBetween(parseIso(i.paidDate), AS_OF) <= 30);
  const dtp = averageDaysToPay(invoices);

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Who owes you money, and who needs a nudge."
        actions={
          <Button variant="primary" icon={<Plus size={16} />} title="Not available in the prototype">
            New invoice
          </Button>
        }
      />

      <KpiRow
        items={[
          { label: "Outstanding", value: formatCompact(ar), context: `across ${openCount} open invoices` },
          {
            label: "Overdue",
            value: formatCompact(sumCents(overdue.map((i) => i.amountCents))),
            context: <span className="text-critical">{overdue.length} invoices past their due date</span>,
          },
          {
            label: "Collected in the last 30 days",
            value: formatCompact(sumCents(paidRecently.map((i) => i.amountCents))),
            context: `${paidRecently.length} invoices paid`,
          },
          { label: "Average time to get paid", value: dtp === null ? "—" : `${dtp} days`, context: "from invoice date to payment" },
        ]}
      />

      <Card className="mt-5" flush>
        <DataTable
          data={rows}
          columns={columns}
          getRowId={getRowId}
          caption="Invoices"
          searchPlaceholder="Search invoice or customer"
          initialSort={{ id: "issued", desc: true }}
          quickViews={quickViews}
          selectable
          selectionSummary={(sel) => `Total ${formatMoney(sumCents(sel.map((r) => r.amountCents)))}`}
          bulkActions={(sel) =>
            sel.some((r) => r.derived === "overdue") ? (
              <Button className="h-8" icon={<BellRing size={14} />} title="Not available in the prototype">
                Send reminders
              </Button>
            ) : null
          }
          exportFileName="invoices"
          emptyMessage="No invoices here."
        />
      </Card>
    </>
  );
}
