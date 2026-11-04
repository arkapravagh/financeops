import type { ReactNode } from "react";

export type ScenarioSectionProps = { title: string; aside?: ReactNode; children: ReactNode };

/** One divided block of the scenario panel or dialog: title, optional summary on the right, controls. */
export function ScenarioSection({ title, aside, children }: ScenarioSectionProps) {
  return (
    <section className="border-t border-line px-5 py-4 first:border-t-0">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
        {aside && <span className="text-right text-xs text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}
