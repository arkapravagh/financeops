---
name: ai-assistant
description: Work on the FinanceOps AI chat panel — add demo intents, change the panel UI, or replace the offline demo engine with real Claude via a backend. Use for anything about "AI", "assistant", "chat", "Ask AI", or connecting an LLM.
---

# FinanceOps AI assistant

## Where things live
| Piece | File |
|---|---|
| Streaming protocol (`ReplyEvent`, `AssistantRequest`) | `src/types/assistant.types.ts` |
| Demo engine (`streamReply`, intents, `pageSuggestions`) | `src/services/assistant.service.ts` |
| State: conversations, streaming, stop/regenerate, history | `src/features/assistant/assistant.provider.tsx` |
| Panel UI / message / input / safe markdown | `src/features/assistant/components/*` |
| Dock (slide-in, auto-collapses sidebar < 1600px) | `assistant-dock.component.tsx`, `app/layout/app-shell.component.tsx` |

## Rules
- **Two contexts.** Outside the panel use `useAssistantControls()` (open/toggle/ask — stable). `useAssistant()`
  changes on every streamed frame; using it in a page re-renders the page per token.
- Every number in an answer must come from `src/services/*` + `src/shared/utils/metrics.util.ts` — never hard-code figures in replies.
- Replies render through `markdown.component.tsx` (React elements only). Never `dangerouslySetInnerHTML` model output.
- Keep the disclaimer ("AI can make mistakes… Not financial advice") and label projections as estimates.

## Add a demo intent
1. Write `fooAnswer(): Answer` in `services/assistant.service.ts` (text + `sources` + `followUps`).
2. Add a regex line in `route()` — **order matters**; put specific phrases before generic ones
   (e.g. "take to pay" before "how long").
3. Optionally add it to `pageSuggestions()` for the relevant route.

## Going live with Claude (future phase — confirm with the user first)
**Never call the Anthropic API from the browser** (it would expose the API key). Add a backend endpoint:

- `POST /api/assistant` → body = `AssistantRequest` → responds `text/event-stream` emitting the same `ReplyEvent`
  JSON objects (`text` deltas, then `sources`, `followups`, `done`).
- Server uses the official SDK `@anthropic-ai/sdk` with model **`claude-opus-5-5`**, streaming
  (`client.messages.stream(...)`), adaptive thinking is on by default for this model; set `output_config.effort`
  explicitly (`low` suits chat). Opt into refusal fallbacks (`betas: ["server-side-fallback-2026-07-01"]`, `fallbacks: "default"`)
  and check `stop_reason` (`refusal`, `max_tokens`) before trusting output.
- Give Claude **read-only finance tools** rather than dumping data into the prompt, e.g.
  `get_cash_summary`, `get_monthly_flows`, `list_invoices({status})`, `get_budgets({month})`,
  `run_forecast({newHires, revenueGrowth, …})`. Implement them with the same metric functions (move `src/shared/utils/metrics.util.ts`
  to a shared package). Scope every tool call to the signed-in user's company; respect roles (payroll stays aggregate).
- `tool_choice` must be `auto` on this model (forced tool use returns 400) — steer via the system prompt.
- System prompt: plain-language finance co-pilot for a startup founder; cite which page/data each figure came from;
  never present projections as fact; not tax/legal advice. Keep it stable for prompt caching; put the date and page context
  in the user turn, not the system prompt.
- Client change is one function: replace the body of `streamReply()` with an SSE reader over `fetch('/api/assistant')`
  that yields the parsed events and honours the `AbortSignal`. Nothing else in the UI changes.
- Before writing the server code, load the `claude-api` skill for current SDK usage — don't write it from memory.
