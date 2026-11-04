/**
 * Workspace roles.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** What a workspace member can see and do. */
export enum TeamRole {
  /** Full access, including billing and members. */
  Owner = "owner",
  /** Edit financial data; no member management. */
  Finance = "finance",
  /** Read-only access. */
  Viewer = "viewer",
}
