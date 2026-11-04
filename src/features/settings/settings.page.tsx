/**
 * Settings: company profile, bank accounts, integrations and team.
 *
 * Route: `/settings`. Sections: company profile, bank accounts, integrations (placeholders), team & permissions.
 * Pages compose components and read data only through `services/`; derived numbers come from `shared/utils/metrics.util.ts`.
 */

import { Building2, CheckCircle2, Landmark, Plug, Users } from "lucide-react";
import { IntegrationStatus } from "../../enums/integration-status.enum";
import { TeamRole } from "../../enums/team-role.enum";
import { commonLabels } from "../../language/en/common.lang";
import { integrationStatusLabels, teamRoleLabels } from "../../language/en/enums.lang";
import { settingsLabels as L } from "../../language/en/settings.lang";
import { getAccounts } from "../../services/cash.service";
import { getCompany, getIntegrations, getTeam } from "../../services/company.service";
import { Badge } from "../../shared/ui/badge.component";
import { Button } from "../../shared/ui/button.component";
import { Card } from "../../shared/ui/card.component";
import { PageHeader } from "../../shared/ui/page-header.component";
import { formatDate } from "../../shared/utils/dates.util";
import { formatCompact, formatMoney } from "../../shared/utils/money.util";

/** Settings page. Integrations are visual placeholders; no credentials in the browser (security rules). */
export function SettingsPage() {
  const company = getCompany();
  const accounts = getAccounts();
  const integrations = getIntegrations();
  const team = getTeam();

  const profile: [string, string][] = [
    [L.profile.company, company.name],
    [L.profile.stage, company.stage],
    [L.profile.headcount, L.profile.headcountValue(company.headcount)],
    [L.profile.currency, company.currency],
    [L.profile.fiscalYear, company.fiscalYearStart],
    [
      L.profile.lastRaise,
      L.profile.lastRaiseValue(formatCompact(company.lastRaise.amountCents), company.lastRaise.round, formatDate(company.lastRaise.date)),
    ],
  ];

  return (
    <>
      <PageHeader title={L.title} subtitle={L.subtitle} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={L.profile.title} action={<Building2 size={16} className="text-muted" aria-hidden />}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
            {profile.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-ink-2">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title={L.accounts.title} action={<Landmark size={16} className="text-muted" aria-hidden />}>
          <ul className="-my-2 divide-y divide-line">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-ink">{a.name}</p>
                  <p className="text-xs text-muted">{L.accounts.detail(a.institution, a.mask)}</p>
                </div>
                <span className="font-medium tabular-nums text-ink">{formatMoney(a.balanceCents)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title={L.integrations.title} subtitle={L.integrations.subtitle} action={<Plug size={16} className="text-muted" aria-hidden />}>
          <ul className="-my-2 divide-y divide-line">
            {integrations.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{i.name}</p>
                  <p className="text-xs text-muted">{i.purpose}</p>
                </div>
                {i.status === IntegrationStatus.Connected ? (
                  <Badge tone="good" icon={<CheckCircle2 size={12} />}>
                    {integrationStatusLabels[i.status]}
                  </Badge>
                ) : (
                  <Button className="h-8" title={commonLabels.notAvailableTitle}>
                    {L.integrations.connect}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card title={L.team.title} action={<Users size={16} className="text-muted" aria-hidden />}>
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
                <Badge tone={m.role === TeamRole.Owner ? "accent" : "neutral"} icon={null}>
                  {teamRoleLabels[m.role]}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">{L.team.note}</p>
        </Card>
      </div>
    </>
  );
}
