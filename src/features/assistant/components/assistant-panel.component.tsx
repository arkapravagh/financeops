/**
 * Assistant panel: Elisa's header (title, demo pill, close), toolbar (new chat, history, cursor mode, feedback),
 * the message list or empty state, and the composer.
 *
 * Follows the page the user is on (context chip) and auto-scrolls while a reply streams unless the user scrolls up.
 */

import { ArrowDown, History, MessageSquare, MousePointer2, Plus, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAssistant } from "../../../hooks/use-assistant.hook";
import { assistantLabels as L } from "../../../language/en/assistant.lang";
import { commonLabels } from "../../../language/en/common.lang";
import { pageSuggestions } from "../../../services/assistant.service";
import { navLabel } from "../../../shared/config/navigation.config";
import { ElisaGlyph } from "../../../shared/ui/elisa-glyph.component";
import { Popover } from "../../../shared/ui/popover.component";
import { ChatMessageView } from "./chat-message-view.component";
import { Composer, type ComposerHandle } from "./composer.component";

const iconBtn =
  "grid size-8 place-items-center rounded-lg text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent";

function timeAgo(ts: number) {
  const m = Math.round((Date.now() - ts) / 60000);
  if (m < 1) return L.justNow;
  if (m < 60) return L.minutesAgo(m);
  const h = Math.round(m / 60);
  return h < 24 ? L.hoursAgo(h) : L.daysAgo(Math.round(h / 24));
}

/** Close callback (the dock owns the open state). */
export type AssistantPanelProps = {
  onClose: () => void;
};

/** The Elisa chat UI (Ctrl+J). Rendered by the dock. */
export function AssistantPanel({ onClose }: AssistantPanelProps) {
  const a = useAssistant();
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<ComposerHandle>(null);
  const [pinned, setPinned] = useState(true); // stick to bottom while the user hasn't scrolled up
  const messages = a.active?.messages ?? [];
  const lastStatus = messages.at(-1)?.status;
  const lastContent = messages[messages.length - 1]?.content;

  // Focus the input whenever the panel opens.
  useEffect(() => {
    if (a.open) {
      const t = setTimeout(() => composerRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [a.open]);

  // Auto-scroll as tokens arrive, only if the user is already at the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [lastContent, messages.length, pinned]);

  // New / switched conversation → jump to bottom.
  useEffect(() => setPinned(true), [a.active?.id]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
  }, []);

  // Stable callback (reads latest send via ref) so memoized messages skip re-rendering while streaming.
  const sendRef = useRef(a.send);
  useEffect(() => {
    sendRef.current = a.send;
  });
  const send = useCallback((text: string) => {
    setPinned(true);
    sendRef.current(text);
    // A clicked starter prompt unmounts with the empty state; keep keyboard focus in the panel.
    composerRef.current?.focus();
  }, []);

  return (
    <div className="flex h-full flex-col border-l border-line bg-page lg:border-l-0 lg:bg-frame">
      {/* Header: conversation title, demo pill and close (same height as the top bar). */}
      <header className="flex h-14 shrink-0 items-center gap-1 px-3">
        <h2 className="min-w-0 flex-1 truncate pl-1 text-[15px] font-medium text-ink">{a.active ? a.active.title : L.newChatTitle}</h2>
        <span className="mr-1 shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2" title={L.demoMode}>
          {L.demoBadge}
        </span>
        <button type="button" className={iconBtn} onClick={onClose} aria-label={L.close} title={L.closeTitle}>
          <X size={17} />
        </button>
      </header>

      {/* Toolbar: new chat and history on the left, feedback on the right. */}
      <div className="flex h-10 shrink-0 items-center gap-1 px-3">
        <button type="button" className={iconBtn} onClick={a.newChat} aria-label={L.newChat} title={L.newChat}>
          <Plus size={17} />
        </button>
        <Popover ariaLabel={L.history} buttonClassName={iconBtn} label={<History size={16} />} panelClassName="w-72">
          {(close) => (
            <>
              <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted">{L.recentChats}</p>
              {a.conversations.length === 0 && <p className="px-2 py-4 text-center text-sm text-muted">{L.noConversations}</p>}
              <ul className="max-h-80 overflow-y-auto">
                {a.conversations.map((c) => (
                  <li key={c.id} className="group flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        a.selectChat(c.id);
                        close();
                      }}
                      className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent ${
                        a.active?.id === c.id ? "bg-surface-2 text-ink" : "text-ink-2"
                      }`}
                    >
                      <MessageSquare size={14} className="shrink-0 text-muted" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">{c.title}</span>
                      <span className="shrink-0 text-[11px] text-muted">{timeAgo(c.updatedAt)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => a.deleteChat(c.id)}
                      aria-label={L.deleteChat(c.title)}
                      className="grid size-7 shrink-0 place-items-center rounded-md text-muted opacity-0 outline-none group-hover:opacity-100 hover:bg-critical/10 hover:text-critical focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Popover>
        <button
          type="button"
          onClick={() => a.setCursorMode(!a.cursorMode)}
          aria-pressed={a.cursorMode}
          title={a.cursorMode ? L.cursor.modeOnTitle : L.cursor.modeOffTitle}
          className={`ml-auto inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
            a.cursorMode ? "border-accent/30 bg-accent-soft text-accent" : "border-line text-ink-2 hover:bg-surface-2 hover:text-ink"
          }`}
        >
          <MousePointer2 size={13} aria-hidden fill={a.cursorMode ? "currentColor" : "none"} />
          {L.cursor.mode}
        </button>
        <button
          type="button"
          aria-disabled
          title={commonLabels.notAvailableTitle}
          className="cursor-not-allowed rounded-md px-2 py-1 text-[13px] text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          {L.feedback}
          <span className="sr-only">{commonLabels.comingSoon}</span>
        </button>
      </div>

      {/* One short announcement per reply state change; the message list itself is not a live region (it updates every frame). */}
      <p className="sr-only" role="status" aria-live="polite">
        {lastStatus ? L.liveStatus[lastStatus] : ""}
      </p>

      {/* Messages */}
      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto px-4 py-5" aria-busy={a.isStreaming}>
          {messages.length === 0 ? (
            <div className="flex min-h-full flex-col items-center justify-center px-2 pb-6 text-center">
              <ElisaGlyph size={30} className="text-accent" />
              <p className="mt-3 text-[15px] text-ink-2">{L.emptyTitle}</p>
              <p className="mt-1 max-w-72 text-sm text-muted">{L.emptyTip}</p>
              <p className="mt-8 text-xs font-medium text-muted">{L.suggestions}</p>
              <div className="mt-2 flex max-w-[480px] flex-wrap justify-center gap-2">
                {pageSuggestions(a.page).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] text-ink-2 outline-none transition hover:border-accent/40 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m, i) => (
                <ChatMessageView
                  key={m.id}
                  message={m}
                  isLast={i === messages.length - 1}
                  busy={a.isStreaming}
                  onRegenerate={a.regenerate}
                  onFeedback={a.setFeedback}
                  onFollowUp={send}
                  onGoTo={a.showOnScreen}
                />
              ))}
            </div>
          )}
        </div>

        {!pinned && messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setPinned(true);
              scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }}
            aria-label={L.scrollToLatest}
            className="absolute bottom-3 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full border border-line bg-surface text-ink-2 shadow-[var(--shadow-float)] outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      <Composer ref={composerRef} busy={a.isStreaming} contextLabel={navLabel(a.page)} onSend={send} onStop={a.stop} />
    </div>
  );
}
