---
name: new-component
description: Create a reusable UI component in src/shared/ui following FinanceOps conventions (tokens, a11y, both themes). Use when a UI pattern is needed in more than one place or the user asks for a new widget.
---

# Add a reusable component

1. **Check first**: list `src/shared/ui/` — extend an existing component (new prop/variant) before creating one.
   Only used by one feature? Put it in `src/features/<feature>/components/` instead.
2. **File**: `src/shared/ui/<kebab-name>.component.tsx` (e.g. `StatTile` → `stat-tile.component.tsx`), named export,
   exported `type <Name>Props`. Start with a header comment; give the component, its props type and any other
   export a JSDoc comment (`.claude/rules/structure.md`).
3. **Styling**: follow the `design-system` skill. Tailwind utilities with design tokens only (`bg-surface`, `bg-surface-2`, `text-ink`, `text-ink-2`,
   `text-muted`, `border-line`, `bg-accent`, `text-good|warning|serious|critical`). No hex values.
   Look at `src/styles/index.css` for the full token list. Allow a `className` prop for layout overrides.
4. **Variants** via a small `Record<Variant, string>` map, not nested ternaries.
5. **A11y**: semantic element, `aria-label` on icon-only controls, `focus-visible:ring-2 ring-accent` on interactive parts,
   status shown with icon/text + color, never color only.
6. **Money/percent props** take raw numbers (cents, ratios) and format internally via `src/shared/utils/money.util.ts`,
   so callers can't pass pre-formatted strings inconsistently.
7. Use it in at least one place, then run the `verify` skill (check light **and** dark theme).
