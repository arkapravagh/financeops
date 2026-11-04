/**
 * English labels for the house DataTable and its facet filters.
 */

/** Toolbar, selection, empty state and pagination text for DataTable. */
export const dataTableLabels = {
  searchPlaceholder: "Search…",
  clearSearch: "Clear search",
  views: "Views",
  noResultsMatch: "No results match your filters.",
  clearFilters: "Clear filters",
  comfortableRows: "Comfortable rows",
  compactRows: "Compact rows",
  switchToComfortable: "Switch to comfortable rows",
  switchToCompact: "Switch to compact rows",
  chooseColumns: "Choose columns",
  columns: "Columns",
  toggleColumns: "Toggle columns",
  exportTitle: "Export filtered rows as CSV",
  export: "Export",
  exportSelected: "Export selected",
  selectAll: (total: number) => `Select all ${total}`,
  clearSelection: "Clear selection",
  selectRow: (id: string) => `Select row ${id}`,
  selectPage: "Select all rows on this page",
  noResults: "No results",
  showing: (from: number, to: number, total: number) => `Showing ${from}–${to} of ${total}`,
  filteredFrom: (total: number) => ` (filtered from ${total})`,
  rowsPerPage: "Rows per page",
  page: (page: number, pageCount: number) => `Page ${page} of ${pageCount}`,
  firstPage: "First page",
  previousPage: "Previous page",
  nextPage: "Next page",
  lastPage: "Last page",
  /** Facet filter trigger, e.g. "Filter by Category, 2 selected". */
  filterBy: (title: string, selected: number) => `Filter by ${title}${selected ? `, ${selected} selected` : ""}`,
  searchFacet: (title: string) => `Search ${title}`,
  noMatches: "No matches",
  clearFilter: "Clear filter",
} as const;
