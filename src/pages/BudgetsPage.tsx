import { PencilLine } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useAssistantControls } from "../components/assistant/AssistantProvider";
import { ColumnChart } from "../components/charts/ColumnChart";
import { BudgetSummary } from "../components/finance/BudgetSummary";
import { BudgetTable, type BudgetScale } from "../components/finance/BudgetTable";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { Segmented } from "../components/ui/Segmented";
import { formatMonthLong, formatMonthShort } from "../lib/dates";
import { budgetUsed, budgetVarianceCents, sumCents } from "../lib/metrics";
import { formatMoney, formatPercent } from "../lib/money";
import { getBudgetHistory, getBudgetMonths, getBudgets, getLatestBudgetMonth } from "../services/budgets";
import { getTransactions } from "../services/transactions";
import type { ExpenseCategory } from "../types/finance";

const MONTHS = getBudgetMonths();

export function BudgetsPage() {
  const { ask } = useAssistantControls();
  const [month, setMonth] = useState(getLatestBudgetMonth());
  const [scale, setScale] = useState<BudgetScale>("percent");

  const budgets = useMemo(() => getBudgets(month), [month]);
  const prevMonth = MONTHS[MONTHS.indexOf(month) - 1];
  const previous = useMemo(() => (prevMonth ? getBudgets(prevMonth) : []), [prevMonth]);
  const history = useMemo(
    () => Object.fromEntries(budgets.map((b) => [b.category, getBudgetHistory(b.category, month).slice(-3)])),
    [budgets, month],
  );
  const transactionsFor = useCallback(
    (category: ExpenseCategory) => getTransactions({ category, month }).filter((t) => t.amountCents < 0),
    [month],
  );

  const over = budgets.filter((b) => budgetUsed(b) > 1);
  const total = sumCents(budgets.map((b) => b.actualCents));
  const byShare = [...budgets].sort((a, b) => b.actualCents - a.actualCents);
  const monthly = MONTHS.map((m) => {
    const rows = getBudgets(m);
    return { month: m, budget: sumCents(rows.map((r) => r.budgetCents)), spent: sumCents(rows.map((r) => r.actualCents)) };
  });

  return (
    <>
      <PageHeader
        title="Budgets"
        subtitle="Are we spending what we planned? A month closes once the books are reconciled."
        actions={
          <>
            <Segmented
              label="Month"
              size="md"
              value={month}
              onChange={setMonth}
              options={MONTHS.map((m) => ({ value: m, label: formatMonthShort(m) }))}
            />
            <Button icon={<PencilLine size={16} />} title="Not available in the prototype">
              Edit budgets
            </Button>
          </>
        }
      />

      <BudgetSummary month={month} budgets={budgets} previous={previous} />

      <Card
        className="mt-5"
        flush
        title="By category"
        subtitle={
          over.length
            ? `${over.map((b) => `${b.category} (${formatMoney(budgetVarianceCents(b))} over)`).join(" and ")} ran over. Select a row to see what's behind it.`
            : "Every category stayed within budget. Select a row to see what's behind it."
        }
        action={
          <Segmented
            label="Chart scale"
            value={scale}
            onChange={setScale}
            options={[
              { value: "percent", label: "% of budget" },
              { value: "amount", label: "Amount" },
            ]}
          />
        }
      >
        <BudgetTable budgets={budgets} scale={scale} history={history} transactionsFor={transactionsFor} onAsk={ask} />
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line px-5 py-3 text-xs text-ink-2" aria-label="Legend">
          <li className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-[var(--series-1)]" aria-hidden /> Spent
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm bg-[var(--series-1-soft)]" aria-hidden /> Budget
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[3px] rounded-full bg-ink" aria-hidden /> Budget line
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-critical" aria-hidden /> Over budget
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="flex h-3 items-end gap-px" aria-hidden>
              <span className="h-1.5 w-1 bg-accent/70" />
              <span className="h-2.5 w-1 bg-accent/70" />
              <span className="h-3 w-1 bg-critical" />
            </span>
            Share of budget used, last 3 months
          </li>
        </ul>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Spent vs budget by month" subtitle={`Budgets are tracked from ${formatMonthLong(MONTHS[0])}.`}>
          <ColumnChart
            labels={monthly.map((m) => formatMonthShort(m.month))}
            tooltipLabels={monthly.map((m) => formatMonthLong(m.month))}
            series={[
              { name: "Budget", color: "var(--muted)", values: monthly.map((m) => m.budget) },
              { name: "Spent", color: "var(--series-1)", values: monthly.map((m) => m.spent) },
            ]}
            extraRows={(i) => [{ label: "Difference", value: formatMoney(monthly[i].spent - monthly[i].budget, { signed: true }) }]}
            ariaLabel={monthly.map((m) => `${formatMonthShort(m.month)}: spent ${formatMoney(m.spent)} of ${formatMoney(m.budget)}`).join("; ")}
            height={240}
          />
        </Card>

        <Card title="Where the money goes" subtitle={`Share of ${formatMonthLong(month)} spending by category.`}>
          <ul className="flex flex-col gap-3">
            {byShare.map((b) => {
              const share = total ? b.actualCents / total : 0;
              return (
                <li key={b.category} className="grid grid-cols-[9.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                  <span className="truncate text-ink">{b.category}</span>
                  <span className="h-2 rounded-full bg-surface-2" aria-hidden>
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(share * 100, 1)}%` }} />
                  </span>
                  <span className="text-right text-ink-2 tabular-nums">{formatPercent(share)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-xs text-muted">Payroll is shown as one total. Individual salaries will sit behind a permission.</p>
        </Card>
      </div>
    </>
  );
}
