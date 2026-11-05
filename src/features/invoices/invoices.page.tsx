/**
 * Invoices: who owes the company money, and who needs a nudge.
 *
 * Route: `/invoices`. Sections: receivables KPIs (outstanding, overdue, collected), status quick views, DataTable of invoices.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { BellRing, Plus } from "lucide-react";
import { InvoiceStatus } from "../../enums/invoice-status.enum";
import { invoicesLabels as L } from "../../language/en/invoices.lang";
import { AS_OF } from "../../services/company.service";
import { getInvoices } from "../../services/invoices.service";
import { DataTable } from "../../shared/data-table/data-table.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { KpiRow } from "../../shared/ui/kpi-row.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { daysBetween, formatDate, parseIso } from "../../shared/utils/dates.util";
import { averageDaysToPay, daysOverdue, invoiceStatus, receivablesCents, sumCents } from "../../shared/utils/metrics.util";
import { centsToDecimal, formatCompact, formatMoney } from "../../shared/utils/money.util";
import type { ColumnDef, QuickView } from "../../types/data-table.types";
import type { Invoice } from "../../types/finance.types";
import { InvoiceStatusBadge } from "./components/invoice-status-badge.component";

/** An invoice plus its display status (Overdue is derived from the due date). */
type InvoiceRow = Invoice & { derived: InvoiceStatus };

const columns: ColumnDef<InvoiceRow>[] = [
  {
    id: "number",
    header: L.columns.invoice,
    accessor: (i) => i.number,
    cell: (i) => <span className="font-medium whitespace-nowrap">{i.number}</span>,
    hideable: false,
    footer: (rows) => <span className="text-ink-2">{L.rowCount(rows.length)}</span>,
  },
  { id: "customer", header: L.columns.customer, accessor: (i) => i.customer, facet: true },
  {
    id: "issued",
    header: L.columns.issued,
    accessor: (i) => i.issueDate,
    cell: (i) => <span className="whitespace-nowrap text-ink-2">{formatDate(i.issueDate)}</span>,
    className: "hidden md:table-cell",
  },
  {
    id: "due",
    header: L.columns.due,
    accessor: (i) => i.dueDate,
    cell: (i) => (
      <div className="whitespace-nowrap">
        <div className="text-ink-2">{formatDate(i.dueDate)}</div>
        {i.derived === InvoiceStatus.Overdue && <div className="text-xs font-medium text-critical">{L.daysLate(daysOverdue(i, AS_OF))}</div>}
        {i.derived === InvoiceStatus.Paid && i.paidDate && <div className="text-xs text-muted">{L.paidOn(formatDate(i.paidDate))}</div>}
      </div>
    ),
  },
  {
    id: "status",
    header: L.columns.status,
    accessor: (i) => i.derived,
    facet: true,
    facetLabel: (v) => L.statusFilter[v as InvoiceStatus] ?? v,
    facetOptions: [InvoiceStatus.Overdue, InvoiceStatus.Sent, InvoiceStatus.Paid, InvoiceStatus.Draft],
    csv: (i) => L.statusFilter[i.derived],
    cell: (i) => <InvoiceStatusBadge status={i.derived} />,
  },
  {
    id: "amount",
    header: L.columns.amount,
    align: "right",
    accessor: (i) => i.amountCents,
    cell: (i) => <span className="font-medium">{formatMoney(i.amountCents, { cents: true })}</span>,
    csv: (i) => centsToDecimal(i.amountCents),
    footer: (rows) => formatMoney(sumCents(rows.map((r) => r.amountCents)), { cents: true }),
  },
  {
    id: "actions",
    header: L.columns.actions,
    align: "right",
    accessor: () => null,
    sortable: false,
    hideable: false,
    csv: false,
    cell: (i) =>
      i.derived === InvoiceStatus.Overdue ? (
        <Button variant="ghost" icon={<BellRing size={14} />} className="h-8" comingSoon>
          {L.remind}
        </Button>
      ) : null,
  },
];

const quickViews: QuickView[] = [
  { id: "all", label: L.views.all, filters: {} },
  { id: "overdue", label: L.views.overdue, filters: { status: [InvoiceStatus.Overdue] } },
  { id: "open", label: L.views.open, filters: { status: [InvoiceStatus.Sent] } },
  { id: "paid", label: L.views.paid, filters: { status: [InvoiceStatus.Paid] } },
  { id: "draft", label: L.views.drafts, filters: { status: [InvoiceStatus.Draft] } },
];

const getRowId = (i: InvoiceRow) => i.id;
const invoices = getInvoices();
const rows: InvoiceRow[] = invoices.map((inv) => ({ ...inv, derived: invoiceStatus(inv, AS_OF) }));

/** Invoices page. "Overdue" is derived at render time from due date vs. `AS_OF`. */
export function InvoicesPage() {
  const ar = receivablesCents(invoices);
  const overdue = rows.filter((i) => i.derived === InvoiceStatus.Overdue);
  const openCount = rows.filter((i) => i.derived === InvoiceStatus.Sent || i.derived === InvoiceStatus.Overdue).length;
  const paidRecently = rows.filter((i) => i.status === InvoiceStatus.Paid && i.paidDate && daysBetween(parseIso(i.paidDate), AS_OF) <= 30);
  const dtp = averageDaysToPay(invoices);

  return (
    <>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        actions={
          <Button variant="primary" icon={<Plus size={16} />} comingSoon>
            {L.newInvoice}
          </Button>
        }
      />

      <KpiRow
        items={[
          { label: L.kpi.outstanding, value: formatCompact(ar), context: L.kpi.outstandingContext(openCount) },
          {
            label: L.kpi.overdue,
            value: formatCompact(sumCents(overdue.map((i) => i.amountCents))),
            context: <span className="text-critical">{L.kpi.overdueContext(overdue.length)}</span>,
          },
          {
            label: L.kpi.collected,
            value: formatCompact(sumCents(paidRecently.map((i) => i.amountCents))),
            context: L.kpi.collectedContext(paidRecently.length),
          },
          { label: L.kpi.timeToPay, value: dtp === null ? "—" : L.kpi.timeToPayValue(dtp), context: L.kpi.timeToPayContext },
        ]}
      />

      <Card className="mt-5" flush>
        <DataTable
          data={rows}
          columns={columns}
          getRowId={getRowId}
          caption={L.title}
          searchPlaceholder={L.searchPlaceholder}
          initialSort={{ id: "issued", desc: true }}
          quickViews={quickViews}
          selectable
          selectionSummary={(sel) => L.selectionTotal(formatMoney(sumCents(sel.map((r) => r.amountCents))))}
          bulkActions={(sel) =>
            sel.some((r) => r.derived === InvoiceStatus.Overdue) ? (
              <Button className="h-8" icon={<BellRing size={14} />} comingSoon>
                {L.sendReminders}
              </Button>
            ) : null
          }
          exportFileName="invoices"
          emptyMessage={L.empty}
        />
      </Card>
    </>
  );
}
