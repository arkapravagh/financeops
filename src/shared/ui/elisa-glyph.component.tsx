/**
 * Elisa glyph: the AI assistant's mark, a solid four-point spark with a small companion spark and a dot.
 *
 * Part of the shared UI kit. Drawn in `currentColor` so it takes the surrounding text colour (accent on buttons,
 * accent-ink inside the assistant's avatar tile). Decorative: always `aria-hidden`; the button or label names it.
 */

/** Size in px (square). */
export type ElisaGlyphProps = {
  size?: number;
  className?: string;
};

/** Elisa's mark. Filled shapes (not strokes) so it stays crisp from 12px up to the 40px avatar. */
export function ElisaGlyph({ size = 16, className = "" }: ElisaGlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={`shrink-0 ${className}`} aria-hidden>
      {/* Main spark: concave four-point star centred at (10, 14). */}
      <path d="M10 5.5Q11.2 12.8 18.5 14Q11.2 15.2 10 22.5Q8.8 15.2 1.5 14Q8.8 12.8 10 5.5Z" />
      {/* Companion spark, upper right. */}
      <path d="M19 1.5Q19.5 4.5 22.5 5Q19.5 5.5 19 8.5Q18.5 5.5 15.5 5Q18.5 4.5 19 1.5Z" />
      <circle cx="20" cy="20" r="1.6" />
    </svg>
  );
}
