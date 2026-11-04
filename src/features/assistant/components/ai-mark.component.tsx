/** AI mark: the assistant's avatar, used in the panel header and next to its messages. */

import { Sparkles } from "lucide-react";

/** The assistant's avatar: a solid indigo tile with a sparkle (the app's single accent). */
export function AiMark({ size = 28, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-lg bg-accent text-accent-ink ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <Sparkles size={Math.round(size * 0.55)} strokeWidth={2.2} />
    </span>
  );
}
