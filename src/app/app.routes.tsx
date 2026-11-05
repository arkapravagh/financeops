/**
 * Route table for the whole app.
 *
 * Every page renders inside {@link AppShell} (sidebar, top bar, AI panel); pages are lazy chunks from
 * `lazy-pages.routes.ts`, suspended inside the shell. Add a route here, in `lazy-pages.routes.ts` **and** in
 * `shared/config/navigation.config.ts` so it shows in the sidebar (see the `new-page` skill).
 */

import { Route, Routes } from "react-router-dom";
import { AppShell } from "./layout/app-shell.component";
import { pages } from "./lazy-pages.routes";

/** All routes, nested under the app shell layout. Unknown paths fall through to the 404 page. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<pages.overview />} />
        <Route path="/transactions" element={<pages.transactions />} />
        <Route path="/invoices" element={<pages.invoices />} />
        <Route path="/reports" element={<pages.reports />} />
        <Route path="/budgets" element={<pages.budgets />} />
        <Route path="/forecast" element={<pages.forecast />} />
        <Route path="/ai-spend" element={<pages.aiSpend />} />
        <Route path="/settings" element={<pages.settings />} />
        <Route path="*" element={<pages.notFound />} />
      </Route>
    </Routes>
  );
}
