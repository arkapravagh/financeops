/** Budget summary: the Budgets page hero (total spend vs. budget for the month and the facts that matter). */

import { budgetSummaryLabels as L } from "../../../language/en/budgets.lang";
import { categoryLabels } from "../../../language/en/enums.lang";
import { BulletBar } from "../../../shared/charts/bullet-bar.component";
import { formatMonthLong, formatMonthShort } from "../../../shared/utils/dates.util";
import { budgetUsed, budgetVarianceCents, growthRate, sumCents } from "../../../shared/utils/metrics.util";
import { formatMoney, formatPercent } from "../../../shared/utils/money.util";
import type { Budget } from "../../../types/finance.types";

/** The month, its budget rows, and the previous month's rows for comparison. */
export type BudgetSummaryProps = {
  month: string;
  budgets: Budget[];
  /** Same categories for the previous month, if any. */
  previous?: Budget[];
};

/**
 * Budgets page signature element: answers "are we on budget?" in one figure,
 * with one overall spend-vs-budget bar and the three facts that matter.
 */
export function BudgetSummary({ month, budgets, previous = [] }: BudgetSummaryProps) {
  const budget = sumCents(budgets.map((b) => b.budgetCents));
  const spent = sumCents(budgets.map((b) => b.actualCents));
  const variance = spent - budget;
  const over = budgets.filter((b) => budgetUsed(b) > 1).sort((a, b) => budgetVarianceCents(b) - budgetVarianceCents(a));
  const roomiest = [...budgets].sort((a, b) => budgetVarianceCents(a) - budgetVarianceCents(b))[0];
  const prevSpent = previous.length ? sumCents(previous.map((b) => b.actualCents)) : null;
  const mom = prevSpent ? growthRate(spent, prevSpent) : null;
  const prevMonth = previous[0]?.month;

  return (
    <section className="@container min-w-0 rounded-[14px] border border-line bg-surface p-6" aria-labelledby="budget-summary-title">
      <div className="flex flex-col gap-6 @4xl:flex-row @4xl:items-start @4xl:justify-between">
        <div className="min-w-0 flex-1">
          <h2 id="budget-summary-title" className="text-[13px] text-muted">
            {L.title(formatMonthLong(month))}
          </h2>
          <p className="mt-1 leading-none text-ink">
            <span className="text-[44px] font-semibold tracking-[-0.035em] @lg:text-[56px]">{formatMoney(Math.abs(variance))}</span>
            <span className="ml-2.5 inline-block text-xl font-medium tracking-[-0.02em] whitespace-nowrap text-ink-2 @lg:text-2xl">{variance <= 0 ? L.under : L.over}</span>
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-ink-2">
            {L.youSpent} <span className="font-medium text-ink">{formatMoney(spent)}</span> {L.ofPlanned(formatMoney(budget), formatPercent(spent / budget))}
            {mom !== null && prevMonth && (
              <>{L.momChange(mom >= 0, formatPercent(Math.abs(mom), 1), formatMonthShort(prevMonth))}</>
            )}
          </p>

          <div className="mt-6 max-w-2xl">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>
                {L.spent} <span className="font-medium text-ink tabular-nums">{formatMoney(spent)}</span>
              </span>
              <span>
                {L.budget} <span className="font-medium text-ink tabular-nums">{formatMoney(budget)}</span>
              </span>
            </div>
            <BulletBar actual={spent} target={budget} max={Math.max(budget, spent) * 1.04} height={28} />
          </div>
        </div>

        <dl className="w-full shrink-0 divide-y divide-line rounded-xl border border-line @4xl:w-80">
          <div className="px-4 py-3">
            <dt className="text-xs text-muted">{L.overBudget}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {over.length ? L.overCount(over.length, budgets.length) : L.noneOver}
            </dd>
          </div>
          {over[0] && (
            <div className="px-4 py-3">
              <dt className="text-xs text-muted">{L.biggestOverrun}</dt>
              <dd className="mt-0.5 text-sm text-ink">
                <span className="font-medium">{categoryLabels[over[0].category]}</span>
                {L.overrunDetail(formatMoney(budgetVarianceCents(over[0])), formatPercent(budgetUsed(over[0])))}
              </dd>
            </div>
          )}
          {roomiest && budgetVarianceCents(roomiest) < 0 && (
            <div className="px-4 py-3">
              <dt className="text-xs text-muted">{L.mostRoom}</dt>
              <dd className="mt-0.5 text-sm text-ink">
                <span className="font-medium">{categoryLabels[roomiest.category]}</span>
                {L.roomDetail(formatMoney(-budgetVarianceCents(roomiest)))}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
