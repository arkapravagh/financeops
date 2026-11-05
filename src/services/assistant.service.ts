/**
 * FinanceOps AI — DEMO ENGINE (prototype only).
 *
 * Answers are computed locally from the same services/metrics the pages use, so numbers
 * always match the screens. The public surface is `streamReply()`, which yields ReplyEvents.
 * When the backend lands, replace the body of `streamReply` with an SSE/fetch reader against
 * `/api/assistant` (Claude on the server, with finance tools) — see .claude/skills/ai-assistant.
 */

import { addMonths, daysBetween, formatDayMonth, formatMonthLong, formatMonthYear, parseIso } from "../shared/utils/dates.util";
import {
  aiMonthlySummary,
  aiRevenueShare,
  averageDaysToPay,
  averageNetBurnCents,
  budgetUsed,
  budgetVarianceCents,
  completeMonths,
  compoundGrowth,
  daysOverdue,
  groupAiUsage,
  growthRate,
  idleSeatCostCents,
  invoiceStatus,
  netBurnCents,
  projectCash,
  projectedRunway,
  receivablesCents,
  runwayMonths,
  sumCents,
  zeroCashDate,
} from "../shared/utils/metrics.util";
import { formatCompact, formatMoney, formatPercent } from "../shared/utils/money.util";
import type { AssistantRequest, AssistantSource, ReplyEvent } from "../types/assistant.types";
import type { ExpenseCategory } from "../types/finance.types";
import { getAiMonths, getAiSeatCharges, getAiUsage } from "./ai-spend.service";
import { getBudgetHistory, getBudgets } from "./budgets.service";
import { DEFAULT_HIRE_COST_CENTS, getForecastBase, spreadHires } from "./forecast.service";
import { getTransactions } from "./transactions.service";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Payroll",
  "Software & cloud",
  "Rent",
  "Contractors",
  "Marketing",
  "Travel",
  "Office & misc",
  "Legal & accounting",
];
import { getAccounts, getMonthlyFlows, getUpcomingBills } from "./cash.service";
import { AS_OF, getCompany } from "./company.service";
import { getInvoices } from "./invoices.service";
import { getMrrHistory } from "./revenue.service";

type Answer = { text: string; sources: AssistantSource[]; followUps: string[] };

const SRC = {
  overview: { label: "Overview", to: "/" },
  invoices: { label: "Invoices", to: "/invoices" },
  budgets: { label: "Budgets", to: "/budgets" },
  forecast: { label: "Runway & forecast", to: "/forecast" },
  transactions: { label: "Transactions", to: "/transactions" },
  aiSpend: { label: "AI spend", to: "/ai-spend" },
} satisfies Record<string, AssistantSource>;

// ---------- shared facts ----------

function facts() {
  const flows = completeMonths(getMonthlyFlows(), AS_OF);
  const cash = sumCents(getAccounts().map((a) => a.balanceCents));
  const avgBurn = averageNetBurnCents(flows, AS_OF);
  const prevBurn = averageNetBurnCents(flows, addMonths(AS_OF, -3));
  const runway = runwayMonths(cash, avgBurn);
  return { flows, cash, avgBurn, prevBurn, runway, zero: zeroCashDate(AS_OF, runway) };
}

// ---------- intents ----------

function runwayAnswer(): Answer {
  const f = facts();
  const raiseBy = f.runway === null ? null : addMonths(AS_OF, f.runway - 9);
  const text =
    f.runway === null
      ? `You're **default alive** — revenue already covers spending, so there's no runway clock. Cash on hand is **${formatMoney(f.cash)}**.`
      : `You have about **${f.runway.toFixed(1)} months of runway**.

- **Cash in the bank:** ${formatMoney(f.cash)} across ${getAccounts().length} accounts
- **Average net burn (last 3 months):** ${formatMoney(f.avgBurn)}/month
- **Projected zero-cash date:** around **${formatMonthYear(f.zero as Date)}**

Rounds usually take 6–9 months to close, so I'd plan to **start fundraising by ${formatMonthYear(raiseBy as Date)}**. If revenue keeps growing at its recent pace, the forecast page shows a slightly longer runway.`;
  return {
    text,
    sources: [SRC.overview, SRC.forecast],
    followUps: ["What if we hire 3 engineers?", "How can we extend runway by 6 months?", "Why did burn go up?"],
  };
}

