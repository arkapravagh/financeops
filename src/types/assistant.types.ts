/**
 * Types for the Elisa panel: messages, conversations and the streaming reply protocol.
 *
 * Enumerations (roles, message status, feedback) live in `src/enums/`.
 */

import type { ChatRole } from "../enums/chat-role.enum";
import type { MessageFeedback } from "../enums/message-feedback.enum";
import type { MessageStatus } from "../enums/message-status.enum";
import type { PageSection } from "../enums/page-section.enum";

/** A link back to the screen a number came from, shown under an answer. */
export type AssistantSource = { label: string; to: string };

/** Where an answer lives on screen: a route, and optionally one section of it (cursor mode scrolls to and highlights it). */
export type AssistantNavigation = { to: string; section?: PageSection };

/**
 * One run of the AI cursor: glide to the page link, open it, scroll to the section and highlight it.
 * `auto` = started by a finished reply (cursor mode on, or the user asked to be taken somewhere); otherwise the user
 * pressed "Go to". On mobile an auto tour only switches the page behind the panel (see `AiCursor`).
 */
export type CursorTour = { id: string; navigation: AssistantNavigation; auto: boolean };

/** One chat message. Assistant messages also carry stream status, sources, follow-ups and feedback. */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  /** Assistant only. */
  status?: MessageStatus;
  sources?: AssistantSource[];
  followUps?: string[];
  /** Assistant only: the screen this answer is about (the "Go to" button, and the AI cursor when cursor mode is on). */
  navigation?: AssistantNavigation;
  feedback?: MessageFeedback;
};

/** A chat thread, kept in memory for the session. */
export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

/**
 * Streaming protocol between the UI and the assistant service.
 * The future backend will emit the same events over SSE, so the UI never changes.
 */
export type ReplyEvent =
  | { type: "text"; delta: string }
  | { type: "sources"; sources: AssistantSource[] }
  | { type: "followups"; items: string[] }
  /**
   * The screen the answer is about. The backend will send it from a "navigate" tool call. `explicit` = the user asked to
   * be taken there ("take me to invoices"), so the UI moves even with cursor mode off; otherwise only in cursor mode.
   */
  | { type: "navigate"; navigation: AssistantNavigation; explicit: boolean }
  | { type: "done" };

/** What the UI sends to `streamReply`: the conversation so far plus the page the user is on. */
export type AssistantRequest = {
  messages: { role: ChatRole; content: string }[];
  /** Current route, so answers can be page-aware ("explain this page"). */
  page: string;
};
