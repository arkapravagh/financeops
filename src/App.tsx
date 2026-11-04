import { Route, Routes } from "react-router-dom";
import { AssistantProvider } from "./components/assistant/AssistantProvider";
import { AppShell } from "./components/layout/AppShell";
import { AiSpendPage } from "./pages/AiSpendPage";
import { BudgetsPage } from "./pages/BudgetsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ForecastPage } from "./pages/ForecastPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TransactionsPage } from "./pages/TransactionsPage";

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
