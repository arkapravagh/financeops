/**
 * Feedback on assistant replies.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Thumbs up or down on an assistant reply. */
export enum MessageFeedback {
  /** Helpful. */
  Up = "up",
  /** Not helpful. */
  Down = "down",
}
