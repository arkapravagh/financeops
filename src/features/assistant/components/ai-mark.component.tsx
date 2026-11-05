/** AI mark: Elisa's avatar, used in the panel header, the empty state and next to her messages. */

import { ElisaGlyph } from "../../../shared/ui/elisa-glyph.component";

/** Elisa's avatar: a solid indigo tile (the app's single accent) with her spark glyph. `pulse` while she replies. */
export function AiMark({ size = 28, pulse = false }: { size?: number; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[30%] bg-accent text-accent-ink ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <ElisaGlyph size={Math.round(size * 0.6)} />
    </span>
  );
}
