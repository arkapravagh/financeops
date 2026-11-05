/**
 * AI cursor: Elisa's on-screen pointer for cursor mode.
 *
 * Runs the current `tour` from the assistant controls. Desktop: glide from the composer to the page's sidebar link,
 * press it, wait for the (lazy) page, scroll to the section, rest on it while it is highlighted, fade out.
 * Mobile, or reduced motion: no glide, just navigate and highlight (a manual "Go to" on mobile closes the panel first;
 * an automatic tour on mobile only switches the page behind the panel). Any real click or key press hands control
 * back to the user immediately. The cursor never clicks anything but the page link.
 */

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAssistantControls } from "../../../hooks/use-assistant.hook";
import { DESKTOP_QUERY, useMediaQuery } from "../../../hooks/use-media-query.hook";
import { assistantLabels } from "../../../language/en/assistant.lang";
import { CURSOR_TIMING as T, placeLabel } from "../cursor.model";

type Point = { x: number; y: number };

const L = assistantLabels.cursor;

/** First visible element matching `selector` (the sidebar exists twice in the DOM: rail and mobile drawer). */
function visible<E extends Element>(selector: string): E | null {
  return [...document.querySelectorAll<E>(selector)].find((el) => el.getClientRects().length > 0 && el.getBoundingClientRect().width > 0) ?? null;
}

const centre = (el: Element): Point => {
  const r = el.getBoundingClientRect();
  return { x: r.left + Math.min(r.width / 2, 24), y: r.top + r.height / 2 };
};

/** The pointer overlay plus a polite live region. Mounted once by the assistant dock. */
export function AiCursor() {
  const { tour, endTour, setOpen } = useAssistantControls();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [shown, setShown] = useState(false);
  const [pressing, setPressing] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  // The tour reads these through a ref so a route change mid-tour doesn't restart it.
  const live = useRef({ desktop, navigate, pathname, setOpen, endTour });
  useEffect(() => {
    live.current = { desktop, navigate, pathname, setOpen, endTour };
  });
  const runId = useRef<string | null>(null);

  useEffect(() => {
    if (!tour) return;
    runId.current = tour.id;
    const ctrl = new AbortController();
    const { signal } = ctrl;
    const { desktop: isDesktop, navigate: go, setOpen: openPanel } = live.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = isDesktop && !reduce;
    const { to, section } = tour.navigation;

    const sleep = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        if (signal.aborted) return reject(signal.reason);
        const t = setTimeout(resolve, ms);
        signal.addEventListener("abort", () => (clearTimeout(t), reject(signal.reason)), { once: true });
      });
    const find = async (selector: string) => {
      for (let waited = 0; waited < T.findTimeout; waited += 100) {
        const el = visible<HTMLElement>(selector);
        if (el) return el;
        await sleep(100);
      }
      return null;
    };

    // A real click or key press means the user is driving again: stop moving (the highlight still fades by itself).
    const interrupt = (e: Event) => e.isTrusted && ctrl.abort();
    window.addEventListener("pointerdown", interrupt, true);
    window.addEventListener("keydown", interrupt, true);

    const run = async () => {
      if (!isDesktop) {
        if (tour.auto) {
          // Mobile keeps the answer on screen; the page underneath is ready when the panel closes.
          if (live.current.pathname !== to) go(to);
          return;
        }
        openPanel(false);
        await sleep(320); // panel slide-out
      }

      if (animate) {
        const composer = document.getElementById("ai-composer");
        setPos(composer ? centre(composer) : { x: window.innerWidth - 200, y: window.innerHeight - 120 });
        setShown(true);
        await sleep(60); // let the start position paint before gliding
      }

      if (live.current.pathname !== to) {
        const link = animate ? visible<HTMLAnchorElement>(`nav a[href="${to}"]`) : null;
        if (link) {
          // Same intent signal as a real hover: the sidebar starts loading the page chunk while the cursor travels.
          link.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
          setPos(centre(link));
          await sleep(T.move + 60);
          setPressing(true);
          await sleep(T.press);
          setPressing(false);
          link.click();
        } else {
          go(to);
        }
      }

      if (!section) {
        await sleep(animate ? T.rest / 2 : 0);
        setAnnouncement(L.announce(placeLabel(tour.navigation)));
        return;
      }
      const el = await find(`[data-ai-target="${section}"]`);
      if (!el) return;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      await sleep(reduce ? 0 : T.scroll);

      // Restart the ring if the section is still lit from an earlier tour: drop the attribute, force a style flush, re-add.
      // Each run gets a token so an earlier tour's timer can't clear this tour's ring early.
      const token = tour.id;
      el.removeAttribute("data-ai-highlight");
      void el.offsetWidth;
      el.setAttribute("data-ai-highlight", token);
      // Not tied to the abort signal: an interrupted tour still clears its ring.
      window.setTimeout(() => {
        if (el.getAttribute("data-ai-highlight") === token) el.removeAttribute("data-ai-highlight");
      }, T.highlight);
      setAnnouncement(L.announce(placeLabel(tour.navigation)));

      if (animate) {
        const r = el.getBoundingClientRect();
        // Top-right corner, inside the border: points at the section without covering its title.
        setPos({ x: r.right - 72, y: r.top + 14 });
        await sleep(T.move + T.rest);
      }
    };

    run()
      .catch(() => undefined) // aborted by the user or a newer tour
      .finally(() => {
        // A newer tour may already own the cursor; only the current run hides it.
        if (runId.current !== tour.id) return;
        setShown(false);
        setPressing(false);
        live.current.endTour(tour.id);
      });

    return () => {
      ctrl.abort();
      window.removeEventListener("pointerdown", interrupt, true);
      window.removeEventListener("keydown", interrupt, true);
    };
  }, [tour]);

  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed top-0 left-0 z-[70] transition-[transform,opacity] ease-[cubic-bezier(0.45,0,0.2,1)] motion-reduce:transition-none ${
          shown ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transitionDuration: `${T.move}ms, 200ms` }}
      >
        <div className={`relative transition-transform duration-150 ${pressing ? "scale-85" : "scale-100"}`}>
          {pressing && <span className="absolute -top-3 -left-3 size-7 rounded-full bg-accent/40 animate-[ai-cursor-ripple_420ms_ease-out_forwards]" />}
          {/* Arrow tip sits on the target point (2px inset for the outline). */}
          <svg width="22" height="24" viewBox="0 0 22 24" className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.25)]">
            <path d="M2 1.5 L19.5 11 L11.4 12.9 L7.6 21.5 Z" className="fill-accent stroke-surface" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          <span className="absolute top-5 left-4 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap text-accent-ink shadow-[var(--shadow-float)]">
            {L.name}
          </span>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </>
  );
}
