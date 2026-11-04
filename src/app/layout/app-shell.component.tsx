/**
 * App shell: sidebar, top bar, page outlet and the AI panel dock (layout-patterns skill).
 *
 * Desktop: the sidebar can collapse to icons (remembered in `fo-sidebar-collapsed`) and folds automatically
 * below 1600px while the AI panel is open. Mobile: the sidebar becomes a slide-in drawer.
 */

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AssistantDock } from "../../features/assistant/components/assistant-dock.component";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { appShellLabels as L } from "../../language/en/app-shell.lang";
import { Sidebar } from "./sidebar.component";
import { Topbar } from "./topbar.component";

const STORAGE_KEY = "fo-sidebar-collapsed";
const AUTO_COLLAPSE_BELOW = 1600;

/** Layout route element: every page renders in its `<Outlet />`. */
export function AppShell() {
  // Mobile drawer (slides in over content)
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Desktop rail (expands / collapses in place), remembered across visits
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  // When the AI panel opens on a narrower desktop, temporarily fold the sidebar to icons so the
  // page keeps enough width. Restored when the panel closes; the saved preference is untouched.
  const { open: aiOpen } = useAssistantControls();
  const [autoCollapsed, setAutoCollapsed] = useState(false);
  useEffect(() => {
    setAutoCollapsed(aiOpen && window.innerWidth < AUTO_COLLAPSE_BELOW);
  }, [aiOpen]);
  const effectiveCollapsed = collapsed || autoCollapsed;

  const toggleCollapsed = () => {
    if (autoCollapsed) {
      setAutoCollapsed(false); // user explicitly expands while the AI panel is open
      return;
    }
    setCollapsed((c) => {
      try {
        localStorage.setItem(STORAGE_KEY, c ? "0" : "1");
      } catch {
        /* storage unavailable — state still applies for this session */
      }
      return !c;
    });
  };

  // Escape closes the drawer
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <div className="flex min-h-full">
      {/* Desktop: width animates between full sidebar and icon rail */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:block ${
          effectiveCollapsed ? "w-16" : "w-60"
        }`}
      >
        <Sidebar collapsed={effectiveCollapsed} />
      </aside>

      {/* Mobile: always mounted so it can animate both in and out */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`}
        role="dialog"
        aria-modal="true"
        aria-label={L.navigation}
        aria-hidden={!drawerOpen}
        inert={!drawerOpen}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`relative h-full w-64 shadow-[var(--shadow-float)] transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
          <button
            className="absolute top-4 right-3 grid size-8 place-items-center rounded-lg text-ink-2 outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={L.closeNavigation}
            onClick={() => setDrawerOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setDrawerOpen(true)} collapsed={effectiveCollapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>

      <AssistantDock />
    </div>
  );
}
