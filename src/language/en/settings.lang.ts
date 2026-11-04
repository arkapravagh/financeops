/**
 * English labels for the Settings page. Role and integration status names live in `enums.lang.ts`.
 */

/** Text on the Settings page. */
export const settingsLabels = {
  title: "Settings",
  subtitle: "Company profile, connected accounts and who can see what.",
  profile: {
    title: "Company profile",
    company: "Company",
    stage: "Stage",
    headcount: "Headcount",
    headcountValue: (n: number) => `${n} people`,
    currency: "Reporting currency",
    fiscalYear: "Fiscal year starts",
    lastRaise: "Last raise",
    /** e.g. "$3.5M Seed round, closed Jun 12, 2025". Amount and date arrive formatted. */
    lastRaiseValue: (amount: string, round: string, date: string) => `${amount} ${round} round, closed ${date}`,
  },
  accounts: {
    title: "Bank accounts",
    /** e.g. "Northbank, account ending 4821". */
    detail: (institution: string, mask: string) => `${institution}, account ending ${mask}`,
  },
  integrations: {
    title: "Integrations",
    subtitle: "Connections are placeholders in this prototype.",
    connect: "Connect",
  },
  team: {
    title: "Team & permissions",
    note: "Owners and Finance can see payroll totals. Viewers see dashboards only.",
  },
} as const;
