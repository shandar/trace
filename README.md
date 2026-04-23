# TRACE

**Every decision traced from intent to ship.**

TRACE is a Claude Code plugin that turns your PRD into a living document. You scaffold intent at the start of a project. Claude Code executes against it, and the PRD writes itself back — logging decisions, surfacing contradicted assumptions, flagging new open questions as the build progresses. At the end of the session, the document matches what shipped, not what you hoped.

Built for the [Built with Opus 4.7 hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon).

---

## How it works

TRACE runs as a set of Claude Code hooks:

1. **PostToolUse** captures every tool event into a per-session log.
2. **Stop** (fires after every turn) triggers a proposer that synthesizes the turn into proposed PRD edits.
3. The proposer runs **three Opus 4.7 sub-agents in parallel**, each reading the same events through a different lens:
   - **Decision** → Decision Log
   - **Assumption** → Assumption Ledger
   - **Question** → Open Questions
4. Proposals with confidence ≥ 0.5 land in `.trace/pending.jsonl`.
5. `trace review` shows each proposal one at a time. `[a]` writes it into the right section of `TRACE.md`. `[s]` skips.

Pure read-only turns produce no proposals. Each turn is watermarked, so the same events are never synthesized twice.

---

## Install

```bash
git clone https://github.com/shandar/trace.git
cd trace
npm install
npm run build
```

Then symlink the CLI locally so `trace` works in any directory:

```bash
npm link
```

You'll also need an Anthropic API key exported in any shell that launches Claude Code:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Quickstart

In any project directory where you want a living PRD:

```bash
trace init
```

This scaffolds a structured `TRACE.md` template. Open it, fill in the intent sections (what you're building, who it's for, what's in scope). Then start building with Claude Code as normal.

Every turn, proposals accumulate in `.trace/pending.jsonl`. When you want to review them:

```bash
trace review
```

That's the whole loop.

---

## Project layout

```
trace/
├── TRACE.md                     This repo's own living PRD — written by TRACE
├── SUBMISSION.md                Hackathon submission description
├── src/
│   ├── cli.ts                   CLI entry (init, review subcommands)
│   ├── event-logger.ts          PostToolUse hook — appends events to session log
│   ├── session-proposer.ts      Stop hook — runs the 3-lens synthesizer
│   └── review.ts                trace review command + section writer
├── .claude/
│   └── settings.json            Hook registration for PostToolUse + Stop
├── .trace/
│   ├── sessions/                Per-session event logs (one .jsonl per session_id)
│   └── pending.jsonl            Queue of proposed edits awaiting review
├── package.json
├── tsconfig.json
└── LICENSE
```

---

## The recursive proof

This repo's `TRACE.md` was written by TRACE itself.

Commit [`797daaf`](https://github.com/shandar/trace/commit/797daaf) is the first moment TRACE used TRACE to document itself — a Decision Log entry written by the hook, vetted through the review loop, committed to `main`. Every subsequent entry in the `## Decision Log`, `## Assumption Ledger`, and `## Open Questions` sections followed the same path.

Read `TRACE.md` in this repo to see what a living PRD actually looks like in the wild.

---

## Built with

- **Claude Code** — hook runtime, sub-agent orchestration, development environment
- **Opus 4.7** — three specialist sub-agents (decision, assumption, question) running in parallel per turn
- **TypeScript** on Node.js

---

## Author

Shandar Junaid — UX designer turned AI product builder.
[Affordance Design Studio](https://affordance.design)

Most of the code in this repo was written by Claude Code under direction. The product calls, the architecture decisions, the demo story, and this README are mine.

---

## License

MIT. See [LICENSE](./LICENSE).
