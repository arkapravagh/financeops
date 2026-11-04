import { formatMonthLong, formatMonthShort } from "../../../shared/utils/dates.util";
import { budgetUsed, budgetVarianceCents, growthRate, sumCents } from "../../../shared/utils/metrics.util";
import { formatMoney, formatPercent } from "../../../shared/utils/money.util";
import type { Budget } from "../../../types/finance.types";
import { BulletBar } from "../../../shared/charts/bullet-bar.component";

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
            {formatMonthLong(month)} budget
          </h2>
          <p className="mt-1 leading-none text-ink">
            <span className="text-[44px] font-semibold tracking-[-0.035em] @lg:text-[56px]">{formatMoney(Math.abs(variance))}</span>
            <span className="ml-2.5 inline-block text-xl font-medium tracking-[-0.02em] whitespace-nowrap text-ink-2 @lg:text-2xl">{variance <= 0 ? "under budget" : "over budget"}</span>
          </p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-ink-2">
            You spent <span className="font-medium text-ink">{formatMoney(spent)}</span> of the {formatMoney(budget)} planned,{" "}
            {formatPercent(spent / budget)} of the budget.
            {mom !== null && prevMonth && (
              <>
                {" "}
                Spending {mom >= 0 ? "rose" : "fell"} {formatPercent(Math.abs(mom), 1)} from {formatMonthShort(prevMonth)}.
              </>
            )}
          </p>

          <div className="mt-6 max-w-2xl">
            <div className="mb-1.5 flex justify-between text-xs text-muted">
              <span>
                Spent <span className="font-medium text-ink tabular-nums">{formatMoney(spent)}</span>
              </span>
              <span>
                Budget <span className="font-medium text-ink tabular-nums">{formatMoney(budget)}</span>
              </span>
            </div>
            <BulletBar actual={spent} target={budget} max={Math.max(budget, spent) * 1.04} height={28} />
          </div>
        </div>

        <dl className="w-full shrink-0 divide-y divide-line rounded-xl border border-line @4xl:w-80">
          <div className="px-4 py-3">
            <dt className="text-xs text-muted">Over budget</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">
              {over.length ? `${over.length} of ${budgets.length} categories` : "None this month"}
            </dd>
          </div>
          {over[0] && (
            <div className="px-4 py-3">
              <dt className="text-xs text-muted">Biggest overrun</dt>
              <dd className="mt-0.5 text-sm text-ink">
                <span className="font-medium">{over[0].category}</span>, {formatMoney(budgetVarianceCents(over[0]))} over (
                {formatPercent(budgetUsed(over[0]))} used)
              </dd>
            </div>
          )}
          {roomiest && budgetVarianceCents(roomiest) < 0 && (
            <div className="px-4 py-3">
              <dt className="text-xs text-muted">Most room left</dt>
              <dd className="mt-0.5 text-sm text-ink">
                <span className="font-medium">{roomiest.category}</span>, {formatMoney(-budgetVarianceCents(roomiest))} unspent
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}
