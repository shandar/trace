# TRACE — Submission

**Demo video:** https://youtu.be/7vDUqqD3xWo
**Repo:** https://github.com/shandar/trace
**Builder:** Shandar Junaid · Affordance Design Studio · Bengaluru, India

---

## Description (157 words)

**TRACE is a living PRD for Claude Code.**

Every engineer who uses Claude Code writes a plan, starts building, and watches the plan go stale within the hour. The PRD becomes a tombstone. The code is the only source of truth, and the *why* behind every tradeoff disappears into commit messages.

TRACE closes that loop. A PostToolUse hook captures every Claude Code action into a per-session log. After every turn, a Stop hook fires three Opus 4.7 sub-agents in parallel — one looks for decisions, one for assumptions validated or contradicted, one for open questions. Each returns a confidence-scored proposal. Confidence ≥ 0.5 lands in a review queue. The user accepts or skips in a minimal TUI, and accepted proposals write themselves into the right section of the PRD.

This repo's TRACE.md was written by TRACE itself — commit [`797daaf`](https://github.com/shandar/trace/commit/797daaf) is the moment TRACE first used TRACE to document itself.

---

## How TRACE addresses the rubric

**Impact (30%).** PRD rot is universal — every engineer who has ever written a spec has watched it go stale. TRACE solves it for the fastest-growing AI-native development workflow (Claude Code), and the solution generalizes: any agentic coding tool with a hook system can host this loop. The proof is in this repo: TRACE's own PRD is alive.

**Demo (25%).** The 3-minute video shows TRACE running on a fresh project. Claude Code is asked to make a real engineering tradeoff (`--name` CLI flag vs `NAME` env var precedence). After one turn, two proposals land in two different sections of the PRD, each from a different Opus 4.7 sub-agent. The Assumption Ledger proposal includes a test command the model executed to validate its own choice. Accepted, the proposals write themselves into the doc on screen.

**Opus 4.7 Use (25%).** Three parallel sub-agents, same model, three system prompts, three lenses on the same event. The Assumption Ledger lens consistently produces *inferences*, not summaries — naming implicit assumptions, identifying contradictions, even running test commands to validate behavior. Same model, used as a team of specialists rather than a generalist.

**Depth (20%).** Six days of real iteration documented in the repo's commit history. Day 3 included a known-bug pivot from `SessionEnd` to `Stop` hooks (issue #41577 in claude-code) that improved the product's semantics from "session recap" to "live companion." Day 4 added the multi-lens architecture as a deliberate rubric play. Both decisions are recorded in TRACE.md's own Decision Log — written by TRACE.

---

## Author note

I'm a UX designer turned AI product builder. Most of the code in this repo was written by Claude Code under direction. The product calls, the architecture decisions, the demo story, and this document are mine. TRACE is built on the thesis that the moat in AI-native software isn't keystrokes — it's judgment.
