import { useLayoutEffect, useRef, useState } from "react";

/** Measure an element's width so SVG text renders at true pixel size (no viewBox scaling). */
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

/** Round tick values covering [min, max], e.g. 0 / 500K / 1M / 1.5M. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (max === min) max = min + 1;
  const raw = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

/** Column path: 4px rounded data-end, square at the baseline. Handles negative values. */
export function columnPath(x: number, y0: number, y1: number, w: number, r = 4): string {
  const h = Math.abs(y1 - y0);
  const rr = Math.min(r, h, w / 2);
  if (y1 <= y0) {
    // grows upward
    return `M${x},${y0} V${y1 + rr} Q${x},${y1} ${x + rr},${y1} H${x + w - rr} Q${x + w},${y1} ${x + w},${y1 + rr} V${y0} Z`;
  }
  return `M${x},${y0} V${y1 - rr} Q${x},${y1} ${x + rr},${y1} H${x + w - rr} Q${x + w},${y1} ${x + w},${y1 - rr} V${y0} Z`;
}

/** X-label thinning so labels never collide. */
export const labelStep = (count: number, plotWidth: number, minGap = 48) =>
  Math.max(1, Math.ceil(count / Math.max(1, plotWidth / minGap)));
