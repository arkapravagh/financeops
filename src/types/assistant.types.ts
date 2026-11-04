/** Types for the FinanceOps AI panel: messages, conversations and the streaming reply protocol. */

/** A link back to the screen a number came from, shown under an answer. */
export type AssistantSource = { label: string; to: string };

/** Who wrote a message. */
export type ChatRole = "user" | "assistant";

/** One chat message. Assistant messages also carry stream status, sources, follow-ups and feedback. */
export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  /** Assistant only. */
  status?: "thinking" | "streaming" | "done" | "stopped" | "error";
  sources?: AssistantSource[];
  followUps?: string[];
  feedback?: "up" | "down";
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
  | { type: "done" };

/** What the UI sends to `streamReply`: the conversation so far plus the page the user is on. */
export type AssistantRequest = {
  messages: { role: ChatRole; content: string }[];
  /** Current route, so answers can be page-aware ("explain this page"). */
  page: string;
};
