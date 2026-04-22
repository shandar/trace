#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SYSTEM_PROMPT =
  "Given the tool events from a single completed Claude Code turn and the current TRACE.md, propose ONE short edit — a single sentence capturing what meaningfully changed or was decided in this turn. Skip trivial turns (return confidence below 0.2). Return ONLY {\"section\": \"<section>\", \"edit\": \"<one sentence>\", \"confidence\": 0.0-1.0}. Pick section from: Decision Log, Assumption Ledger, Open Questions, In Scope, Out of Scope.";

const MEANINGFUL_TOOLS = new Set([
  "Edit",
  "Write",
  "Bash",
  "MultiEdit",
  "NotebookEdit",
]);

const MODEL = "claude-opus-4-7";
const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicContentBlock[];
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
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

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });
  } catch {
    return;
  }

  if (!res.ok) return;

  const data = (await res.json()) as AnthropicResponse;
  const text = data.content?.[0]?.text?.trim();
  if (!text) return;

  let normalized: string;
  try {
    normalized = JSON.stringify(JSON.parse(text));
  } catch {
    return;
  }

  try {
    appendFileSync(resolve(cwd, ".trace/pending.jsonl"), normalized + "\n");
  } catch {
    return;
  }
}

main().catch(() => {});
