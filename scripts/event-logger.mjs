#!/usr/bin/env node
// PostToolUse hook: append a trimmed, redacted copy of each tool event to
// .trace/sessions/<session_id>.jsonl. Only runs in projects that have a
// TRACE.md (created by /trace-prd:init). Never blocks the session: every
// failure exits quietly with code 0.

import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureTraceDir, isSafeId, isTraced, projectDir, readStdin, sanitize } from "./lib.mjs";

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) return;

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return;
  }

  const root = projectDir(event);
  if (!isTraced(root)) return;
  if (!isSafeId(event.session_id)) return;

  // Keep only what synthesis needs. Drops transcript paths, cwd and permission mode.
  const record = sanitize({
    ts: new Date().toISOString(),
    tool_name: event.tool_name,
    tool_input: event.tool_input,
    tool_response: event.tool_response,
  });

  const { sessionsDir } = ensureTraceDir(root);
  appendFileSync(resolve(sessionsDir, `${event.session_id}.jsonl`), JSON.stringify(record) + "\n");
}

main().catch(() => {});
