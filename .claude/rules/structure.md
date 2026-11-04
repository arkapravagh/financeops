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
    <feature>/ <feature>.page.tsx, components/, feature-level models/config/hooks
  shared/      reusable across features, no feature knowledge
    ui/ charts/ data-table/ finance/   presentational building blocks
    hooks/ utils/ config/              cross-cutting hooks, pure helpers, app-wide config
  services/    the ONLY data access layer (mock today, API later)
  data/        mock datasets (read only by services)
  types/       domain types shared by every layer
  styles/      global CSS and design tokens
```

**Dependency direction** (imports only point down this list):
`app` → `features` → `shared` → `services` → `data` · `types` is importable from anywhere.
- A feature may use another feature's public provider/hook (e.g. `useAssistantControls`), never its internals.
- `shared/` never imports from `features/` or `app/`.
- Nothing but `services/` imports `data/` (data-and-mocks rules).
- `shared/utils/metrics.util.ts` is pure and may be used by services, features and the assistant engine.

## File names: `<name>.<type>.<ext>`, kebab-case
| Type suffix | What it holds | Example |
|---|---|---|
| `.page.tsx` | A routed page (one per feature) | `features/forecast/forecast.page.tsx` |
| `.component.tsx` | A React component: one per file, or one tight primitive family (`Table`/`Th`/`Td`) | `shared/ui/stat-tile.component.tsx` |
| `.provider.tsx` | A React context provider + its hooks | `features/assistant/assistant.provider.tsx` |
| `.hook.ts` | A custom hook; name starts with `use-` | `shared/hooks/use-theme.hook.ts` |
| `.service.ts` | Data access functions | `services/forecast.service.ts` |
| `.data.ts` | Mock dataset | `data/transactions.data.ts` |
| `.types.ts` | Shared type definitions | `types/finance.types.ts` |
| `.model.ts` | Feature domain model: types + pure functions | `features/forecast/scenario.model.ts` |
| `.config.ts` | Static configuration / catalogues | `shared/config/navigation.config.ts` |
| `.util.ts` | Pure helper functions | `shared/utils/money.util.ts` |
| `.routes.tsx` | Route table | `app/app.routes.tsx` |

Exceptions: `app/main.tsx` (Vite entry, referenced by `index.html`) and `styles/index.css`.
Exported identifiers keep normal TS casing (`StatTile`, `useTheme`, `getForecastBase`); only file names are kebab-case.

## Imports
- Relative paths, no extensions, no barrel `index.ts` files.
- Order: packages (alphabetical) → project files (alphabetical by path) → side-effect imports (CSS, fonts) last.

## Code documentation
Every file starts with a header block, then a blank line, then imports:
```ts
/**
 * <What this file is, in one line.>
 *
 * <Where it sits / who uses it / the rule that matters most here, in 1–3 lines.>
 */
```
- Every **exported** function, component, hook, type and constant has a `/** ... */` doc comment that says
  what it is for (not how): units for money (`cents`), meaning of `null`, side effects (storage, focus, DOM).
- Props types document non-obvious fields inline (`/** Ratio used, may exceed 1. */`).
- Comments explain *why* (a rule, an edge case, a trade-off). Don't narrate obvious code.
- Reference rules/skills by name (`finance-domain rules`, `design-system skill`) instead of copying them.