function burnAnswer(): Answer {
  const f = facts();
  const last = f.flows[f.flows.length - 1];
  const sixAgo = f.flows[f.flows.length - 7];
  const change = growthRate(f.avgBurn, f.prevBurn) ?? 0;
  const outGrowth = compoundGrowth(sixAgo.outCents, last.outCents, 6);
  const inGrowth = compoundGrowth(sixAgo.inCents, last.inCents, 6);
  const top = [...getBudgets()].sort((a, b) => b.actualCents - a.actualCents).slice(0, 3);
  const over = getBudgets().filter((b) => budgetUsed(b) > 1);
  return {
    text: `Net burn averaged **${formatMoney(f.avgBurn)}/month** over the last 3 months — ${
      change > 0 ? `up **${formatPercent(change, 1)}**` : `down **${formatPercent(-change, 1)}**`
    } on the 3 months before.

**What's driving it**
- Spending grew **${formatPercent(outGrowth, 1)}/month** over the last 6 months, while cash in grew **${formatPercent(inGrowth, 1)}/month** — revenue is growing faster, but from a smaller base.
- In ${formatMonthLong(last.month)}, the biggest costs were ${top.map((b) => `${b.category} (${formatCompact(b.actualCents)})`).join(", ")}.
${over.length ? `- ${over.map((b) => `**${b.category}** ran ${formatMoney(budgetVarianceCents(b))} over budget`).join("; ")}.` : "- Every category stayed within budget."}

Burn is roughly flat, which is healthy for a growing seed-stage company. The quickest lever is usually software & tools — worth an audit of unused seats.`,
    sources: [SRC.budgets, SRC.overview],
    followUps: ["Which categories are over budget?", "What's my runway?", "Summarize last month"],
  };
}

function invoicesAnswer(): Answer {
  const invoices = getInvoices();
  const overdue = invoices
    .filter((i) => invoiceStatus(i, AS_OF) === "overdue")
    .sort((a, b) => daysOverdue(b, AS_OF) - daysOverdue(a, AS_OF));
  const ar = receivablesCents(invoices);
  const dueSoon = invoices.filter((i) => {
    if (invoiceStatus(i, AS_OF) !== "sent") return false;
    const d = daysBetween(AS_OF, parseIso(i.dueDate));
    return d >= 0 && d <= 7;
  });
  if (overdue.length === 0) {
    return {
      text: `Nothing is overdue. You're owed **${formatMoney(ar)}** in total, all within terms.`,
      sources: [SRC.invoices],
      followUps: ["What bills are due this week?", "What's my runway?"],
    };
  }
  return {
    text: `You have **${overdue.length} overdue invoices** worth **${formatMoney(sumCents(overdue.map((i) => i.amountCents)))}** (out of ${formatMoney(ar)} owed in total). I'd chase them in this order:

${overdue.map((i, n) => `${n + 1}. **${i.customer}** — ${i.number}, ${formatMoney(i.amountCents)}, **${daysOverdue(i, AS_OF)} days late**`).join("\n")}

${
  overdue.filter((i) => i.customer === overdue[0].customer).length > 1
    ? `**${overdue[0].customer}** has more than one late invoice — worth a call rather than another email.\n\n`
    : ""
}${dueSoon.length ? `Also coming due in the next 7 days: ${dueSoon.map((i) => `${i.customer} (${formatMoney(i.amountCents)}, ${formatDayMonth(i.dueDate)})`).join(", ")}.` : ""}`,
    sources: [SRC.invoices],
    followUps: ["Draft a polite reminder email", "How long do customers take to pay?", "What bills are due this week?"],
  };
}

