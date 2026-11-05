---
paths:
  - "src/shared/charts/**"
  - "src/features/**"
---

# Chart rules

Charts are hand-rolled SVG components in `src/shared/charts/`. Don't add a chart library.

## Pick the form first
- One headline number → **stat tile / hero figure**, not a chart.
- Change over time (cash balance, MRR) → **line** (area wash optional).
- Monthly amounts compared (cash in vs out) → **columns**.
- Actual vs. target (budgets, quotas) → **`BulletBar`** (band = target, bar = actual, tick = target line,
  overflow in critical + an "over" label). Rows share one scale; default to % of target, offer $ as a toggle.
  For a full category breakdown use `BudgetTable` (`features/budgets/components/budget-table.component.tsx`: bullet + figures + 3-month trend + expandable detail).
- Plan vs actual columns: plan in neutral `--muted`, actual in `--series-1` (never the pale band colour for marks).
- Single progress value → **meter**. Part of a whole → segmented bar, never a pie.
- **Never a dual-axis chart.** Two measures of different scale = two charts.

## Color
- Series colors are the `--series-1..3` tokens in `src/styles/index.css` (indigo, burnt orange, teal), assigned
  **in fixed order**, never cycled, and they follow the entity (filtering must not repaint surviving series).
  **Max 3 series per chart** — that's what the palette is validated for; fold extras into "Other" or use small multiples.
- Changing a series color? Re-run the dataviz validator (`validate_palette.js --pairs all`) for **both** light (`#ffffff`)
  and dark (`#1a1a19`) surfaces and record the result in the comment above the tokens.
- Status colors (`good / warning / serious / critical`) are reserved for state, never for a series.
- Text (labels, values, legend) uses ink tokens, never the series color.
- Light and dark series steps are defined separately in the tokens — don't just invert.

## Marks
- Columns ≤ 24px wide, 4px rounded top, square at baseline, 2px gap between adjacent bars.
- Lines 2px, round caps/joins. Markers r ≥ 4 with a 2px surface ring.
- Area fill = vertical gradient of the series color, ~16% at the line fading to 0 at the baseline.
- Gridlines: 1px solid hairline, recessive. Y ticks rounded and compact (`$0 / $50K / $100K`).
- Label selectively (last point, extreme) — never a number on every point.

## Interaction & a11y
- Every chart has hover: crosshair + tooltip for lines, per-bar tooltip for columns. Hit areas larger than marks.
- ≥ 2 series → a legend is always shown. One series → the card title names it, no legend.
- Every chart has `role="img"` + `aria-label` summarising it, and the data is available as a table somewhere.
- Projections are visually distinct (dashed line) **and** labelled "Projected".
- Events on a time chart (a raise landing, "Start raising", "Zero cash") use `LineChart`'s `markers` prop — a dotted
  hairline plus a short label — never a second axis or an annotation drawn in a series colour.
- Comparing scenarios: the edited scenario is `--series-1` (solid history, dashed projection), the current trajectory is a
  `--muted` dashed reference line, saved scenarios take `--series-2` then `--series-3`. That's the 3-series cap — max 2 saved.
