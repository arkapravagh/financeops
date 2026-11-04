import type { ColumnDef } from "./types";

/** Escape a CSV field. Strings starting with = + - @ are prefixed to block formula injection in Excel/Sheets. */
function field(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s = String(v);
  if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv<T>(rows: T[], columns: ColumnDef<T>[]): string {
  const cols = columns.filter((c) => c.csv !== false);
  const lines = [cols.map((c) => field(c.header)).join(",")];
  for (const row of rows) {
    lines.push(cols.map((c) => field(typeof c.csv === "function" ? c.csv(row) : c.accessor(row))).join(","));
  }
  return lines.join("\r\n");
}

export function downloadCsv(fileName: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }); // BOM so Excel reads UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
