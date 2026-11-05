/**
 * Light/dark theme state.
 *
 * The initial theme is set before React loads by the inline script in index.html (no flash);
 * this hook reads it from `<html data-theme>` and persists changes to localStorage (`fo-theme`).
 */

import { useCallback, useState } from "react";
import { Theme } from "../enums/theme.enum";

/** Current theme and a `toggle()` that flips it, updates `<html data-theme>` and remembers the choice. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === Theme.Dark ? Theme.Dark : Theme.Light,
  );
  // Side effects run in the event handler, not inside a state updater (StrictMode may call updaters twice).
  const toggle = useCallback(() => {
    const next = theme === Theme.Dark ? Theme.Light : Theme.Dark;
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("fo-theme", next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setTheme(next);
  }, [theme]);
  return { theme, toggle };
}