function reminderDraftAnswer(): Answer {
  const overdue = getInvoices()
    .filter((i) => invoiceStatus(i, AS_OF) === "overdue")
    .sort((a, b) => daysOverdue(b, AS_OF) - daysOverdue(a, AS_OF));
  const i = overdue[0];
  if (!i) return { text: "There are no overdue invoices to chase right now.", sources: [SRC.invoices], followUps: [] };
  const company = getCompany();
  return {
    text: `Here's a friendly first reminder for **${i.customer}**:

**Subject:** Quick reminder — ${i.number} (${formatMoney(i.amountCents, { cents: true })})

Hi there,

Hope all is well! A quick note that invoice **${i.number}** for **${formatMoney(i.amountCents, { cents: true })}** was due on ${formatDayMonth(i.dueDate)}. Could you let me know when we can expect payment, or if anything is holding it up on your side?

Happy to resend the invoice or answer any questions.

Thanks so much,
Alex — ${company.name}

Sending isn't available in the prototype yet, but you can copy this.`,
    sources: [SRC.invoices],
    followUps: ["Make it firmer", "Which invoices should I chase?"],
  };
}

function paymentTimeAnswer(): Answer {
  const invoices = getInvoices();
  const dtp = averageDaysToPay(invoices);
  const paid = invoices.filter((i) => i.status === "paid" && i.paidDate);
  return {
    text: `Customers take **${dtp ?? "—"} days on average** to pay, measured from invoice date to payment across ${paid.length} paid invoices:

${paid.map((i) => `- ${i.customer} — ${daysBetween(parseIso(i.issueDate), parseIso(i.paidDate as string))} days`).join("\n")}

Your standard terms are 30 days, so on-time payers are fine. The risk is the long tail — invoices already past due tend to slip further. Automatic reminders at +3 and +10 days usually cut late payments noticeably.`,
    sources: [SRC.invoices],
    followUps: ["Which invoices should I chase?", "Draft a polite reminder email"],
  };
}

function categoryBudgetAnswer(category: ExpenseCategory): Answer {
  const history = getBudgetHistory(category);
  const now = history[history.length - 1];
  const prev = history[history.length - 2];
  const used = budgetUsed(now);
  const variance = budgetVarianceCents(now);
  const overMonths = history.filter((h) => budgetUsed(h) > 1).length;
  const txns = getTransactions({ category, month: now.month })
    .filter((t) => t.amountCents < 0)
    .sort((a, b) => a.amountCents - b.amountCents)
    .slice(0, 3);
  const growth = prev ? growthRate(now.actualCents, prev.actualCents) : null;
  return {
    text: `**${category}** used **${formatPercent(used)}** of its ${formatMonthLong(now.month)} budget: ${formatMoney(now.actualCents)} against ${formatMoney(
      now.budgetCents,
    )}, so ${variance > 0 ? `**${formatMoney(variance)} over**` : `${formatMoney(-variance)} under`}.

**The trend**
${history.map((h) => `- ${formatMonthLong(h.month)}: ${formatMoney(h.actualCents)} of ${formatMoney(h.budgetCents)} (${formatPercent(budgetUsed(h))})`).join("\n")}

${
  txns.length
    ? `**Biggest items this month**\n${txns.map((t) => `- ${t.description} (${t.counterparty}): ${formatMoney(-t.amountCents)}`).join("\n")}\n\n`
    : ""
}${
  overMonths >= 2
    ? `It has been over budget in **${overMonths} of the last ${history.length} months**${
        growth !== null ? `, and spending ${growth >= 0 ? "grew" : "fell"} ${formatPercent(Math.abs(growth), 1)} last month` : ""
      }. That's a pattern, not a one-off: either the budget is too low for how the business now runs, or usage needs a cap. I'd raise the budget to about ${formatMoney(
        Math.round((now.actualCents * 1.05) / 10000) * 10000,
      )} and set a usage alert, then review seats and unused tools.`
    : "This looks like a one-off rather than a trend. Check the biggest items above before changing the budget."
}`,
    sources: [SRC.budgets, SRC.transactions],
    followUps: ["Which categories are over budget?", "How can we extend runway by 6 months?"],
  };
}

