import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sparkles, Sun } from "lucide-react";
import { useAssistantControls } from "../../features/assistant/assistant.provider";
import { useTheme } from "../../shared/hooks/use-theme.hook";
import { formatDate } from "../../shared/utils/dates.util";
import { AS_OF } from "../../services/company.service";

export type TopbarProps = {
  /** Opens the mobile drawer. */
  onMenu: () => void;
  /** Desktop sidebar state + toggle. */
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function Topbar({ onMenu, collapsed, onToggleCollapsed }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const assistant = useAssistantControls();
  const iconBtn =
    "grid size-9 place-items-center rounded-lg text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent";
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-page/85 px-4 backdrop-blur lg:px-8">
      <button className={`${iconBtn} lg:hidden`} aria-label="Open navigation" onClick={onMenu}>
        <Menu size={18} />
      </button>
      <button
        className={`${iconBtn} -ml-2 hidden lg:grid`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!collapsed}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleCollapsed}
      >
        {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
      </button>

      <label className="relative hidden max-w-sm flex-1 items-center sm:flex">
        <span className="sr-only">Search</span>
        <Search size={16} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
        <input
          placeholder="Search transactions, invoices, vendors…"
          className="h-9 w-full rounded-lg border border-line bg-surface pr-14 pl-9 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
        />
        <kbd className="absolute right-2 rounded border border-line px-1.5 text-[10px] text-muted">Ctrl K</kbd>
      </label>

      <div className="ml-auto flex items-center gap-1">
        <span className="mr-2 hidden text-xs text-muted xl:inline">Data as of {formatDate(AS_OF)}</span>
        <button
          type="button"
          onClick={assistant.toggle}
          aria-expanded={assistant.open}
          aria-label={assistant.open ? "Close AI assistant" : "Open AI assistant"}
          title="Ask AI (Ctrl+J)"
          className={`mr-1 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
            assistant.open
              ? "border-accent/40 bg-accent/10 text-ink"
              : "border-line bg-surface text-ink hover:bg-surface-2"
          }`}
        >
          <Sparkles size={16} className="text-accent" aria-hidden />
          <span className="hidden sm:inline">Ask AI</span>
          <kbd className="hidden rounded border border-line px-1 text-[10px] font-normal text-muted md:inline">Ctrl J</kbd>
        </button>
        <button className={iconBtn} aria-label="Notifications">
          <Bell size={18} />
        </button>
        <button
          className={iconBtn}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={toggle}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div
          className="ml-2 grid size-8 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent lg:hidden"
          aria-label="Signed in as Alex Rivera"
          role="img"
        >
          AR
        </div>
      </div>
    </header>
  );
}
