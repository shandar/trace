# TRACE — Submission

*Working draft. Final copy lands Saturday.*
*Target: 150 words. Hard cap: 200.*

---

## v0 — 168 words

**TRACE is a living PRD for Claude Code.**

Every engineer who uses Claude Code writes a plan, starts building, and watches the plan go stale within the hour. The PRD becomes a tombstone. The code becomes the only source of truth, and the *why* behind every tradeoff disappears into commit messages.

TRACE closes that loop. A PostToolUse hook captures every action Claude Code takes. An Opus 4.7 sub-agent reads the action and the current PRD, and proposes a one-sentence edit with a confidence score. The user accepts or skips in a minimal review TUI. Accepted edits land in the document, routed to the correct section.

The PRD in this repo was written by TRACE itself — commit [`797daaf`](https://github.com/shandar/trace/commit/797daaf) is the moment TRACE first used TRACE to document itself.

Built in one day with Claude Code hooks, sub-agents, and Opus 4.7. Every decision traced, from intent to ship.

---

## Rubric self-check

- **Impact (30%)** — ✓ Names the real problem (PRD rot), the real audience (Claude Code builders), and shows the thesis in one sentence.
- **Demo (25%)** — ⚠ Video link gets pasted here Saturday.
- **Opus 4.7 Use (25%)** — ✓ Names the model explicitly, ✓ shows sub-agent creative use, ✓ confidence-gating (once shipped) adds surprise.
- **Depth (20%)** — ✓ Cites the thesis commit directly. Shows actual craft, not a quick hack.

---

## Iteration notes

- v0 is too technical in paragraph 2. A non-engineer judge should understand "PostToolUse hook" after reading — or the word "hook" gets replaced.
- "Sub-agent" might confuse judges who haven't used Claude Code's sub-agent API. Consider replacing with "separate model instance".
- The thesis commit line is the money sentence. Protect it through all edits.
- If confidence-gating ships, add one line: *"Low-confidence proposals quietly route to a noise log; high-confidence ones auto-accept."*

---

## Final version checklist (Saturday)

- [ ] Video link pasted in (YouTube Unlisted)
- [ ] Commit hash still points to the right commit after any rebases
- [ ] Word count between 100 and 200
- [ ] Reads cleanly to a non-technical friend in one pass
- [ ] All four rubric categories represented in the first 150 words
