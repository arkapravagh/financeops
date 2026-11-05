/**
 * Report card: one month-end report with its headline cash figures and Excel / PDF downloads.
 *
 * Used only by the Reports page. Downloads are placeholders in the prototype (`comingSoon`); the backend will
 * generate the files and must apply the same permissions as the screen (security-and-privacy rules).
 */

import { Clock, FileChartColumn, FileSpreadsheet, FileText } from "lucide-react";
import { useId, type ReactNode } from "react";
import { PageSection } from "../../../enums/page-section.enum";
import { ReportStatus } from "../../../enums/report-status.enum";
import { commonLabels } from "../../../language/en/common.lang";
import { reportStatusLabels } from "../../../language/en/enums.lang";
import { reportsLabels as L } from "../../../language/en/reports.lang";
import { Badge } from "../../../shared/ui/badge.component";
import { Button } from "../../../shared/ui/button.component";
import { formatDate, formatMonthLong } from "../../../shared/utils/dates.util";
import { formatFileSize } from "../../../shared/utils/file-size.util";
import { formatMoney } from "../../../shared/utils/money.util";
import type { MonthlyReportSummary } from "../../../types/finance.types";

/** The report to show, and whether it is the newest published one (gets a "Latest" badge). */
export type ReportCardProps = {
  report: MonthlyReportSummary;
  latest?: boolean;
};

/** One figure in the 2×2 summary grid. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-[15px] font-semibold tracking-[-0.01em] text-ink tabular-nums">{value}</dd>
    </div>
  );
}

/** A download button in the card footer: format name plus a muted detail (size or page count). */
function Download({ icon, label, detail, ariaLabel, disabled }: { icon: ReactNode; label: string; detail?: string; ariaLabel: string; disabled: boolean }) {
  return (
    <Button
      variant="ghost"
      icon={icon}
      className="h-11 w-full justify-center rounded-none"
      aria-label={ariaLabel}
      disabled={disabled}
      comingSoon={!disabled}
    >
      {label}
      {detail && <span className="font-normal text-muted">{detail}</span>}
    </Button>
  );
}

/** Month card: title and publish date, headline figures (or what's pending), then Excel and PDF downloads. */
export function ReportCard({ report, latest = false }: ReportCardProps) {
  const titleId = useId();
  const month = formatMonthLong(report.month);
  const ready = report.status === ReportStatus.Ready;
  const f = report.figures;
  const size = report.xlsxBytes === null ? undefined : formatFileSize(report.xlsxBytes);
  const pages = report.pdfPages === null ? undefined : L.pages(report.pdfPages);

  return (
    <article aria-labelledby={titleId} data-ai-target={latest ? PageSection.LatestReport : undefined} className="flex min-w-0 flex-col rounded-[14px] border border-line bg-surface">
      <header className="flex items-start gap-3 px-5 pt-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2" aria-hidden>
          {ready ? <FileChartColumn size={18} /> : <Clock size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          {/* Badge shares the title row so the date line keeps the full width; it wraps under the title on narrow cards. */}
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <h3 id={titleId} className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {month}
            </h3>
            {latest && <Badge tone="accent">{L.latest}</Badge>}
            {!ready && <Badge>{reportStatusLabels[report.status]}</Badge>}
          </div>
          <p className="mt-0.5 text-[13px] text-muted">
            {ready ? L.published(formatDate(report.availableOn)) : L.expected(formatDate(report.availableOn))}
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 pt-5 pb-5">
        {f ? (
          <dl aria-label={L.figures.label} className="grid grid-cols-2 gap-x-4 gap-y-4">
            <Figure label={L.figures.endingCash} value={formatMoney(f.endingCashCents)} />
            <Figure
              label={f.netBurnCents > 0 ? L.figures.netBurn : L.figures.netCashIn}
              value={formatMoney(Math.abs(f.netBurnCents))}
            />
            <Figure label={L.figures.moneyIn} value={formatMoney(f.inCents)} />
            <Figure label={L.figures.moneyOut} value={formatMoney(f.outCents)} />
          </dl>
        ) : (
          <p className="text-[13px] text-ink-2">{L.inProgressNote}</p>
        )}
      </div>

      <footer className="grid grid-cols-2 divide-x divide-line overflow-hidden rounded-b-[14px] border-t border-line">
        <Download
          icon={<FileSpreadsheet size={16} aria-hidden />}
          label={L.excel}
          detail={size}
          disabled={!ready}
          ariaLabel={L.downloadExcel(month, size ?? reportStatusLabels[report.status]) + (ready ? commonLabels.comingSoon : "")}
        />
        <Download
          icon={<FileText size={16} aria-hidden />}
          label={L.pdf}
          detail={pages}
          disabled={!ready}
          ariaLabel={L.downloadPdf(month, pages ?? reportStatusLabels[report.status]) + (ready ? commonLabels.comingSoon : "")}
        />
      </footer>
    </article>
  );
}
