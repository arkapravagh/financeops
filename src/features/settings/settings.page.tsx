import { Building2, CheckCircle2, Landmark, Plug, Users } from "lucide-react";
import { Badge } from "../../shared/ui/badge.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { formatDate } from "../../shared/utils/dates.util";
import { formatCompact, formatMoney } from "../../shared/utils/money.util";
import { getAccounts } from "../../services/cash.service";
import { getCompany, getIntegrations, getTeam } from "../../services/company.service";

export function SettingsPage() {
  const company = getCompany();
  const accounts = getAccounts();
  const integrations = getIntegrations();
  const team = getTeam();

  const profile: [string, string][] = [
    ["Company", company.name],
    ["Stage", company.stage],
    ["Headcount", `${company.headcount} people`],
    ["Reporting currency", company.currency],
    ["Fiscal year starts", company.fiscalYearStart],
    ["Last raise", `${formatCompact(company.lastRaise.amountCents)} ${company.lastRaise.round} round, closed ${formatDate(company.lastRaise.date)}`],
  ];

  return (
    <>
      <PageHeader title="Settings" subtitle="Company profile, connected accounts and who can see what." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Company profile" action={<Building2 size={16} className="text-muted" aria-hidden />}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {profile.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Bank accounts" action={<Landmark size={16} className="text-muted" aria-hidden />}>
          <ul className="-my-2 divide-y divide-line">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{a.name}</p>
                  <p className="text-xs text-muted">
                    {a.institution}, account ending {a.mask}
                  </p>
                </div>
                <span className="font-medium tabular-nums text-ink">{formatMoney(a.balanceCents)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Integrations" subtitle="Connections are placeholders in this prototype." action={<Plug size={16} className="text-muted" aria-hidden />}>
          <ul className="-my-2 divide-y divide-line">
            {integrations.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{i.name}</p>
                  <p className="text-xs text-muted">{i.purpose}</p>
                </div>
                {i.status === "connected" ? (
                  <Badge tone="good" icon={<CheckCircle2 size={12} />}>
                    Connected
                  </Badge>
                ) : (
                  <Button className="h-8" title="Not available in the prototype">
                    Connect
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Team & permissions" action={<Users size={16} className="text-muted" aria-hidden />}>
          <ul className="-my-2 divide-y divide-line">
            {team.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-ink" aria-hidden>
                    {m.name
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </div>
                  <div>
                    <p className="font-medium text-ink">{m.name}</p>
                    <p className="text-xs text-muted">{m.email}</p>
                  </div>
                </div>
                <Badge tone={m.role === "Owner" ? "accent" : "neutral"} icon={null}>
                  {m.role}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Owners and Finance can see payroll totals. Viewers see dashboards only.
          </p>
        </Card>
      </div>
    </>
  );
}
