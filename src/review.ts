import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

interface PendingEdit {
  section: string;
  edit: string;
  confidence: number;
}

function parsePending(raw: string): PendingEdit[] {
  const out: PendingEdit[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const obj = JSON.parse(trimmed) as Partial<PendingEdit>;
      if (typeof obj.section === "string" && typeof obj.edit === "string") {
        out.push({
          section: obj.section,
          edit: obj.edit,
          confidence:
            typeof obj.confidence === "number" ? obj.confidence : 0,
        });
      }
    } catch {
      // skip malformed line
    }
  }
  return out;
}

function appendToDecisionLog(tracePath: string, edit: string): void {
  let doc = readFileSync(tracePath, "utf8");
  if (!doc.endsWith("\n")) doc += "\n";
  const bullet = `- ${edit}\n`;

  const heading = /^##\s+Decision Log\b.*$/im.exec(doc);
  if (!heading) {
    writeFileSync(tracePath, `${doc}\n## Decision Log\n\n${bullet}`, "utf8");
    return;
  }

  const headingLineEnd = doc.indexOf("\n", heading.index) + 1;
  const rest = doc.slice(headingLineEnd);
  const nextHeading = /^##\s+/m.exec(rest);
  const sectionEnd = nextHeading
    ? headingLineEnd + nextHeading.index
    : doc.length;

  const before = doc.slice(0, headingLineEnd);
  const body = doc.slice(headingLineEnd, sectionEnd).replace(/\s*$/, "");
  const after = doc.slice(sectionEnd);

  const newBody = body === "" ? `\n${bullet}` : `${body}\n${bullet}`;
  const separator = after ? "\n" : "";
  writeFileSync(tracePath, before + newBody + separator + after, "utf8");
}

export async function review(cwd: string): Promise<void> {
  const pendingPath = resolve(cwd, ".trace/pending.jsonl");
  const tracePath = resolve(cwd, "TRACE.md");

  if (!existsSync(tracePath)) {
    console.error(
      "trace: no TRACE.md in current directory. Run `trace init` first.",
    );
    process.exit(1);
  }

  if (!existsSync(pendingPath)) {
    console.log("trace: no pending edits.");
    return;
  }

  const edits = parsePending(readFileSync(pendingPath, "utf8"));
  if (edits.length === 0) {
    console.log("trace: no pending edits.");
    return;
  }

  const rl = createInterface({ input, output });
  let accepted = 0;
  let skipped = 0;
  let i = 0;
  let aborted = false;

  try {
    for (; i < edits.length; i++) {
      const { section, edit, confidence } = edits[i];
      console.log("");
      console.log(`── proposal ${i + 1} of ${edits.length} ──`);
      console.log(`section:    ${section}`);
      console.log(`confidence: ${confidence.toFixed(2)}`);
      console.log(`edit:       ${edit}`);
      console.log("");

      let answer: string;
      try {
        answer = (await rl.question("[a]ccept / [s]kip? "))
          .trim()
          .toLowerCase();
      } catch {
        console.log("\n→ input closed. Remaining proposals kept in queue.");
        aborted = true;
        break;
      }

      if (answer === "a" || answer === "accept") {
        appendToDecisionLog(tracePath, edit);
        accepted++;
        console.log("→ accepted, appended to Decision Log.");
      } else {
        skipped++;
        console.log("→ skipped.");
      }
    }
  } finally {
    rl.close();
  }

  if (aborted) {
    const remaining = edits
      .slice(i)
      .map((e) => JSON.stringify(e))
      .join("\n");
    writeFileSync(
      pendingPath,
      remaining.length ? remaining + "\n" : "",
      "utf8",
    );
    console.log("");
    console.log(
      `trace: reviewed ${i} of ${edits.length} — ${accepted} accepted, ${skipped} skipped. ${edits.length - i} kept in queue.`,
    );
    return;
  }

  writeFileSync(pendingPath, "", "utf8");
  console.log("");
  console.log(
    `trace: reviewed ${edits.length} — ${accepted} accepted, ${skipped} skipped. Queue cleared.`,
  );
}
