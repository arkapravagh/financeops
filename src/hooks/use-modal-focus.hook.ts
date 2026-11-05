/**
 * Focus management for overlay panels that live inside the app root (mobile navigation drawer, mobile AI panel).
 *
 * While `active`: focus moves into the container (unless it is already inside), Tab and Shift+Tab cycle within it,
 * Escape calls `onClose`, and when it deactivates focus returns to the element that had it before.
 * Portal-based overlays use `Drawer`, which additionally makes the app root inert.
 */

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus in `containerRef` while `active`, close on Escape, restore focus afterwards.
 * Escape presses already handled by a child (`event.defaultPrevented`, e.g. "stop generating") are ignored.
 */
export function useModalFocus(active: boolean, containerRef: RefObject<HTMLElement | null>, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!active || !container) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = () =>
      [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);

    if (!container.contains(document.activeElement)) (focusables()[0] ?? container).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return e.preventDefault();
      const first = list[0];
      const last = list[list.length - 1];
      const inside = container.contains(document.activeElement);
      if (!inside || (e.shiftKey && document.activeElement === first)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [active, containerRef]);
}
