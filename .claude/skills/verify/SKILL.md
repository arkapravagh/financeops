---
name: verify
description: Done-checklist for any FinanceOps change — type-check/build, run the app, visual check in light and dark, a11y and finance-correctness checks. Use before saying a task is complete.
---

# Verify a change

1. `npm run build` — must pass with zero TypeScript errors. Fix, don't suppress (`// @ts-ignore` is not allowed).
2. `npm run dev` and open the changed route(s) at http://localhost:5173.
   If a browser tool is available, screenshot the page in **light and dark** (theme toggle in the top bar).
3. Visual: no overflow at 1280px and 390px width, numbers right-aligned in tables, no clipped chart labels.
4. Finance correctness:
   - Amounts use `formatMoney` / `formatCompact`; no raw cents on screen.
   - Totals agree across pages (e.g. cash balance is identical on Overview, Forecast and Settings).
     Note: Overview shows *simple* runway (cash ÷ 3-mo avg net burn); Forecast shows *projected* runway
     (models growth) — they are intentionally different and must be labelled as such.
   - Projections are labelled.
5. A11y: tab through the page — every control reachable with a visible focus ring; status badges have text.
6. Rules: no `src/data` imports in pages/components, no hex colors in components, no new deps without reason.
7. Report what you checked and anything you couldn't check (e.g. "no browser available, verified build only").
