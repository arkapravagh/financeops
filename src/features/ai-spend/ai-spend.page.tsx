/**
 * AI spend: what AI costs the company, where the tokens go, and whether it grows faster than revenue.
 *
 * Route: `/ai-spend`. Sections: KPIs, AI spend by month vs budget, share of revenue, where the tokens go, team AI tools.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { useMemo, useState } from "react";
import { getAiBudget, getAiFeatures, getAiMonths, getAiSeatCharges, getAiUsage } from "../../services/ai-spend.service";
import { getMrrHistory } from "../../services/revenue.service";
import { BulletBar } from "../../shared/charts/bullet-bar.component";
import { ColumnChart } from "../../shared/charts/column-chart.component";
import { LineChart } from "../../shared/charts/line-chart.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { Insight } from "../../shared/ui/insight.component";
import { KpiRow, type Kpi } from "../../shared/ui/kpi-row.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { Segmented } from "../../shared/ui/segmented.component";
import type { Delta } from "../../shared/ui/stat-tile.component";
import { formatMonthLong, formatMonthShort } from "../../shared/utils/dates.util";
import {
  aiCostPerCustomerCents,
  aiMonthlySummary,
  aiRevenueShare,
  groupAiUsage,
  growthRate,
  idleSeatCostCents,
  sumCents,
} from "../../shared/utils/metrics.util";
import { formatCount, formatMoney, formatPercent } from "../../shared/utils/money.util";
import { useAssistantControls } from "../assistant/assistant.provider";
import { AiSeatsTable } from "./components/ai-seats-table.component";
import { AiUsageTable, type AiUsageView } from "./components/ai-usage-table.component";

const MONTHS = getAiMonths();
const SUMMARY = aiMonthlySummary(getAiUsage(), getAiSeatCharges());
const FEATURES = getAiFeatures();
const MRR = getMrrHistory();
const CUSTOMER_FACING = new Set(FEATURES.filter((f) => f.customerFacing).map((f) => f.feature));

/** Month-over-month delta where "up" means spending more (bad unless stated). */
function costDelta(current: number, previous: number | undefined, upIsGood = false): Delta | undefined {
  if (previous === undefined) return undefined;
  const g = growthRate(current, previous);
  if (g === null) return undefined;
  const direction = Math.abs(g) < 0.0005 ? "flat" : g > 0 ? "up" : "down";
  return { text: formatPercent(Math.abs(g), 1), direction, good: direction === "flat" || (g > 0) === upIsGood };
}

