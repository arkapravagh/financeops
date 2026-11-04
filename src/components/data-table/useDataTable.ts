import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { CellValue, ColumnDef, FacetOption, Filters, SortState } from "./types";

const collator = new Intl.Collator("en-US", { numeric: true, sensitivity: "base" });

export const facetKey = <T,>(col: ColumnDef<T>, row: T) => String(col.accessor(row) ?? "");

const isEmpty = (v: CellValue) => v === null || v === undefined || v === "";

function compareValues(a: CellValue, b: CellValue): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

export type UseDataTableOptions<T> = {
  data: T[];
  /** Must be referentially stable (define at module scope or memoize). */
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  initialSort?: SortState | null;
  initialPageSize?: number;
};

/**
 * Headless table state. Pipeline: search → facet filters → sort → paginate,
 * each step memoized so unrelated state changes (selection, density, page) don't redo work.
 */
export function useDataTable<T>({ data, columns, getRowId, initialSort = null, initialPageSize = 10 }: UseDataTableOptions<T>) {
  const [search, setSearchState] = useState("");
  const [filters, setFiltersState] = useState<Filters>({});
  const [sort, setSortState] = useState<SortState | null>(initialSort);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.id)));
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  // Typing stays responsive: filtering runs on a deferred copy of the query.
  const deferredSearch = useDeferredValue(search);

  const colById = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  const visibleColumns = useMemo(() => columns.filter((c) => !hidden.has(c.id)), [columns, hidden]);
  const facetColumns = useMemo(() => columns.filter((c) => c.facet), [columns]);

  // Search index: one lowercase string per row, built once per data change.
  const searchIndex = useMemo(() => {
    const idx = new Map<T, string>();
    for (const row of data) {
      idx.set(
        row,
        columns
          .map((c) => (c.searchValue ? c.searchValue(row) : String(c.accessor(row) ?? "")))
          .join(" \u0000 ")
          .toLowerCase(),
      );
    }
    return idx;
  }, [data, columns]);

  const query = deferredSearch.trim().toLowerCase();
  const searched = useMemo(
    () => (query ? data.filter((r) => (searchIndex.get(r) as string).includes(query)) : data),
    [data, query, searchIndex],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([id, v]) => v.length > 0 && colById.has(id))
        .map(([id, v]) => [colById.get(id) as ColumnDef<T>, new Set(v)] as const),
    [filters, colById],
  );

  const filtered = useMemo(
    () =>
      activeFilters.length === 0
        ? searched
        : searched.filter((row) => activeFilters.every(([col, set]) => set.has(facetKey(col, row)))),
    [searched, activeFilters],
  );

  // Facet counts respect search + every OTHER active filter (standard faceted-search behaviour).
  const facets = useMemo(() => {
    const out: Record<string, FacetOption[]> = {};
    for (const col of facetColumns) {
      const others = activeFilters.filter(([c]) => c.id !== col.id);
      const counts = new Map<string, number>();
      for (const row of data) counts.set(facetKey(col, row), 0); // keep zero-count options visible
      for (const row of searched) {
        if (others.every(([c, set]) => set.has(facetKey(c, row)))) {
          const k = facetKey(col, row);
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
      }
      const entries = [...counts.entries()].filter(([k]) => k !== "");
      const order = col.facetOptions;
      entries.sort((a, b) => (order ? order.indexOf(a[0]) - order.indexOf(b[0]) : collator.compare(a[0], b[0])));
      out[col.id] = entries.map(([value, count]) => ({ value, label: col.facetLabel?.(value) ?? value, count }));
    }
    return out;
  }, [facetColumns, activeFilters, data, searched]);

  // Decorate–sort–undecorate: each accessor runs once per row, ties keep original order, empties last.
  const sorted = useMemo(() => {
    const col = sort ? colById.get(sort.id) : undefined;
    if (!sort || !col) return filtered;
    const keyed = filtered.map((row, i) => ({ row, i, k: col.accessor(row) }));
    keyed.sort((a, b) => {
      const ae = isEmpty(a.k);
      const be = isEmpty(b.k);
      if (ae || be) return ae === be ? a.i - b.i : ae ? 1 : -1;
      const c = compareValues(a.k, b.k);
      return c !== 0 ? (sort.desc ? -c : c) : a.i - b.i;
    });
    return keyed.map((x) => x.row);
  }, [filtered, sort, colById]);

  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pageIndex, pageCount - 1);
  const pageRows = useMemo(() => sorted.slice(page * pageSize, page * pageSize + pageSize), [sorted, page, pageSize]);

  // ----- actions (all reset to page 1 when the result set changes) -----
  const setSearch = useCallback((v: string) => {
    setSearchState(v);
    setPageIndex(0);
  }, []);
  const setFilter = useCallback((id: string, values: string[]) => {
    setFiltersState((f) => ({ ...f, [id]: values }));
    setPageIndex(0);
  }, []);
  const setFilters = useCallback((f: Filters) => {
    setFiltersState(f);
    setPageIndex(0);
  }, []);
  const resetFilters = useCallback(() => {
    setFiltersState({});
    setSearchState("");
    setPageIndex(0);
  }, []);
  const toggleSort = useCallback((id: string) => {
    setSortState((s) => (!s || s.id !== id ? { id, desc: false } : !s.desc ? { id, desc: true } : null));
    setPageIndex(0);
  }, []);
  const setPageSize = useCallback((n: number) => {
    setPageSizeState(n);
    setPageIndex(0);
  }, []);
  const toggleColumn = useCallback(
    (id: string) =>
      setHidden((h) => {
        const next = new Set(h);
        if (next.has(id)) next.delete(id);
        else if (columns.length - next.size > 1) next.add(id); // always keep one column
        return next;
      }),
    [columns.length],
  );

  // ----- selection -----
  const toggleRow = useCallback((id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const pageIds = useMemo(() => pageRows.map(getRowId), [pageRows, getRowId]);
  const pageSelectedCount = pageIds.filter((id) => selected.has(id)).length;
  const togglePage = useCallback(
    (checked: boolean) =>
      setSelected((s) => {
        const next = new Set(s);
        for (const id of pageIds) {
          if (checked) next.add(id);
          else next.delete(id);
        }
        return next;
      }),
    [pageIds],
  );
  const selectAllFiltered = useCallback(() => setSelected(new Set(sorted.map(getRowId))), [sorted, getRowId]);
  const clearSelection = useCallback(() => setSelected(new Set()), []);
  const selectedRows = useMemo(() => data.filter((r) => selected.has(getRowId(r))), [data, selected, getRowId]);

  const hasActiveFilters = search.trim() !== "" || activeFilters.length > 0;

  return {
    // data
    rows: sorted,
    pageRows,
    total,
    facets,
    // state
    search,
    filters,
    sort,
    hidden,
    visibleColumns,
    page,
    pageCount,
    pageSize,
    selected,
    selectedRows,
    pageSelectedCount,
    hasActiveFilters,
    // actions
    setSearch,
    setFilter,
    setFilters,
    resetFilters,
    toggleSort,
    toggleColumn,
    setPage: setPageIndex,
    setPageSize,
    toggleRow,
    togglePage,
    selectAllFiltered,
    clearSelection,
  };
}
