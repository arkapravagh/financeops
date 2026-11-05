---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.css"
---

# Frontend rules

## Stack
React 19 + TypeScript (strict) + Vite + Tailwind CSS v4 + React Router + lucide-react icons.
No UI kit, no chart library, no state library — keep the prototype light.

## Components
- Function components with named exports. One component per file, named `<kebab-name>.component.tsx`
  (`StatTile` → `stat-tile.component.tsx`). Naming, folders and docs: `structure.md`.
- Props typed with an exported `type XxxProps`. No `any`; no `React.FC`.
- Reuse `shared/ui/*` before writing new markup. If a pattern appears twice, extract it.
- Pages (`src/features/<feature>/<feature>.page.tsx`) compose components and call services; they hold no formatting or metric logic.
- Keep components presentational; derived numbers come from `shared/utils/metrics.util.ts`.
- No hard-coded English: every visible string (incl. `aria-label`, `title`, placeholders) comes from
  `src/language/en/<area>.lang.ts`; enum values render through `enums.lang.ts`. All hooks live in `src/hooks/`.

## Styling
- Tailwind utility classes only; no inline `style` except for computed geometry (chart widths, bar fill).
- Colors come from the design tokens in `src/styles/index.css` (`bg-surface`, `text-ink`, `text-muted`,
  `border-line`, `bg-accent`, status tokens). **Never hard-code hex in components.**
- Light and dark themes are driven by `data-theme` on `<html>`; every new UI must be checked in both.
- Typeface: **Geist** (self-hosted via `@fontsource-variable/geist`, imported in `app/main.tsx`, set as `--font-sans`).
  Use it everywhere — no second display font. Never load fonts from a third-party CDN.
- Spacing scale: cards `p-5`, page gutters `px-6 lg:px-8`, gaps `gap-4`/`gap-6`. Radius: `rounded-xl` for cards.
- Numbers in tables use `tabular-nums` and are right-aligned. Hero / stat values use proportional figures.

## Tables
- Any list that needs search, filtering, sorting, selection, export or > ~10 rows uses
  `shared/data-table/data-table.component.tsx` (see the Transactions / Invoices pages for examples).
  The plain `shared/ui/table.component.tsx` primitives are only for small static lists (e.g. dashboard "recent" widgets).
- Define `columns` and `getRowId` at **module scope** (or `useMemo`) — the table's memoization depends on stable references.
- `accessor` returns the raw value (cents, ISO date, enum) used for sort/filter/CSV; `cell` handles display.
  Never sort or filter on formatted strings.
- Money columns: `align: "right"`, `csv` exports dollars with 2 decimals, `footer` totals the filtered rows.
- Facet filters (`facet: true`) suit low-cardinality fields (category, status, account). Use `quickViews` for
  the 3–5 most common filter presets.
- The table filters client-side. When the API lands, add a server mode (same props, state lifted to the query)
  rather than a second table component.

## Routing
- Routes are declared once in `src/app/app.routes.tsx`; sidebar items come from `src/shared/config/navigation.config.ts`.
- Adding a page = route + nav entry + page file (see `new-page` skill).

## Accessibility
- Semantic HTML: `<table>` for tabular data, `<button>` for actions, `<nav>` for navigation.
- Every icon-only button has `aria-label`. Status badges include text, not just color.
- Interactive elements must be keyboard reachable with a visible focus ring (`focus-visible:ring-2`).
- Charts expose an accessible name and a table fallback (see `charts.md`).
