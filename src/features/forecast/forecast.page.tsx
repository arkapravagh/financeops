/**
 * Runway & forecast: model hiring, growth and fundraising to see how long the money lasts.
 *
 * Route: `/forecast`. Sections: verdict (hero), projected cash chart, compare scenarios, runway sensitivity, scenario panel, month-by-month table, custom scenario drawer.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { getCashHistory } from "../../services/cash.service";
import { getForecastBase, getForecastOrigin } from "../../services/forecast.service";
import { LineChart, type ChartMarker, type LineSeries } from "../../shared/charts/line-chart.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { Segmented } from "../../shared/ui/segmented.component";
import { formatMonthLong, formatMonthShort, monthKeyAdd } from "../../shared/utils/dates.util";
import { formatCompact } from "../../shared/utils/money.util";
import { CustomScenarioDrawer, type CustomScenarioDraft } from "./components/custom-scenario-drawer.component";
import { ForecastVerdict } from "./components/forecast-verdict.component";
import { exportProjectionCsv, ProjectionTable } from "./components/projection-table.component";
import { RunwaySensitivity } from "./components/runway-sensitivity.component";
import { ScenarioBuilder } from "./components/scenario-builder.component";
import { ScenarioCompare, type CompareRow } from "./components/scenario-compare.component";
import { scenarioLibrary } from "./scenario-library.config";
import { evaluateScenario, fromBase, RAISE_LEAD_MONTHS, sameAssumptions, type LibraryScenario, type Scenario } from "./scenario.model";
import { MAX_SAVED, useCustomScenarios, useSavedScenarios } from "./use-scenario-storage.hook";

type Horizon = "12" | "24" | "36";

// Derived from actuals once; the page only varies the scenario on top.
const BASE = getForecastBase();
const ORIGIN = getForecastOrigin();
const HISTORY = getCashHistory();
const CURRENT = fromBase(BASE);
const LIBRARY = scenarioLibrary(BASE);
const SAVED_COLORS = ["var(--series-2)", "var(--series-3)"];

/** Forecast page. Everything here is labelled as a projection; the base comes from `getForecastBase()`. */
export function ForecastPage() {
  const [scenario, setScenario] = useState<Scenario>(CURRENT);
  const [horizon, setHorizon] = useState<Horizon>("24");
  const { saved, save, remove } = useSavedScenarios();
  const { custom, upsert, remove: removeCustom } = useCustomScenarios();
  const options = useMemo(() => [...custom, ...LIBRARY], [custom]);

  // Custom-scenario drawer. `editor` outlives `editorOpen` so the drawer can slide out; `key` gives each opening a fresh form.
  const [editor, setEditor] = useState<{ draft: CustomScenarioDraft; key: number } | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const openEditor = (draft: CustomScenarioDraft) => {
    setEditor((e) => ({ draft, key: (e?.key ?? 0) + 1 }));
    setEditorOpen(true);
  };
  const closeEditor = () => setEditorOpen(false);
  // "Create custom scenario" starts from whatever is in the panel; editing starts from the stored one.
  const createCustom = () =>
    openEditor({ ...scenario, id: undefined, name: "", description: scenario.id === "working" ? "" : `Based on ${scenario.name}.` });
  const editCustom = (s: LibraryScenario) => openEditor({ ...s });

  const isCurrent = sameAssumptions(scenario, CURRENT);
  const current = useMemo(() => evaluateScenario(BASE, CURRENT, ORIGIN), []);
  const working = useMemo(
    () => evaluateScenario(BASE, { ...scenario, name: isCurrent ? CURRENT.name : scenario.name }, ORIGIN),
    [scenario, isCurrent],
  );
  const savedResults = useMemo(() => saved.map((s) => evaluateScenario(BASE, s, ORIGIN)), [saved]);

  // ---- Chart: 12 months of actuals, then the chosen horizon ----
  const h = Number(horizon);
  const H = HISTORY.length;
  const lastMonth = HISTORY[H - 1].month;
  const months = [...HISTORY.map((m) => m.month), ...Array.from({ length: h }, (_, i) => monthKeyAdd(lastMonth, i + 1))];
  const hist = HISTORY.map((m) => m.balanceCents);
  const pad = Array<null>(H - 1).fill(null);
  const projected = (pts: { cashCents: number }[]) => [...pad, BASE.startCashCents, ...pts.slice(0, h).map((p) => p.cashCents)];
  const workingName = isCurrent ? "Current trajectory" : scenario.id === "working" ? "Your scenario" : scenario.name;

  const series: LineSeries[] = [
    { name: workingName, color: "var(--series-1)", values: [...hist, ...working.points.slice(0, h).map((p) => p.cashCents)] },
    ...(isCurrent ? [] : [{ name: "Current trajectory", color: "var(--muted)", dashed: true, values: projected(current.points) }]),
    ...savedResults.map((r, i) => ({ name: r.scenario.name, color: SAVED_COLORS[i], dashed: true, values: projected(r.points) })),
  ];

  const markers: ChartMarker[] = [];
  if (scenario.raise && scenario.raise.month <= h)
    markers.push({ index: H - 1 + scenario.raise.month, label: `Raise ${formatCompact(scenario.raise.amountCents)}` });
  if (!scenario.raise && working.runway !== null && working.runway - RAISE_LEAD_MONTHS > 0 && working.runway - RAISE_LEAD_MONTHS <= h)
    markers.push({ index: H - 1 + Math.round(working.runway - RAISE_LEAD_MONTHS), label: "Start raising" });
  if (working.runway !== null && working.runway <= h)
    markers.push({ index: H - 1 + Math.round(working.runway), label: "Zero cash", tone: "critical" });

  const compareRows: CompareRow[] = [
    { result: working, color: "var(--series-1)", label: workingName },
    ...(isCurrent ? [] : [{ result: current, color: "var(--muted)", dashed: true }]),
    ...savedResults.map((r, i) => ({ result: r, color: SAVED_COLORS[i], dashed: true, removable: true })),
  ];

  const runwayText = (r: number | null) => (r === null ? `more than ${BASE.months} months` : `${r.toFixed(1)} months`);

  return (
    <>
      <PageHeader
        title="Runway & forecast"
        subtitle="Model hiring, growth and fundraising to see how long the money lasts. Everything here is a projection, not a promise."
        actions={
          <Segmented
            label="Forecast horizon"
            size="md"
            value={horizon}
            onChange={setHorizon}
            options={[
              { value: "12", label: "12 months" },
              { value: "24", label: "24 months" },
              { value: "36", label: "36 months" },
            ]}
          />
        }
      />

      <ForecastVerdict result={working} current={current} isCurrent={isCurrent} origin={ORIGIN} />

      {/* Container query, not viewport: stacks when the AI panel leaves too little width (layout-patterns) */}
      <div className="@container mt-5">
      <div className="grid grid-cols-1 gap-5 @5xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Projected cash balance" subtitle={`12 months of actuals, then ${h} months projected. Solid is actual; dashed is projected.`}>
            <LineChart
              labels={months.map(formatMonthShort)}
              tooltipLabels={months.map(formatMonthLong)}
              projectedFrom={H - 1}
              series={series}
              markers={markers}
              ariaLabel={`Projected cash. ${workingName}: runway ${runwayText(working.runway)}.${
                isCurrent ? "" : ` Current trajectory: ${runwayText(current.runway)}.`
              }${savedResults.map((r) => ` ${r.scenario.name}: ${runwayText(r.runway)}.`).join("")}`}
              height={320}
            />
          </Card>

          <Card
            title="Compare scenarios"
            subtitle={
              saved.length
                ? `Saved scenarios stay on the chart until you delete them (up to ${MAX_SAVED}).`
                : "Pick a scenario and press Compare in the panel to keep it here and on the chart."
            }
            flush
          >
            <ScenarioCompare rows={compareRows} origin={ORIGIN} onRemove={remove} />
          </Card>

          <Card
            title="What moves your runway most"
            subtitle={`Months gained or lost from one change to ${isCurrent ? "the current trajectory" : "your scenario"}.`}
          >
            <RunwaySensitivity base={BASE} scenario={scenario} />
          </Card>
        </div>

        <Card
          title="Scenario"
          subtitle="Change the assumptions. The chart and numbers update as you go."
          flush
          className="self-start @5xl:sticky @5xl:top-20"
        >
          <ScenarioBuilder
            scenario={scenario}
            current={CURRENT}
            options={options}
            origin={ORIGIN}
            canSave={saved.length < MAX_SAVED}
            onChange={setScenario}
            onSave={(name) => save(scenario, name)}
            onCreateCustom={createCustom}
            onEditCustom={editCustom}
          />
        </Card>
      </div>

      </div>
      <Card
        className="mt-5"
        title="Month by month"
        subtitle={`${workingName}, next ${h} months.`}
        flush
        action={
          <Button className="h-8" icon={<Download size={14} />} onClick={() => exportProjectionCsv(working.points.slice(0, h), ORIGIN, workingName)}>
            Export CSV
          </Button>
        }
      >
        <ProjectionTable points={working.points.slice(0, h)} origin={ORIGIN} scenarioName={workingName} />
      </Card>

      {editor && (
        <CustomScenarioDrawer
          key={editor.key}
          open={editorOpen}
          initial={editor.draft}
          base={BASE}
          current={CURRENT}
          origin={ORIGIN}
          takenNames={options.filter((o) => o.id !== editor.draft.id).map((o) => o.name)}
          onClose={closeEditor}
          onSave={(d) => {
            setScenario(upsert(d));
            closeEditor();
          }}
          onDelete={() => {
            if (editor.draft.id) removeCustom(editor.draft.id);
            if (scenario.id === editor.draft.id) setScenario(CURRENT);
            closeEditor();
          }}
        />
      )}
    </>
  );
}
