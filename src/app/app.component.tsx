import { Route, Routes } from "react-router-dom";
import { AssistantProvider } from "../features/assistant/assistant.provider";
import { AppShell } from "./layout/app-shell.component";
import { AiSpendPage } from "../features/ai-spend/ai-spend.page";
import { BudgetsPage } from "../features/budgets/budgets.page";
import { DashboardPage } from "../features/overview/overview.page";
import { ForecastPage } from "../features/forecast/forecast.page";
import { InvoicesPage } from "../features/invoices/invoices.page";
import { NotFoundPage } from "../features/not-found/not-found.page";
import { SettingsPage } from "../features/settings/settings.page";
import { TransactionsPage } from "../features/transactions/transactions.page";

export function App() {
  return (
    <AssistantProvider>
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/ai-spend" element={<AiSpendPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    </AssistantProvider>
  );
}
