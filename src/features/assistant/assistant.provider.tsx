/**
 * AI assistant state: conversations, streaming, panel open/close.
 *
 * Provides the two contexts defined in `hooks/use-assistant.hook.ts` (split so streaming tokens only re-render
 * the panel). Consumers read them with `useAssistantControls()` / `useAssistant()` from that file.
 * Replies come from `services/assistant.service.ts`; no LLM calls from the browser, ever.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { ChatRole } from "../../enums/chat-role.enum";
import { MessageFeedback } from "../../enums/message-feedback.enum";
import { MessageStatus } from "../../enums/message-status.enum";
import {
  AssistantContext,
  AssistantControlsContext,
  type AssistantContextValue,
  type AssistantControls,
} from "../../hooks/use-assistant.hook";
import { assistantLabels } from "../../language/en/assistant.lang";
import { streamReply } from "../../services/assistant.service";
import type { ChatMessage, Conversation } from "../../types/assistant.types";

const OPEN_KEY = "fo-ai-open";
const HISTORY_KEY = "fo-ai-history";
const MAX_CONVERSATIONS = 20;

const uid = () => crypto.randomUUID();
const titleFrom = (text: string) => (text.length > 48 ? `${text.slice(0, 45).trimEnd()}…` : text);

function loadHistory(): Conversation[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Conversation[];
    // Anything that was mid-stream when the tab closed is marked stopped.
    return list.map((c) => ({
      ...c,
      messages: c.messages.map((m) =>
        m.status === MessageStatus.Streaming || m.status === MessageStatus.Thinking ? { ...m, status: MessageStatus.Stopped } : m,
      ),
    }));
  } catch {
    return [];
  }
}

/** Provides assistant state to the app. Mounted once in `app/app.component.tsx`. */
export function AssistantProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [open, setOpenState] = useState(() => {
    try {
      return localStorage.getItem(OPEN_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [conversations, setConversations] = useState<Conversation[]>(loadHistory);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const setOpen = useCallback((v: boolean) => {
    setOpenState(v);
    try {
      localStorage.setItem(OPEN_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  // Persist history only when not streaming (avoids a write per token).
  useEffect(() => {
    if (isStreaming) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)));
    } catch {
      /* quota / private mode — history just won't persist */
    }
  }, [conversations, isStreaming]);

  // Ctrl/Cmd + J toggles the panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const patchMessage = useCallback((convId: string, msgId: string, fn: (m: ChatMessage) => ChatMessage) => {
    setConversations((list) =>
      list.map((c) =>
        c.id !== convId ? c : { ...c, updatedAt: Date.now(), messages: c.messages.map((m) => (m.id === msgId ? fn(m) : m)) },
      ),
    );
  }, []);

  /** Runs one assistant turn for `history` into a new assistant message in `convId`. */
  const runAssistant = useCallback(
    async (convId: string, history: ChatMessage[]) => {
      const assistantId = uid();
      const placeholder: ChatMessage = { id: assistantId, role: ChatRole.Assistant, content: "", createdAt: Date.now(), status: MessageStatus.Thinking };
      setConversations((list) =>
        list.map((c) => (c.id === convId ? { ...c, messages: [...history, placeholder], updatedAt: Date.now() } : c)),
      );

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      // Batch token updates to one React update per animation frame.
      let buffer = "";
      let frame = 0;
      const flush = () => {
        frame = 0;
        if (!buffer) return;
        const chunk = buffer;
        buffer = "";
        patchMessage(convId, assistantId, (m) => ({ ...m, status: MessageStatus.Streaming, content: m.content + chunk }));
      };

      try {
        for await (const ev of streamReply(
          { messages: history.map(({ role, content }) => ({ role, content })), page: pathname },
          controller.signal,
        )) {
          if (ev.type === "text") {
            buffer += ev.delta;
            if (!frame) frame = requestAnimationFrame(flush);
          } else if (ev.type === "sources") {
            patchMessage(convId, assistantId, (m) => ({ ...m, sources: ev.sources }));
          } else if (ev.type === "followups") {
            patchMessage(convId, assistantId, (m) => ({ ...m, followUps: ev.items }));
          }
        }
        if (frame) cancelAnimationFrame(frame);
        flush();
        patchMessage(convId, assistantId, (m) => ({ ...m, status: MessageStatus.Done }));
      } catch (err) {
        if (frame) cancelAnimationFrame(frame);
        flush();
        const aborted = err instanceof DOMException && err.name === "AbortError";
        patchMessage(convId, assistantId, (m) => ({
          ...m,
          status: aborted ? MessageStatus.Stopped : MessageStatus.Error,
          content: aborted ? m.content : m.content || assistantLabels.message.failedContent,
        }));
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
        setIsStreaming(false);
      }
    },
    [patchMessage, pathname],
  );

  const sendInto = useCallback(
    (convId: string | null, text: string) => {
      const content = text.trim();
      if (!content) return;
      const userMsg: ChatMessage = { id: uid(), role: ChatRole.User, content, createdAt: Date.now() };
      let id = convId;
      let history: ChatMessage[];
      const existing = id ? conversations.find((c) => c.id === id) : undefined;
      if (existing) {
        history = [...existing.messages, userMsg];
      } else {
        id = uid();
        history = [userMsg];
        setConversations((list) => [{ id: id as string, title: titleFrom(content), messages: [], updatedAt: Date.now() }, ...list]);
        setActiveId(id);
      }
      void runAssistant(id as string, history);
    },
    [conversations, runAssistant],
  );

  const send = useCallback((text: string) => sendInto(activeId, text), [activeId, sendInto]);

  // `ask` must stay referentially stable, so it reads the latest sendInto through a ref.
  const sendIntoRef = useRef(sendInto);
  useEffect(() => {
    sendIntoRef.current = sendInto;
  }, [sendInto]);
  const ask = useCallback(
    (prompt: string) => {
      setOpen(true);
      sendIntoRef.current(null, prompt);
    },
    [setOpen],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  // Read the latest state through a ref so `regenerate` keeps a stable identity (memoized messages don't re-render).
  const latest = useRef({ active, isStreaming });
  useEffect(() => {
    latest.current = { active, isStreaming };
  });
  const regenerate = useCallback(() => {
    const { active: cur, isStreaming: busy } = latest.current;
    if (!cur || busy) return;
    const msgs = cur.messages;
    const lastUser = msgs.map((m) => m.role).lastIndexOf(ChatRole.User);
    if (lastUser < 0) return;
    void runAssistant(cur.id, msgs.slice(0, lastUser + 1));
  }, [runAssistant]);

  const setFeedback = useCallback(
    (messageId: string, feedback: MessageFeedback | undefined) => {
      if (!activeId) return;
      patchMessage(activeId, messageId, (m) => ({ ...m, feedback }));
    },
    [activeId, patchMessage],
  );

  const newChat = useCallback(() => {
    abortRef.current?.abort();
    setActiveId(null);
  }, []);
  const selectChat = useCallback((id: string) => {
    abortRef.current?.abort();
    setActiveId(id);
  }, []);
  const deleteChat = useCallback(
    (id: string) => {
      if (id === activeId) {
        abortRef.current?.abort();
        setActiveId(null);
      }
      setConversations((list) => list.filter((c) => c.id !== id));
    },
    [activeId],
  );

  const controls = useMemo<AssistantControls>(() => ({ open, setOpen, toggle, ask }), [open, setOpen, toggle, ask]);

  const value = useMemo<AssistantContextValue>(
    () => ({
      ...controls,
      conversations,
      active,
      isStreaming,
      send,
      stop,
      regenerate,
      setFeedback,
      newChat,
      selectChat,
      deleteChat,
      page: pathname,
    }),
    [controls, conversations, active, isStreaming, send, stop, regenerate, setFeedback, newChat, selectChat, deleteChat, pathname],
  );

  return (
    <AssistantControlsContext.Provider value={controls}>
      <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
    </AssistantControlsContext.Provider>
  );
}
