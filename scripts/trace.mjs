#!/usr/bin/env node
// Deterministic helper behind /trace-prd:init and /trace-prd:review.
// Claude handles the conversation; this script owns every file write so
// TRACE.md edits are exact and repeatable.
//
//   node trace.mjs init [--force]      scaffold TRACE.md and .trace/
//   node trace.mjs status              JSON: queued proposals + unprocessed events
//   node trace.mjs queue  < proposals  add proposals (JSON array on stdin)
//   node trace.mjs mark <sid>=<n> ...  mark events up to line n as processed
//   node trace.mjs accept <id> [--stdin]  write proposal to TRACE.md (stdin: {"edit": "..."} to reword)
//   node trace.mjs skip <id>           drop proposal from the queue

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  CONFIDENCE_THRESHOLD,
  SECTIONS,
  appendPending,
  appendToSection,
  ensureTraceDir,
  hasMeaningful,
  isSafeId,
  listSessions,
  normalizeProposal,
  paths,
  readJsonl,
  readStdin,
  readWatermark,
  writeJsonl,
  writeWatermark,
} from "./lib.mjs";

// Upper bound on event text handed back to Claude in one review.
const MAX_EVENT_CHARS = 60_000;

const TEMPLATE = `# TRACE: Living PRD

## Intent

<!-- What are you building and why? -->

## Users

<!-- Who is this for, and what job are they hiring it to do? -->

## In scope

<!-- What must ship? -->

## Out of scope

<!-- What are you explicitly not doing? -->

## Open Questions

<!-- Unresolved decisions that could affect the build. -->

## Decision Log

<!-- Accepted decisions, appended by /trace-prd:review. -->

## Assumption Ledger

<!-- Validated, contradicted, or new assumptions, appended by /trace-prd:review. -->
`;

const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const p = paths(root);

function fail(msg, code = 1) {
  process.stderr.write(`trace-prd: ${msg}\n`);
  process.exit(code);
}

function requireTraceMd() {
  if (!existsSync(p.traceMd)) fail("no TRACE.md in this project. Run /trace-prd:init first.", 2);
}

/** Queue entries written by older versions have no id; give them one so they can be addressed. */
function loadPending() {
  const items = readJsonl(p.pending);
  const normalized = items.map((i) => normalizeProposal(i, i.source || "background")).filter(Boolean);
  if (normalized.some((n, idx) => n.id !== items[idx]?.id) || normalized.length !== items.length) {
    writeJsonl(p.pending, normalized);
  }
  return normalized;
}

function cmdInit(args) {
  const force = args.includes("--force");
  if (existsSync(p.traceMd) && !force) fail(`TRACE.md already exists at ${p.traceMd}`, 3);
  writeFileSync(p.traceMd, TEMPLATE);
  ensureTraceDir(root);
  console.log(`trace-prd: wrote ${p.traceMd}`);
}

function cmdStatus() {
  requireTraceMd();
  ensureTraceDir(root);

  const marks = {};
  const chunks = [];
  let meaningful = false;
  for (const sid of listSessions(p.sessionsDir)) {
    if (!isSafeId(sid)) continue;
    const all = readJsonl(resolve(p.sessionsDir, `${sid}.jsonl`));
    const from = readWatermark(p.sessionsDir, sid);
    if (all.length <= from) continue;
    const fresh = all.slice(from);
    marks[sid] = all.length;
    if (hasMeaningful(fresh)) meaningful = true;
    for (const e of fresh) chunks.push(JSON.stringify(e));
  }

  // Keep the most recent events when there is more than one review's worth.
  let total = 0;
  let kept = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    total += chunks[i].length + 1;
    if (total > MAX_EVENT_CHARS) break;
    kept.unshift(chunks[i]);
  }

  console.log(
    JSON.stringify(
      {
        sections: SECTIONS,
        pending: loadPending(),
        unprocessed: {
          has_meaningful_changes: meaningful,
          event_count: chunks.length,
          omitted_older_events: chunks.length - kept.length,
          marks,
          events: kept.map((c) => JSON.parse(c)),
        },
      },
      null,
      1,
    ),
  );
}

async function cmdQueue() {
  requireTraceMd();
  ensureTraceDir(root);
  let input;
  try {
    input = JSON.parse(await readStdin());
  } catch {
    fail("queue expects a JSON array of {section, edit, confidence} on stdin");
  }
  const list = (Array.isArray(input) ? input : [input])
    .map((x) => normalizeProposal({ ...x, id: undefined }, "review"))
    .filter((x) => x && x.confidence >= CONFIDENCE_THRESHOLD);
  appendPending(p.pending, list);
  console.log(JSON.stringify(list.map(({ id, section }) => ({ id, section }))));
}

function cmdMark(args) {
  requireTraceMd();
  for (const arg of args) {
    const [sid, n] = arg.split("=");
    const count = Number(n);
    if (!isSafeId(sid) || !Number.isInteger(count) || count < 0) fail(`bad mark "${arg}", expected <session>=<n>`);
    if (count > readWatermark(p.sessionsDir, sid)) writeWatermark(p.sessionsDir, sid, count);
  }
  console.log(`trace-prd: marked ${args.length} session(s) as processed`);
}

async function cmdAccept(args) {
  requireTraceMd();
  const id = args[0];
  const pending = loadPending();
  const item = pending.find((x) => x.id === id);
  if (!item) fail(`no queued proposal with id "${id}"`);

  let edit = item.edit;
  if (args.includes("--stdin")) {
    try {
      const body = JSON.parse(await readStdin());
      if (typeof body.edit === "string" && body.edit.trim()) edit = body.edit.trim().replace(/^[-*]\s+/, "");
    } catch {
      fail('--stdin expects {"edit": "..."}');
    }
  }

  appendToSection(p.traceMd, item.section, edit);
  writeJsonl(p.pending, pending.filter((x) => x.id !== id));
  console.log(`trace-prd: added to ${item.section}`);
}

function cmdSkip(args) {
  requireTraceMd();
  const id = args[0];
  const pending = loadPending();
  if (!pending.some((x) => x.id === id)) fail(`no queued proposal with id "${id}"`);
  writeJsonl(p.pending, pending.filter((x) => x.id !== id));
  console.log("trace-prd: skipped");
}

const [cmd, ...args] = process.argv.slice(2);
const commands = {
  init: () => cmdInit(args),
  status: () => cmdStatus(),
  queue: () => cmdQueue(),
  mark: () => cmdMark(args),
  accept: () => cmdAccept(args),
  skip: () => cmdSkip(args),
};

if (!commands[cmd]) fail(`unknown command "${cmd ?? ""}". Use one of: ${Object.keys(commands).join(", ")}`);
Promise.resolve(commands[cmd]()).catch((err) => fail(err?.message || String(err)));
