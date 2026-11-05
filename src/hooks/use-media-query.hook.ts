/**
 * Media query subscription, e.g. to know whether a layout is in its desktop or mobile form.
 *
 * Uses `useSyncExternalStore`, so the value is consistent during render and updates when the viewport crosses the
 * breakpoint. Keep queries in sync with the Tailwind breakpoints they mirror (`lg` = 1024px).
 */

import { useCallback, useSyncExternalStore } from "react";

/** Tailwind's `lg` breakpoint as a media query: the app shell docks panels and shows the sidebar from here up. */
export const DESKTOP_QUERY = "(min-width: 1024px)";

/** Whether `query` currently matches. Re-renders when it starts or stops matching. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
}
