import { ArrowLeftRight, Cpu, FileText, LayoutDashboard, PiggyBank, Settings, TrendingUp, type LucideIcon } from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };
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

export const secondaryNavItems: NavItem[] = [{ to: "/settings", label: "Settings", icon: Settings }];
