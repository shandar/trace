#!/usr/bin/env node
// Stop hook: background proposals. Runs only when the user has set their own
// API key in the plugin options. Without a key it does nothing and leaves the
// events unprocessed, so /trace-prd:review can synthesize them in-session.
//
// The key comes only from CLAUDE_PLUGIN_OPTION_ANTHROPIC_API_KEY (the plugin's
// sensitive userConfig, kept in the OS credential store). It is sent only to
// api.anthropic.com and is never logged, written to disk, or printed.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CONFIDENCE_THRESHOLD,
  appendPending,
  ensureTraceDir,
  hasMeaningful,
  isSafeId,
  isTraced,
  normalizeProposal,
  paths,
  projectDir,
  readJsonl,
  readStdin,
  readWatermark,
  writeWatermark,
} from "./lib.mjs";

const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MODEL = "claude-sonnet-5-5";
const REQUEST_TIMEOUT_MS = 45_000;

// Each lens reads the same events through one question.
const LENSES = [
  'What engineering or product decision was made this turn? If nothing was decided, return confidence 0. Return ONLY {"section": "Decision Log", "edit": "...", "confidence": 0.0-1.0}.',
  'What prior assumption was validated, contradicted, or newly surfaced this turn? If none, return confidence 0. Return ONLY {"section": "Assumption Ledger", "edit": "...", "confidence": 0.0-1.0}.',
  'What open question or unknown emerged this turn? If none, return confidence 0. Return ONLY {"section": "Open Questions", "edit": "...", "confidence": 0.0-1.0}.',
];

/** Models sometimes wrap JSON in prose or code fences; take the first object. */
function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callLens(apiKey, model, system, userContent) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        system,
        messages: [{ role: "user", content: userContent }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.find((b) => b.type === "text")?.text;
    return text ? extractJson(text) : null;
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = (process.env.CLAUDE_PLUGIN_OPTION_ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) return;
  const model = (process.env.CLAUDE_PLUGIN_OPTION_MODEL || "").trim() || DEFAULT_MODEL;

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

  const p = ensureTraceDir(root);
  const sessionFile = resolve(p.sessionsDir, `${event.session_id}.jsonl`);
  const all = readJsonl(sessionFile);
  const watermark = readWatermark(p.sessionsDir, event.session_id);
  const fresh = all.slice(watermark);
  if (fresh.length === 0) return;

  // Claim this slice before the API call so the same events are never sent twice.
  writeWatermark(p.sessionsDir, event.session_id, all.length);
  if (!hasMeaningful(fresh)) return;

  let traceMd;
  try {
    traceMd = readFileSync(paths(root).traceMd, "utf8");
  } catch {
    return;
  }

  const userContent =
    `<session_events>\n${fresh.map((e) => JSON.stringify(e)).join("\n")}\n</session_events>\n\n` +
    `<trace_md>\n${traceMd}\n</trace_md>`;

  const results = await Promise.all(LENSES.map((lens) => callLens(apiKey, model, lens, userContent)));

  const proposals = results
    .map((r) => normalizeProposal(r, "background"))
    .filter((r) => r && r.confidence >= CONFIDENCE_THRESHOLD);
  appendPending(p.pending, proposals);
}

main().catch(() => {});
