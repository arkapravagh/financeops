export type AssistantSource = { label: string; to: string };

export type ChatRole = "user" | "assistant";

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

export type AssistantRequest = {
  messages: { role: ChatRole; content: string }[];
  /** Current route, so answers can be page-aware ("explain this page"). */
  page: string;
};
