/**
 * DataTable: the house table for any list that needs search, facet filters, sorting, selection,
 * CSV export or pagination (Transactions, Invoices). State lives in `use-data-table.hook.ts`.
 */

import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  Download,
  Rows3,
  Rows4,
  Search,
  Settings2,
  X,
} from "lucide-react";
import { memo, useState, type ReactNode } from "react";
import { TableDensity } from "../../enums/table-density.enum";
import { facetKey, useDataTable } from "../../hooks/use-data-table.hook";
import { dataTableLabels as L } from "../../language/en/data-table.lang";
import type { ColumnDef, Filters, QuickView, SortState } from "../../types/data-table.types";
import { Checkbox } from "../ui/checkbox.component";
import { Popover } from "../ui/popover.component";
import { downloadCsv, toCsv } from "./csv.util";
import { FacetFilter } from "./facet-filter.component";

/** Rows, column definitions and optional features (quick views, selection, export file name). */
export type DataTableProps<T> = {
  data: T[];
  /** Must be referentially stable — define at module scope or useMemo. */
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  /** Accessible table name. */
  caption: string;
  searchPlaceholder?: string;
  initialSort?: SortState;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  quickViews?: QuickView[];
  selectable?: boolean;
  /** Shown in the bulk bar, e.g. the sum of selected amounts. */
  selectionSummary?: (rows: T[]) => ReactNode;
  /** Extra bulk actions for the selected rows. */
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  exportFileName?: string;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
};

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;
const justifyClass = { left: "justify-start", right: "justify-end", center: "justify-center" } as const;
const toolBtn =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-sm font-medium text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent";
const pageBtn =
  "grid size-8 place-items-center rounded-lg border border-line text-ink-2 outline-none transition hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40";

function sameFilters(a: Filters, b: Filters) {
  const norm = (f: Filters) =>
    JSON.stringify(
      Object.entries(f)
        .filter(([, v]) => v.length)
        .map(([k, v]) => [k, [...v].sort()])
        .sort(([x], [y]) => String(x).localeCompare(String(y))),
    );
  return norm(a) === norm(b);
}

// ---------- Row (memoized: re-renders only when its own props change) ----------

type RowProps<T> = {
  row: T;
  id: string;
  columns: ColumnDef<T>[];
  selectable: boolean;
  selected: boolean;
  onToggle: (id: string) => void;
  cellPad: string;
  extraClass: string;
};

function RowImpl<T>({ row, id, columns, selectable, selected, onToggle, cellPad, extraClass }: RowProps<T>) {
  return (
    <tr
      aria-selected={selectable ? selected : undefined}
      className={`group transition-colors ${selected ? "bg-accent/6" : "hover:bg-surface-2/70"} ${extraClass}`}
    >
      {selectable && (
        <td className={`w-10 border-b border-line pr-0 pl-5 ${cellPad}`}>
          <Checkbox checked={selected} onChange={() => onToggle(id)} label={L.selectRow(id)} />
        </td>
      )}
      {columns.map((c) => (
        <td
          key={c.id}
          className={`border-b border-line px-5 text-ink ${cellPad} ${alignClass[c.align ?? "left"]} ${
            c.align === "right" ? "tabular-nums" : ""
          } ${c.className ?? ""}`}
        >
          {c.cell ? c.cell(row) : (c.accessor(row) ?? "—")}
        </td>
      ))}
    </tr>
  );
}
const Row = memo(RowImpl) as typeof RowImpl;

// ---------- Table ----------

