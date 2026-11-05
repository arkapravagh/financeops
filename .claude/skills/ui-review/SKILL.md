---
name: ui-review
description: Screenshot-driven visual review of Finopsis pages using headless Chrome (scripts/ui-snap.mjs) — light/dark, desktop/mobile, AI panel open/closed — then critique against the design-system skill. Use after any visual change, or when asked to "check how it looks", "review the design", or "take screenshots".
---

# UI review

1. Build and serve: `npm run build` then `npm run preview` (port 4173) — run preview in the background.
2. Snap the pages you touched:
   ```bash
   npm run snap -- --routes /,/budgets --theme both --width 1440,390 --ai closed,open
   ```
   Options: `--url` (default http://localhost:4173), `--routes` (comma list), `--theme light|dark|both`,
   `--width` (comma list), `--height` (default 1000), `--ai open|closed` (comma list), `--full` (full page),
   `--out` (default `.snaps/`). Needs Chrome/Edge; set `CHROME_PATH` if it isn't found.
3. **Read every PNG** and critique against `design-system` + `layout-patterns`:
   - Hierarchy: is there exactly one bold element? Does the eye land on the most important number first?
   - Generic tells: identical shadowed cards, tinted alert boxes, `A · B · C` strings, ALL-CAPS labels.
   - Layout: overflow, horizontal scroll, label collisions, cramped columns at 900px content width.
   - Both themes legible; status never colour-only; focus rings visible.
4. Fix, re-snap, compare. Report what you checked and what you could not (e.g. animation, real hover).
5. Snapshots are scratch output (`.snaps/` is git-ignored) — don't commit them.
