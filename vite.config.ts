/**
 * Vite build config: React, Tailwind and the production chunking strategy.
 *
 * Pages are split per route by the lazy imports in `src/app/lazy-pages.routes.ts`. Here, stable third-party code is
 * pulled into its own vendor chunks so a change to app code doesn't invalidate the (larger, rarely changing) library cache.
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Matches a module path segment on any OS (`/` or `\`). */
const dir = (name: string) => new RegExp(String.raw`[\\/]` + name + String.raw`[\\/]`);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React runtime + router: needed on every page, changes only on upgrades.
            { name: "react", test: dir("node_modules[\\\\/](?:react|react-dom|scheduler|react-router|react-router-dom|cookie|set-cookie-parser)"), priority: 20 },
            // Icons are spread across every page; one shared chunk instead of copies in each page chunk.
            { name: "icons", test: dir("node_modules[\\\\/]lucide-react"), priority: 10 },
            // Shared UI, charts and table used by several pages: one cached chunk instead of a dozen sub-1 kB requests.
            { name: "shared", test: dir("src[\\\\/](?:shared|hooks)"), priority: 5 },
          ],
        },
      },
    },
  },
});