function budgetsAnswer(): Answer {
  const budgets = getBudgets();
  const over = budgets.filter((b) => budgetUsed(b) > 1).sort((a, b) => budgetUsed(b) - budgetUsed(a));
  const near = budgets.filter((b) => budgetUsed(b) >= 0.9 && budgetUsed(b) <= 1);
  const total = sumCents(budgets.map((b) => b.actualCents)) - sumCents(budgets.map((b) => b.budgetCents));
  return {
    text: `For ${formatMonthLong(budgets[0].month)}, total spend came in **${formatMoney(Math.abs(total))} ${total <= 0 ? "under" : "over"} budget**.

**Over budget**
${over.length ? over.map((b) => `- **${b.category}** — ${formatPercent(budgetUsed(b))} of budget (${formatMoney(budgetVarianceCents(b))} over)`).join("\n") : "- None"}

**Close to the limit (90–100%)**
${near.length ? near.map((b) => `- ${b.category} — ${formatPercent(budgetUsed(b))}`).join("\n") : "- None"}

Software & cloud is the one to watch: it tends to creep as usage-based tools scale. Consider raising its budget to match reality, or set a usage alert on cloud spend.`,
    sources: [SRC.budgets],
    followUps: ["Why did burn go up?", "How can we extend runway by 6 months?"],
  };
}

function aiSpendAnswer(): Answer {
  const summary = aiMonthlySummary(getAiUsage(), getAiSeatCharges());
  const months = getAiMonths();
  const month = months[months.length - 1];
  const now = summary[summary.length - 1];
  const prev = summary[summary.length - 2];
  const mom = prev ? (growthRate(now.totalCents, prev.totalCents) ?? 0) : 0;
  const mrr = getMrrHistory().find((m) => m.month === month);
  const share = aiRevenueShare(now.totalCents, mrr?.mrrCents ?? 0);
  const features = groupAiUsage(getAiUsage({ month }), (u) => u.feature).slice(0, 3);
  const seats = getAiSeatCharges({ month });
  const idle = sumCents(seats.map(idleSeatCostCents));
  const idleCount = sumCents(seats.map((x) => x.seats - x.activeSeats));
  return {
    text: `AI cost **${formatMoney(now.totalCents)}** in ${formatMonthLong(month)}, ${mom >= 0 ? "up" : "down"} **${formatPercent(Math.abs(mom), 1)}** on the month${share === null ? "" : ` and **${formatPercent(share, 1)}** of MRR`}.

- **Model APIs:** ${formatMoney(now.apiCents)}
- **GPU hosting:** ${formatMoney(now.computeCents)}
- **Team seats:** ${formatMoney(now.seatsCents)}

**Biggest features:** ${features.map((f) => `${f.key} (${formatMoney(f.costCents)})`).join(", ")}.

**Ways to cut it:**
- Remove the **${idleCount} unused seats** (${formatMoney(idle)} a month).
- Review GPU hosting for document parsing. It is the largest line, so compare it with a per-token API at current volume.
- Cache repeated prompts and send simple requests to a smaller model.

Savings from model changes are estimates, so test them on a sample before switching.`,
    sources: [SRC.aiSpend, SRC.budgets],
    followUps: ["Which categories are over budget?", "How can we extend runway by 6 months?"],
  };
}

function revenueAnswer(): Answer {
  const mrr = getMrrHistory();
  const now = mrr[mrr.length - 1];
  const prev = mrr[mrr.length - 2];
  const first = mrr[0];
  const mom = growthRate(now.mrrCents, prev.mrrCents) ?? 0;
  const cmgr = compoundGrowth(first.mrrCents, now.mrrCents, mrr.length - 1);
  return {
    text: `MRR is **${formatMoney(now.mrrCents)}** (ARR **${formatCompact(now.mrrCents * 12)}**), up **${formatPercent(mom, 1)}** month over month.

- **12-month trend:** ${formatCompact(first.mrrCents)} → ${formatCompact(now.mrrCents)}, a compound **${formatPercent(cmgr, 1)}/month**
- **Customers:** ${first.customers} → **${now.customers}**
- **Average revenue per customer:** ${formatMoney(Math.round(now.mrrCents / now.customers))}/month

Growth has accelerated over the last two months — a good story for your next investor update.`,
    sources: [SRC.overview],
    followUps: ["What's my runway?", "Summarize last month"],
  };
}

