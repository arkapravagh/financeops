/** 404 page for unknown routes, with a link back to the Overview. */

import { Link } from "react-router-dom";

/** Shown for any path not in `app/app.routes.tsx`. */
export function NotFoundPage() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="text-sm text-muted">404</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink">This page doesn't exist yet</h1>
      <Link to="/" className="mt-4 text-sm font-medium text-accent hover:underline">
        Back to overview
      </Link>
    </div>
  );
}
