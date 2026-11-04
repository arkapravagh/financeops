/**
 * Integration connection states.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Whether an integration is connected (placeholder only in the prototype). */
export enum IntegrationStatus {
  /** Linked and syncing. */
  Connected = "connected",
  /** Can be connected. */
  Available = "available",
}
