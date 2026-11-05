/**
 * AI cursor model: timings and the human name of the place a cursor tour goes to.
 *
 * Used by `AiCursor` (the animation) and the chat message "Go to" button, so both name a place the same way.
 */

import { assistantLabels } from "../../language/en/assistant.lang";
import { pageSectionLabels } from "../../language/en/enums.lang";
import { navLabel } from "../../shared/config/navigation.config";
import type { AssistantNavigation } from "../../types/assistant.types";

/** Milliseconds for each step of a tour. Glides are slow enough to follow, short enough not to be in the way. */
export const CURSOR_TIMING = {
  /** One glide between two points (matches the CSS transition on the cursor). */
  move: 650,
  /** The press before the cursor opens a page link. */
  press: 180,
  /** Smooth scroll to the section before the cursor lands on it. */
  scroll: 500,
  /** How long the cursor rests on the section before fading (the ring lasts a little longer, see index.css). */
  rest: 1400,
  /** Give up looking for a section after this (a lazy page chunk that never arrives). */
  findTimeout: 4000,
  /** How long a section keeps `data-ai-highlight`: the 2.6s ring animation in index.css plus a little slack. */
  highlight: 2700,
} as const;

/** "Invoice list on Invoices", or just "Invoices" when the answer names no section. */
export function placeLabel(navigation: AssistantNavigation): string {
  const page = navLabel(navigation.to);
  return navigation.section ? assistantLabels.cursor.place(pageSectionLabels[navigation.section], page) : page;
}
