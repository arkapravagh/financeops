# FinanceOps — project guide for Claude

FinanceOps is a finance co-pilot for **small startups (seed → Series A, 2–50 people)**.
It answers the questions a founder asks every week:

- How much cash do we have, and how long does it last? (cash, burn, runway)
- Where is the money going? (categorised spend, budgets vs actuals)
- Who owes us money? (invoices / accounts receivable)
- What happens if we hire / grow / cut? (scenario forecast)

## Current phase: static prototype

- **Frontend only.** React + TypeScript + Vite + Tailwind CSS v4 + React Router.
- **No backend, no API calls, no auth.** All data comes from typed mock files in `src/data/`.
- Data is read only through `src/services/` so the mock layer can later be swapped for a real API
  without touching pages (see the `connect-api` skill).
- Client-side interactivity is fine (filters, sliders, theme toggle). Persisting anything is not in scope.

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` (http://localhost:5173) |
| Type-check + build | `npm run build` |
| Screenshots for review | `npm run snap -- --routes overview,/budgets --theme both` (needs `npm run preview`) |
| Preview production build | `npm run preview` |

Always run `npm run build` before declaring a change done — it type-checks the whole project.

## Layout

```
src/
  main.tsx, App.tsx        entry + routes
  index.css                Tailwind + design tokens (light/dark CSS variables)
  types/                   domain types (Transaction, Invoice, Budget, ...)
  data/                    mock data (static, deterministic, no Math.random)
  services/                the ONLY way pages get data (mock today, API later)
  lib/                     pure helpers: money formatting, finance metrics
  components/layout/       AppShell, Sidebar, Topbar
  components/ui/           Card, StatTile, Badge, Meter, PageHeader, Popover, Checkbox, ...
  components/data-table/   DataTable + useDataTable (sort, facets, search, selection, CSV, pagination)
  components/assistant/    FinanceOps AI right panel (chat UI, streaming state, safe markdown)
  components/charts/       hand-rolled SVG charts (ColumnChart, LineChart)
  pages/                   one file per route
```

## Rules

Detailed rules live in `.claude/rules/` and are loaded automatically:

- `finance-domain.md` — money as integer cents, metric definitions, rounding, currency.
- `frontend.md` — component, styling, routing and accessibility conventions.
- `data-and-mocks.md` — how mock data and the service layer must be shaped.
- `charts.md` — chart forms, palette, marks, tooltips.
- `security-and-privacy.md` — financial data handling, even in the prototype.

## Skills

Project skills live in `.claude/skills/` — use them instead of improvising:

- `new-page` — add a route/page wired into the sidebar.
- `new-component` — add a reusable UI component.
- `mock-data` — add or extend a mock dataset + service function.
- `finance-metrics` — add or change a financial calculation (burn, runway, MRR, ...).
- `add-chart` — add a chart using the house SVG chart components.
- `verify` — the done-checklist (build, visual check, a11y).
- `connect-api` — the plan for replacing mocks with a real backend (future phase).
- `ai-assistant` — the AI chat panel: add demo intents, or connect real Claude via a backend.

**Design work** — use these together before touching visuals:
- `design-system` — tokens, type scale, radius/elevation, component recipes, copy rules (source of truth).
- `layout-patterns` — app shell + page wireframes, responsive and AI-panel-aware layout rules.
- `frontend-design` — Anthropic's public design-direction skill (third-party, Apache-2.0, see its SOURCE.md).
- `ui-review` — screenshot every change with `npm run snap` and critique it before calling it done.

## AI assistant (prototype)
The right-hand "FinanceOps AI" panel (Ctrl+J) runs an **offline demo engine** (`services/assistant.ts`) that answers
from the same mock data and metrics as the pages. It speaks a streaming event protocol identical to what the future
backend will send, so going live means replacing one function. No LLM calls from the browser, ever.

## Non-negotiables

1. Money is **integer cents** in data and logic; format only at the edge with `lib/money.ts`.
2. Pages never import from `src/data/` directly — always through `src/services/`.
3. No new dependency without a clear reason; prefer a small local component.
4. Status (paid/overdue/etc.) is never conveyed by color alone — always icon or text too.
5. Both light and dark themes must look right.