/** Full-featured client-side table. Define `columns` and `getRowId` at module scope so memoization holds. */
export function DataTable<T>({
  data,
  columns,
  getRowId,
  caption,
  searchPlaceholder = L.searchPlaceholder,
  initialSort,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  quickViews,
  selectable = false,
  selectionSummary,
  bulkActions,
  exportFileName = "export",
  emptyMessage = L.noResultsMatch,
  rowClassName,
}: DataTableProps<T>) {
  const t = useDataTable({ data, columns, getRowId, initialSort, initialPageSize });
  const [density, setDensity] = useState<TableDensity>(TableDensity.Comfortable);
  const cellPad = density === TableDensity.Compact ? "py-1.5" : "py-3";
  const facetCols = columns.filter((c) => c.facet);
  const hasFooter = t.visibleColumns.some((c) => c.footer);
  const from = t.total === 0 ? 0 : t.page * t.pageSize + 1;
  const to = Math.min(t.total, (t.page + 1) * t.pageSize);
  const colSpan = t.visibleColumns.length + (selectable ? 1 : 0);
  const allPageSelected = t.pageRows.length > 0 && t.pageSelectedCount === t.pageRows.length;

  const quickViewCount = (v: QuickView) => {
    const entries = Object.entries(v.filters).filter(([, vals]) => vals.length);
    if (entries.length === 0) return data.length;
    const cols = entries.map(([id, vals]) => [columns.find((c) => c.id === id), new Set(vals)] as const);
    return data.filter((row) => cols.every(([c, set]) => c && set.has(facetKey(c, row)))).length;
  };

  const exportRows = (rows: T[], suffix = "") => downloadCsv(`${exportFileName}${suffix}`, toCsv(rows, t.visibleColumns));

  return (
    <div className="flex flex-col">
      {/* Quick views */}
      {quickViews && (
        <div role="tablist" aria-label={L.views} className="flex flex-wrap gap-1 px-5 pb-3">
          {quickViews.map((v) => {
            const active = sameFilters(t.filters, v.filters);
            return (
              <button
                key={v.id}
                role="tab"
                aria-selected={active}
                onClick={() => t.setFilters(v.filters)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent ${
                  active ? "bg-accent/12 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {v.label} <span className="ml-1 text-xs text-muted tabular-nums">{quickViewCount(v)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
        <label className="relative flex items-center">
          <span className="sr-only">Search {caption}</span>
          <Search size={16} className="pointer-events-none absolute left-3 text-muted" aria-hidden />
          <input
            value={t.search}
            onChange={(e) => t.setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 w-56 rounded-lg border border-line bg-surface pr-8 pl-9 text-sm text-ink outline-none placeholder:text-muted focus-visible:ring-2 focus-visible:ring-accent sm:w-64"
          />
          {t.search && (
            <button
              type="button"
              aria-label={L.clearSearch}
              onClick={() => t.setSearch("")}
              className="absolute right-2 grid size-5 place-items-center rounded text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </label>

        {facetCols.map((c) => (
          <FacetFilter
            key={c.id}
            title={c.header}
            options={t.facets[c.id] ?? []}
            selected={t.filters[c.id] ?? []}
            onChange={(v) => t.setFilter(c.id, v)}
          />
        ))}

        {t.hasActiveFilters && (
          <button type="button" onClick={t.resetFilters} className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink">
            Reset <X size={14} />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className={toolBtn}
            aria-pressed={density === TableDensity.Compact}
            title={density === TableDensity.Compact ? L.comfortableRows : L.compactRows}
            aria-label={density === TableDensity.Compact ? L.switchToComfortable : L.switchToCompact}
            onClick={() => setDensity((d) => (d === TableDensity.Compact ? TableDensity.Comfortable : TableDensity.Compact))}
          >
            {density === TableDensity.Compact ? <Rows3 size={16} /> : <Rows4 size={16} />}
          </button>

          <Popover
            align="end"
            ariaLabel={L.chooseColumns}
            buttonClassName={toolBtn}
            label={
              <>
                <Settings2 size={16} aria-hidden /> <span className="hidden sm:inline">{L.columns}</span>
              </>
            }
          >
            <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted">{L.toggleColumns}</p>
            <ul>
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-ink hover:bg-surface-2">
                      <Checkbox checked={!t.hidden.has(c.id)} onChange={() => t.toggleColumn(c.id)} label={c.header} />
                      {c.header}
                    </label>
                  </li>
                ))}
            </ul>
          </Popover>

          <button type="button" className={toolBtn} onClick={() => exportRows(t.rows)} title={L.exportTitle}>
            <Download size={16} aria-hidden /> <span className="hidden sm:inline">{L.export}</span>
          </button>
        </div>
      </div>

      {/* Bulk selection bar */}
      {selectable && t.selected.size > 0 && (
        <div className="mx-5 mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-accent/10 px-4 py-2 text-sm" role="status">
          <span className="font-medium text-ink">{t.selected.size} selected</span>
          {selectionSummary && <span className="text-ink-2">{selectionSummary(t.selectedRows)}</span>}
          {t.selected.size < t.total && (
            <button type="button" onClick={t.selectAllFiltered} className="font-medium text-accent hover:underline">
              {L.selectAll(t.total)}
            </button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {bulkActions?.(t.selectedRows, t.clearSelection)}
            <button type="button" className={toolBtn} onClick={() => exportRows(t.selectedRows, "-selected")}>
              <Download size={14} aria-hidden /> {L.exportSelected}
            </button>
            <button type="button" aria-label={L.clearSelection} className="grid size-8 place-items-center rounded-lg text-ink-2 hover:bg-surface-2 hover:text-ink" onClick={t.clearSelection}>
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table: scrolls inside its own box so the header can stick */}
      <div className="max-h-[min(70vh,760px)] overflow-auto border-t border-line">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {selectable && (
                <th scope="col" className="sticky top-0 z-10 w-10 bg-surface py-2.5 pr-0 pl-5 text-left shadow-[inset_0_-1px_0_var(--line)]">
                  <Checkbox
                    checked={allPageSelected}
                    indeterminate={t.pageSelectedCount > 0}
                    onChange={t.togglePage}
                    label={L.selectPage}
                  />
                </th>
              )}
              {t.visibleColumns.map((c) => {
                const sortable = c.sortable !== false;
                const dir = t.sort?.id === c.id ? (t.sort.desc ? "descending" : "ascending") : "none";
                const Icon = dir === "ascending" ? ArrowUp : dir === "descending" ? ArrowDown : ChevronsUpDown;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={sortable ? dir : undefined}
                    className={`sticky top-0 z-10 bg-surface px-5 py-2.5 text-xs font-medium whitespace-nowrap text-muted shadow-[inset_0_-1px_0_var(--line)] ${
                      alignClass[c.align ?? "left"]
                    } ${c.headerClassName ?? c.className ?? ""}`}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => t.toggleSort(c.id)}
                        className={`-mx-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 outline-none hover:bg-surface-2 hover:text-ink focus-visible:ring-2 focus-visible:ring-accent ${
                          dir !== "none" ? "text-ink" : ""
                        } ${justifyClass[c.align ?? "left"]}`}
                      >
                        {c.header}
                        <Icon size={13} className={dir === "none" ? "opacity-40" : ""} aria-hidden />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {t.pageRows.map((row) => {
              const id = getRowId(row);
              return (
                <Row
                  key={id}
                  row={row}
                  id={id}
                  columns={t.visibleColumns}
                  selectable={selectable}
                  selected={t.selected.has(id)}
                  onToggle={t.toggleRow}
                  cellPad={cellPad}
                  extraClass={rowClassName?.(row) ?? ""}
                />
              );
            })}
            {t.pageRows.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-5 py-16 text-center">
                  <p className="text-sm font-medium text-ink">{emptyMessage}</p>
                  {t.hasActiveFilters && (
                    <button type="button" onClick={t.resetFilters} className="mt-2 text-sm font-medium text-accent hover:underline">
                      {L.clearFilters}
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>

          {hasFooter && t.total > 0 && (
            <tfoot>
              <tr className="bg-surface-2/60">
                {selectable && <td className="sticky bottom-0 bg-surface-2 pl-5" />}
                {t.visibleColumns.map((c) => (
                  <td
                    key={c.id}
                    className={`sticky bottom-0 bg-surface-2 px-5 py-2.5 text-sm font-medium text-ink ${alignClass[c.align ?? "left"]} ${
                      c.align === "right" ? "tabular-nums" : ""
                    } ${c.className ?? ""}`}
                  >
                    {c.footer?.(t.rows)}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm text-ink-2">
        <span className="tabular-nums">
          {t.total === 0 ? L.noResults : L.showing(from, to, t.total)}
          {t.total !== data.length && <span className="text-muted">{L.filteredFrom(data.length)}</span>}
        </span>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">{L.rowsPerPage}</span>
            <select
              value={t.pageSize}
              onChange={(e) => t.setPageSize(Number(e.target.value))}
              className="h-8 rounded-lg border border-line bg-surface px-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <span className="tabular-nums">
            {L.page(t.page + 1, t.pageCount)}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className={`${pageBtn} hidden sm:grid`} aria-label={L.firstPage} disabled={t.page === 0} onClick={() => t.setPage(0)}>
              <ChevronsLeft size={16} />
            </button>
            <button type="button" className={pageBtn} aria-label={L.previousPage} disabled={t.page === 0} onClick={() => t.setPage(t.page - 1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={pageBtn} aria-label={L.nextPage} disabled={t.page >= t.pageCount - 1} onClick={() => t.setPage(t.page + 1)}>
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className={`${pageBtn} hidden sm:grid`}
              aria-label={L.lastPage}
              disabled={t.page >= t.pageCount - 1}
              onClick={() => t.setPage(t.pageCount - 1)}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
