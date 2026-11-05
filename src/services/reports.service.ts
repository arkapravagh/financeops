/**
 * Reports service: month-end financial reports with the headline cash figures each one summarises.
 *
 * Mock-backed today; when the API lands only this file changes (the backend will also serve the files).
 * Figures come from `cash.service`, so a report always agrees with Overview and Transactions.
 */

import { monthlyReports } from "../data/reports.data";
import { ReportStatus } from "../enums/report-status.enum";
import { netBurnCents } from "../shared/utils/metrics.util";
import type { MonthlyReportSummary } from "../types/finance.types";
import { getCashHistory, getMonthlyFlows } from "./cash.service";

/** Every monthly report, newest month first. Ready reports carry cash in/out, net burn and month-end cash. */
export function getMonthlyReports(): MonthlyReportSummary[] {
  const flows = getMonthlyFlows();
  const balances = getCashHistory();
  return [...monthlyReports]
    .sort((a, b) => b.month.localeCompare(a.month))
    .map((report) => {
      const flow = report.status === ReportStatus.Ready ? flows.find((f) => f.month === report.month) : undefined;
      const end = balances.find((b) => b.month === report.month);
      return {
        ...report,
        figures:
          flow && end
            ? { inCents: flow.inCents, outCents: flow.outCents, netBurnCents: netBurnCents(flow), endingCashCents: end.balanceCents }
            : null,
      };
    });
}