function hiringAnswer(q: string): Answer {
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
  const m = q.match(/(\d+|one|two|three|four|five|six)\s*(new\s*)?(engineers?|people|hires?|employees?|devs?|developers?|salespeople|reps?)/);
  const n = m ? (Number(m[1]) || words[m[1]] || 2) : 2;
  const base = getForecastBase();
  const hireCost = DEFAULT_HIRE_COST_CENTS;
  const r0 = projectedRunway(base.startCashCents, projectCash(base));
  const r1 = projectedRunway(base.startCashCents, projectCash({ ...base, hires: spreadHires(n, "New hire", hireCost) }));
  const fmt = (r: number | null) => (r === null ? "36+ months" : `${r.toFixed(1)} months`);
  const lost = r0 !== null && r1 !== null ? r0 - r1 : null;
  return {
    text: `Hiring **${n} ${n === 1 ? "person" : "people"}** over the next 6 months at ~${formatMoney(hireCost)}/month fully loaded each:

- **Projected runway today:** ${fmt(r0)}
- **With the new hires:** **${fmt(r1)}**${lost !== null ? ` (−${lost.toFixed(1)} months)` : ""}
- **Added monthly cost at full ramp:** ${formatMoney(n * hireCost)}
${r1 !== null ? `- **Zero-cash date moves to:** ${formatMonthYear(addMonths(AS_OF, r1))}` : ""}

${
  r1 !== null && r1 < 15
    ? "That takes you under 15 months — I'd only do this alongside a fundraise or if the hires directly accelerate revenue."
    : "That's affordable if the roles speed up revenue. Try different numbers on the forecast page."
}

_Projection assumes recent revenue and spend growth continue. It's an estimate, not financial advice._`,
    sources: [SRC.forecast],
    followUps: ["How can we extend runway by 6 months?", "What's my runway?"],
  };
}

function extendRunwayAnswer(): Answer {
  const f = facts();
  const budgets = getBudgets();
  const sw = budgets.find((b) => b.category === "Software & cloud");
  const mk = budgets.find((b) => b.category === "Marketing");
  const ct = budgets.find((b) => b.category === "Contractors");
  const target = f.runway === null ? null : f.cash / (f.runway + 6);
  const needed = target === null ? 0 : f.avgBurn - target;
  return {
    text: `To add **6 months** of runway at today's cash, net burn needs to drop by about **${formatMoney(Math.round(needed))}/month** (to ~${formatMoney(Math.round(target ?? 0))}).

Realistic levers, smallest pain first:
1. **Collect overdue invoices** — one-time boost of ${formatMoney(sumCents(getInvoices().filter((i) => invoiceStatus(i, AS_OF) === "overdue").map((i) => i.amountCents)))}.
2. **Tools & cloud audit** — trimming 15% of ${formatCompact(sw?.actualCents ?? 0)}/month saves ~${formatMoney(Math.round((sw?.actualCents ?? 0) * 0.15))}/month.
3. **Pause paid marketing tests** that aren't converting — up to ${formatCompact(mk?.actualCents ?? 0)}/month.
4. **Bring contractor work in-house** where possible — ${formatCompact(ct?.actualCents ?? 0)}/month today.
5. **Annual prepay discounts** from customers — pulls cash forward without cutting anything.

Cuts alone rarely add 6 months without touching payroll; the stronger move is usually **growing revenue faster** while holding spend flat. Try the **Lean mode** preset on the forecast page.`,
    sources: [SRC.forecast, SRC.budgets, SRC.invoices],
    followUps: ["Which invoices should I chase?", "Which categories are over budget?"],
  };
}

function cashAnswer(): Answer {
  const accounts = getAccounts();
  const f = facts();
  return {
    text: `You have **${formatMoney(f.cash)}** in the bank:

${accounts.map((a) => `- **${a.name}** (${a.institution} ··${a.mask}) — ${formatMoney(a.balanceCents)}`).join("\n")}

About ${formatPercent(accounts.find((a) => a.kind === "treasury")!.balanceCents / f.cash)} sits in T-bills earning interest, which is sensible for cash you won't need for 6+ months.`,
    sources: [SRC.overview],
    followUps: ["What's my runway?", "What bills are due this week?"],
  };
}

