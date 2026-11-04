/**
 * Scenario picker groups.
 *
 * Values are stable ids (stored in data and localStorage); English display text lives in
 * `language/en/enums.lang.ts`. Never render an enum value directly.
 */

/** Group a scenario belongs to in the Forecast picker. Custom (user-made) is always listed first. */
export enum ScenarioCategory {
  /** Built by the user. */
  Custom = "custom",
  /** Trend continuations and reference cases. */
  Baseline = "baseline",
  /** Adding or freezing headcount. */
  Hiring = "hiring",
  /** Cutting or slowing spend. */
  CostControl = "cost-control",
  /** Pricing, growth and new revenue. */
  Revenue = "revenue",
  /** Downside shocks. */
  Risks = "risks",
  /** Equity, debt and grants. */
  Fundraising = "fundraising",
  /** Combined strategic plays. */
  Strategy = "strategy",
}
