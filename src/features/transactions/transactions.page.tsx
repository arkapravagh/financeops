/**
 * Transactions: every bank transaction, searchable and filterable.
 *
 * Route: `/transactions`. Sections: DataTable with search, facet filters, sorting, row selection with bulk actions, CSV export and totals.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { Clock, Tags, Upload } from "lucide-react";
import { Category } from "../../enums/category.enum";
import { TransactionStatus } from "../../enums/transaction-status.enum";
import { categoryLabels, transactionStatusLabels } from "../../language/en/enums.lang";
import { flowLabels, transactionsLabels as L, type TransactionFlow } from "../../language/en/transactions.lang";
import { getAccounts } from "../../services/cash.service";
import { getTransactions } from "../../services/transactions.service";
import { DataTable } from "../../shared/data-table/data-table.component";
import { Amount } from "../../shared/finance/amount.component";
import { Badge } from "../../shared/ui/badge.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { formatDate } from "../../shared/utils/dates.util";
import { sumCents } from "../../shared/utils/metrics.util";
import { centsToDecimal, formatMoney } from "../../shared/utils/money.util";
import type { ColumnDef } from "../../types/data-table.types";
import type { Transaction } from "../../types/finance.types";

const accountNames = new Map(getAccounts().map((a) => [a.id, a.name]));
const flowOf = (t: Transaction): TransactionFlow => (t.category === Category.Transfer ? "transfer" : t.amountCents > 0 ? "in" : "out");
/** Totals exclude internal transfers, which net to zero and inflate both sides. */
const external = (rows: Transaction[]) => rows.filter((t) => t.category !== Category.Transfer);

// Module scope = referentially stable → the table's memoization holds across renders.
const columns: ColumnDef<Transaction>[] = [
  {
    id: "date",
    header: L.columns.date,
    accessor: (t) => t.date,
    cell: (t) => <span className="whitespace-nowrap text-ink-2">{formatDate(t.date)}</span>,
    hideable: false,
    footer: (rows) => <span className="text-ink-2">{L.rowCount(rows.length)}</span>,
  },
  {
    id: "description",
    header: L.columns.description,
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
    header: L.columns.counterparty,
    accessor: (t) => t.counterparty,
    defaultHidden: true,
  },
  {
    id: "category",
    header: L.columns.category,
    accessor: (t) => t.category,
    cell: (t) => <span className="text-ink-2">{categoryLabels[t.category]}</span>,
    facet: true,
    facetLabel: (v) => categoryLabels[v as Category] ?? v,
    csv: (t) => categoryLabels[t.category],
  },
  {
    id: "flow",
    header: L.columns.type,
    accessor: flowOf,
    facet: true,
    facetLabel: (v) => flowLabels[v as TransactionFlow] ?? v,
    facetOptions: ["in", "out", "transfer"] satisfies TransactionFlow[],
    csv: (t) => flowLabels[flowOf(t)],
    defaultHidden: true,
  },
  {
    id: "account",
    header: L.columns.account,
    accessor: (t) => accountNames.get(t.accountId) ?? t.accountId,
    cell: (t) => <span className="text-ink-2">{accountNames.get(t.accountId)}</span>,
    facet: true,
    className: "hidden md:table-cell",
  },
  {
    id: "status",
    header: L.columns.status,
    accessor: (t) => t.status,
    facet: true,
    facetLabel: (v) => transactionStatusLabels[v as TransactionStatus] ?? v,
    facetOptions: [TransactionStatus.Pending, TransactionStatus.Cleared],
    csv: (t) => transactionStatusLabels[t.status],
    cell: (t) =>
      t.status === TransactionStatus.Pending ? (
        <Badge tone="warning" icon={<Clock size={12} />}>
          {transactionStatusLabels[t.status]}
        </Badge>
      ) : (
        <span className="text-xs text-muted">{transactionStatusLabels[t.status]}</span>
      ),
    className: "hidden md:table-cell",
  },
  {
    id: "amount",
    header: L.columns.amount,
    align: "right",
    accessor: (t) => t.amountCents,
    cell: (t) => <Amount cents={t.amountCents} />,
    csv: (t) => centsToDecimal(t.amountCents),
    footer: (rows) => {
      const ext = external(rows);
      const inn = sumCents(ext.filter((t) => t.amountCents > 0).map((t) => t.amountCents));
      const out = sumCents(ext.filter((t) => t.amountCents < 0).map((t) => t.amountCents));
      return (
        <span className="inline-flex flex-col items-end leading-tight">
          <span>{L.net(formatMoney(inn + out, { signed: true, cents: true }))}</span>
          <span className="text-xs font-normal text-muted">{L.inOut(formatMoney(inn), formatMoney(-out))}</span>
        </span>
      );
    },
  },
];

const getRowId = (t: Transaction) => t.id;
const data = getTransactions();

/** Transactions page. */
export function TransactionsPage() {
  return (
    <>
      <PageHeader
        title={L.title}
        subtitle={L.subtitle}
        actions={
          <Button icon={<Upload size={16} />} comingSoon>
            {L.importCsv}
          </Button>
        }
      />

      <Card flush>
        <DataTable
          data={data}
          columns={columns}
          getRowId={getRowId}
          caption={L.title}
          searchPlaceholder={L.searchPlaceholder}
          initialSort={{ id: "date", desc: true }}
          selectable
          selectionSummary={(rows) => L.net(formatMoney(sumCents(rows.map((r) => r.amountCents)), { signed: true, cents: true }))}
          bulkActions={() => (
            <Button className="h-8" icon={<Tags size={14} />} comingSoon>
              {L.recategorize}
            </Button>
          )}
          exportFileName="transactions"
          emptyMessage={L.empty}
        />
      </Card>
    </>
  );
}
