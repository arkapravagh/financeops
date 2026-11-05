/**
 * Lazy page registry: every route's page is its own chunk, downloaded the first time it's needed.
 *
 * `app.routes.tsx` renders these; the sidebar calls {@link preloadPage} on hover / focus so the chunk is usually
 * cached before the click. `import()` is memoised by the browser, so a preload and the later render share one request.
 * Add a new page here as well as in the route table (see the `new-page` skill).
 */

import { lazy, type ComponentType } from "react";

type PageModuleLoader = () => Promise<{ default: ComponentType }>;

/** One loader per page; React.lazy needs a default export, so each named page export is re-wrapped. */
const load = {
  overview: () => import("../features/overview/overview.page").then((m) => ({ default: m.OverviewPage })),
  transactions: () => import("../features/transactions/transactions.page").then((m) => ({ default: m.TransactionsPage })),
  invoices: () => import("../features/invoices/invoices.page").then((m) => ({ default: m.InvoicesPage })),
  reports: () => import("../features/reports/reports.page").then((m) => ({ default: m.ReportsPage })),
  budgets: () => import("../features/budgets/budgets.page").then((m) => ({ default: m.BudgetsPage })),
  forecast: () => import("../features/forecast/forecast.page").then((m) => ({ default: m.ForecastPage })),
  aiSpend: () => import("../features/ai-spend/ai-spend.page").then((m) => ({ default: m.AiSpendPage })),
  settings: () => import("../features/settings/settings.page").then((m) => ({ default: m.SettingsPage })),
  notFound: () => import("../features/not-found/not-found.page").then((m) => ({ default: m.NotFoundPage })),
} satisfies Record<string, PageModuleLoader>;

/** Lazily loaded page components, keyed like {@link load}. Render them inside a `<Suspense>` boundary. */
export const pages = {
  overview: lazy(load.overview),
  transactions: lazy(load.transactions),
  invoices: lazy(load.invoices),
  reports: lazy(load.reports),
  budgets: lazy(load.budgets),
  forecast: lazy(load.forecast),
  aiSpend: lazy(load.aiSpend),
  settings: lazy(load.settings),
  notFound: lazy(load.notFound),
};

const loaderByPath: Record<string, PageModuleLoader> = {
  "/": load.overview,
  "/transactions": load.transactions,
  "/invoices": load.invoices,
  "/reports": load.reports,
  "/budgets": load.budgets,
  "/forecast": load.forecast,
  "/ai-spend": load.aiSpend,
  "/settings": load.settings,
};

/** Start downloading a route's page chunk ahead of navigation. Unknown paths and failures are ignored (the render retries). */
export function preloadPage(path: string) {
  loaderByPath[path]?.().catch(() => undefined);
}
