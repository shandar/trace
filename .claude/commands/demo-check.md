---
description: Audit current project state against the submission demo script. Flags what's demoable today vs partial vs missing.
---

You are auditing this project against its submission demo script. Be concrete. Be honest.

## Steps

1. Find the PRD in the project root (`TRACE.md`, `PRD.md`, `*_PRD.md`, or similar). Read its demo script section — usually labeled "Demo plan", "Submission video", or similar.
2. Run `git log --oneline -20` to see recent work.
3. If `.trace/decisions.jsonl` exists, read the last 20 entries for decision context.
4. Scan the current file tree for implemented features.

## Output

A single markdown table, three columns:

| Demo beat | Status | What's missing |
|---|---|---|
| (exact beat from script) | ✓ demoable / ◐ partial / ✗ missing | (concrete gap — one line) |

Below the table, three short lines:

- **At risk:** the single beat most likely not to be demoable by submission time.
- **Cut candidates:** any beats that should be removed from the script instead of built.
- **Next 2 hours:** the one task that moves the most beats forward.

## Rules

- Do not propose adding new beats. The script is fixed.
- Do not recommend rewrites or refactors.
- If a beat's status is unclear, mark it ◐ and say what you'd need to test to confirm.
- Status ✓ requires evidence — a working file, a passing command, a visible UI. Not "the code exists."

Keep the full response under 30 lines.
