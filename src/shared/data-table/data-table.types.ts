/** Types for the house DataTable: column definitions and table state. */

import type { ReactNode } from "react";

/** Raw value a column exposes for sorting, filtering and CSV (never a formatted string). */
export type CellValue = string | number | null | undefined;

/** How one column reads, displays, sorts, filters, totals and exports its data. */
export type ColumnDef<T> = {
  id: string;
  header: string;
  /** Raw value used for sorting, filtering, search and CSV. Keep it cheap and pure. */
  accessor: (row: T) => CellValue;
  /** Custom rendering. Defaults to the accessor value. */
  cell?: (row: T) => ReactNode;
  /** Extra text to match in global search (defaults to the accessor value). */
  searchValue?: (row: T) => string;
  align?: "left" | "right" | "center";
  /** Default true. */
  sortable?: boolean;
  /** Default true. */
  hideable?: boolean;
  defaultHidden?: boolean;
  /** Show a faceted filter for this column's accessor values. */
  facet?: boolean;
  facetLabel?: (value: string) => string;
  /** Fixed option order for the facet (otherwise alphabetical). */
  facetOptions?: string[];
  /** Footer content, computed over ALL filtered rows (not just the current page). */
  footer?: (rows: T[]) => ReactNode;
  /** CSV value; `false` excludes the column from exports. Defaults to accessor. */
  csv?: ((row: T) => string | number) | false;
  /** Extra classes for body cells (e.g. responsive hiding). */
  className?: string;
  headerClassName?: string;
};

/** Active sort: column id and direction. */
export type SortState = { id: string; desc: boolean };
/** Row height setting. */
export type Density = "comfortable" | "compact";
/** Selected facet values per column id. */
export type Filters = Record<string, string[]>;

/** A named preset of facet filters, rendered as tabs above the table. */
export type QuickView = { id: string; label: string; filters: Filters };

/** One choice in a facet filter, with how many rows have it. */
export type FacetOption = { value: string; label: string; count: number };
