/**
 * AI spend: what AI costs the company, where the tokens go, and whether it grows faster than revenue.
 *
 * Route: `/ai-spend`. Sections: KPIs, AI spend by month vs budget, share of revenue, where the tokens go, team AI tools.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { useMemo, useState } from "react";
import { AiFeature } from "../../enums/ai-feature.enum";
import { AiUsageKind } from "../../enums/ai-usage-kind.enum";
import { AiUsageView } from "../../enums/ai-usage-view.enum";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { aiSpendLabels as L } from "../../language/en/ai-spend.lang";
import { aiFeatureLabels, aiUsageViewLabels } from "../../language/en/enums.lang";
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
import { formatCount, formatMoney, formatPercent, formatPoints } from "../../shared/utils/money.util";
import { AiSeatsTable } from "./components/ai-seats-table.component";
import { AiUsageTable } from "./components/ai-usage-table.component";

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
  const [view, setView] = useState<AiUsageView>(AiUsageView.Feature);

  const i = MONTHS.indexOf(month);
  const now = SUMMARY[i];
  const prev = SUMMARY[i - 1];
  const mrrOf = (m: string) => MRR.find((p) => p.month === m);

  const usage = useMemo(() => getAiUsage({ month }), [month]);
  const seats = useMemo(() => getAiSeatCharges({ month }), [month]);
  const rows = useMemo(
    () => (view === AiUsageView.Feature ? groupAiUsage(usage, (u) => u.feature) : groupAiUsage(usage, (u) => u.model)),
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
      label: L.kpi.spend,
      value: formatMoney(now.totalCents),
      delta: costDelta(now.totalCents, prev?.totalCents),
      context: prev ? L.kpi.versus(formatMonthShort(prev.month)) : L.kpi.firstMonth,
      trend: SUMMARY.slice(0, i + 1).map((s) => s.totalCents),
    },
    {
      label: L.kpi.share,
      value: shareNow === null ? "—" : formatPercent(shareNow, 1),
      delta:
        shareNow !== null && sharePrev !== null
          ? {
              text: L.kpi.sharePoints(formatPoints(Math.abs(shareNow - sharePrev))),
              direction: Math.abs(shareNow - sharePrev) < 0.0005 ? "flat" : shareNow > sharePrev ? "up" : "down",
              good: shareNow <= sharePrev,
            }
          : undefined,
      context: L.kpi.shareContext(formatMoney(mrrNow)),
    },
    {
      label: L.kpi.tokens,
      value: formatCount(now.tokens),
      delta: costDelta(now.tokens, prev?.tokens, true),
      context: L.kpi.requests(formatCount(now.requests)),
      trend: SUMMARY.slice(0, i + 1).map((s) => s.tokens),
    },
    {
      label: L.kpi.perCustomer,
      value: perCustomerNow === null ? "—" : formatMoney(perCustomerNow, { cents: true }),
      delta: perCustomerNow !== null && perCustomerPrev !== null ? costDelta(perCustomerNow, perCustomerPrev) : undefined,
      context: L.kpi.customers(mrrOf(month)?.customers ?? 0),
    },
  ];

  const history = SUMMARY.slice(0, i + 1);
  const historyMonths = MONTHS.slice(0, i + 1);
  const sharePoints = historyMonths.map((_, m) => share(m));

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
            <Button onClick={() => ask(L.askPrompt)}>{L.askAi}</Button>
          </>
        }
      />

      <KpiRow items={kpis} />

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card
          className="xl:col-span-2"
          title={L.byMonth.title}
          subtitle={
            aiGrowth3 !== null && mrrGrowth3 !== null
              ? L.byMonth.growthSubtitle(formatPercent(aiGrowth3), formatMonthShort(MONTHS[base!]), formatPercent(mrrGrowth3))
              : L.byMonth.defaultSubtitle
          }
        >
          <ColumnChart
            labels={historyMonths.map(formatMonthShort)}
            tooltipLabels={historyMonths.map(formatMonthLong)}
            series={[
              { name: L.byMonth.api, color: "var(--series-1)", values: history.map((s) => s.apiCents) },
              { name: L.byMonth.gpu, color: "var(--series-2)", values: history.map((s) => s.computeCents) },
              { name: L.byMonth.seats, color: "var(--series-3)", values: history.map((s) => s.seatsCents) },
            ]}
            extraRows={(m) => [{ label: L.byMonth.total, value: formatMoney(history[m].totalCents) }]}
            ariaLabel={history
              .map((s) => L.byMonth.summaryItem(formatMonthShort(s.month), formatMoney(s.totalCents)))
              .join("; ")}
            height={300}
          />
        </Card>

        <Card title={L.budget.title(formatMonthLong(month))} flush>
          <div className="px-5">
            {budget ? (
              <>
                <p className="text-ink">
                  <span className="text-[26px] font-semibold tracking-[-0.02em]">
                    {formatMoney(Math.abs(now.totalCents - budget.budgetCents))}
                  </span>
                  <span className="ml-2 text-sm text-ink-2">{now.totalCents > budget.budgetCents ? L.budget.over : L.budget.under}</span>
                </p>
                <div className="mt-3 mb-1.5 flex justify-between text-xs text-muted">
                  <span>
                    {L.budget.spent} <span className="font-medium text-ink tabular-nums">{formatMoney(now.totalCents)}</span>
                  </span>
                  <span>
                    {L.budget.budget} <span className="font-medium text-ink tabular-nums">{formatMoney(budget.budgetCents)}</span>
                  </span>
                </div>
                <BulletBar actual={now.totalCents} target={budget.budgetCents} max={Math.max(budget.budgetCents, now.totalCents) * 1.05} />
              </>
            ) : (
              <p className="text-sm text-ink-2">{L.budget.none}</p>
            )}
          </div>
          <div className="mt-3 divide-y divide-line border-t border-line px-5 pb-1.5">
            {aiGrowth3 !== null && mrrGrowth3 !== null && aiGrowth3 > mrrGrowth3 && (
              <Insight tone="warning" title={L.insights.fasterTitle}>
                {L.insights.fasterBody(formatPercent(aiGrowth3), formatPercent(mrrGrowth3), shareNow === null ? "—" : formatPercent(shareNow, 1))}
              </Insight>
            )}
            {topFeature && (
              <Insight tone="info" title={L.insights.biggestTitle(aiFeatureLabels[topFeature.key as AiFeature] ?? topFeature.key)}>
                {L.insights.biggestBody(formatMoney(topFeature.costCents), formatPercent(topFeature.costCents / (now.totalCents - now.seatsCents)))}
              </Insight>
            )}
            {idleSeats > 0 && (
              <Insight tone="info" title={L.insights.idleTitle(idleSeats)}>
                {L.insights.idleBody(formatMoney(idleCents))}
              </Insight>
            )}
          </div>
        </Card>
      </div>

      <Card
        className="mt-5"
        flush
        title={L.tokens.title}
        subtitle={L.tokens.subtitle(formatMonthLong(month))}
        action={
          <Segmented
            label={L.tokens.groupBy}
            value={view}
            onChange={setView}
            options={[
              { value: AiUsageView.Feature, label: aiUsageViewLabels[AiUsageView.Feature] },
              { value: AiUsageView.Model, label: aiUsageViewLabels[AiUsageView.Model] },
            ]}
          />
        }
      >
        <AiUsageTable
          view={view}
          rows={rows}
          detailFor={(key) => {
            if (view === AiUsageView.Feature) return FEATURES.find((f) => f.feature === key)?.description ?? "";
            const u = usage.find((x) => x.model === key);
            return u ? L.tokens.modelDetail(u.vendor, u.kind === AiUsageKind.Api ? L.tokens.billedPerToken : L.tokens.billedPerGpuHour) : "";
          }}
          nameFor={(key) => (view === AiUsageView.Feature ? (aiFeatureLabels[key as AiFeature] ?? key) : key)}
          audienceFor={(key) => (CUSTOMER_FACING.has(key as AiFeature) ? L.tokens.customers : L.tokens.team)}
        />
      </Card>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title={L.share.title} subtitle={L.share.subtitle}>
          <LineChart
            labels={historyMonths.map(formatMonthShort)}
            tooltipLabels={historyMonths.map(formatMonthLong)}
            series={[
              {
                name: L.share.series,
                color: "var(--series-1)",
                area: true,
                // basis points, so the shared integer tick logic works for small ratios
                values: sharePoints.map((r) => (r === null ? null : Math.round(r * 10_000))),
              },
            ]}
            formatTick={(v) => formatPercent(v / 10_000, v % 100 === 0 ? 0 : 1)}
            formatValue={(v) => formatPercent(v / 10_000, 1)}
            ariaLabel={historyMonths
              .map((m, k) => L.share.summaryItem(formatMonthShort(m), sharePoints[k] === null ? L.share.noRevenue : formatPercent(sharePoints[k]!, 1)))
              .join("; ")}
            height={220}
          />
        </Card>

        <Card
          title={L.seats.title}
          flush
          subtitle={
            seats.length
              ? L.seats.subtitle(formatMoney(sumCents(seats.map((s) => s.costCents))))
              : L.seats.none
          }
        >
          {seats.length > 0 && <AiSeatsTable seats={seats} />}
          <p className="px-5 py-3 text-xs text-muted">{L.seats.note}</p>
        </Card>
      </div>
    </>
  );
}
