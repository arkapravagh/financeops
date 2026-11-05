/**
 * App shell: sidebar, top bar, page outlet and the AI panel dock (layout-patterns skill).
 *
 * Desktop: the sidebar and AI panel sit on the app frame and stay put; the top bar and page live in an inset, rounded
 * main card that scrolls on its own. The sidebar can collapse to icons (remembered in `fo-sidebar-collapsed`) and folds
 * automatically below 1600px while the AI panel is open. Mobile: the window scrolls and the sidebar is a slide-in drawer.
 */

import { X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AssistantDock } from "../../features/assistant/components/assistant-dock.component";
import { useAssistantControls } from "../../hooks/use-assistant.hook";
import { useModalFocus } from "../../hooks/use-modal-focus.hook";
import { appShellLabels as L } from "../../language/en/app-shell.lang";
import { Sidebar } from "./sidebar.component";
import { Topbar } from "./topbar.component";

const STORAGE_KEY = "fo-sidebar-collapsed";
const AUTO_COLLAPSE_BELOW = 1600;

/** Shown while a lazily loaded page chunk downloads; the min height stops the footer area jumping up. */
function PageFallback() {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center">
      <span className="size-5 animate-spin rounded-full border-2 border-line border-t-accent motion-reduce:animate-none" aria-hidden />
      <span className="sr-only">{L.loadingPage}</span>
    </div>
  );
}

/** Layout route element: every page renders in its `<Outlet />` (pages are lazy chunks, see `lazy-pages.routes.ts`). */
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

  // Mobile drawer is a modal: focus moves in and stays in, Escape closes, focus returns to the menu button.
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerOpen, drawerRef, () => setDrawerOpen(false));

  // Each page starts at the top: on desktop the main card is the scroller, on mobile the window is.
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-full lg:h-screen lg:overflow-hidden lg:bg-frame">
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
        ref={drawerRef}
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
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg text-ink-2 outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={L.closeNavigation}
            onClick={() => setDrawerOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Main card: rounded and inset on desktop (8px from the frame), with its own scrollbar; the top bar sticks inside it.
          `relative` makes it the containing block for absolute children (e.g. sr-only text), so they scroll and clip with
          the card instead of stretching the window and adding a second scrollbar. */}
      <div
        ref={mainRef}
        data-scroll-root
        className="scroll-thin flex min-w-0 flex-1 flex-col lg:relative lg:my-2 lg:mr-2 lg:overflow-y-auto lg:rounded-[14px] lg:border lg:border-line lg:bg-page"
      >
        <Topbar onMenu={() => setDrawerOpen(true)} collapsed={effectiveCollapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Inside the card so the shell stays put while a page chunk loads; later navigations keep the old page up (transition). */}
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <AssistantDock />
    </div>
  );
}
