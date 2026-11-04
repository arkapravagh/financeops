/**
 * Colour themes.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** The two supported colour themes (value is written to `<html data-theme>` and localStorage). */
export enum Theme {
  /** Light theme. */
  Light = "light",
  /** Dark theme. */
  Dark = "dark",
}
