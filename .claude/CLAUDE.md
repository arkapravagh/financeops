# Finopsis — project guide for Claude

Finopsis is a finance co-pilot for **small startups (seed → Series A, 2–50 people)**.
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

Feature folders, kebab-case `<name>.<type>.ts(x)` file names. Full conventions: `.claude/rules/structure.md`.

```
src/
  app/                     main.tsx (entry), app.component.tsx, app.routes.tsx
    layout/                app-shell, sidebar, topbar
  features/                one folder per route: <feature>.page.tsx + components/ only it uses
    overview/ transactions/ invoices/ reports/ budgets/ ai-spend/ settings/ not-found/
    forecast/              + scenario.model.ts, scenario-library.config.ts (ids + maths only)
    assistant/             Elisa panel: assistant.provider.tsx + chat components
  shared/
    ui/                    card, stat-tile, badge, kpi-row, page-header, popover, drawer, slider, ...
    charts/                hand-rolled SVG charts (column-chart, line-chart, bullet-bar, sparkline)
    data-table/            data-table component (sort, facets, search, selection, CSV, pagination)
    finance/               amount
    utils/ config/         money/dates/metrics utils; navigation config
  hooks/                   EVERY custom hook: use-theme, use-data-table, use-element-width, use-media-query, use-modal-focus, use-assistant, use-scenario-storage
  services/                *.service.ts: the ONLY way features get data (mock today, API later)
  data/                    *.data.ts: mock data (static, deterministic, no Math.random), uses enum members
  enums/                   *.enum.ts: TypeScript enums (Category, InvoiceStatus, AiFeature, TeamRole, BudgetScale, ...)
  language/en/             *.lang.ts: every user-visible English string, incl. enum labels (enums.lang.ts)
  types/                   *.types.ts: domain types (finance, forecast, assistant, data-table)
  styles/index.css         Tailwind + design tokens (light/dark CSS variables)
```
Imports point down: `app` → `features` → `shared` → `hooks` → `services` → `data`; `enums`, `language` and `types`
are importable anywhere. No raw enum strings (`=== "paid"`), no rendered enum ids, no hard-coded English in UI.
Every file has a header comment and every export has a JSDoc comment.

## Rules

Detailed rules live in `.claude/rules/` and are loaded automatically:

- `finance-domain.md` — money as integer cents, metric definitions, rounding, currency.
- `frontend.md` — component, styling, routing and accessibility conventions.
- `data-and-mocks.md` — how mock data and the service layer must be shaped.
- `charts.md` — chart forms, palette, marks, tooltips.
- `security-and-privacy.md` — financial data handling, even in the prototype.
- `structure.md` — folder layers, `<name>.<type>.ts` naming, enums, language files, hooks, imports, code documentation.

## Skills

Project skills live in `.claude/skills/` — use them instead of improvising:

- `new-page` — add a route/page wired into the sidebar.
- `new-component` — add a reusable UI component.
- `mock-data` — add or extend a mock dataset + service function.
- `finance-metrics` — add or change a financial calculation (burn, runway, MRR, ...).
- `add-chart` — add a chart using the house SVG chart components.
- `verify` — the done-checklist (build, visual check, a11y).
- `react-review` — code-quality review: structure checks + a React review by the `react-quality-reviewer` agent.
- `connect-api` — the plan for replacing mocks with a real backend (future phase).
- `ai-assistant` — the AI chat panel: add demo intents, or connect real Claude via a backend.

**Design work** — use these together before touching visuals:
- `design-system` — tokens, type scale, radius/elevation, component recipes, copy rules (source of truth).
- `layout-patterns` — app shell + page wireframes, responsive and AI-panel-aware layout rules.
- `frontend-design` — Anthropic's public design-direction skill (third-party, Apache-2.0, see its SOURCE.md).
- `ui-review` — screenshot every change with `npm run snap` and critique it before calling it done.

## AI assistant (prototype)
The right-hand "Elisa" panel (Ctrl+J) runs an **offline demo engine** (`services/assistant.service.ts`) that answers
from the same mock data and metrics as the pages. It speaks a streaming event protocol identical to what the future
backend will send, so going live means replacing one function. No LLM calls from the browser, ever.
**Cursor mode** (toggle in the panel) moves a visible "Elisa" cursor to the screen and section an answer is about
(`navigate` reply event → `AiCursor`); sections opt in with `aiTarget={PageSection.X}`. See the `ai-assistant` skill.

## Non-negotiables

1. Money is **integer cents** in data and logic; format only at the edge with `shared/utils/money.util.ts`.
2. Features (pages and components) never import from `src/data/` directly — always through `src/services/`.
3. No new dependency without a clear reason; prefer a small local component.
4. Status (paid/overdue/etc.) is never conveyed by color alone — always icon or text too.
5. Both light and dark themes must look right.
