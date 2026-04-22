#!/usr/bin/env node
import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

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

  const sessionsDir = resolve(cwd, ".trace/sessions");
  try {
    mkdirSync(sessionsDir, { recursive: true });
  } catch {
    return;
  }

  try {
    appendFileSync(
      resolve(sessionsDir, `${sessionId}.jsonl`),
      JSON.stringify(event) + "\n",
    );
  } catch {
    return;
  }
}

main().catch(() => {});
