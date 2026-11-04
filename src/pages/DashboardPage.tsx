import { ArrowRight, Download, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useAssistantControls } from "../components/assistant/AssistantProvider";
import { ColumnChart } from "../components/charts/ColumnChart";
import { LineChart } from "../components/charts/LineChart";
import { Amount } from "../components/finance/Amount";
import { RunwayStrip } from "../components/finance/RunwayStrip";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Insight } from "../components/ui/Insight";
import { KpiRow } from "../components/ui/KpiRow";
import { PageHeader } from "../components/ui/PageHeader";
import { Table, Td, Th } from "../components/ui/Table";
import { addMonths, daysBetween, formatDate, formatDayMonth, formatMonthLong, formatMonthShort, monthKeyAdd, parseIso } from "../lib/dates";
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
} from "../lib/metrics";
import { formatCompact, formatMoney, formatPercent } from "../lib/money";
import { getBudgets } from "../services/budgets";
import { getAccounts, getCashHistory, getMonthlyFlows, getUpcomingBills } from "../services/cash";
import { AS_OF, getCompany } from "../services/company";
import { getInvoices } from "../services/invoices";
import { getMrrHistory } from "../services/revenue";
import { getRecentTransactions } from "../services/transactions";

const PROJECTION_MONTHS = 6;
const dayNum = new Intl.DateTimeFormat("en-US", { day: "numeric" });
const monShort = new Intl.DateTimeFormat("en-US", { month: "short" });

const linkCls =
  "inline-flex items-center gap-1 rounded text-[13px] font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent";

