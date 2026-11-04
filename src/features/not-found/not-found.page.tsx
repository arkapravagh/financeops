/** 404 page for unknown routes, with a link back to the Overview. */

import { Link } from "react-router-dom";
import { notFoundLabels as L } from "../../language/en/not-found.lang";

/** Shown for any path not in `app/app.routes.tsx`. */
export function NotFoundPage() {
  return (
    <div className="grid place-items-center py-24 text-center">
      <p className="text-sm text-muted">{L.code}</p>
      <h1 className="mt-1 text-2xl font-semibold text-ink">{L.title}</h1>
      <Link to="/" className="mt-4 text-sm font-medium text-accent hover:underline">
        {L.backHome}
      </Link>
    </div>
  );
}
