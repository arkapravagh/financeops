/**
 * English labels for the Reports page: month-end financial reports as Excel and PDF downloads.
 */

/** Text on the Reports page and its month cards. Values arrive already formatted. */
export const reportsLabels = {
  title: "Reports",
  subtitle: "Month-end reports to send to your board, investors or accountant. Each covers cash, spending by category, budget against actual and money owed to you.",
  /** Year group heading count, e.g. "10 reports". */
  yearCount: (n: number) => `${n} ${n === 1 ? "report" : "reports"}`,
  latest: "Latest",
  published: (date: string) => `Published ${date}`,
  expected: (date: string) => `Expected around ${date}`,
  inProgressNote: "The report is ready once the books close: every transaction categorised and the bank accounts reconciled.",
  figures: {
    label: "Headline figures",
    endingCash: "Cash at month end",
    netBurn: "Net burn",
    netCashIn: "Net cash in",
    moneyIn: "Money in",
    moneyOut: "Money out",
  },
  excel: "Excel",
  pdf: "PDF",
  pages: (n: number) => `${n} pages`,
  /** Screen-reader names that say which month and which format a button downloads. */
  downloadExcel: (month: string, size: string) => `Download ${month} report as Excel, ${size}`,
  downloadPdf: (month: string, pages: string) => `Download ${month} report as PDF, ${pages}`,
  disclaimer: "Management reports built from your bank, invoice and budget data. They are unaudited and are not tax or accounting advice.",
} as const;
