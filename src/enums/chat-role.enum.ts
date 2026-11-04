/**
 * Chat message authors.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Who wrote a chat message. */
export enum ChatRole {
  /** The person using the app. */
  User = "user",
  /** FinanceOps AI. */
  Assistant = "assistant",
}
