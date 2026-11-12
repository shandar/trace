// Shared helpers for TRACE hooks and the trace.mjs command helper.
// Zero dependencies on purpose: plugins have no build step, and the
// directory prefers readable source with nothing to install.

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

export const SECTIONS = ["Decision Log", "Assumption Ledger", "Open Questions"];
export const CONFIDENCE_THRESHOLD = 0.5;

// Only write-mutating tools signal a turn worth synthesizing; reads are noise.
export const MEANINGFUL_TOOLS = new Set(["Edit", "Write", "MultiEdit", "NotebookEdit"]);

// Per-string cap for logged payloads. Keeps logs small and limits how much
// file content ever reaches disk or the API.
const MAX_STRING = 2000;

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

/** Project root: prefer the session's project dir over the tool's cwd, which can drift into subfolders. */
export function projectDir(event) {
  const fromEnv = process.env.CLAUDE_PROJECT_DIR;
  if (fromEnv) return fromEnv;
  return typeof event?.cwd === "string" && event.cwd ? event.cwd : null;
}

export function paths(root) {
  const traceDir = resolve(root, ".trace");
  return {
    traceMd: resolve(root, "TRACE.md"),
    traceDir,
    sessionsDir: resolve(traceDir, "sessions"),
    pending: resolve(traceDir, "pending.jsonl"),
  };
}

/** TRACE is opt-in per project: nothing is logged unless TRACE.md exists. */
export function isTraced(root) {
  return Boolean(root) && existsSync(paths(root).traceMd);
}

/** Keep raw session logs out of git; TRACE.md and the review queue still travel with the repo. */
export function ensureTraceDir(root) {
  const p = paths(root);
  mkdirSync(p.sessionsDir, { recursive: true });
  const ignore = resolve(p.traceDir, ".gitignore");
  if (!existsSync(ignore)) {
    writeFileSync(ignore, "# Raw tool logs stay local. Written by TRACE.\nsessions/\n");
  }
  return p;
}

// ---------------------------------------------------------------------------
// Redaction
// ---------------------------------------------------------------------------

// Order matters: whole PEM blocks first, then known token shapes, then
// generic NAME=value assignments.
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  /sk-ant-[A-Za-z0-9_-]{8,}/g,
  /\bsk-[A-Za-z0-9_-]{20,}/g,
  /\bAIza[0-9A-Za-z_-]{20,}/g,
  /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

const BEARER = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{10,}/gi;

// NAME=value or "name": "value" where the name looks like a credential.
const ASSIGNMENT =
  /(["']?[A-Za-z0-9_.-]*(?:key|token|secret|password|passwd|pwd|credential|auth(?!or))[A-Za-z0-9_.-]*["']?\s*[:=]\s*)(["']?)([^\s"',;]{4,})\2/gi;

const CREDENTIAL_FIELD = /(api[_-]?key|token|secret|password|passwd|credential|authorization|private[_-]?key)/i;

export function redactString(s) {
  let out = s;
  for (const re of SECRET_PATTERNS) out = out.replace(re, "[REDACTED]");
  out = out.replace(BEARER, "$1 [REDACTED]");
  out = out.replace(ASSIGNMENT, (_m, name, q) => `${name}${q}[REDACTED]${q}`);
  return out;
}

/** Recursively redact and truncate every string in a payload. */
export function sanitize(value, depth = 0) {
  if (depth > 8) return "[TRUNCATED]";
  if (typeof value === "string") {
    const clean = redactString(value);
    return clean.length > MAX_STRING
      ? `${clean.slice(0, MAX_STRING)}… [truncated ${clean.length - MAX_STRING} chars]`
      : clean;
  }
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => sanitize(v, depth + 1));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      // Structured fields like { "apiKey": "..." } carry no NAME=value text for the string patterns to catch.
      out[k] = typeof v === "string" && CREDENTIAL_FIELD.test(k) && v.length >= 4 ? "[REDACTED]" : sanitize(v, depth + 1);
    }
    return out;
  }
  return value;
}

