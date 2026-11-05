/**
 * Card: the standard panel with an optional title row, subtitle and action.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import type { ReactNode } from "react";
import type { PageSection } from "../../enums/page-section.enum";

/** Title row content and layout options. Use `flush` for edge-to-edge tables and lists. */
export type CardProps = {
  title?: ReactNode;
  /** One line of plain-language context under the title. */
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove body padding (for edge-to-edge tables and lists). */
  flush?: boolean;
  /** Marks the card as a section Elisa's cursor can scroll to and highlight (cursor mode). */
  aiTarget?: PageSection;
};

/** Panel: border only, 14px radius, no shadow (design-system). */
export function Card({ title, subtitle, action, children, className = "", flush = false, aiTarget }: CardProps) {
  return (
    <section data-ai-target={aiTarget} className={`min-w-0 rounded-[14px] border border-line bg-surface ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-5">
          <div className="min-w-0 flex-1 basis-64">
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[13px] text-ink-2">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={flush ? (title || action ? "mt-4" : "pt-5") : "p-5"}>{children}</div>
    </section>
  );
}
