#!/usr/bin/env node
import { readFileSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const SYSTEM_PROMPT =
  'You are a PRD updater. Given a Claude Code tool event and the current TRACE.md, propose ONE short edit — a single sentence to add to the Decision Log section. Return ONLY a JSON object: {"section": "Decision Log", "edit": "<one sentence>", "confidence": 0.0-1.0}. No preamble. No markdown.';

const MODEL = "claude-opus-4-7";
const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

interface HookEvent {
  cwd?: string;
  [k: string]: unknown;
}

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

  let event: HookEvent;
  try {
    event = JSON.parse(raw) as HookEvent;
  } catch {
    return;
  }

  const cwd = event.cwd;
  if (typeof cwd !== "string" || cwd.length === 0) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;

  let traceMd: string;
  try {
    traceMd = readFileSync(resolve(cwd, "TRACE.md"), "utf8");
  } catch {
    return;
  }

  const userContent = `<event>\n${JSON.stringify(event, null, 2)}\n</event>\n\n<trace_md>\n${traceMd}\n</trace_md>`;

  const res = await fetch(API_URL, {
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

  const pendingPath = resolve(cwd, ".trace/pending.jsonl");
  appendFileSync(pendingPath, normalized + "\n");
}

main().catch(() => {
  // Silent. Never block the Claude Code session.
});
