---
name: connect-api
description: Plan and execute the move from mock data to a real backend/API (bank feeds, Stripe, accounting). Use when the user asks to add a backend, database, auth, or real integrations.
---

# Connect a real API (future phase)

Don't start this without the user confirming the backend choice. Propose, then build.

## Recommended target architecture
- **Backend**: Node + TypeScript (Fastify or NestJS) or a BaaS (Supabase) — Postgres for ledger data.
- **Money in DB**: `BIGINT` cents + `currency CHAR(3)`; never `FLOAT`.
- **Auth**: hosted auth (Clerk / Auth0 / Supabase Auth) with org + role (owner, finance, viewer).
- **Integrations** (server-side only): Plaid (bank feeds), Stripe (revenue/MRR), QuickBooks/Xero (accounting sync).
- **Client data**: TanStack Query for fetching/caching.

## Migration steps
1. Add `src/services/http.service.ts` (base URL from `import.meta.env.VITE_API_URL`, JSON + error handling).
2. Convert each service from sync mock return to `async` fetch, **keeping the same return types**.
3. Wrap pages' data access in TanStack Query hooks (`useTransactions(filter)`), adding loading/empty/error states
   with the existing `Card` component.
4. Move `AS_OF` usage to real "today"; keep metric functions pure (they still take `asOf`).
5. Keep the mock files as fixtures for tests / Storybook.
6. Add `.env.example` with the needed `VITE_` vars; never commit `.env.local`.
7. Run `verify`.