function billsAnswer(): Answer {
  const bills = getUpcomingBills().filter((b) => daysBetween(AS_OF, parseIso(b.dueDate)) <= 14);
  const manual = bills.filter((b) => !b.autopay);
  return {
    text: `**${formatMoney(sumCents(bills.map((b) => b.amountCents)))}** is due in the next 14 days:

${bills.map((b) => `- ${formatDayMonth(b.dueDate)} — **${b.vendor}**, ${formatMoney(b.amountCents)}${b.autopay ? " (autopay)" : " — **pay manually**"}`).join("\n")}

${manual.length ? `${manual.length} of these need a manual payment. Your operating account easily covers all of them.` : "All of these are on autopay."}`,
    sources: [SRC.overview],
    followUps: ["What's my cash balance?", "Which invoices should I chase?"],
  };
}

function summaryAnswer(): Answer {
  const f = facts();
  const last = f.flows[f.flows.length - 1];
  const mrr = getMrrHistory();
  const now = mrr[mrr.length - 1];
  const mom = growthRate(now.mrrCents, mrr[mrr.length - 2].mrrCents) ?? 0;
  const over = getBudgets().filter((b) => budgetUsed(b) > 1);
  const overdue = getInvoices().filter((i) => invoiceStatus(i, AS_OF) === "overdue");
  return {
    text: `### ${formatMonthLong(last.month)} at a glance

- **Cash in:** ${formatMoney(last.inCents)} · **Cash out:** ${formatMoney(last.outCents)} · **Net burn:** ${formatMoney(netBurnCents(last))}
- **MRR:** ${formatMoney(now.mrrCents)} (**+${formatPercent(mom, 1)}** MoM), ${now.customers} customers
- **Runway:** ${f.runway === null ? "default alive" : `${f.runway.toFixed(1)} months`} — cash ${formatCompact(f.cash)}
- **Budgets:** ${over.length ? `${over.map((b) => b.category).join(" and ")} over budget` : "all on track"}
- **Collections:** ${overdue.length} invoices overdue (${formatMoney(sumCents(overdue.map((i) => i.amountCents)))})

**Bottom line:** revenue momentum is strong and burn is flat. The two things to act on this week are chasing overdue invoices and reining in software spend.`,
    sources: [SRC.overview, SRC.budgets, SRC.invoices],
    followUps: ["Which invoices should I chase?", "Why did burn go up?", "Draft an investor update"],
  };
}

function investorUpdateAnswer(): Answer {
  const f = facts();
  const mrr = getMrrHistory();
  const now = mrr[mrr.length - 1];
  const first = mrr[0];
  const company = getCompany();
  return {
    text: `Here's a draft investor update you can edit:

**${company.name} — ${formatMonthLong(f.flows[f.flows.length - 1].month)} update**

**Highlights**
- MRR reached **${formatMoney(now.mrrCents)}** (ARR ${formatCompact(now.mrrCents * 12)}), up from ${formatCompact(first.mrrCents)} a year ago
- Customers grew to **${now.customers}** (from ${first.customers})
- Net burn steady at ~${formatCompact(f.avgBurn)}/month

**Financials**
- Cash: ${formatMoney(f.cash)} · Runway: ${f.runway?.toFixed(1)} months

**Asks**
- Intros to finance leads at mid-market logistics and healthcare companies

_Draft generated from your FinanceOps data — please review before sending._`,
    sources: [SRC.overview],
    followUps: ["Summarize last month", "What's my runway?"],
  };
}

function helpAnswer(page: string): Answer {
  return {
    text: `Hi! I'm your finance co-pilot for **${getCompany().name}**. I can answer questions using your live numbers, for example:

- **Runway & burn** — "How long will our cash last?"
- **Collections** — "Which invoices should I chase?"
- **Budgets** — "Where are we overspending?"
- **Scenarios** — "What if we hire 3 engineers?"
- **Summaries** — "Summarize last month" or "Draft an investor update"

_You're in demo mode: answers are generated offline from sample data._`,
    sources: [],
    followUps: pageSuggestions(page).slice(0, 3),
  };
}

// ---------- routing ----------

