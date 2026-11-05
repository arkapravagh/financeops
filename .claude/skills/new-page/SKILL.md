---
name: new-page
description: Add a new page/route to the Finopsis app and wire it into the sidebar. Use when the user asks for a new screen, tab, section or view (e.g. "add a payroll page", "create a vendors screen").
---

# Add a new page

1. **Name it.** Route path and feature folder are kebab-case (`/payroll`, `features/payroll/`); the component is
   PascalCase + `Page` (`PayrollPage`). File naming and docs follow `.claude/rules/structure.md`.
2. **Data first.** If the page needs new data, run the `mock-data` skill first so a service function exists.
3. **Create** `src/features/<feature>/<feature>.page.tsx` using this skeleton. Components used only by this page
   go in `src/features/<feature>/components/<name>.component.tsx`; anything reusable goes in `src/shared/`.

   ```tsx
   /**
    * Payroll: what the team costs each month, as an aggregate (no per-person salaries; security rules).
    *
    * Route: `/payroll`. Sections: KPI row, payroll by month, cost by department.
    */

   import { payrollLabels as L } from "../../language/en/payroll.lang";
   import { Card } from "../../shared/ui/card.component";
   import { PageHeader } from "../../shared/ui/page-header.component";

   /** Payroll page. */
   export function PayrollPage() {
     // const data = getSomething();   // from src/services, never src/data
     return (
       <>
         <PageHeader title={L.title} subtitle={L.subtitle} />
         <div className="grid gap-6">
           <Card title={L.byMonth.title}>...</Card>
         </div>
       </>
     );
   }
   ```

   Put every visible string in `src/language/en/<feature>.lang.ts` (header comment + `/** */` on the export):

   ```ts
   /** Text on the Payroll page. */
   export const payrollLabels = {
     title: "Payroll",
     subtitle: "What does the team cost each month?",
     byMonth: { title: "Payroll by month", summary: (total: string) => `${total} this month` },
   } as const;
   ```
   Closed sets of values (statuses, view toggles) are enums in `src/enums/` with labels in `enums.lang.ts`.
   Any new hook goes in `src/hooks/`.

4. **Route** (pages are lazy-loaded, one chunk each): in `src/app/lazy-pages.routes.ts` add a loader
   (`payroll: () => import("../features/payroll/payroll.page").then((m) => ({ default: m.PayrollPage }))`), its
   `pages.payroll = lazy(load.payroll)` entry and its path in `loaderByPath` (sidebar preloading); then add
   `<Route path="/payroll" element={<pages.payroll />} />` in `src/app/app.routes.tsx`. Never import a page statically.
5. **Nav**: add an entry to `src/shared/config/navigation.config.ts` with a `lucide-react` icon; its label goes in
   `language/en/navigation.lang.ts`. Keep the sidebar ≤ 8 items;
   group secondary items under "Settings" instead of growing the list.
6. **Layout conventions**: KPI row first (one `KpiRow` panel, not separate tiles), then the main chart,
   then detail tables. Each page answers one founder question — put that question in the subtitle.
   Nav entries go into the right group in `navGroups` (Money / Plan).
   Sections Elisa should be able to point at get `aiTarget={PageSection.X}` (add the enum member + label), and the
   matching demo intents use `at(answer, "/payroll", PageSection.X)` (`ai-assistant` skill, cursor mode).
7. Follow `layout-patterns` for structure, then run `verify`, `ui-review` and `react-review`.
