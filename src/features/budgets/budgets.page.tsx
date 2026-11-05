/**
 * Budgets: where the money goes, and whether each category is on budget.
 *
 * Route: `/budgets`. Sections: budget summary (hero), spent vs budget by month, by-category table.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { PencilLine } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { BudgetScale } from "../../enums/budget-scale.enum";
import { type ExpenseCategory } from "../../enums/category.enum";
import { PageSection } from "../../enums/page-section.enum";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { budgetsLabels as L } from "../../language/en/budgets.lang";
import { budgetScaleLabels, categoryLabels } from "../../language/en/enums.lang";
import { getBudgetHistory, getBudgetMonths, getBudgets, getLatestBudgetMonth } from "../../services/budgets.service";
import { getTransactions } from "../../services/transactions.service";
import { ColumnChart } from "../../shared/charts/column-chart.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { Segmented } from "../../shared/ui/segmented.component";
import { formatMonthLong, formatMonthShort } from "../../shared/utils/dates.util";
import { budgetUsed, budgetVarianceCents, sumCents } from "../../shared/utils/metrics.util";
import { formatMoney, formatPercent } from "../../shared/utils/money.util";
import { BudgetSummary } from "./components/budget-summary.component";
import { BudgetTable } from "./components/budget-table.component";

const MONTHS = getBudgetMonths();

/** Budgets page. Month picker defaults to the latest month with budgets. */
export function BudgetsPage() {
  const { ask } = useAssistantControls();
  const [month, setMonth] = useState(getLatestBudgetMonth());
  const [scale, setScale] = useState<BudgetScale>(BudgetScale.Percent);

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
        title={L.title}
        subtitle={L.subtitle}
        actions={
          <>
            <Segmented
              label={L.month}
              size="md"
              value={month}
              onChange={setMonth}
              options={MONTHS.map((m) => ({ value: m, label: formatMonthShort(m) }))}
            />
            <Button icon={<PencilLine size={16} />} comingSoon>
              {L.editBudgets}
            </Button>
          </>
        }
      />

      <BudgetSummary month={month} budgets={budgets} previous={previous} />

      <Card
        aiTarget={PageSection.BudgetTable}
        className="mt-5"
        flush
        title={L.byCategory.title}
        subtitle={
          over.length
            ? L.byCategory.overSubtitle(over.map((b) => L.byCategory.overItem(categoryLabels[b.category], formatMoney(budgetVarianceCents(b)))).join(L.byCategory.overJoin))
            : L.byCategory.withinSubtitle
        }
        action={
          <Segmented
            label={L.byCategory.chartScale}
            value={scale}
            onChange={setScale}
            options={[
              { value: BudgetScale.Percent, label: budgetScaleLabels[BudgetScale.Percent] },
              { value: BudgetScale.Amount, label: budgetScaleLabels[BudgetScale.Amount] },
            ]}
          />
        }
      >
        <BudgetTable budgets={budgets} scale={scale} history={history} transactionsFor={transactionsFor} onAsk={ask} />
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line px-5 py-3 text-xs text-ink-2" aria-label={L.legend.label}>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-[var(--series-1)]" aria-hidden /> {L.legend.spent}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-4 rounded-sm bg-[var(--series-1-soft)]" aria-hidden /> {L.legend.budget}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-3 w-[3px] rounded-full bg-ink" aria-hidden /> {L.legend.budgetLine}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-critical" aria-hidden /> {L.legend.overBudget}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span className="flex h-3 items-end gap-px" aria-hidden>
              <span className="h-1.5 w-1 bg-accent/70" />
              <span className="h-2.5 w-1 bg-accent/70" />
              <span className="h-3 w-1 bg-critical" />
            </span>
            {L.legend.trend}
          </li>
        </ul>
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title={L.monthly.title} subtitle={L.monthly.subtitle(formatMonthLong(MONTHS[0]))}>
          <ColumnChart
            labels={monthly.map((m) => formatMonthShort(m.month))}
            tooltipLabels={monthly.map((m) => formatMonthLong(m.month))}
            series={[
              { name: L.monthly.budget, color: "var(--muted)", values: monthly.map((m) => m.budget) },
              { name: L.monthly.spent, color: "var(--series-1)", values: monthly.map((m) => m.spent) },
            ]}
            extraRows={(i) => [{ label: L.monthly.difference, value: formatMoney(monthly[i].spent - monthly[i].budget, { signed: true }) }]}
            ariaLabel={monthly.map((m) => L.monthly.summaryItem(formatMonthShort(m.month), formatMoney(m.spent), formatMoney(m.budget))).join("; ")}
            height={240}
          />
        </Card>

        <Card title={L.share.title} subtitle={L.share.subtitle(formatMonthLong(month))}>
          <ul className="flex flex-col gap-3">
            {byShare.map((b) => {
              const share = total ? b.actualCents / total : 0;
              return (
                <li key={b.category} className="grid grid-cols-[9.5rem_minmax(0,1fr)_3rem] items-center gap-3 text-sm">
                  <span className="truncate text-ink">{categoryLabels[b.category]}</span>
                  <span className="h-2 rounded-full bg-surface-2" aria-hidden>
                    <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(share * 100, 1)}%` }} />
                  </span>
                  <span className="text-right text-ink-2 tabular-nums">{formatPercent(share)}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-xs text-muted">{L.share.payrollNote}</p>
        </Card>
      </div>
    </>
  );
}
