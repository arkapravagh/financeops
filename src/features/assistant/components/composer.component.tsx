/** Composer: the message input at the bottom of the AI panel. */

import { ArrowUp, AtSign, Paperclip, Square } from "lucide-react";
import { forwardRef, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";

/** Imperative handle so the panel can focus the input (e.g. after opening). */
export type ComposerHandle = { focus: () => void };

/** Busy state (shows Stop), the current page label and send/stop callbacks. */
export type ComposerProps = {
  busy: boolean;
  contextLabel: string;
  onSend: (text: string) => void;
  onStop: () => void;
};

const MAX_HEIGHT = 200;

/** Auto-growing input. Enter sends, Shift+Enter adds a line, Esc while streaming stops. */
export const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer({ busy, contextLabel, onSend, onStop }, ref) {
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => ({ focus: () => taRef.current?.focus() }), []);

  useLayoutEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_HEIGHT)}px`;
  }, [text]);

  const submit = () => {
    if (busy || !text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="px-4 pb-3">
      <div className="rounded-2xl border border-line bg-surface transition focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
        <label className="sr-only" htmlFor="ai-composer">
          Message FinanceOps AI
        </label>
        <textarea
          id="ai-composer"
          ref={taRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape" && busy) {
              onStop();
            }
          }}
          placeholder="Ask about cash, burn, invoices…"
          className="block max-h-[200px] w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm text-ink outline-none placeholder:text-muted"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            type="button"
            disabled
            title="Attachments — coming soon"
            aria-label="Attach file (coming soon)"
            className="grid size-8 place-items-center rounded-lg text-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Paperclip size={16} />
          </button>
          <span className="inline-flex max-w-[60%] items-center gap-1 truncate rounded-md bg-surface-2 px-2 py-1 text-[11px] text-ink-2" title="The assistant knows which page you're on">
            <AtSign size={11} aria-hidden /> {contextLabel}
          </span>
          {busy ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop (Esc)"
              className="ml-auto grid size-8 place-items-center rounded-full bg-ink text-surface outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Square size={12} fill="currentColor" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!text.trim()}
              aria-label="Send message"
              title="Send (Enter)"
              className="ml-auto grid size-8 place-items-center rounded-full bg-ink text-surface outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-accent disabled:bg-surface-2 disabled:text-muted"
            >
              <ArrowUp size={16} strokeWidth={2.4} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">AI can make mistakes. Verify important numbers. Not financial advice.</p>
    </div>
  );
});
