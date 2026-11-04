/**
 * Assistant message lifecycle.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Lifecycle of an assistant reply. */
export enum MessageStatus {
  /** Request sent, no text yet. */
  Thinking = "thinking",
  /** Text is arriving. */
  Streaming = "streaming",
  /** Complete. */
  Done = "done",
  /** Stopped by the user. */
  Stopped = "stopped",
  /** Failed; can be retried. */
  Error = "error",
}
