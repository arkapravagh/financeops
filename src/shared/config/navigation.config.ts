/**
 * Navigation config: sidebar groups and page labels.
 *
 * Shared by the app shell (sidebar) and the AI panel (current-page chip). Every route in
 * `app/app.routes.tsx` should have an entry here.
 */

import { ArrowLeftRight, Cpu, FileText, LayoutDashboard, PiggyBank, Settings, TrendingUp, type LucideIcon } from "lucide-react";

/** One navigable page: path, label and icon. */
export type NavItem = { to: string; label: string; icon: LucideIcon };
/** A labelled group of pages in the sidebar. */
export type NavGroup = { label: string; items: NavItem[] };

/** Grouped by the job the founder is doing (layout-patterns: app shell). */
export const navGroups: NavGroup[] = [
  {
    label: "Money",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard },
      { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
      { to: "/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    label: "Plan",
    items: [
      { to: "/budgets", label: "Budgets", icon: PiggyBank },
      { to: "/forecast", label: "Runway & forecast", icon: TrendingUp },
      { to: "/ai-spend", label: "AI spend", icon: Cpu },
    ],
  },
];

/** Flat list (used for page labels, e.g. the AI panel's context chip). */
export const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

/** Pages pinned to the bottom of the sidebar (Settings). */
export const secondaryNavItems: NavItem[] = [{ to: "/settings", label: "Settings", icon: Settings }];
