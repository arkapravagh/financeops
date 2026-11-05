/** Assistant dock: positions the AI panel beside (desktop) or over (mobile) the page. */

import { useRef } from "react";
import { useAssistantControls } from "../../../hooks/use-assistant.hook";
import { DESKTOP_QUERY, useMediaQuery } from "../../../hooks/use-media-query.hook";
import { useModalFocus } from "../../../hooks/use-modal-focus.hook";
import { assistantLabels } from "../../../language/en/assistant.lang";
import { AssistantPanel } from "./assistant-panel.component";

/**
 * Right-hand AI panel.
 * ≥ lg: docked beside the content; width animates 0 ↔ 400px and the page reflows (charts resize).
 * < lg: slides over the page from the right with a dimmed backdrop and behaves as a modal dialog
 * (focus moves in and stays in, Escape closes, focus returns to the opener).
 * Always mounted so it animates both ways; `inert` when closed keeps it out of tab order.
 */
export function AssistantDock() {
  const { open, setOpen } = useAssistantControls();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const panelRef = useRef<HTMLElement>(null);
  const modal = open && !desktop;
  useModalFocus(modal, panelRef, () => setOpen(false));

  return (
    <>
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        ref={panelRef}
        aria-label={assistantLabels.dockLabel}
        role={modal ? "dialog" : undefined}
        aria-modal={modal || undefined}
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-[420px] shadow-[var(--shadow-float)] transition-transform duration-300 ease-in-out motion-reduce:transition-none lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:overflow-hidden lg:shadow-none lg:transition-[width] ${
          open ? "translate-x-0 lg:w-[400px]" : "translate-x-full lg:w-0"
        }`}
      >
        {/* Fixed inner width so content doesn't squash while the dock animates */}
        <div className="h-full w-full lg:w-[400px]">
          <AssistantPanel onClose={() => setOpen(false)} />
        </div>
      </aside>
    </>
  );
}
