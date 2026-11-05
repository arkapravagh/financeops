/**
 * Hooks (and the contexts behind them) for the Elisa, the AI assistant.
 *
 * State is split into two contexts so streaming tokens only re-render the panel:
 * - `useAssistantControls()`: open/close/ask. Stable while a reply streams; use it anywhere (top bar, pages).
 * - `useAssistant()`: full chat state. Changes on every streamed frame; use it only inside the assistant panel.
 * The values are provided by `AssistantProvider` (features/assistant/assistant.provider.tsx).
 */

import { createContext, useContext } from "react";
import type { MessageFeedback } from "../enums/message-feedback.enum";
import type { AssistantNavigation, Conversation, CursorTour } from "../types/assistant.types";

/** Stable controls: safe to consume anywhere (doesn't change while tokens stream). */
export type AssistantControls = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  /** Open the panel and send a prompt in a fresh conversation. */
  ask: (prompt: string) => void;
  /** Cursor mode: after each answer, Elisa moves a visible cursor to the screen it is about. Remembered (`fo-ai-cursor`). */
  cursorMode: boolean;
  setCursorMode: (on: boolean) => void;
  /** The cursor run in progress (rendered by `AiCursor`), or null. */
  tour: CursorTour | null;
  /** Take the user to an answer's screen now (the "Go to" button), whatever the mode. */
  showOnScreen: (navigation: AssistantNavigation) => void;
  /** Called by the cursor when its run ends or the user interrupts it. */
  endTour: (id: string) => void;
};

/** Fast-changing chat state plus the controls: consume only inside the panel. */
export type AssistantContextValue = AssistantControls & {
  conversations: Conversation[];
  active: Conversation | null;
  isStreaming: boolean;
  send: (text: string) => void;
  stop: () => void;
  regenerate: () => void;
  setFeedback: (messageId: string, feedback: MessageFeedback | undefined) => void;
  newChat: () => void;
  selectChat: (id: string) => void;
  deleteChat: (id: string) => void;
  /** Pathname of the page the user is on (the panel turns it into the context chip's label with `navLabel`). */
  page: string;
};

/** Full chat state context. Provided by `AssistantProvider`; read it through {@link useAssistant}. */
export const AssistantContext = createContext<AssistantContextValue | null>(null);

/** Stable controls context. Provided by `AssistantProvider`; read it through {@link useAssistantControls}. */
export const AssistantControlsContext = createContext<AssistantControls | null>(null);

/** Full chat state. Re-renders on every streamed frame: use only in the assistant panel. Throws outside the provider. */
export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant must be used inside <AssistantProvider>");
  return ctx;
}

/** Open/close/ask only. Stable while streaming: use this everywhere else (top bar, pages). Throws outside the provider. */
export function useAssistantControls() {
  const ctx = useContext(AssistantControlsContext);
  if (!ctx) throw new Error("useAssistantControls must be used inside <AssistantProvider>");
  return ctx;
}