export function DashboardPage() {
  const { ask } = useAssistantControls();
  const company = getCompany();
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
    .filter((i) => invoiceStatus(i, AS_OF) === "overdue")
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
        title="Good morning, Alex"
        subtitle={`Here's where ${company.name} stands on ${formatDate(AS_OF)}.`}
        actions={
          <>
            <Button icon={<Download size={16} />} title="Not available in the prototype">
              Export
            </Button>
            <Button variant="primary" icon={<Plus size={16} />} title="Not available in the prototype">
              Add transaction
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
            label: "Net burn, 3-month average",
            value: `${formatCompact(avgBurn)}/mo`,
            delta: { text: formatPercent(Math.abs(burnChange), 1), direction: burnChange > 0 ? "up" : "down", good: burnChange <= 0 },
            context: "vs the 3 months before",
            trend: complete.map(netBurnCents),
          },
          {
            label: "Monthly recurring revenue",
            value: formatCompact(mrrNow.mrrCents),
            delta: { text: formatPercent(mrrGrowth, 1), direction: mrrGrowth >= 0 ? "up" : "down", good: mrrGrowth >= 0 },
            context: `from ${mrrNow.customers} customers`,
            trend: mrr.map((m) => m.mrrCents),
          },
          {
            label: "Owed to you",
            value: formatCompact(ar),
            context: <span className={overdueTotal > 0 ? "text-critical" : ""}>{formatCompact(overdueTotal)} of it overdue</span>,
          },
          {
            label: "Bills in the next 14 days",
            value: formatCompact(billsTotal),
            context: manualBills ? `${manualBills} need a manual payment` : "All on autopay",
          },
        ]}
      />

      {/* Cash balance + attention */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Cash balance"
          subtitle={`Down ${formatCompact(startCash - cash)} over 12 months. The dashed line projects the next 6 months at current burn.`}
        >
          <LineChart
            labels={cashMonths.map(formatMonthShort)}
            tooltipLabels={cashMonths.map(formatMonthLong)}
            series={[{ name: "Cash balance", color: "var(--series-1)", values: cashValues, area: true }]}
            projectedFrom={history.length - 1}
            ariaLabel={`Cash balance fell from ${formatCompact(startCash)} to ${formatCompact(cash)} over 12 months, projected ${formatCompact(
              cashValues[cashValues.length - 1],
            )} in 6 months at current burn.`}
            height={300}
          />
        </Card>

        <Card
          title="Needs your attention"
          action={
            <button type="button" onClick={() => ask("Summarize last month")} className={linkCls}>
              <Sparkles size={13} aria-hidden /> Ask AI
            </button>
          }
          flush
        >
          <div className="divide-y divide-line px-5 pb-1.5">
            {overdue.length > 0 && (
              <Insight
                tone="critical"
                title={`${overdue.length} invoices overdue, ${formatMoney(overdueTotal)} in total`}
                action={
                  <Link to="/invoices" className={linkCls}>
                    Review invoices <ArrowRight size={13} aria-hidden />
                  </Link>
                }
              >
                The oldest is {overdue[0].customer}, {daysBetween(parseIso(overdue[0].dueDate), AS_OF)} days late.
              </Insight>
            )}
            {overBudget.map((b) => (
              <Insight key={b.category} tone="warning" title={`${b.category} is ${formatPercent(budgetUsed(b) - 1)} over budget`}>
                {formatMoney(b.actualCents)} spent against {formatMoney(b.budgetCents)} planned in October.
              </Insight>
            ))}
            {manualBills > 0 && (
              <Insight tone="info" title={`${manualBills} bills need a manual payment`}>
                The first is due {formatDayMonth(billsSoon.find((b) => !b.autopay)!.dueDate)}.
              </Insight>
            )}
          </div>
        </Card>
      </div>

      {/* Cash in vs out + bills */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="Cash in and out"
          subtitle="Revenue is growing faster than spending, so net burn is holding near $125K a month."
        >
          <ColumnChart
            labels={complete.map((f) => formatMonthShort(f.month))}
            tooltipLabels={complete.map((f) => formatMonthLong(f.month))}
            series={[
              { name: "Cash in", color: "var(--series-1)", values: complete.map((f) => f.inCents) },
              { name: "Cash out", color: "var(--series-2)", values: complete.map((f) => f.outCents) },
            ]}
            extraRows={(i) => [{ label: "Net burn", value: formatMoney(netBurnCents(complete[i])) }]}
            ariaLabel="Monthly cash in rose from $41K to $68K while cash out rose from $158K to $194K over the last 12 months."
            height={360}
          />
        </Card>

        <Card title="Upcoming bills" subtitle={`${formatMoney(billsTotal)} due in the next 14 days`} flush>
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
                      <span className="sr-only">Due {formatDayMonth(b.dueDate)}. </span>
                      {b.autopay ? "Autopay" : <span className="font-medium text-ink-2">Pay manually</span>}
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
          title="Recent transactions"
          flush
          action={
            <Link to="/transactions" className={linkCls}>
              View all <ArrowRight size={13} aria-hidden />
            </Link>
          }
        >
          <Table caption="Recent transactions">
            <thead>
              <tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th className="hidden sm:table-cell">Category</Th>
                <Th align="right">Amount</Th>
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
                  <Td className="hidden text-ink-2 sm:table-cell">{t.category}</Td>
                  <Td align="right">
                    <Amount cents={t.amountCents} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card title="Who owes you" subtitle={`${formatMoney(ar)} across ${invoices.filter((i) => i.status === "sent").length} open invoices`}>
          <ul className="flex flex-col gap-4">
            {aging.map((b, i) => {
              const share = ar === 0 ? 0 : b.amountCents / ar;
              const fill = ["bg-accent", "bg-warning", "bg-serious", "bg-critical"][i];
              return (
                <li key={b.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-ink">
                      <span className={`size-2 rounded-full ${fill}`} aria-hidden />
                      {b.label}
                    </span>
                    <span className="font-medium tabular-nums text-ink">{formatMoney(b.amountCents)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2">
                    <div className={`h-full rounded-full ${fill}`} style={{ width: `${share * 100}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {b.count} {b.count === 1 ? "invoice" : "invoices"}, {formatPercent(share)} of the total
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
