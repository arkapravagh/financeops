/**
 * Element width tracking for the house SVG charts.
 *
 * Charts draw at true pixel size (no viewBox scaling) so text stays crisp; they re-render when their box resizes,
 * e.g. when the AI panel opens and the content column narrows.
 */

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Measure an element's content width and keep it updated with a ResizeObserver.
 * @returns `[ref, width]`: attach `ref` to the element; `width` is 0 until the first measurement.
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}
