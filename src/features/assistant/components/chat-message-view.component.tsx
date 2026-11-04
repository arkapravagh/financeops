/** Chat message: one user or assistant message with status, sources, follow-ups, copy and feedback. */

import { Check, Copy, CornerDownRight, FileText, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router-dom";
import type { ChatMessage } from "../../../types/assistant.types";
import { AiMark } from "./ai-mark.component";
import { Markdown } from "./markdown.component";

/** The message plus callbacks for follow-up questions, retry and feedback. */
export type ChatMessageViewProps = {
  message: ChatMessage;
  isLast: boolean;
  busy: boolean;
  onRegenerate: () => void;
  onFeedback: (id: string, f: "up" | "down" | undefined) => void;
  onFollowUp: (text: string) => void;
};

const actionBtn =
  "grid size-7 place-items-center rounded-md text-muted outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40";

function ChatMessageViewImpl({ message, isLast, busy, onRegenerate, onFeedback, onFollowUp }: ChatMessageViewProps) {
  const [copied, setCopied] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-surface-2 px-4 py-2.5 text-sm whitespace-pre-wrap text-ink">
          {message.content}
        </div>
      </div>
    );
  }

  const live = message.status === "thinking" || message.status === "streaming";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="flex gap-3">
      <AiMark size={28} pulse={live} />
      <div className="min-w-0 flex-1 pt-0.5">
        {message.status === "thinking" ? (
          <div className="flex h-6 items-center gap-1" role="status" aria-label="Assistant is thinking">
            {[0, 150, 300].map((d) => (
              <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d}ms` }} />
            ))}
            <span className="ml-2 text-xs text-muted">Analyzing your numbers…</span>
          </div>
        ) : (
          <div className={live ? "ai-caret" : undefined}>
            <Markdown text={message.content} />
          </div>
        )}

        {message.status === "stopped" && <p className="mt-2 text-xs text-muted italic">Stopped.</p>}
        {message.status === "error" && <p className="mt-2 text-xs text-critical">The reply failed. Try regenerating.</p>}

        {!live && message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-muted">Sources</span>
            {message.sources.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-0.5 text-xs text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
              >
                <FileText size={11} aria-hidden /> {s.label}
              </Link>
            ))}
          </div>
        )}

        {!live && (
          <div className="mt-2 flex items-center gap-0.5">
            <button type="button" className={actionBtn} onClick={copy} aria-label={copied ? "Copied" : "Copy reply"} title="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {isLast && (
              <button type="button" className={actionBtn} onClick={onRegenerate} disabled={busy} aria-label="Regenerate reply" title="Regenerate">
                <RefreshCw size={14} />
              </button>
            )}
            <button
              type="button"
              className={`${actionBtn} ${message.feedback === "up" ? "text-ink" : ""}`}
              aria-pressed={message.feedback === "up"}
              aria-label="Good response"
              title="Good response"
              onClick={() => onFeedback(message.id, message.feedback === "up" ? undefined : "up")}
            >
              <ThumbsUp size={14} fill={message.feedback === "up" ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              className={`${actionBtn} ${message.feedback === "down" ? "text-ink" : ""}`}
              aria-pressed={message.feedback === "down"}
              aria-label="Bad response"
              title="Bad response"
              onClick={() => onFeedback(message.id, message.feedback === "down" ? undefined : "down")}
            >
              <ThumbsDown size={14} fill={message.feedback === "down" ? "currentColor" : "none"} />
            </button>
          </div>
        )}

        {isLast && !live && !busy && message.followUps && message.followUps.length > 0 && (
          <div className="mt-3 flex flex-col items-start gap-1.5">
            {message.followUps.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onFollowUp(f)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-left text-xs text-ink-2 outline-none transition hover:border-accent/40 hover:bg-accent/6 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
              >
                <CornerDownRight size={12} className="shrink-0 text-muted" aria-hidden /> {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Memoized so only the streaming message re-renders while tokens arrive. */
export const ChatMessageView = memo(ChatMessageViewImpl);
