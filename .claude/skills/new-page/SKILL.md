---
name: new-page
description: Add a new page/route to the FinanceOps app and wire it into the sidebar. Use when the user asks for a new screen, tab, section or view (e.g. "add a payroll page", "create a vendors screen").
---

# Add a new page

1. **Name it.** Route path is kebab-case (`/payroll`), component is PascalCase + `Page` (`PayrollPage`).
2. **Data first.** If the page needs new data, run the `mock-data` skill first so a service function exists.
3. **Create** `src/pages/<Name>Page.tsx` using this skeleton:

   ```tsx
   import { PageHeader } from "../components/ui/PageHeader";
   import { Card } from "../components/ui/Card";

   export function PayrollPage() {
     // const data = getSomething();   // from src/services, never src/data
     return (
       <>
         <PageHeader title="Payroll" subtitle="One plain-language sentence on what this page answers." />
         <div className="grid gap-6">
           <Card title="...">...</Card>
         </div>
       </>
     );
   }
   ```

4. **Route**: add `<Route path="/payroll" element={<PayrollPage />} />` in `src/App.tsx`.
5. **Nav**: add an entry to `src/components/layout/nav.ts` with a `lucide-react` icon. Keep the sidebar ≤ 8 items;
   group secondary items under "Settings" instead of growing the list.
6. **Layout conventions**: KPI row first (one `KpiRow` panel, not separate tiles), then the main chart,
   then detail tables. Each page answers one founder question — put that question in the subtitle.
   Nav entries go into the right group in `navGroups` (Money / Plan).
7. Follow `layout-patterns` for structure, then run `verify` and `ui-review`.
