/**
 * Light/dark theme state.
 *
 * The initial theme is set before React loads by the inline script in index.html (no flash);
 * this hook reads it from `<html data-theme>` and persists changes to localStorage (`fo-theme`).
 */

import { useCallback, useState } from "react";

/** The two supported themes. */
export type Theme = "light" | "dark";

/** Current theme and a `toggle()` that flips it, updates `<html data-theme>` and remembers the choice. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("fo-theme", next);
      } catch {
        /* storage unavailable — theme still applies for this session */
      }
      return next;
    });
  }, []);
  return { theme, toggle };
}
