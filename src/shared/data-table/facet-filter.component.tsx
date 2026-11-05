/** Facet filter: a popover of checkboxes for one low-cardinality column (category, status, account). */

import { PlusCircle, Search } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox.component";
import { Popover } from "../ui/popover.component";
import type { FacetOption } from "./data-table.types";

/** Column title, available options with counts, and the controlled selection. */
export type FacetFilterProps = {
  title: string;
  options: FacetOption[];
  selected: string[];
  onChange: (values: string[]) => void;
};

/** Toolbar button that opens the option list; shows how many values are selected. */
export function FacetFilter({ title, options, selected, onChange }: FacetFilterProps) {
  const [q, setQ] = useState("");
  const active = selected.length > 0;
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const shown = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;

  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <Popover
      ariaLabel={`Filter by ${title}${active ? `, ${selected.length} selected` : ""}`}
      buttonClassName={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
        active ? "border-line bg-surface text-ink" : "border-dashed border-line text-ink-2 hover:bg-surface-2 hover:text-ink"
      }`}
      label={
        <>
          <PlusCircle size={14} className={active ? "rotate-45 text-muted transition" : "text-muted transition"} aria-hidden />
          {title}
          {active && (
            <>
              <span className="mx-0.5 h-4 w-px bg-line" aria-hidden />
              {selected.length > 2 ? (
                <span className="rounded bg-accent/12 px-1.5 py-0.5 text-xs">{selected.length} selected</span>
              ) : (
                selected.map((v) => (
                  <span key={v} className="rounded bg-accent/12 px-1.5 py-0.5 text-xs">
                    {labelOf(v)}
                  </span>
                ))
              )}
            </>
          )}
        </>
      }
    >
      {options.length > 7 && (
        <label className="relative mb-1 flex items-center">
          <span className="sr-only">Search {title}</span>
          <Search size={14} className="pointer-events-none absolute left-2.5 text-muted" aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={title}
            className="h-8 w-full rounded-md border border-line bg-surface-2 pl-8 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent"
          />
        </label>
      )}
      <ul className="max-h-72 overflow-y-auto" role="group" aria-label={title}>
        {shown.map((o) => (
          <li key={o.value}>
            <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2">
              <Checkbox checked={selected.includes(o.value)} onChange={() => toggle(o.value)} label={o.label} />
              <span className="flex-1 truncate">{o.label}</span>
              <span className={`text-xs tabular-nums ${o.count === 0 ? "text-muted/60" : "text-muted"}`}>{o.count}</span>
            </label>
          </li>
        ))}
        {shown.length === 0 && <li className="px-2 py-3 text-center text-sm text-muted">No matches</li>}
      </ul>
      {active && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="mt-1 w-full rounded-md border-t border-line px-2 py-1.5 text-center text-sm font-medium text-ink-2 outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
        >
          Clear filter
        </button>
      )}
    </Popover>
  );
}
