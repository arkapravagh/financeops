import { Clock, Tags, Upload } from "lucide-react";
import { DataTable } from "../components/data-table/DataTable";
import type { ColumnDef } from "../components/data-table/types";
import { Amount } from "../components/finance/Amount";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { formatDate } from "../lib/dates";
import { sumCents } from "../lib/metrics";
import { formatMoney } from "../lib/money";
import { getAccounts } from "../services/cash";
import { getTransactions } from "../services/transactions";
import type { Transaction } from "../types/finance";

const accountNames = new Map(getAccounts().map((a) => [a.id, a.name]));
const flowOf = (t: Transaction) => (t.category === "Transfer" ? "Transfer" : t.amountCents > 0 ? "Money in" : "Money out");
/** Totals exclude internal transfers, which net to zero and inflate both sides. */
const external = (rows: Transaction[]) => rows.filter((t) => t.category !== "Transfer");

// Module scope = referentially stable → the table's memoization holds across renders.
const columns: ColumnDef<Transaction>[] = [
  {
    id: "date",
    header: "Date",
    accessor: (t) => t.date,
    cell: (t) => <span className="whitespace-nowrap text-ink-2">{formatDate(t.date)}</span>,
    hideable: false,
    footer: (rows) => <span className="text-ink-2">{rows.length} transactions</span>,
  },
  {
    id: "description",
    header: "Description",
    accessor: (t) => t.description,
    searchValue: (t) => `${t.description} ${t.counterparty}`,
    cell: (t) => (
      <>
        <div className="font-medium">{t.description}</div>
        <div className="text-xs text-muted">{t.counterparty}</div>
      </>
    ),
    hideable: false,
  },
  {
    id: "counterparty",
    header: "Counterparty",
    accessor: (t) => t.counterparty,
    defaultHidden: true,
  },
  {
    id: "category",
    header: "Category",
    accessor: (t) => t.category,
    cell: (t) => <span className="text-ink-2">{t.category}</span>,
    facet: true,
  },
  {
    id: "flow",
    header: "Type",
    accessor: flowOf,
    facet: true,
    facetOptions: ["Money in", "Money out", "Transfer"],
    defaultHidden: true,
  },
  {
    id: "account",
    header: "Account",
    accessor: (t) => accountNames.get(t.accountId) ?? t.accountId,
    cell: (t) => <span className="text-ink-2">{accountNames.get(t.accountId)}</span>,
    facet: true,
    className: "hidden md:table-cell",
  },
  {
    id: "status",
    header: "Status",
    accessor: (t) => t.status,
    facet: true,
    facetLabel: (v) => (v === "pending" ? "Pending" : "Cleared"),
    facetOptions: ["pending", "cleared"],
    cell: (t) =>
      t.status === "pending" ? (
        <Badge tone="warning" icon={<Clock size={12} />}>
          Pending
        </Badge>
      ) : (
        <span className="text-xs text-muted">Cleared</span>
      ),
    className: "hidden md:table-cell",
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    accessor: (t) => t.amountCents,
    cell: (t) => <Amount cents={t.amountCents} />,
    csv: (t) => (t.amountCents / 100).toFixed(2),
    footer: (rows) => {
      const ext = external(rows);
      const inn = sumCents(ext.filter((t) => t.amountCents > 0).map((t) => t.amountCents));
      const out = sumCents(ext.filter((t) => t.amountCents < 0).map((t) => t.amountCents));
      return (
        <span className="inline-flex flex-col items-end leading-tight">
          <span>Net {formatMoney(inn + out, { signed: true, cents: true })}</span>
          <span className="text-xs font-normal text-muted">
            In {formatMoney(inn)}, out {formatMoney(-out)}
          </span>
        </span>
      );
    },
  },
];

const getRowId = (t: Transaction) => t.id;
const data = getTransactions();

export function TransactionsPage() {
  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Every dollar in and out, auto-categorised from your bank feeds."
        actions={
          <Button icon={<Upload size={16} />} title="Not available in the prototype">
            Import CSV
          </Button>
        }
      />

      <Card flush>
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          caption="Transactions"
          searchPlaceholder="Search description or vendor"
          initialSort={{ id: "date", desc: true }}
          selectable
          selectionSummary={(rows) => `Net ${formatMoney(sumCents(rows.map((r) => r.amountCents)), { signed: true, cents: true })}`}
          bulkActions={() => (
            <Button className="h-8" icon={<Tags size={14} />} title="Not available in the prototype">
              Recategorize
            </Button>
          )}
          exportFileName="transactions"
          emptyMessage="No transactions match these filters."
        />
      </Card>
    </>
  );
}
