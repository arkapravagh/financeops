/** Scenario picker: searchable dropdown of custom and predefined scenarios, grouped by category. */

import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { scenarioCategoryLabels } from "../../../language/en/enums.lang";
import { pickerLabels as L, scenarioNames } from "../../../language/en/forecast.lang";
import type { LibraryScenario } from "../../../types/forecast.types";

/** Options in display order, the selected id, and select/create callbacks. */
export type ScenarioPickerProps = {
  /** All options in display order; consecutive options with the same category form a group. */
  options: LibraryScenario[];
  /** Id of the scenario in the panel. Anything not in `options` (e.g. "working") shows as edited. */
  selectedId: string;
  onSelect: (s: LibraryScenario) => void;
  onCreate: () => void;
};

const matches = (s: LibraryScenario, q: string) =>
  `${s.name} ${s.description} ${scenarioCategoryLabels[s.category]}`.toLowerCase().includes(q);

/**
 * Searchable, grouped scenario dropdown (ARIA combobox + listbox).
 * Type to filter, arrow keys to move, Enter to choose, Escape to close.
 */
export function ScenarioPicker({ options, selectedId, onSelect, onCreate }: ScenarioPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;

  const selected = options.find((o) => o.id === selectedId);
  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => (q ? options.filter((o) => matches(o, q)) : options), [options, q]);
  const groups = useMemo(() => {
    const out: { category: LibraryScenario["category"]; items: { option: LibraryScenario; index: number }[] }[] = [];
    filtered.forEach((option, index) => {
      const last = out.at(-1);
      if (last?.category === option.category) last.items.push({ option, index });
      else out.push({ category: option.category, items: [{ option, index }] });
    });
    return out;
  }, [filtered]);

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };
  const openList = () => {
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.id === selectedId)));
    setOpen(true);
  };
  const choose = (s: LibraryScenario) => {
    onSelect(s);
    close();
  };

  // Focus the search box on open, close on outside click.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the active option in view as it moves.
  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active, uid]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = filtered.length - 1;
    if (e.key === "ArrowDown") setActive((a) => Math.min(last, a + 1));
    else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1));
    else if (e.key === "Home") setActive(0);
    else if (e.key === "End") setActive(last);
    else if (e.key === "PageDown") setActive((a) => Math.min(last, a + 8));
    else if (e.key === "PageUp") setActive((a) => Math.max(0, a - 8));
    else if (e.key === "Enter" && filtered[active]) choose(filtered[active]);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(false);
    else return;
    e.preventDefault();
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openList();
          }
        }}
        className="flex h-11 w-full items-center gap-3 rounded-lg border border-line bg-surface px-3 text-left outline-none transition hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{selected?.name ?? scenarioNames.working}</span>
          <span className="block truncate text-xs text-muted">{selected ? scenarioCategoryLabels[selected.category] : L.edited}</span>
        </span>
        <ChevronDown size={16} aria-hidden className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow-float)]">
          <div className="relative border-b border-line">
            <Search size={15} aria-hidden className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              role="combobox"
              aria-label={L.search}
              aria-expanded
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={filtered[active] ? optId(active) : undefined}
              placeholder={L.searchPlaceholder(options.length)}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKey}
              className="h-10 w-full bg-transparent pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted"
            />
          </div>

          <ul id={listId} role="listbox" aria-label={L.list} className="scroll-thin max-h-80 overflow-y-auto py-1">
            {groups.map((g, gi) => (
              <li key={g.category} role="presentation">
                <div id={`${uid}-group-${gi}`} className="flex items-baseline justify-between px-3 pt-2.5 pb-1 text-xs font-medium text-muted">
                  <span>{scenarioCategoryLabels[g.category]}</span>
                  <span className="tabular-nums">{g.items.length}</span>
                </div>
                <ul role="group" aria-labelledby={`${uid}-group-${gi}`}>
                  {g.items.map(({ option, index }) => {
                    const isSelected = option.id === selectedId;
                    return (
                      <li
                        key={option.id}
                        id={optId(index)}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActive(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => choose(option)}
                        className={`mx-1 flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 ${index === active ? "bg-surface-2" : ""}`}
                      >
                        <Check size={14} aria-hidden className={`mt-0.5 shrink-0 text-accent ${isSelected ? "" : "invisible"}`} />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-ink">{option.name}</span>
                          {option.description && <span className="line-clamp-2 block text-xs text-muted">{option.description}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-ink-2">{L.noMatch(query.trim())}</p>
          )}
          <p className="sr-only" aria-live="polite">
            {L.resultCount(filtered.length)}
          </p>

          <div className="border-t border-line p-1">
            <button
              type="button"
              onClick={() => {
                close(false);
                onCreate();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] font-medium text-accent outline-none hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus size={14} aria-hidden /> {L.create}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
