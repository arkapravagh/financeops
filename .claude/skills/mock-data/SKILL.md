---
name: mock-data
description: Add or extend mock datasets and the matching service functions for the static prototype. Use when a page needs data that doesn't exist yet (vendors, payroll, subscriptions, accounts...).
---

# Add mock data + service

1. **Type** — add/extend the type in `src/types/finance.types.ts` (with a JSDoc comment). Money fields end in
   `Cents` (integers), dates are ISO strings, ids are prefixed strings (`ven_001`), enums are string unions.
2. **Data** — create `src/data/<entity>.data.ts` (kebab-case, header comment; see `.claude/rules/structure.md`):
   ```ts
   /**
    * Mock data: vendors the company pays every month.
    *
    * Static and deterministic, anchored to `AS_OF`. Read only through `services/vendors.service.ts`.
    */

   import type { Vendor } from "../types/finance.types";

   /** Recurring vendors with their monthly cost. */
   export const vendors = [
     { id: "ven_001", name: "Nimbus Cloud", category: "Software", monthlyCents: 412_00 },
   ] satisfies Vendor[];
   ```
   - Deterministic: no `Math.random()`, no `new Date()`. Anchor dates relative to `AS_OF` (2026-11-02) by hand.
   - Fictional names only. Realistic magnitudes for a ~12-person seed SaaS startup
     (monthly payroll ≈ $140K, cloud ≈ $9K, rent ≈ $8K, MRR ≈ $60–70K).
   - Keep totals consistent with existing data (e.g. vendor spend should roughly match categorised transactions).
3. **Service** — add to `src/services/<entity>.service.ts` (or the closest existing service):
   ```ts
   /** Vendors, optionally filtered by category, most expensive first. */
   export function getVendors(filter: { category?: string } = {}): Vendor[] { ... }
   ```
   Filter/sort here; never format. Re-export nothing from `src/data` directly to features.
4. Consume it from the page via the service, then run `npm run build`.
