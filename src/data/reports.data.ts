/**
 * Mock data: month-end financial reports (management packs), one per closed month plus the open month.
 *
 * Static and deterministic, anchored to `AS_OF` (2026-11-02). Months match `flows.data.ts`, so every ready
 * report has cash figures. Read only through `services/reports.service.ts`.
 */

import { ReportStatus } from "../enums/report-status.enum";
import type { MonthlyReport } from "../types/finance.types";

/** Nov 2025 – Oct 2026 are published; Nov 2026 is still open. December carries the year-end pages. */
export const monthlyReports = [
  { id: "rep_2025_11", month: "2025-11", status: ReportStatus.Ready, availableOn: "2025-12-05", pdfPages: 11, xlsxBytes: 46_210 },
  { id: "rep_2025_12", month: "2025-12", status: ReportStatus.Ready, availableOn: "2026-01-08", pdfPages: 16, xlsxBytes: 61_480 },
  { id: "rep_2026_01", month: "2026-01", status: ReportStatus.Ready, availableOn: "2026-02-05", pdfPages: 11, xlsxBytes: 47_030 },
  { id: "rep_2026_02", month: "2026-02", status: ReportStatus.Ready, availableOn: "2026-03-04", pdfPages: 11, xlsxBytes: 47_650 },
  { id: "rep_2026_03", month: "2026-03", status: ReportStatus.Ready, availableOn: "2026-04-06", pdfPages: 12, xlsxBytes: 49_120 },
  { id: "rep_2026_04", month: "2026-04", status: ReportStatus.Ready, availableOn: "2026-05-05", pdfPages: 12, xlsxBytes: 49_870 },
  { id: "rep_2026_05", month: "2026-05", status: ReportStatus.Ready, availableOn: "2026-06-04", pdfPages: 12, xlsxBytes: 50_340 },
  { id: "rep_2026_06", month: "2026-06", status: ReportStatus.Ready, availableOn: "2026-07-06", pdfPages: 13, xlsxBytes: 52_960 },
  { id: "rep_2026_07", month: "2026-07", status: ReportStatus.Ready, availableOn: "2026-08-05", pdfPages: 12, xlsxBytes: 51_780 },
  { id: "rep_2026_08", month: "2026-08", status: ReportStatus.Ready, availableOn: "2026-09-03", pdfPages: 12, xlsxBytes: 52_410 },
  { id: "rep_2026_09", month: "2026-09", status: ReportStatus.Ready, availableOn: "2026-10-05", pdfPages: 13, xlsxBytes: 54_090 },
  { id: "rep_2026_10", month: "2026-10", status: ReportStatus.Ready, availableOn: "2026-11-02", pdfPages: 13, xlsxBytes: 55_320 },
  { id: "rep_2026_11", month: "2026-11", status: ReportStatus.InProgress, availableOn: "2026-12-04", pdfPages: null, xlsxBytes: null },
] satisfies MonthlyReport[];
