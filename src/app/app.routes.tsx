/**
 * Route table for the whole app.
 *
 * Every page renders inside {@link AppShell} (sidebar, top bar, AI panel). Add a route here **and** a matching
 * entry in `shared/config/navigation.config.ts` so it shows in the sidebar (see the `new-page` skill).
 */

import { Route, Routes } from "react-router-dom";
import { AiSpendPage } from "../features/ai-spend/ai-spend.page";
import { BudgetsPage } from "../features/budgets/budgets.page";
import { ForecastPage } from "../features/forecast/forecast.page";
import { InvoicesPage } from "../features/invoices/invoices.page";
import { NotFoundPage } from "../features/not-found/not-found.page";
import { OverviewPage } from "../features/overview/overview.page";
import { SettingsPage } from "../features/settings/settings.page";
import { TransactionsPage } from "../features/transactions/transactions.page";
import { AppShell } from "./layout/app-shell.component";

/** All routes, nested under the app shell layout. Unknown paths fall through to the 404 page. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/ai-spend" element={<AiSpendPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
