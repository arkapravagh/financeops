/** Budget table: one row per expense category with a bullet bar, figures, 3-month trend and expandable detail. */

import { AlertTriangle, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { BudgetScale } from "../../../enums/budget-scale.enum";
import type { ExpenseCategory } from "../../../enums/category.enum";
import { budgetTableLabels as L } from "../../../language/en/budgets.lang";
import { categoryLabels } from "../../../language/en/enums.lang";
import { BulletBar } from "../../../shared/charts/bullet-bar.component";
import { niceTicks } from "../../../shared/charts/chart.util";
import { Amount } from "../../../shared/finance/amount.component";
import { Badge } from "../../../shared/ui/badge.component";
import { formatDayMonth, formatMonthLong, formatMonthShort } from "../../../shared/utils/dates.util";
import { budgetUsed, budgetVarianceCents } from "../../../shared/utils/metrics.util";
import { formatCompact, formatMoney, formatPercent } from "../../../shared/utils/money.util";
import type { Budget, Transaction } from "../../../types/finance.types";

/** Budget rows, scale, per-category history, a transaction lookup for details, and an Ask AI hook. */
export type BudgetTableProps = {
  budgets: Budget[];
  scale: BudgetScale;
  /** Budget rows for the trend column, per category, oldest first. */
  history: Record<string, Budget[]>;
  /** Transactions behind a category for the selected month. */
  transactionsFor: (category: ExpenseCategory) => Transaction[];
  onAsk: (prompt: string) => void;
};

// Wide (≥ 64rem of its own width): a real table row. Narrow: stacked card-row. Container query, not viewport.
const wideGrid = "@5xl:grid-cols-[10.5rem_minmax(0,1fr)_6rem_6rem_7.5rem_4.5rem_1.25rem]";

function Trend({ rows }: { rows: Budget[] }) {
  const H = 24;
  const cap = 1.3;
  return (
    <span
      className="flex h-6 items-end gap-[3px]"
      role="img"
      aria-label={L.trendLabel(rows.map((r) => L.trendItem(formatMonthShort(r.month), formatPercent(budgetUsed(r)))).join(", "))}
    >
      {rows.map((r) => {
        const u = budgetUsed(r);
        return (
          <span
            key={r.month}
            title={L.trendTitle(formatMonthShort(r.month), formatPercent(u))}
            className={`w-[7px] rounded-t-[2px] ${u > 1 ? "bg-critical" : "bg-accent/70"}`}
            style={{ height: Math.max(2, (Math.min(u, cap) / cap) * H) }}
          />
        );
      })}
    </span>
  );
}

/** Category breakdown. Lays out as a table when wide and as stacked rows when narrow (container query). */
export function BudgetTable({ budgets, scale, history, transactionsFor, onAsk }: BudgetTableProps) {
  const [open, setOpen] = useState<string | null>(null);

  const rows =
    scale === BudgetScale.Percent
      ? [...budgets].sort((a, b) => budgetUsed(b) - budgetUsed(a))
      : [...budgets].sort((a, b) => Math.max(b.budgetCents, b.actualCents) - Math.max(a.budgetCents, a.actualCents));

  const ticks =
    scale === BudgetScale.Percent
      ? Array.from({ length: Math.max(5, Math.ceil(Math.max(...budgets.map(budgetUsed)) * 4)) + 1 }, (_, k) => k * 0.25)
      : niceTicks(0, Math.max(...budgets.map((b) => Math.max(b.actualCents, b.budgetCents))), 4);
  const max = ticks[ticks.length - 1];
  const tickLabel = (t: number) => (scale === BudgetScale.Percent ? formatPercent(t) : formatCompact(t));

  return (
    <div className="@container">
      {/* Column headings (wide layout only) */}
      <div className={`hidden items-end gap-x-4 border-b border-line px-5 pb-2 text-xs font-medium text-muted @5xl:grid ${wideGrid}`}>
        <span>{L.category}</span>
        <span className="relative h-4" aria-hidden>
          {ticks.map((t, i) => (
            <span
              key={t}
              className={`absolute font-normal tabular-nums ${i === 0 ? "" : i === ticks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: `${(t / max) * 100}%` }}
            >
              {tickLabel(t)}
            </span>
          ))}
          <span className="sr-only">{L.spendAgainstBudget}</span>
        </span>
        <span className="text-right">{L.spent}</span>
        <span className="text-right">{L.budget}</span>
        <span className="text-right">{L.variance}</span>
        <span className="text-right">{L.threeMonths}</span>
        <span />
      </div>

      <ul className="divide-y divide-line">
        {rows.map((b) => {
          const used = budgetUsed(b);
          const variance = budgetVarianceCents(b);
          const over = variance > 0;
          const isOpen = open === b.category;
          const actualV = scale === BudgetScale.Percent ? used : b.actualCents;
          const targetV = scale === BudgetScale.Percent ? 1 : b.budgetCents;
          const panelId = `budget-${b.category.replace(/\W+/g, "-")}`;

          return (
            <li key={b.category}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : b.category)}
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-3.5 text-left outline-none transition-colors hover:bg-surface-2/60 focus-visible:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset ${wideGrid} ${
                  isOpen ? "bg-surface-2/60" : ""
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-ink">{categoryLabels[b.category]}</span>
                  {scale === BudgetScale.Percent && <span className="text-xs text-muted tabular-nums @5xl:hidden">{formatPercent(used)}</span>}
                </span>

                {/* Variance + chevron (narrow: top-right) */}
                <span className="flex items-center justify-end gap-2 @5xl:hidden">
                  <VarianceLabel variance={variance} />
                  <ChevronDown size={16} className={`text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                </span>

                <span className="col-span-2 @5xl:col-span-1">
                  <BulletBar actual={actualV} target={targetV} max={max} ticks={ticks} />
                </span>

                <span className="col-span-2 text-xs text-muted @5xl:hidden">
                  {L.spentOf(formatMoney(b.actualCents), formatMoney(b.budgetCents))}
                </span>

                {/* Wide-only columns */}
                <span className="hidden text-right text-sm font-medium text-ink tabular-nums @5xl:block">{formatMoney(b.actualCents)}</span>
                <span className="hidden text-right text-sm text-ink-2 tabular-nums @5xl:block">{formatMoney(b.budgetCents)}</span>
                <span className="hidden justify-end @5xl:flex">
                  <VarianceLabel variance={variance} />
                </span>
                <span className="hidden justify-end @5xl:flex">
                  <Trend rows={history[b.category] ?? []} />
                </span>
                <ChevronDown size={16} className={`hidden text-muted transition-transform @5xl:block ${isOpen ? "rotate-180" : ""}`} aria-hidden />
              </button>

              {isOpen && (
                <Details
                  id={panelId}
                  budget={b}
                  over={over}
                  history={history[b.category] ?? []}
                  transactions={transactionsFor(b.category)}
                  onAsk={onAsk}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VarianceLabel({ variance }: { variance: number }) {
  if (variance > 0)
    return (
      <Badge tone="critical" icon={<AlertTriangle size={12} />}>
        {L.over(formatCompact(variance))}
      </Badge>
    );
  if (variance === 0) return <span className="text-xs font-medium text-ink-2">{L.onBudget}</span>;
  return <span className="text-xs text-ink-2 tabular-nums">{L.left(formatCompact(-variance))}</span>;
}

function Details({
  id,
  budget,
  over,
  history,
  transactions,
  onAsk,
}: {
  id: string;
  budget: Budget;
  over: boolean;
  history: Budget[];
  transactions: Transaction[];
  onAsk: (prompt: string) => void;
}) {
  const top = [...transactions].sort((a, b) => Math.abs(b.amountCents) - Math.abs(a.amountCents)).slice(0, 4);
  const prev = history.length > 1 ? history[history.length - 2] : null;
  const change = prev ? budget.actualCents - prev.actualCents : null;
  const avgUsed = history.length ? history.reduce((s, r) => s + budgetUsed(r), 0) / history.length : null;
  const overMonths = history.filter((r) => budgetUsed(r) > 1).length;

  return (
    <div id={id} className="grid grid-cols-1 gap-5 border-t border-line bg-surface-2/40 px-5 py-4 @3xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink">{L.largestTransactions(formatMonthLong(budget.month))}</p>
        {top.length ? (
          <ul className="mt-2 divide-y divide-line">
            {top.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-14 shrink-0 text-xs text-muted">{formatDayMonth(t.date)}</span>
                <span className="min-w-0 flex-1 truncate text-ink">
                  {t.description} <span className="text-muted">{t.counterparty}</span>
                </span>
                <Amount cents={t.amountCents} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink-2">{L.noDetail}</p>
        )}
        <Link
          to="/transactions"
          className="mt-2 inline-flex items-center gap-1 rounded text-[13px] font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
        >
          {L.openTransactions} <ArrowRight size={13} aria-hidden />
        </Link>
      </div>

      <div className="flex flex-col gap-3 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
          {change !== null && prev && (
            <>
              <dt className="text-muted">{L.versus(formatMonthShort(prev.month))}</dt>
              <dd className={`text-right tabular-nums ${change > 0 ? "text-ink" : "text-good-ink"}`}>
                {formatMoney(change, { signed: true })}
              </dd>
            </>
          )}
          {avgUsed !== null && (
            <>
              <dt className="text-muted">{L.average(history.length)}</dt>
              <dd className="text-right tabular-nums text-ink">{L.used(formatPercent(avgUsed))}</dd>
            </>
          )}
          <dt className="text-muted">{L.monthsOver}</dt>
          <dd className="text-right tabular-nums text-ink">
            {L.monthsOverValue(overMonths, history.length)}
          </dd>
        </dl>
        {over && (
          <button
            type="button"
            onClick={() => onAsk(L.askPrompt(categoryLabels[budget.category]))}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] font-medium text-ink outline-none transition hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Sparkles size={13} className="text-accent" aria-hidden /> {L.askWhy}
          </button>
        )}
      </div>
    </div>
  );
}
