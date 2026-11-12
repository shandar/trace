---
description: Turn recent work into PRD entries and review each one (accept, reword, or skip)
allowed-tools: Bash(node:*), Read, AskUserQuestion
---

Review TRACE proposals for this project. The helper script owns every file write; never edit TRACE.md or anything in `.trace/` directly.

Helper: `node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" <command>`

## 1. Load state

Run `status`. If it exits with code 2, tell the user to run `/trace-prd-auto:init` and stop.

The JSON has:
- `pending`: proposals already queued (from background runs or earlier reviews), each with an `id`.
- `unprocessed`: tool events not yet synthesized, plus `marks` (session to line count).

## 2. Synthesize unprocessed events (only if `unprocessed.has_meaningful_changes` is true)

Read TRACE.md, then read the events through three lenses, one proposal at most per lens:

- **Decision Log**: what engineering or product decision was made?
- **Assumption Ledger**: what prior assumption was validated, contradicted, or newly surfaced?
- **Open Questions**: what unknown emerged that could affect the build?

Rules:
- Write each entry as one plain sentence that stands alone in the PRD and says *why*, not just *what*.
- Ground every entry in the events. Do not invent decisions. Skip a lens when nothing fits.
- Give each a confidence from 0 to 1; anything under 0.5 is dropped.
- Do not repeat something TRACE.md already says.

Queue them by piping a JSON array on stdin with a quoted heredoc, so no text is interpreted by the shell:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" queue <<'TRACE_EOF'
[{"section": "Decision Log", "edit": "...", "confidence": 0.8}]
TRACE_EOF
```

Then, whether or not you queued anything, run `mark` with every entry from `unprocessed.marks`, for example `mark 2b46...=42 8a9a...=17`, so the same events are not reviewed again.

## 3. Walk the queue

Run `status` again to get the full queue with ids. If it is empty, say there is nothing to review and stop.

Go through the proposals one at a time. For each, show the section, the entry text and its confidence, then ask with AskUserQuestion: **Accept**, **Reword**, **Skip**, or **Stop reviewing**.

- Accept: `accept <id>`
- Reword: take the user's wording, then
  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" accept <id> --stdin <<'TRACE_EOF'
  {"edit": "the reworded entry"}
  TRACE_EOF
  ```
- Skip: `skip <id>`
- Stop reviewing: leave the rest queued for next time.

## 4. Wrap up

Summarize in one line: how many accepted, skipped, and still queued.

$ARGUMENTS
