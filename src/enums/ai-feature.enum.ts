/**
 * AI features (where AI is used in the business).
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Where AI is used. Customer-facing features count toward "AI cost per customer". */
export enum AiFeature {
  /** Assistant inside the product. */
  InAppAssistant = "in-app-assistant",
  /** Tags and routes support tickets. */
  SupportTriage = "support-triage",
  /** Semantic search (embeddings). */
  Search = "search",
  /** Extracts fields from uploaded files. */
  DocumentParsing = "document-parsing",
  /** Scripts and agents the team runs. */
  InternalTools = "internal-tools",
}