/** AI spend page. Month picker defaults to the latest month with usage. */
export function AiSpendPage() {
  const { ask } = useAssistantControls();
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1]);
  const [view, setView] = useState<AiUsageView>("feature");

  const i = MONTHS.indexOf(month);
  const now = SUMMARY[i];
  const prev = SUMMARY[i - 1];
  const mrrOf = (m: string) => MRR.find((p) => p.month === m);

  const usage = useMemo(() => getAiUsage({ month }), [month]);
  const seats = useMemo(() => getAiSeatCharges({ month }), [month]);
  const rows = useMemo(
    () => (view === "feature" ? groupAiUsage(usage, (u) => u.feature) : groupAiUsage(usage, (u) => u.model)),
    [usage, view],
  );
  const budget = getAiBudget(month);

  // --- Figures for the selected month ---
  const share = (m: number) => aiRevenueShare(SUMMARY[m].totalCents, mrrOf(MONTHS[m])?.mrrCents ?? 0);
  const shareNow = share(i);
  const sharePrev = i > 0 ? share(i - 1) : null;
  const perCustomer = (m: number) =>
    aiCostPerCustomerCents(
      sumCents(getAiUsage({ month: MONTHS[m] }).filter((u) => CUSTOMER_FACING.has(u.feature)).map((u) => u.costCents)),
      mrrOf(MONTHS[m])?.customers ?? 0,
    );
  const perCustomerNow = perCustomer(i);
  const perCustomerPrev = i > 0 ? perCustomer(i - 1) : null;
  const idleCents = sumCents(seats.map(idleSeatCostCents));
  const idleSeats = sumCents(seats.map((s) => s.seats - s.activeSeats));

  // --- 3-month trend vs revenue ---
  const base = i >= 3 ? i - 3 : null;
  const aiGrowth3 = base === null ? null : growthRate(now.totalCents, SUMMARY[base].totalCents);
  const mrrNow = mrrOf(month)?.mrrCents ?? 0;
  const mrrBase = base === null ? 0 : (mrrOf(MONTHS[base])?.mrrCents ?? 0);
  const mrrGrowth3 = base === null ? null : growthRate(mrrNow, mrrBase);
  const topFeature = groupAiUsage(usage, (u) => u.feature)[0];

  const kpis: Kpi[] = [
    {
      label: "AI spend",
      value: formatMoney(now.totalCents),
      delta: costDelta(now.totalCents, prev?.totalCents),
      context: prev ? `vs ${formatMonthShort(prev.month)}` : "first month tracked",
      trend: SUMMARY.slice(0, i + 1).map((s) => s.totalCents),
    },
    {
      label: "Share of revenue",
      value: shareNow === null ? "—" : formatPercent(shareNow, 1),
      delta:
        shareNow !== null && sharePrev !== null
          ? {
              text: `${Math.abs((shareNow - sharePrev) * 100).toFixed(1)} pts`,
              direction: Math.abs(shareNow - sharePrev) < 0.0005 ? "flat" : shareNow > sharePrev ? "up" : "down",
              good: shareNow <= sharePrev,
            }
          : undefined,
      context: `of ${formatMoney(mrrNow)} MRR`,
    },
    {
      label: "Tokens processed",
      value: formatCount(now.tokens),
      delta: costDelta(now.tokens, prev?.tokens, true),
      context: `${formatCount(now.requests)} requests`,
      trend: SUMMARY.slice(0, i + 1).map((s) => s.tokens),
    },
    {
      label: "AI cost per customer",
      value: perCustomerNow === null ? "—" : formatMoney(perCustomerNow, { cents: true }),
      delta: perCustomerNow !== null && perCustomerPrev !== null ? costDelta(perCustomerNow, perCustomerPrev) : undefined,
      context: `${mrrOf(month)?.customers ?? 0} paying customers`,
    },
  ];

  const history = SUMMARY.slice(0, i + 1);
  const historyMonths = MONTHS.slice(0, i + 1);
  const sharePoints = historyMonths.map((_, m) => share(m));

  return (
    <>
      <PageHeader
        title="AI spend"
        subtitle="What is AI costing us, and is it growing faster than revenue?"
        actions={
          <>
            <Segmented
              label="Month"
              size="md"
              value={month}
              onChange={setMonth}
              options={MONTHS.map((m) => ({ value: m, label: formatMonthShort(m) }))}
            />
            <Button onClick={() => ask("Where is our AI spend going, and how can we cut it?")}>Ask AI</Button>
          </>
        }
      />

      <KpiRow items={kpis} />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title="AI spend by month"
          subtitle={
            aiGrowth3 !== null && mrrGrowth3 !== null
              ? `Up ${formatPercent(aiGrowth3)} since ${formatMonthShort(MONTHS[base!])}, while revenue grew ${formatPercent(mrrGrowth3)}.`
              : "Model APIs, self-hosted GPUs and per-seat team tools."
          }
        >
          <ColumnChart
            labels={historyMonths.map(formatMonthShort)}
            tooltipLabels={historyMonths.map(formatMonthLong)}
            series={[
              { name: "Model APIs", color: "var(--series-1)", values: history.map((s) => s.apiCents) },
              { name: "GPU hosting", color: "var(--series-2)", values: history.map((s) => s.computeCents) },
              { name: "Team seats", color: "var(--series-3)", values: history.map((s) => s.seatsCents) },
            ]}
            extraRows={(m) => [{ label: "Total", value: formatMoney(history[m].totalCents) }]}
            ariaLabel={history
              .map((s) => `${formatMonthShort(s.month)}: ${formatMoney(s.totalCents)} total`)
              .join("; ")}
            height={300}
          />
        </Card>

        <Card title={`${formatMonthLong(month)} budget`} flush>
          <div className="px-5">
            {budget ? (
              <>
                <p className="text-ink">
                  <span className="text-[26px] font-semibold tracking-[-0.02em]">
                    {formatMoney(Math.abs(now.totalCents - budget.budgetCents))}
                  </span>
                  <span className="ml-2 text-sm text-ink-2">{now.totalCents > budget.budgetCents ? "over budget" : "under budget"}</span>
                </p>
                <div className="mt-3 mb-1.5 flex justify-between text-xs text-muted">
                  <span>
                    Spent <span className="font-medium text-ink tabular-nums">{formatMoney(now.totalCents)}</span>
                  </span>
                  <span>
                    Budget <span className="font-medium text-ink tabular-nums">{formatMoney(budget.budgetCents)}</span>
                  </span>
                </div>
                <BulletBar actual={now.totalCents} target={budget.budgetCents} max={Math.max(budget.budgetCents, now.totalCents) * 1.05} />
              </>
            ) : (
              <p className="text-sm text-ink-2">No AI budget for this month. AI budgets start in August 2026.</p>
            )}
          </div>
          <div className="mt-3 divide-y divide-line border-t border-line px-5 pb-1.5">
            {aiGrowth3 !== null && mrrGrowth3 !== null && aiGrowth3 > mrrGrowth3 && (
              <Insight tone="warning" title="AI spend is growing faster than revenue">
                {formatPercent(aiGrowth3)} in three months against {formatPercent(mrrGrowth3)} for MRR. AI is now{" "}
                {shareNow === null ? "—" : formatPercent(shareNow, 1)} of revenue.
              </Insight>
            )}
            {topFeature && (
              <Insight tone="info" title={`${topFeature.key} is the biggest cost`}>
                {formatMoney(topFeature.costCents)}, {formatPercent(topFeature.costCents / (now.totalCents - now.seatsCents))} of usage-based AI
                spend this month.
              </Insight>
            )}
            {idleSeats > 0 && (
              <Insight tone="info" title={`${idleSeats} AI seats went unused`}>
                That is {formatMoney(idleCents)} this month. Remove them before the next renewal.
              </Insight>
            )}
          </div>
        </Card>
      </div>

      <Card
        className="mt-5"
        flush
        title="Where the tokens go"
        subtitle={`Usage-based AI in ${formatMonthLong(month)}, as billed by each provider. Hover tokens for the input and output split.`}
        action={
          <Segmented
            label="Group by"
            value={view}
            onChange={setView}
            options={[
              { value: "feature", label: "By feature" },
              { value: "model", label: "By model" },
            ]}
          />
        }
      >
        <AiUsageTable
          view={view}
          rows={rows}
          detailFor={(key) => {
            if (view === "feature") return FEATURES.find((f) => f.feature === key)?.description ?? "";
            const u = usage.find((x) => x.model === key);
            return u ? `${u.vendor}, ${u.kind === "api" ? "billed per token" : "billed per GPU hour"}` : "";
          }}
          audienceFor={(key) => (CUSTOMER_FACING.has(key as never) ? "Customers" : "Team")}
        />
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="AI spend as a share of revenue" subtitle="AI spend divided by that month's MRR. Lower means AI pays for itself more easily.">
          <LineChart
            labels={historyMonths.map(formatMonthShort)}
            tooltipLabels={historyMonths.map(formatMonthLong)}
            series={[
              {
                name: "Share of revenue",
                color: "var(--series-1)",
                area: true,
                // basis points, so the shared integer tick logic works for small ratios
                values: sharePoints.map((r) => (r === null ? null : Math.round(r * 10_000))),
              },
            ]}
            formatTick={(v) => `${(v / 100).toFixed(v % 100 === 0 ? 0 : 1)}%`}
            formatValue={(v) => `${(v / 100).toFixed(1)}%`}
            ariaLabel={historyMonths
              .map((m, k) => `${formatMonthShort(m)}: ${sharePoints[k] === null ? "no revenue" : formatPercent(sharePoints[k]!, 1)}`)
              .join("; ")}
            height={220}
          />
        </Card>

        <Card
          title="Team AI tools"
          flush
          subtitle={
            seats.length
              ? `${formatMoney(sumCents(seats.map((s) => s.costCents)))} in per-seat tools this month.`
              : "No per-seat AI tools this month."
          }
        >
          {seats.length > 0 && <AiSeatsTable seats={seats} />}
          <p className="px-5 py-3 text-xs text-muted">AI spend is booked under Software & cloud in Budgets. Figures are as billed.</p>
        </Card>
      </div>
    </>
  );
}
