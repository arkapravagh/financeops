/** Composer: the message input at the bottom of Elisa's panel (+ menu, page context, dictation, voice / send / stop). */

import { ArrowUp, AtSign, AudioLines, Mic, Paperclip, Plus, Square, TerminalSquare } from "lucide-react";
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { assistantLabels } from "../../../language/en/assistant.lang";
import { commonLabels } from "../../../language/en/common.lang";
import { Popover } from "../../../shared/ui/popover.component";

const L = assistantLabels.composer;

/** Imperative handle so the panel can focus the input (e.g. after opening). */
export type ComposerHandle = { focus: () => void };

/** Busy state (shows Stop), the current page label and send/stop callbacks. */
export type ComposerProps = {
  busy: boolean;
  contextLabel: string;
  onSend: (text: string) => void;
  onStop: () => void;
  /** React 19 ref-as-prop: lets the panel focus the input. */
  ref?: Ref<ComposerHandle>;
};

const MAX_HEIGHT = 200;
const toolBtn =
  "grid size-8 place-items-center rounded-full text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent";
const roundBtn =
  "grid size-9 place-items-center rounded-full bg-ink text-surface outline-none transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
const menuItem =
  "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-surface-2 focus-visible:bg-surface-2";

/**
 * Auto-growing input. Enter sends, Shift+Enter adds a line, Esc while streaming stops.
 * The round button is voice mode while the input is empty, send once there is text, and stop while Elisa replies.
 * Attachments, dictation and voice mode are prototype placeholders (aria-disabled, "coming soon").
 */
export function Composer({ busy, contextLabel, onSend, onStop, ref }: ComposerProps) {
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

  /** Put a command's prompt in the input so the user can edit it or press Enter. */
  const insert = (prompt: string) => {
    setText(prompt);
    requestAnimationFrame(() => {
      const ta = taRef.current;
      ta?.focus();
      ta?.setSelectionRange(prompt.length, prompt.length);
    });
  };

  return (
    <div className="px-4 pb-3">
      <div className="rounded-3xl border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
        <label className="sr-only" htmlFor="ai-composer">
          {L.label}
        </label>
        <textarea
          id="ai-composer"
          ref={taRef}
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            } else if (e.key === "Escape" && busy) {
              e.preventDefault(); // handled: stops the reply, so an enclosing modal must not also close
              onStop();
            }
          }}
          placeholder={L.placeholder}
          className="block max-h-[200px] min-h-14 w-full resize-none bg-transparent px-5 pt-4 pb-1 text-sm text-ink outline-none placeholder:text-muted"
        />
        <div className="flex items-center gap-1 px-3 pb-3">
          <Popover side="top" ariaLabel={L.more} buttonClassName={toolBtn} label={<Plus size={18} />} panelClassName="w-64">
            {(close) => (
              <>
                <button type="button" aria-disabled title={commonLabels.notAvailableTitle} className={`${menuItem} cursor-not-allowed text-muted`}>
                  <Paperclip size={15} aria-hidden />
                  {L.attachFiles}
                  <span className="sr-only">{commonLabels.comingSoon}</span>
                </button>
                <p className="mt-1 border-t border-line px-2 pt-2 pb-1 text-xs font-medium text-muted">{L.commandsHeading}</p>
                {L.commands.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`${menuItem} text-ink`}
                    onClick={() => {
                      close();
                      insert(c);
                    }}
                  >
                    <TerminalSquare size={15} className="shrink-0 text-muted" aria-hidden />
                    <span className="truncate">{c}</span>
                  </button>
                ))}
              </>
            )}
          </Popover>
          <span
            className="inline-flex max-w-[50%] min-w-0 items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] text-ink-2"
            title={L.contextTitle}
          >
            <AtSign size={11} className="shrink-0" aria-hidden />
            <span className="truncate">{contextLabel}</span>
          </span>

          <button
            type="button"
            aria-disabled
            aria-label={L.dictate + commonLabels.comingSoon}
            title={commonLabels.notAvailableTitle}
            className={`${toolBtn} ml-auto cursor-not-allowed`}
          >
            <Mic size={17} />
          </button>
          {busy ? (
            <button type="button" onClick={onStop} aria-label={L.stop} title={L.stopTitle} className={roundBtn}>
              <Square size={12} fill="currentColor" />
            </button>
          ) : text.trim() ? (
            <button type="button" onClick={submit} aria-label={L.send} title={L.sendTitle} className={roundBtn}>
              <ArrowUp size={17} strokeWidth={2.4} />
            </button>
          ) : (
            <button
              type="button"
              aria-disabled
              aria-label={L.voiceMode + commonLabels.comingSoon}
              title={commonLabels.notAvailableTitle}
              className={`${roundBtn} cursor-not-allowed`}
            >
              <AudioLines size={17} />
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted">{L.disclaimer}</p>
    </div>
  );
}
