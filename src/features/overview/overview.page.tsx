/**
 * Overview: the founder's weekly check-in. How much cash, how long it lasts, and what needs attention.
 *
 * Route: `/`. Sections: runway strip (hero), KPI row, cash balance, cash in and out, needs your attention, recent transactions, upcoming bills, who owes you.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { ArrowRight, Download, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { InvoiceStatus } from "../../enums/invoice-status.enum";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { commonLabels } from "../../language/en/common.lang";
import { categoryLabels, receivablesAgeLabels } from "../../language/en/enums.lang";
import { overviewLabels as L } from "../../language/en/overview.lang";
import { getBudgets } from "../../services/budgets.service";
import { getAccounts, getCashHistory, getMonthlyFlows, getUpcomingBills } from "../../services/cash.service";
import { AS_OF, getCompany, getTeam } from "../../services/company.service";
import { getInvoices } from "../../services/invoices.service";
import { getMrrHistory } from "../../services/revenue.service";
import { getRecentTransactions } from "../../services/transactions.service";
import { ColumnChart } from "../../shared/charts/column-chart.component";
import { LineChart } from "../../shared/charts/line-chart.component";
import { Amount } from "../../shared/finance/amount.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { Insight } from "../../shared/ui/insight.component";
import { KpiRow } from "../../shared/ui/kpi-row.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { Table, Td, Th } from "../../shared/ui/table.component";
import { addMonths, daysBetween, formatDate, formatDayMonth, formatMonthLong, formatMonthShort, monthKeyAdd, parseIso } from "../../shared/utils/dates.util";
import {
  averageNetBurnCents,
  budgetUsed,
  completeMonths,
  growthRate,
  invoiceStatus,
  netBurnCents,
  receivablesAging,
  receivablesCents,
  runwayMonths,
  sumCents,
} from "../../shared/utils/metrics.util";
import { formatCompact, formatMoney, formatPercent } from "../../shared/utils/money.util";
import { RunwayStrip } from "./components/runway-strip.component";

const PROJECTION_MONTHS = 6;
const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const monShort = new Intl.DateTimeFormat("en-US", { month: "short" });

const linkCls =
  "inline-flex items-center gap-1 rounded text-[13px] font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent";

/** Overview page. Shows *simple* runway (cash ÷ 3-month average net burn), labelled as such. */
export function OverviewPage() {
  const { ask } = useAssistantControls();
  const company = getCompany();
  const firstName = getTeam()[0].name.split(" ")[0];
  const accounts = getAccounts();
  const flows = getMonthlyFlows();
  const history = getCashHistory();
  const mrr = getMrrHistory();
  const invoices = getInvoices();
  const bills = getUpcomingBills();
  const budgets = getBudgets();
  const recent = getRecentTransactions(6);
  const complete = completeMonths(flows, AS_OF);

  // --- Core metrics ---
  const cash = sumCents(accounts.map((a) => a.balanceCents));
  const avgBurn = averageNetBurnCents(flows, AS_OF);
  const prevAvgBurn = averageNetBurnCents(flows, addMonths(AS_OF, -3));
  const runway = runwayMonths(cash, avgBurn);
  const mrrNow = mrr[mrr.length - 1];
  const mrrGrowth = growthRate(mrrNow.mrrCents, mrr[mrr.length - 2].mrrCents) ?? 0;
  const burnChange = growthRate(avgBurn, prevAvgBurn) ?? 0;
  const ar = receivablesCents(invoices);
  const overdue = invoices
    .filter((i) => invoiceStatus(i, AS_OF) === InvoiceStatus.Overdue)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdueTotal = sumCents(overdue.map((i) => i.amountCents));
  const overBudget = budgets.filter((b) => budgetUsed(b) > 1);
  const aging = receivablesAging(invoices, AS_OF);
  const billsSoon = bills.filter((b) => daysBetween(AS_OF, parseIso(b.dueDate)) <= 14);
  const billsTotal = sumCents(billsSoon.map((b) => b.amountCents));
  const manualBills = billsSoon.filter((b) => !b.autopay).length;

  // --- Cash chart: 12 months actual + 6 months projected at current burn ---
  const lastMonth = history[history.length - 1].month;
  const projectedMonths = Array.from({ length: PROJECTION_MONTHS }, (_, i) => monthKeyAdd(lastMonth, i + 1));
  const cashValues = [...history.map((h) => h.balanceCents), ...projectedMonths.map((_, i) => cash - avgBurn * (i + 1))];
  const cashMonths = [...history.map((h) => h.month), ...projectedMonths];
  const startCash = history[0].balanceCents;

  return (
    <>
      <PageHeader
        title={L.greeting(firstName)}
        subtitle={L.subtitle(company.name, formatDate(AS_OF))}
        actions={
          <>
            <Button icon={<Download size={16} />} title={commonLabels.notAvailableTitle}>
              {L.export}
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} title={commonLabels.notAvailableTitle}>
              {L.addTransaction}
            </Button>
          </>
        }
      />

      {/* Signature element */}
      <RunwayStrip runwayMonths={runway} cashCents={cash} avgNetBurnCents={avgBurn} accounts={accounts} asOf={AS_OF} />

      <KpiRow
        className="mt-5"
        items={[
          {
            label: L.kpi.netBurn,
            value: L.kpi.perMonth(formatCompact(avgBurn)),
            delta: { text: formatPercent(Math.abs(burnChange), 1), direction: burnChange > 0 ? "up" : "down", good: burnChange <= 0 },
            context: L.kpi.netBurnContext,
            trend: complete.map(netBurnCents),
          },
          {
            label: L.kpi.mrr,
            value: formatCompact(mrrNow.mrrCents),
            delta: { text: formatPercent(mrrGrowth, 1), direction: mrrGrowth >= 0 ? "up" : "down", good: mrrGrowth >= 0 },
            context: L.kpi.mrrContext(mrrNow.customers),
            trend: mrr.map((m) => m.mrrCents),
          },
          {
            label: L.kpi.owed,
            value: formatCompact(ar),
            context: <span className={overdueTotal > 0 ? "text-critical" : ""}>{L.kpi.owedContext(formatCompact(overdueTotal))}</span>,
          },
          {
            label: L.kpi.bills,
            value: formatCompact(billsTotal),
            context: manualBills ? L.kpi.billsManual(manualBills) : L.kpi.billsAutopay,
          },
        ]}
      />

      {/* Cash balance + attention */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={L.cash.title}
          subtitle={L.cash.subtitle(formatCompact(startCash - cash))}
        >
          <LineChart
            labels={cashMonths.map(formatMonthShort)}
            tooltipLabels={cashMonths.map(formatMonthLong)}
            series={[{ name: L.cash.series, color: "var(--series-1)", values: cashValues, area: true }]}
            projectedFrom={history.length - 1}
            ariaLabel={L.cash.chartSummary(formatCompact(startCash), formatCompact(cash), formatCompact(cashValues[cashValues.length - 1]))}
            height={300}
          />
        </Card>

        <Card
          title={L.attention.title}
          action={
            <button type="button" onClick={() => ask(L.attention.askPrompt)} className={linkCls}>
              <Sparkles size={13} aria-hidden /> {L.attention.askAi}
            </button>
          }
          flush
        >
          <div className="divide-y divide-line px-5 pb-1.5">
            {overdue.length > 0 && (
              <Insight
                tone="critical"
                title={L.attention.overdueTitle(overdue.length, formatMoney(overdueTotal))}
                action={
                  <Link to="/invoices" className={linkCls}>
                    {L.attention.reviewInvoices} <ArrowRight size={13} aria-hidden />
                  </Link>
                }
              >
                {L.attention.oldestOverdue(overdue[0].customer, daysBetween(parseIso(overdue[0].dueDate), AS_OF))}
              </Insight>
            )}
            {overBudget.map((b) => (
              <Insight key={b.category} tone="warning" title={L.attention.overBudgetTitle(categoryLabels[b.category], formatPercent(budgetUsed(b) - 1))}>
                {L.attention.overBudgetDetail(formatMoney(b.actualCents), formatMoney(b.budgetCents), formatMonthLong(b.month))}
              </Insight>
            ))}
            {manualBills > 0 && (
              <Insight tone="info" title={L.attention.manualBillsTitle(manualBills)}>
                {L.attention.firstDue(formatDayMonth(billsSoon.find((b) => !b.autopay)!.dueDate))}
              </Insight>
            )}
          </div>
        </Card>
      </div>

      {/* Cash in vs out + bills */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={L.flows.title}
          subtitle={L.flows.subtitle}
        >
          <ColumnChart
            labels={complete.map((f) => formatMonthShort(f.month))}
            tooltipLabels={complete.map((f) => formatMonthLong(f.month))}
            series={[
              { name: L.flows.cashIn, color: "var(--series-1)", values: complete.map((f) => f.inCents) },
              { name: L.flows.cashOut, color: "var(--series-2)", values: complete.map((f) => f.outCents) },
            ]}
            extraRows={(i) => [{ label: L.flows.netBurn, value: formatMoney(netBurnCents(complete[i])) }]}
            ariaLabel={L.flows.chartSummary}
            height={360}
          />
        </Card>

        <Card title={L.bills.title} subtitle={L.bills.subtitle(formatMoney(billsTotal))} flush>
          <ul className="divide-y divide-line px-5 pb-2">
            {billsSoon.map((b) => {
              const d = parseIso(b.dueDate);
              return (
                <li key={b.id} className="flex items-center gap-3.5 py-3">
                  <div className="flex w-10 shrink-0 flex-col items-center rounded-lg border border-line py-1 leading-none" aria-hidden>
                    <span className="text-[10px] text-muted">{monShort.format(d)}</span>
                    <span className="mt-0.5 text-[15px] font-semibold text-ink">{dayNum.format(d)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{b.vendor}</p>
                    <p className="text-xs text-muted">
                      <span className="sr-only">{L.bills.due(formatDayMonth(b.dueDate))}</span>
                      {b.autopay ? L.bills.autopay : <span className="font-medium text-ink-2">{L.bills.payManually}</span>}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-ink">{formatMoney(b.amountCents)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Recent + who owes you */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={L.recent.title}
          flush
          action={
            <Link to="/transactions" className={linkCls}>
              {L.recent.viewAll} <ArrowRight size={13} aria-hidden />
            </Link>
          }
        >
          <Table caption={L.recent.title}>
            <thead>
              <tr>
                <Th>{L.recent.date}</Th>
                <Th>{L.recent.description}</Th>
                <Th className="hidden sm:table-cell">{L.recent.category}</Th>
                <Th align="right">{L.recent.amount}</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.id} className="hover:bg-surface-2/60 [&:last-child>td]:border-b-0">
                  <Td className="whitespace-nowrap text-ink-2">{formatDayMonth(t.date)}</Td>
                  <Td>
                    <div className="font-medium">{t.description}</div>
                    <div className="text-xs text-muted">{t.counterparty}</div>
                  </Td>
                  <Td className="hidden text-ink-2 sm:table-cell">{categoryLabels[t.category]}</Td>
                  <Td align="right">
                    <Amount cents={t.amountCents} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card title={L.owed.title} subtitle={L.owed.subtitle(formatMoney(ar), invoices.filter((i) => i.status === InvoiceStatus.Sent).length)}>
          <ul className="flex flex-col gap-4">
            {aging.map((b, i) => {
              const share = ar === 0 ? 0 : b.amountCents / ar;
              const fill = ["bg-accent", "bg-warning", "bg-serious", "bg-critical"][i];
              return (
                <li key={b.age}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span className={`size-2 rounded-full ${fill}`} aria-hidden />
                      {receivablesAgeLabels[b.age]}
                    </span>
                    <span className="font-medium tabular-nums text-ink">{formatMoney(b.amountCents)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2">
                    <div className={`h-full rounded-full ${fill}`} style={{ width: `${share * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {L.owed.bucketDetail(b.count, formatPercent(share))}
                  </p>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </>
  );
}
