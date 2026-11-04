---
name: react-review
description: Validate React + TypeScript code quality in FinanceOps using the react-quality-reviewer agent. Runs the structure checker (naming, docs, layering, enums, language files) and the type-check, then reviews hooks, effects, state, keys, memoization, accessibility, performance and project rules, and returns a prioritised report. Use after writing or refactoring components, pages or hooks, before committing or opening a PR, or when asked to "review the code", "check code quality" or "validate the React code".
argument-hint: "[path ... | changed]  (default: all of src/)"
context: fork
agent: react-quality-reviewer
allowed-tools: Read, Grep, Glob, Bash
---

# React code-quality review

Review scope: **$ARGUMENTS**
(No argument: all of `src/`. `changed`: files changed against `main`, plus uncommitted changes. Otherwise the given paths.)

You are running as the `react-quality-reviewer` agent. **Do not modify any files.**

1. Work from the project root. Resolve the scope to a list of files under `src/`.
2. Run the automated checks and keep their output for the report:
   ```bash
   node .claude/skills/react-review/scripts/check-structure.mjs <paths or nothing>
   npx tsc --noEmit
   ```
   The checker exits 1 on errors (naming, location, docs, layering) and reports warnings for raw enum strings
   and hard-coded English. See the header of `scripts/check-structure.mjs` for exactly what it checks.
3. Read every file in scope and review it against your agent checklist (hooks & effects, state & rendering,
   type safety, project rules, accessibility, performance). For large scopes, start with pages, providers and hooks,
   then components that have state or effects; skim pure presentational components.
4. Verify each finding against the code before reporting it.
5. Return the report in the format from your agent instructions: verdict, automated results, then
   Must fix / Should fix / Nits / Looks good, each finding with `file:line`, why it matters and the fix.

The person reading the report decides what to change. If they ask for fixes afterwards, that happens in the main
conversation, followed by the `verify` skill.
