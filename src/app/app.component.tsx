/**
 * Root component: app-wide providers wrapped around the route table.
 *
 * The router itself lives in `main.tsx` so tests or stories can render {@link App} inside a memory router.
 */

import { AssistantProvider } from "../features/assistant/assistant.provider";
import { AppRoutes } from "./app.routes";

/** The Finopsis app. Provides AI assistant state to every page and the shell. */
export function App() {
  return (
    <AssistantProvider>
      <AppRoutes />
    </AssistantProvider>
  );
}
