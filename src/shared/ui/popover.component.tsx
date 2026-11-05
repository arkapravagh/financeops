/**
 * Popover: click-to-open floating panel for menus and filters.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Trigger content and panel content. Pass a function as children to get a `close()` callback. */
export type PopoverProps = {
  /** Trigger content. */
  label: ReactNode;
  ariaLabel?: string;
  buttonClassName?: string;
  align?: "start" | "end";
  panelClassName?: string;
  children: ReactNode | ((close: () => void) => ReactNode);
};

/** Click-to-open panel. Closes on outside click and Escape (focus returns to the trigger). */
export function Popover({ label, ariaLabel, buttonClassName = "", align = "start", panelClassName = "", children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={buttonClassName}
      >
        {label}
      </button>
      {open && (
        <div
          id={id}
          className={`absolute top-full z-30 mt-1.5 min-w-52 rounded-xl border border-line bg-surface p-1.5 shadow-[var(--shadow-float)] ${
            align === "end" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}
