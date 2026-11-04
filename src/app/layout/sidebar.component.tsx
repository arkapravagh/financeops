/** Sidebar: company switcher, grouped navigation, Settings and the profile footer. */

import { NavLink } from "react-router-dom";
import { appShellLabels as L } from "../../language/en/app-shell.lang";
import { getCompany, getTeam } from "../../services/company.service";
import { navGroups, secondaryNavItems, type NavItem } from "../../shared/config/navigation.config";

/** `collapsed` shows icons only; `onNavigate` lets the mobile drawer close after a click. */
export type SidebarProps = {
  /** Icon-only rail (desktop collapsed state). */
  collapsed?: boolean;
  onNavigate?: () => void;
};

/** Text that fades and folds away when the sidebar collapses, so icons stay put. */
function FadeLabel({ collapsed, children }: { collapsed: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-300 ease-in-out motion-reduce:transition-none ${
        collapsed ? "max-w-0 opacity-0" : "max-w-48 opacity-100"
      }`}
    >
      {children}
    </span>
  );
}

function Item({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `relative flex items-center rounded-lg px-3 py-[7px] text-sm outline-none transition-[gap,background-color,color] duration-300 focus-visible:ring-2 focus-visible:ring-accent ${
          collapsed ? "gap-0" : "gap-3"
        } ${isActive ? "bg-surface font-medium text-ink ring-1 ring-line" : "text-ink-2 hover:bg-surface/60 hover:text-ink"}`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={17} className={`shrink-0 ${isActive ? "text-accent" : "text-muted"}`} aria-hidden />
          <FadeLabel collapsed={collapsed}>{item.label}</FadeLabel>
        </>
      )}
    </NavLink>
  );
}

/** Navigation built from `shared/config/navigation.config.ts`. The active page is marked with `aria-current`. */
export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const company = getCompany();
  const me = getTeam()[0];
  const initials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2);

  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-line bg-page px-3 py-4">
      {/* Workspace */}
      <div className={`flex h-10 items-center px-1 transition-[gap] duration-300 ${collapsed ? "gap-0" : "gap-2.5"}`}>
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-[13px] font-semibold text-page" aria-hidden>
          {initials(company.name)}
        </div>
        <FadeLabel collapsed={collapsed}>
          <span className="block leading-tight">
            <span className="block text-sm font-semibold text-ink">{company.name}</span>
            <span className="block text-xs text-muted">
              {L.companySummary(company.stage, company.headcount)}
            </span>
          </span>
        </FadeLabel>
      </div>

      <nav aria-label={L.mainNavigation} className="mt-6 flex flex-col gap-5">
        {navGroups.map((g) => (
          <div key={g.label} className="flex flex-col gap-0.5">
            <p
              className={`px-3 pb-1 text-xs font-medium text-muted transition-opacity duration-300 ${
                collapsed ? "h-0 overflow-hidden pb-0 opacity-0" : "opacity-100"
              }`}
              aria-hidden={collapsed}
            >
              {g.label}
            </p>
            {g.items.map((item) => (
              <Item key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5">
        {secondaryNavItems.map((item) => (
          <Item key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {/* Profile */}
        <div className={`mt-3 flex items-center border-t border-line px-1 pt-4 transition-[gap] duration-300 ${collapsed ? "gap-0" : "gap-2.5"}`}>
          <div
            className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
            title={collapsed ? L.sampleDataUser(me.name) : undefined}
            aria-hidden
          >
            {initials(me.name)}
          </div>
          <FadeLabel collapsed={collapsed}>
            <span className="block leading-tight">
              <span className="block text-sm font-medium text-ink">{me.name}</span>
              <span className="block text-xs text-muted">{L.sampleDataNote}</span>
            </span>
          </FadeLabel>
        </div>
      </div>
    </div>
  );
}
