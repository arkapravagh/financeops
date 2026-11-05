---
name: layout-patterns
description: Page structures for Finopsis — the app shell, Overview, list pages, and analysis pages — with ASCII wireframes and responsive rules (including room for the AI panel). Use when creating a page, rearranging a page, or fixing a layout that breaks at some width.
---

# Layout patterns

## App shell
```
┌──────────┬──────────────────────────────────────────┬─────────────┐
│ Sidebar  │ Top bar: [menu] search…     Ask Elisa ☾ ◯│  AI panel   │
│ 240 / 64 ├──────────────────────────────────────────┤  400 (opt.) │
│ workspace│  Page (max 1280, centred, gutters 32)    │             │
│ nav      │                                          │             │
│ groups   │                                          │             │
│ profile  │                                          │             │
└──────────┴──────────────────────────────────────────┴─────────────┘
```
- **Desktop (≥ lg): inset main card.** Sidebar and AI panel sit on the app frame (`bg-frame`) and never scroll with the
  page. Top bar + page live in one rounded card (`rounded-[14px] border bg-page`, 8px from the frame) that scrolls on its
  own (`data-scroll-root`, thin scrollbar); the top bar is sticky inside it. Mobile: the window scrolls, no card.
- Sidebar groups: **Money** (Overview, Transactions, Invoices, Reports) and **Plan** (Budgets, Runway & forecast, AI spend); Settings at bottom.
- AI panel docks at ≥ lg (400px); below 1600px the sidebar auto-folds to icons while it is open.
- The content column can be as narrow as ~900px at desktop sizes. **Design every page to work at 900px**.

## Overview (one bold element)
```
Header: greeting                                   [Export] [Add transaction]
┌──────────────────────────── Runway strip (hero) ───────────────────────────┐
│ Cash in the bank            Runway                                          │
│ $2.3M                       18.6 months ──●──────────────▲──────────────●   │
│ 3 accounts                  today        start raising   zero cash          │
├──────────────┬──────────────┬──────────────┬──────────────────────────────┤
│ Net burn     │ MRR          │ Owed to you  │ Bills next 14 days           │  ← KPI row (dividers)
└──────────────┴──────────────┴──────────────┴──────────────────────────────┘
┌────────── Cash balance chart (2/3) ─────────┐ ┌── Needs attention (1/3) ──┐
└─────────────────────────────────────────────┘ └───────────────────────────┘
┌────────── Cash in vs out (2/3) ─────────────┐ ┌── Upcoming bills (1/3) ───┐
┌────────── Recent transactions (2/3) ────────┐ ┌── Who owes you (1/3) ─────┐
```
## List page (Transactions, Invoices)
```
Header: title + one-line purpose                          [primary action]
[KPI row panel — optional]
┌ Panel ──────────────────────────────────────────────────────────────────┐
│ Views (tabs) · Toolbar (search, filters, columns, export)               │
│ DataTable                                                               │
│ Pagination                                                              │
└─────────────────────────────────────────────────────────────────────────┘
```
## Analysis page (Budgets, Forecast)
```
Header
[KPI row panel]
┌ Main chart (3/5 or 2/3) ─────────────┐ ┌ Controls or supporting (2/5 or 1/3) ┐
┌ Detail table (full width) ──────────────────────────────────────────────────┐
```

## Responsive rules
- Grids use **explicit** `grid-cols-1` on mobile, then `lg:` / `xl:` columns.
- Components whose layout depends on *their own* width (charts, KPI rows, bullet chart) use **container queries**
  (`@container` + `@md:` / `@2xl:`), not viewport breakpoints — they sit in panels of very different widths.
- Grid children get `min-w-0` (the `Panel`/`Card` components already do) so tables/charts can shrink.
- Two-column rows collapse to one column below `xl` when the row contains a dense table.
- Check 1440 (panel closed and open), 1024 and 390 widths with the `ui-review` skill.
