---
name: add-chart
description: Add a chart to a FinanceOps page using the in-house SVG chart components (ColumnChart, LineChart). Use for any graph, trend, plot or visualisation request.
---

# Add a chart

Read `.claude/rules/charts.md` first.

1. **Is it a chart at all?** A single number → `StatTile`. Progress vs a target → `Meter`. Only change-over-time or
   comparisons get a chart.
2. **Pick the component** in `src/shared/charts/`:
   - `LineChart` — series over time; supports `projectedFrom` index (dashed + "Projected" label) and area wash.
   - `ColumnChart` — grouped monthly columns (e.g. cash in vs cash out).
   If neither fits, extend one with a prop before writing a new chart file.
3. **Data shape**: `{ label: string; values: number[] }[]` in **cents**; the chart formats ticks/tooltips
   via `formatCompact`/`formatMoney`.
4. **Series**: pass `series={[{ name, color: "var(--series-1)" }, ...]}` in fixed slot order. Never use status colors.
5. **Required**: `ariaLabel` summarising the takeaway ("Cash balance fell from $2.1M to $1.6M over 12 months").
   Legend appears automatically for ≥ 2 series.
6. Put the chart in a `Card` with a title that names what's plotted; add a short takeaway in the card subtitle.
7. `verify`: hover tooltips work, ticks are round, no label collisions, both themes legible.
