/**
 * English labels for navigation: sidebar groups and page names (also used by the AI panel's page chip).
 */

/** Sidebar group headings and page names. Keys match `shared/config/navigation.config.ts`. */
export const navigationLabels = {
  groups: {
    money: "Money",
    plan: "Plan",
  },
  pages: {
    overview: "Overview",
    transactions: "Transactions",
    invoices: "Invoices",
    reports: "Reports",
    budgets: "Budgets",
    forecast: "Runway & forecast",
    aiSpend: "AI spend",
    settings: "Settings",
  },
  /** Fallback page name when the route isn't in the navigation. */
  unknownPage: "This page",
} as const;
