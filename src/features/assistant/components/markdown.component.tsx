/** Safe Markdown renderer for assistant replies (no HTML injection; see security rules). */

import { memo, type ReactNode } from "react";

/**
 * Minimal, safe Markdown → React renderer for assistant replies.
 * Supports: paragraphs, line breaks, ### headings, - bullets, 1. numbered lists, **bold**, _italic_, `code`.
 * Builds React elements only — never dangerouslySetInnerHTML — so model output can't inject HTML.
 * Tolerates partial input mid-stream (an unclosed ** simply renders as text until it closes).
 */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k} className="font-semibold text-ink">{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("`")) out.push(<code key={k} className="rounded bg-surface-2 px-1 py-0.5 text-[0.85em]">{tok.slice(1, -1)}</code>);
    else out.push(<em key={k} className="text-ink-2">{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MarkdownImpl({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-ink">
      {blocks.map((block, bi) => {
        const lines = block.split("\n").filter((l) => l.length > 0);
        if (lines.length === 0) return null;
        const key = `b${bi}`;

        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={key} className="flex list-disc flex-col gap-1 pl-5 marker:text-muted">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*[-*] /, ""), `${key}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+\. /.test(l))) {
          return (
            <ol key={key} className="flex list-decimal flex-col gap-1 pl-5 marker:text-muted">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*\d+\. /, ""), `${key}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        // Heading line followed by a list (common "**Title**\n- item" shape) → render heading + list
        if (lines.length > 1 && lines.slice(1).every((l) => /^\s*([-*]|\d+\.) /.test(l))) {
          const ordered = /^\s*\d+\. /.test(lines[1]);
          const items = lines.slice(1).map((l, li) => (
            <li key={li}>{inline(l.replace(/^\s*([-*]|\d+\.) /, ""), `${key}-${li}`)}</li>
          ));
          return (
            <div key={key} className="flex flex-col gap-1">
              <p>{inline(lines[0].replace(/^#+\s*/, ""), `${key}-h`)}</p>
              {ordered ? (
                <ol className="flex list-decimal flex-col gap-1 pl-5 marker:text-muted">{items}</ol>
              ) : (
                <ul className="flex list-disc flex-col gap-1 pl-5 marker:text-muted">{items}</ul>
              )}
            </div>
          );
        }
        if (/^#{1,4} /.test(lines[0]) && lines.length === 1) {
          return (
            <h4 key={key} className="text-[15px] font-semibold text-ink">
              {inline(lines[0].replace(/^#+ /, ""), key)}
            </h4>
          );
        }
        return (
          <p key={key}>
            {lines.map((l, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+ /, ""), `${key}-${li}`)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

/** Renders `text` as a small, safe subset of Markdown. Memoized on the text. */
export const Markdown = memo(MarkdownImpl);
