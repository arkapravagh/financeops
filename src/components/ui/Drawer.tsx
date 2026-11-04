import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type DrawerProps = {
  open: boolean;
  title: string;
  /** One line of plain-language context under the title. */
  description?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Action row pinned to the bottom (buttons). */
  footer?: ReactNode;
  /** Width override, e.g. "sm:w-[36rem]". Full width on phones. */
  className?: string;
};

const DURATION_MS = 300;

/**
 * Right-hand slide-in panel, rendered in a portal on <body> above the app (and the AI panel).
 * While open the app root is `inert`, so focus stays in the drawer; Escape, the backdrop or the
 * close button slide it out, then focus returns to whatever opened it. Mark the first field with `data-autofocus`.
 * Stays mounted through the exit animation.
 */
export function Drawer({ open, title, description, onClose, children, footer, className = "sm:w-[30rem]" }: DrawerProps) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  // Captured during render, before anything inside the drawer can take focus.
  const returnFocus = useRef<HTMLElement | null>(open ? (document.activeElement as HTMLElement | null) : null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  const descId = useId();

  // Enter: mount off-screen, then slide in on the next frame. Exit: slide out, then unmount.
  useEffect(() => {
    if (open) {
      const active = document.activeElement as HTMLElement | null;
      if (!panelRef.current?.contains(active)) returnFocus.current = active;
      setMounted(true);
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(raf);
    }
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), DURATION_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // While mounted: lock page scroll (so only the drawer scrolls), keep the app inert, close on Escape, restore focus after.
  useEffect(() => {
    if (!mounted) return;
    const root = document.getElementById("root");
    if (root) root.inert = true;
    // Hide the page scrollbar and pad by its width so the page behind doesn't shift sideways.
    const html = document.documentElement;
    const scrollbar = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, padding: document.body.style.paddingRight };
    html.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      (panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel).focus({ preventScroll: true });
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (root) root.inert = false;
      html.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.padding;
      if (returnFocus.current?.isConnected) returnFocus.current.focus({ preventScroll: true });
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div
        aria-hidden
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-line bg-surface text-ink shadow-[var(--shadow-float)] outline-none transition-transform duration-300 ease-in-out motion-reduce:transition-none ${
          shown ? "translate-x-0" : "translate-x-full"
        } ${className}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-[13px] text-ink-2">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-lg text-muted outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={16} />
          </button>
        </header>
        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-4">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