function route(q: string, page: string): Answer {
  const s = q.toLowerCase();
  const has = (re: RegExp) => re.test(s);

  if (has(/\b(this page|this screen|explain (this|the) (page|screen))\b/)) {
    if (page.startsWith("/budgets")) return budgetsAnswer();
    if (page.startsWith("/invoices")) return invoicesAnswer();
    if (page.startsWith("/forecast")) return runwayAnswer();
    if (page.startsWith("/transactions")) return burnAnswer();
    if (page.startsWith("/ai-spend")) return aiSpendAnswer();
    return summaryAnswer();
  }
  if (has(/investor update|update for investors|board update/)) return investorUpdateAnswer();
  if (has(/(tokens?|llm|gpu|ai (spend|cost|bill|budget|seats?|tools?)|model (costs?|spend|api))/) || (has(/ai/) && has(/spend|cost|bill|budget|going|cut/)))
    return aiSpendAnswer();
  if (has(/remind|email|draft|firmer/) && has(/remind|invoice|email|firmer|polite/)) return reminderDraftAnswer();
  if (has(/take to pay|days to pay|time to pay|pay us|payment terms|how fast .* pay/)) return paymentTimeAnswer();
  if (has(/hire|hiring|headcount|engineers?|recruit/)) return hiringAnswer(s);
  if (has(/extend|longer runway|cut costs?|save money|reduce (burn|spend)|lean/)) return extendRunwayAnswer();
  if (has(/runway|run out|zero.?cash|how long|last us|fundrais/)) return runwayAnswer();
  if (has(/invoice|overdue|chase|owe|receivable|collect|late pay|days to pay|pay us/)) return invoicesAnswer();
  const named = EXPENSE_CATEGORIES.find((c) => s.includes(c.toLowerCase()));
  if (named && has(/budget|over|spend|why|cost/)) return categoryBudgetAnswer(named);
  if (has(/budget|overspend|over budget|category|categories/)) return budgetsAnswer();
  if (has(/\bburn|spending|expenses?|costs?\b|going up/)) return burnAnswer();
  if (has(/mrr|arr|revenue|growth|customers?|sales/)) return revenueAnswer();
  if (has(/bill|due this week|upcoming|payables?|pay (this|next)/)) return billsAnswer();
  if (has(/cash|balance|bank|accounts?/)) return cashAnswer();
  if (has(/summar|overview|how are we doing|recap|last month|this month/)) return summaryAnswer();
  return helpAnswer(page);
}

/** Starter prompts for the AI panel, tailored to the page the user is on (falls back to general ones). */
export function pageSuggestions(page: string): string[] {
  if (page.startsWith("/budgets")) return ["Which categories are over budget?", "Why did burn go up?", "How can we extend runway by 6 months?", "Explain this page"];
  if (page.startsWith("/invoices")) return ["Which invoices should I chase?", "Draft a polite reminder email", "How long do customers take to pay?", "Explain this page"];
  if (page.startsWith("/forecast")) return ["What if we hire 3 engineers?", "How can we extend runway by 6 months?", "When should we start fundraising?", "Explain this page"];
  if (page.startsWith("/ai-spend")) return ["Where is our AI spend going?", "How can we cut AI costs?", "Which categories are over budget?", "Explain this page"];
  if (page.startsWith("/transactions")) return ["Why did burn go up?", "What bills are due this week?", "What's my cash balance?", "Summarize last month"];
  return ["What's my runway?", "Summarize last month", "Which invoices should I chase?", "What if we hire 3 engineers?"];
}

// ---------- streaming ----------

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const t = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(t);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });

/** Stream a reply as ReplyEvents. Throws AbortError when `signal` aborts. */
export async function* streamReply(req: AssistantRequest, signal?: AbortSignal): AsyncGenerator<ReplyEvent> {
  const question = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const answer = route(question, req.page);

  await wait(550, signal); // "thinking"

  // Emit word-ish chunks (keeps whitespace/newlines intact) at a natural, deterministic pace.
  const chunks = answer.text.match(/\S+\s*|\s+/g) ?? [];
  for (let i = 0; i < chunks.length; i += 2) {
    const delta = chunks.slice(i, i + 2).join("");
    yield { type: "text", delta };
    await wait(delta.includes("\n") ? 40 : 18, signal);
  }
  if (answer.sources.length) yield { type: "sources", sources: answer.sources };
  if (answer.followUps.length) yield { type: "followups", items: answer.followUps };
  yield { type: "done" };
}
