---
paths:
  - "src/data/**"
  - "src/services/**"
  - "src/types/**"
---

# Data & mock rules

## Shape
- Domain types live in `src/types/finance.types.ts`. Mock files (`*.data.ts`) must satisfy them (`satisfies Transaction[]`).
- Mirror what a real API would return: ids are strings (`txn_001`), dates ISO, money in cents, enums as string unions.
- Mock data must be **deterministic** — no `Math.random()`, no `new Date()`; anchor everything to `AS_OF`.
- Keep mock data realistic for a ~12-person seed-stage SaaS startup: payroll is the biggest cost,
  then cloud/software, rent, contractors. Revenue from Stripe subscriptions + a few invoiced customers.

## Service layer (`src/services/`)
- Features (pages and components) get data **only** from services, never by importing `src/data/*`.
- Service functions are named for intent (`getTransactions`, `getCashHistory`, `getOpenInvoices`), return typed data,
  and may filter/sort — but never format for display.
- Keep signatures API-ready: accept a filter object (`{ from?, to?, category? }`) rather than many positional args.
- When the backend arrives, only `src/services/*` changes (see `connect-api` skill).

## Don'ts
- Don't put real company names, real people, real bank/account numbers in mocks. Use clearly fictional names.
- Don't compute metrics inside mock files — mocks are raw facts; metrics are `shared/utils/metrics.util.ts`.
