/**
 * Reports: month-end financial reports as Excel and PDF, one card per month, grouped by year.
 *
 * Route: `/reports`. Figures on each card come from the same cash service as Overview, so they always agree.
 */

import { ReportStatus } from "../../enums/report-status.enum";
import { reportsLabels as L } from "../../language/en/reports.lang";
import { getMonthlyReports } from "../../services/reports.service";
import { PageHeader } from "../../shared/ui/page-header.component";
import { ReportCard } from "./components/report-card.component";

/** Reports page. Newest first; the newest published report is marked "Latest". */
export function ReportsPage() {
  const reports = getMonthlyReports();
  const latestId = reports.find((r) => r.status === ReportStatus.Ready)?.id;
  const years = [...new Set(reports.map((r) => r.month.slice(0, 4)))];

  return (
    <>
      <PageHeader title={L.title} subtitle={L.subtitle} />
      <div className="@container flex flex-col gap-8">
        {years.map((year) => {
          const items = reports.filter((r) => r.month.startsWith(year));
          return (
            <section key={year} aria-labelledby={`reports-${year}`}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 id={`reports-${year}`} className="text-[15px] font-semibold text-ink">
                  {year}
                </h2>
                <span className="text-[13px] text-muted">{L.yearCount(items.length)}</span>
              </div>
              <div className="grid gap-5 @xl:grid-cols-2 @4xl:grid-cols-3">
                {items.map((r) => (
                  <ReportCard key={r.id} report={r} latest={r.id === latestId} />
                ))}
              </div>
            </section>
          );
        })}
        <p className="text-xs text-muted">{L.disclaimer}</p>
      </div>
    </>
  );
}
