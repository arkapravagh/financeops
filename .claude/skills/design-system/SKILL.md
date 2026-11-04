---
name: design-system
description: The FinanceOps visual language — tokens, type scale, radius/elevation hierarchy, component recipes and copy rules. Use before styling ANY UI (new page, component, restyle, "make it look better") so the app stays one coherent design. Pairs with frontend-design (direction) and layout-patterns (page structure).
---

# FinanceOps design system

**Brief:** a calm, exact finance co-pilot for seed-stage founders. They open it to answer one question —
*how long does our money last?* — so the product's signature is the **runway**, and everything else is quiet.

## Principles
1. **One bold element per page.** On Overview it's the runway strip. Elsewhere it's the page's main chart.
   Everything around it is disciplined: no decorative gradients, no tinted boxes for the sake of colour.
2. **Structure is information.** Borders separate regions; dividers separate list items; elevation (shadow) is
   reserved for things that *float* (popovers, tooltips, drawers). Panels never get a drop shadow.
3. **Numbers are the content.** Big figures in proportional digits, columns in `tabular-nums`, units in words.
4. **Calm colour.** Indigo is the only accent. Status colours appear only as small marks (icon, dot, bar) with text.

## Tokens (`src/index.css`)
| Role | Light | Dark | Token / class |
|---|---|---|---|
| Page (paper) | `#f4f5f8` | `#0d0e13` | `bg-page` |
| Surface (panels) | `#ffffff` | `#15171f` | `bg-surface` |
| Raised / subtle fill | `#f0f1f5` | `#1c1f29` | `bg-surface-2` |
| Ink (primary text) | `#171a26` | `#eceef4` | `text-ink` |
| Ink 2 (secondary) | `#4c5162` | `#b4b8c6` | `text-ink-2` |
| Muted (meta, axes) | `#6b7183` | `#828799` | `text-muted` |
| Line (borders) | `#e3e5ec` | `#262935` | `border-line` |
| Accent (indigo) | `#5b4fe0` | `#8b80f4` | `bg-accent`, `text-accent` |
| Accent ink (on accent fill) | `#ffffff` | `#120f2e` | `text-accent-ink` |
Status: `good / warning / serious / critical` — marks only. Charts: `--series-1..3` (see `.claude/rules/charts.md`).
Never hard-code hex in components.

## Type scale (Geist)
| Use | Size / weight | Class |
|---|---|---|
| Hero figure (one per page) | 56 / 600, tracking −0.035em | `text-[56px] font-semibold tracking-[-0.035em]` |
| Page title | 28 / 600, tracking −0.025em | `text-[28px] font-semibold` |
| Section / panel title | 15 / 600 | `text-[15px] font-semibold` |
| KPI value | 26 / 600 | `text-[26px] font-semibold` |
| Body | 14 / 400 | `text-sm` |
| Meta, labels, axes | 12–13 / 400–500 | `text-xs` / `text-[13px]` |
Sentence case everywhere. **No ALL-CAPS labels, no eyebrow labels above headings.**

## Shape & elevation
| Element | Radius | Elevation |
|---|---|---|
| Panel (`Panel` / `Card`) | 14px `rounded-[14px]` | border only |
| Controls (button, input, select, tab) | 8px `rounded-lg` | none |
| Chips, badges, pills, avatars | full | none |
| Popover, tooltip, drawer | 12px | `shadow-[var(--shadow-float)]` |

## Spacing
4-pt grid. Panel padding `p-5` (20px) or `p-6` for hero panels. Gap between panels `gap-5`. Page gutters
`px-4 sm:px-6 lg:px-8`. Inside lists use dividers (`divide-y divide-line`), not gaps between boxes.

## Component recipes
- **Panel:** `rounded-[14px] border border-line bg-surface`. Title row: title (15/600) + optional one-line
  description (13, ink-2) + actions right. No shadow.
- **KPI row:** one panel split by vertical dividers (`divide-x divide-line`), not four separate cards.
  Each cell: label (13 muted) → value (26/600) → delta + context (12). Optional sparkline in `--series-1`.
- **Alert list:** rows with a 16px status icon, title (14/500), one sentence (13 ink-2), optional action link.
  Rows separated by dividers. No tinted backgrounds.
- **Buttons:** primary = `bg-accent text-accent-ink`; secondary = bordered surface; ghost = text only.
  Labels say exactly what happens ("Export CSV", "New invoice"). No trailing arrows on button text.
- **Badges:** used for state only (Paid, Overdue, Pending). Category labels are plain text, not pills.

## Copy rules
- Plain verbs, sentence case, no filler. Name things by what the user sees ("Cash in the bank").
- **No middle-dot strings** (`A · B · C`). Write a sentence or use separate elements.
- Projections are labelled "Projected" / "Estimate". Empty states tell the user what to do next.

## Before you ship
Run the `ui-review` skill (screenshots in light + dark, 1440 + 390, AI panel open + closed).