// ---------------------------------------------------------------------------
// IO helpers
// ---------------------------------------------------------------------------

export async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export function readJsonl(file) {
  if (!existsSync(file)) return [];
  const out = [];
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // skip malformed line
    }
  }
  return out;
}

export function writeJsonl(file, items) {
  writeFileSync(file, items.map((i) => JSON.stringify(i)).join("\n") + (items.length ? "\n" : ""));
}

// ---------------------------------------------------------------------------
// Sessions and watermarks
// ---------------------------------------------------------------------------

export function readWatermark(sessionsDir, sessionId) {
  const file = resolve(sessionsDir, `${sessionId}.watermark`);
  if (!existsSync(file)) return 0;
  const n = parseInt(readFileSync(file, "utf8").trim(), 10);
  return Number.isInteger(n) && n >= 0 ? n : 0;
}

export function writeWatermark(sessionsDir, sessionId, n) {
  writeFileSync(resolve(sessionsDir, `${sessionId}.watermark`), String(n));
}

export function listSessions(sessionsDir) {
  if (!existsSync(sessionsDir)) return [];
  return readdirSync(sessionsDir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.slice(0, -".jsonl".length));
}

/** Session ids are uuids from Claude Code; reject anything that could escape the folder. */
export function isSafeId(id) {
  return typeof id === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(id);
}

export function hasMeaningful(events) {
  return events.some((e) => typeof e?.tool_name === "string" && MEANINGFUL_TOOLS.has(e.tool_name));
}

// ---------------------------------------------------------------------------
// Proposals queue
// ---------------------------------------------------------------------------

export function newId() {
  return randomBytes(3).toString("hex");
}

/** Normalize a proposal; returns null when it is unusable. */
export function normalizeProposal(p, source) {
  if (!p || typeof p.section !== "string" || typeof p.edit !== "string") return null;
  const section = SECTIONS.find((s) => s.toLowerCase() === p.section.trim().toLowerCase());
  const edit = p.edit.trim().replace(/^[-*]\s+/, "");
  if (!section || !edit) return null;
  const confidence = typeof p.confidence === "number" ? p.confidence : 0;
  return {
    id: typeof p.id === "string" && p.id ? p.id : newId(),
    section,
    edit,
    confidence,
    source: p.source || source,
  };
}

export function appendPending(file, proposals) {
  for (const p of proposals) appendFileSync(file, JSON.stringify(p) + "\n");
}

// ---------------------------------------------------------------------------
// TRACE.md editing
// ---------------------------------------------------------------------------

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Append a bullet to the end of a "## Section" block, creating the section if missing. */
export function appendToSection(tracePath, section, edit) {
  let doc = readFileSync(tracePath, "utf8");
  if (!doc.endsWith("\n")) doc += "\n";
  const bullet = `- ${edit.replace(/\s*\n\s*/g, " ")}\n`;

  const heading = new RegExp(`^##\\s+${escapeRegExp(section)}\\b.*$`, "im").exec(doc);
  if (!heading) {
    writeFileSync(tracePath, `${doc}\n## ${section}\n\n${bullet}`, "utf8");
    return;
  }

  const headingLineEnd = doc.indexOf("\n", heading.index) + 1;
  const rest = doc.slice(headingLineEnd);
  const nextHeading = /^##\s+/m.exec(rest);
  const sectionEnd = nextHeading ? headingLineEnd + nextHeading.index : doc.length;

  const before = doc.slice(0, headingLineEnd);
  const body = doc.slice(headingLineEnd, sectionEnd).replace(/\s*$/, "");
  const after = doc.slice(sectionEnd);

  const newBody = body === "" ? `\n${bullet}` : `${body}\n${bullet}`;
  const separator = after ? "\n" : "";
  writeFileSync(tracePath, before + newBody + separator + after, "utf8");
}
