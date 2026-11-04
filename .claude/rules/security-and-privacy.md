# Security & privacy rules

This app will hold a company's most sensitive data (bank balances, payroll, customers). Build habits now.

- **Never commit secrets.** No API keys, tokens or bank credentials in source. Future config goes in `.env.local`
  (git-ignored) and only `VITE_`-prefixed *public* values may reach the browser.
- No real personal or financial data in mocks, screenshots, fixtures or commit messages.
- Payroll is per-person sensitive: UI shows payroll as an aggregate by default; individual salaries are a
  permission-gated view in the future phase — don't build an un-gated per-employee salary table.
- Don't log financial payloads to the console in committed code.
- Never render user-provided strings with `dangerouslySetInnerHTML`.
- Bank / accounting integrations (Plaid, Stripe, QuickBooks, Xero) must be OAuth/token based via the backend —
  the browser never sees provider secrets. In the prototype, integrations are **visual placeholders only**.
- Exports (CSV/PDF) are a future feature; when built, they must respect the same permissions as the screen.
