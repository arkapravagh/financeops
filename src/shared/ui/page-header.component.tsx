/**
 * Page header: page title, one-line purpose and page-level actions.
 *
 * Part of the shared UI kit: design tokens only, works in light and dark themes (design-system skill).
 */

import type { ReactNode } from "react";

/** Title (sentence case), optional subtitle and right-aligned actions. */
export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

/** The top of every page. The only `<h1>` on the page. */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.025em] text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-[65ch] text-sm text-ink-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
