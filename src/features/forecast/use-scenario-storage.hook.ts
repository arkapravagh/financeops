/**
 * Browser persistence for forecast scenarios (localStorage).
 *
 * Two independent lists:
 * - **Saved** (`fo-scenarios`): up to {@link MAX_SAVED} scenarios pinned to the chart and comparison table.
 * - **Custom** (`fo-custom-scenarios`): up to {@link MAX_CUSTOM} user-built scenarios shown in the picker.
 *
 * Prototype only: data stays in this browser. When the API lands, swap these hooks for service calls.
 * Storage failures (private mode, quota) are swallowed; the lists then just don't survive a reload.
 */

import { useCallback, useEffect, useState } from "react";
import { CUSTOM_CATEGORY, type LibraryScenario, type Scenario } from "./scenario.model";

/** Saved comparisons cap: + current + working = the 3-series limit the chart palette is validated for. */
export const MAX_SAVED = 2;

/** Upper bound on user-built scenarios kept in the picker. */
export const MAX_CUSTOM = 50;

/** Fill fields added after a scenario was stored, so older saves keep working. */
function normalize<T extends Scenario>(s: T): T {
  return { ...s, revenueAdjustment: s.revenueAdjustment ?? 0, hires: s.hires ?? [], raise: s.raise ?? null };
}

/** A list in React state mirrored to `localStorage[key]`, read once on mount and capped at `max` items. */
function useStoredList<T extends Scenario>(key: string, max: number) {
  const [list, setList] = useState<T[]>(() => {
    try {
      return (JSON.parse(localStorage.getItem(key) ?? "[]") as T[]).slice(0, max).map(normalize);
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch {
      /* storage unavailable */
    }
  }, [key, list]);
  return [list, setList] as const;
}

/**
 * Scenarios pinned to the chart and comparison table.
 * @returns `saved` (newest first), `save(scenario, name)` and `remove(id)`.
 */
export function useSavedScenarios() {
  const [saved, setSaved] = useStoredList<Scenario>("fo-scenarios", MAX_SAVED);
  const save = useCallback(
    (s: Scenario, name: string) =>
      setSaved((list) => [{ ...s, id: crypto.randomUUID(), name: name.trim() || "Untitled scenario" }, ...list].slice(0, MAX_SAVED)),
    [setSaved],
  );
  const remove = useCallback((id: string) => setSaved((list) => list.filter((s) => s.id !== id)), [setSaved]);
  return { saved, save, remove };
}

/**
 * Scenarios the user built with "Create custom scenario". They appear at the top of the picker.
 * @returns `custom` (newest first), `upsert(draft)` which returns the stored scenario, and `remove(id)`.
 */
export function useCustomScenarios() {
  const [custom, setCustom] = useStoredList<LibraryScenario>("fo-custom-scenarios", MAX_CUSTOM);
  /** Insert or update (matched by id). Assigns an id, category and trimmed text. */
  const upsert = useCallback(
    (s: Omit<LibraryScenario, "id" | "category" | "custom"> & { id?: string }): LibraryScenario => {
      const stored: LibraryScenario = {
        ...s,
        id: s.id ?? `custom-${crypto.randomUUID()}`,
        name: s.name.trim() || "Untitled scenario",
        description: s.description.trim(),
        category: CUSTOM_CATEGORY,
        custom: true,
      };
      setCustom((list) =>
        list.some((x) => x.id === stored.id) ? list.map((x) => (x.id === stored.id ? stored : x)) : [stored, ...list].slice(0, MAX_CUSTOM),
      );
      return stored;
    },
    [setCustom],
  );
  const remove = useCallback((id: string) => setCustom((list) => list.filter((s) => s.id !== id)), [setCustom]);
  return { custom, upsert, remove };
}
