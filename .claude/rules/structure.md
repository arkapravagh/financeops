---
paths:
  - "src/**"
---

# Project structure, file naming and documentation

## Folders (layers)
```
src/
  app/         entry (main.tsx), root component, route table, app shell layout (sidebar, top bar)
  features/    one folder per product area; each owns its page and the components only it uses
    <feature>/ <feature>.page.tsx, components/, feature-level models/config
  shared/      reusable across features, no feature knowledge
    ui/ charts/ data-table/ finance/   presentational building blocks
    utils/ config/                     pure helpers, app-wide config
  hooks/       EVERY custom React hook (use-*.hook.ts), incl. context hooks (contexts live with their hook)
  services/    the ONLY data access layer (mock today, API later)
  data/        mock datasets (read only by services)
  enums/       TypeScript enums for every closed set of values (statuses, categories, view modes)
  language/en/ every user-visible English string (<area>.lang.ts)
  types/       domain types shared by every layer
  styles/      global CSS and design tokens
```

**Dependency direction** (imports only point down this list):
`app` → `features` → `shared` → `hooks` → `services` → `data`.
`enums`, `types` and `language` are importable from anywhere; they import only from each other
(`enums` imports nothing; `language` imports only `enums`/`types`).
- A feature may use another feature's public provider (e.g. `AssistantProvider`), never its internals.
- `shared/` never imports from `features/` or `app/`; `hooks/` never imports from `features/`, `app/` or `shared/`.
- Nothing but `services/` imports `data/` (data-and-mocks rules).
- `shared/utils/metrics.util.ts` is pure and may be used by services, hooks, features and the assistant engine.

## File names: `<name>.<type>.<ext>`, kebab-case
| Type suffix | What it holds | Example |
|---|---|---|
| `.page.tsx` | A routed page (one per feature) | `features/forecast/forecast.page.tsx` |
| `.component.tsx` | A React component: one per file, or one tight primitive family (`Table`/`Th`/`Td`) | `shared/ui/stat-tile.component.tsx` |
| `.provider.tsx` | A React context provider (its contexts + hooks live in `hooks/`) | `features/assistant/assistant.provider.tsx` |
| `.hook.ts` | A custom hook in `src/hooks/`; name starts with `use-` | `hooks/use-theme.hook.ts` |
| `.service.ts` | Data access functions | `services/forecast.service.ts` |
| `.data.ts` | Mock dataset | `data/transactions.data.ts` |
| `.enum.ts` | One TypeScript enum (+ derived subset types / ordered lists) | `enums/invoice-status.enum.ts` |
| `.lang.ts` | English labels for one area | `language/en/forecast.lang.ts` |
| `.types.ts` | Shared type definitions | `types/finance.types.ts` |
| `.model.ts` | Feature domain model: pure functions + constants | `features/forecast/scenario.model.ts` |
| `.config.ts` | Static configuration / catalogues | `shared/config/navigation.config.ts` |
| `.util.ts` | Pure helper functions | `shared/utils/money.util.ts` |
| `.routes.ts(x)` | Route table and its lazy page registry | `app/app.routes.tsx`, `app/lazy-pages.routes.ts` |

Exceptions: `app/main.tsx` (Vite entry, referenced by `index.html`) and `styles/index.css`.
Exported identifiers keep normal TS casing (`StatTile`, `useTheme`, `getForecastBase`); only file names are kebab-case.

## Enums (`src/enums/`)
- Use a TypeScript `enum` for any closed set of domain or state values: categories, statuses, roles, AI features,
  view modes (`BudgetScale`, `ForecastHorizon`), theme. Values are stable lowercase ids (`"software-cloud"`), because
  they are stored in data and localStorage.
- **Never compare or assign the raw string** (`status === "paid"`). Use the member (`InvoiceStatus.Paid`). The compiler
  only catches raw strings whose text differs from the value, so this is enforced by review.
- **Never render an enum value.** Display text comes from the label maps in `language/en/enums.lang.ts`.
- Visual props of UI components (`tone`, `variant`, `size`, `align`) stay string-literal unions: they are design
  options, not domain values.
- Mock data uses enum members (`category: Category.Payroll`).

## Language (`src/language/en/`)
- **No user-visible English in components, pages, hooks or services** (headings, labels, `aria-label`, `title`,
  placeholders, empty states, chart summaries, prompts sent to the AI panel). Add it to the area's `.lang.ts`.
- One file per area, exporting `<area>Labels` objects (`as const`). Text with values uses small functions that
  receive values **already formatted** by `money.util` / `dates.util`: `L.subtitle(formatMoney(x))`.
- Enum labels are `Record<Enum, string>` maps, so a new enum member without a label is a compile error.
- Import with an alias in the consumer: `import { invoicesLabels as L } from "../../language/en/invoices.lang";`.
- Exception: the AI demo engine's answer prose (`services/assistant.service.ts`) stays in the service. It stands in
  for text the real backend will generate. It must still use enum labels for categories, features and statuses.
- Data content (transaction descriptions, vendor names, integration purposes) is data, not UI copy; it stays in `data/`.

## Hooks (`src/hooks/`)
- Every custom hook lives here, one file per concern (`use-scenario-storage.hook.ts` holds both scenario hooks).
- A context's `createContext` objects and consumer hooks live in the hook file; the `.provider.tsx` supplies values.
- Hooks may use services, utils, types, enums and language, but not features, app or shared UI.

## Imports
- Relative paths, no extensions, no barrel `index.ts` files.
- Order: packages (alphabetical) → project files (alphabetical by path) → side-effect imports (CSS, fonts) last.
- Use `import type` for type-only imports (always in `types/` and `language/` files).

## Code documentation
Every file starts with a header block, then a blank line, then imports:
```ts
/**
 * <What this file is, in one line.>
 *
 * <Where it sits / who uses it / the rule that matters most here, in 1–3 lines.>
 */
```
- Every **exported** function, component, hook, type, enum, constant and label object has a `/** ... */` doc comment
  that says what it is for (not how): units for money (`cents`), meaning of `null`, side effects (storage, focus, DOM).
- Enum members each get a one-line doc comment.
- Props types document non-obvious fields inline (`/** Ratio used, may exceed 1. */`).
- Comments explain *why* (a rule, an edge case, a trade-off). Don't narrate obvious code.
- Reference rules/skills by name (`finance-domain rules`, `design-system skill`) instead of copying them.

## Checking it
Run the `react-review` skill (`/react-review`, `/react-review changed` or `/react-review src/features/forecast`). It runs
`.claude/skills/react-review/scripts/check-structure.mjs` (naming, headers, docs, layering, raw enum strings,
leftover English) and then a React code-quality review by the `react-quality-reviewer` agent.
