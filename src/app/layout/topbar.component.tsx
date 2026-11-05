/** Top bar: menu / collapse toggle, global search, data freshness, Ask Elisa, notifications and theme toggle. */

import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from "lucide-react";
import { Theme } from "../../enums/theme.enum";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { useTheme } from "../../hooks/use-theme.hook";
import { appShellLabels as L } from "../../language/en/app-shell.lang";
import { commonLabels } from "../../language/en/common.lang";
import { AS_OF, getTeam } from "../../services/company.service";
import { ElisaGlyph } from "../../shared/ui/elisa-glyph.component";
import { formatDate } from "../../shared/utils/dates.util";

/** Callbacks for the mobile menu and the desktop sidebar collapse toggle. */
export type TopbarProps = {
  /** Opens the mobile drawer. */
  onMenu: () => void;
  /** Desktop sidebar state + toggle. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

/** Sticky header above every page. */
export function Topbar({ onMenu, collapsed, onToggleCollapsed }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const assistant = useAssistantControls();
  const me = getTeam()[0];
  const iconBtn =
    "grid size-9 place-items-center rounded-lg text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent";
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur lg:px-8">
      <button className={`${iconBtn} lg:hidden`} aria-label={L.openNavigation} onClick={onMenu}>
        <Menu size={18} />
      </button>
      <button
        className={`${iconBtn} -ml-2 hidden lg:grid`}
        aria-label={collapsed ? L.expandSidebar : L.collapseSidebar}
        aria-expanded={!collapsed}
        title={collapsed ? L.expandSidebar : L.collapseSidebar}
        onClick={onToggleCollapsed}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      <label className="relative hidden max-w-sm flex-1 items-center sm:flex">
        <span className="sr-only">{L.search}</span>
        <Search size={16} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
        {/* Placeholder: search isn't built yet, so it says so instead of advertising a shortcut. */}
        <input
          readOnly
          aria-disabled
          title={commonLabels.notAvailableTitle}
          placeholder={L.searchPlaceholder}
          className="h-9 w-full cursor-not-allowed rounded-lg border border-line bg-surface pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
        />
      </label>

      <div className="ml-auto flex items-center gap-1">
        <span className="mr-2 hidden text-xs text-muted xl:inline">{L.dataAsOf(formatDate(AS_OF))}</span>
        <button
          type="button"
          onClick={assistant.toggle}
          aria-expanded={assistant.open}
          aria-label={assistant.open ? L.closeAssistant : L.openAssistant}
          title={L.askAiTitle}
          className={`mr-1 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
            assistant.open
              ? "border-line bg-surface-2 text-ink"
              : "border-line bg-surface text-ink hover:bg-surface-2"
          }`}
        >
          <ElisaGlyph size={16} className="text-accent" />
          <span className="hidden sm:inline">{L.askAi}</span>
        </button>
        <button type="button" className={`${iconBtn} aria-disabled:cursor-not-allowed`} aria-label={L.notifications + commonLabels.comingSoon} aria-disabled title={commonLabels.notAvailableTitle}>
          <Bell size={18} />
        </button>
        <button
          className={iconBtn}
          aria-label={theme === Theme.Dark ? L.switchToLight : L.switchToDark}
          onClick={toggle}
        >
          {theme === Theme.Dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div
          className="ml-2 grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent lg:hidden"
          aria-label={L.signedInAs(me.name)}
          role="img"
        >
          {me.name.split(" ").map((p) => p[0]).join("")}
        </div>
      </div>
    </header>
  );
}
