#!/usr/bin/env node
// TODO: should we cap proposals per turn at 2 to reduce review fatigue?
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LENS_A =
  'What engineering or product decision was made this turn? If nothing decided, return confidence 0. Return ONLY {"section": "Decision Log", "edit": "...", "confidence": 0.0-1.0}.';

const LENS_B =
  'What prior assumption was validated, contradicted, or newly surfaced this turn? If none, return confidence 0. Return ONLY {"section": "Assumption Ledger", "edit": "...", "confidence": 0.0-1.0}.';

const LENS_C =
  'What open question or unknown emerged this turn? If none, return confidence 0. Return ONLY {"section": "Open Questions", "edit": "...", "confidence": 0.0-1.0}.';

// Only write-mutating tools signal a meaningful turn; Bash/Read/Grep are read-only noise
const MEANINGFUL_TOOLS = new Set([
  "Edit",
  "Write",
  "MultiEdit",
  "NotebookEdit",
]);

const MODEL = "claude-opus-4-7";
const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const CONFIDENCE_THRESHOLD = 0.5;

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
}

interface Proposal {
  section: string;
  edit: string;
  confidence: number;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function callLens(
  apiKey: string,
  systemPrompt: string,
  userContent: string,
): Promise<Proposal | null> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AnthropicResponse;
    const text = data.content?.[0]?.text?.trim();
    if (!text) return null;
    const parsed = JSON.parse(text) as Partial<Proposal>;
    if (
      typeof parsed.section === "string" &&
      typeof parsed.edit === "string" &&
      typeof parsed.confidence === "number"
    ) {
      return { section: parsed.section, edit: parsed.edit, confidence: parsed.confidence };
    }
    return null;
  } catch {
    return null;
  }
}

async function main(): Promise<void> {
  const raw = await readStdin();
  if (!raw.trim()) return;

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return;
  }

  const cwd = event.cwd;
  const sessionId = event.session_id;
  if (typeof cwd !== "string" || !cwd) return;
  if (typeof sessionId !== "string" || !sessionId) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  const sessionFile = resolve(cwd, `.trace/sessions/${sessionId}.jsonl`);
  if (!existsSync(sessionFile)) return;

  let allLines: string[];
  try {
    allLines = readFileSync(sessionFile, "utf8")
      .split("\n")
      .filter((l) => l.trim());
  } catch {
    return;
  }

  const watermarkFile = resolve(
    cwd,
    `.trace/sessions/${sessionId}.watermark`,
  );
  let watermark = 0;
  if (existsSync(watermarkFile)) {
    try {
      const w = parseInt(readFileSync(watermarkFile, "utf8").trim(), 10);
      if (!isNaN(w) && w >= 0) watermark = w;
    } catch {
      // stay at 0
    }
  }

  const newLines = allLines.slice(watermark);
  if (newLines.length === 0) return;

  // Advance watermark immediately — we own this slice regardless of API outcome
  try {
    writeFileSync(watermarkFile, String(allLines.length));
  } catch {
    return;
  }

  const hasMeaningful = newLines.some((line) => {
    try {
      const parsed = JSON.parse(line) as Record<string, unknown>;
      return (
        typeof parsed.tool_name === "string" &&
        MEANINGFUL_TOOLS.has(parsed.tool_name)
      );
    } catch {
      return false;
    }
  });

  if (!hasMeaningful) return;

  let traceMd: string;
  try {
    traceMd = readFileSync(resolve(cwd, "TRACE.md"), "utf8");
  } catch {
    return;
  }

  const sessionEvents = newLines.join("\n");
  const userContent = `<session_events>\n${sessionEvents}\n</session_events>\n\n<trace_md>\n${traceMd}\n</trace_md>`;

  const results = await Promise.all([
    callLens(apiKey, LENS_A, userContent),
    callLens(apiKey, LENS_B, userContent),
    callLens(apiKey, LENS_C, userContent),
  ]);

  const pendingPath = resolve(cwd, ".trace/pending.jsonl");
  for (const proposal of results) {
    if (proposal === null) continue;
    if (proposal.confidence < CONFIDENCE_THRESHOLD) continue;
    try {
      appendFileSync(pendingPath, JSON.stringify(proposal) + "\n");
    } catch {
      // continue writing remaining proposals
    }
  }
}

main().catch(() => {});
