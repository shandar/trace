<p align="center">
  <img src="./trace-banner.png" alt="TRACE: Every decision traced from intent to ship. A Claude Code plugin." width="100%" />
</p>

# TRACE

**Every decision traced from intent to ship.**

TRACE is a Claude Code plugin that turns your PRD into a living document. You write the intent at the start of a project. Claude Code builds against it, and TRACE writes back: logging decisions, surfacing contradicted assumptions, and flagging new open questions as the build moves. At the end of the session, the document matches what shipped, not what you hoped.

---

## Two editions

| | [`trace-prd`](./plugins/trace-prd) | [`trace-prd-auto`](./plugins/trace-prd-auto) |
|---|---|---|
| How entries are captured | Claude offers entries at natural breaks; `/trace-prd:review` catches up from the conversation and git history | Hooks record every tool event; `/trace-prd-auto:review` turns them into proposals |
| Background proposals after each turn | No | Optional, with your own API key |
| What it ships | Markdown only: one skill, two commands | Hooks and dependency-free Node scripts |
| Requirements | Claude Code | Claude Code and Node.js 18+ |
| Where to get it | Plugin directory, or this repo's marketplace | This repo's marketplace |

Most people should start with **`trace-prd`**. Install one edition per project, not both.

## Install

```
/plugin install trace-prd
```

Or from this repository's marketplace:

```
/plugin marketplace add shandar/trace
/plugin install trace-prd@trace-marketplace        # markdown-only edition
/plugin install trace-prd-auto@trace-marketplace   # hook edition
```

## Quickstart

```
/trace-prd:init      create TRACE.md and write the intent
/trace-prd:review    catch the PRD up; accept, reword, or skip each proposal
```

Every entry lands in one of three sections of `TRACE.md`:

- **Decision Log:** what was chosen, and why.
- **Assumption Ledger:** what the plan took for granted, and what the build showed.
- **Open Questions:** unknowns that could change scope, design, or direction.

---

## Repository layout

```
trace/
├── .claude-plugin/marketplace.json   Lists both editions
├── plugins/
│   ├── trace-prd/                    Markdown-only edition (directory listing)
│   └── trace-prd-auto/               Hook edition
└── TRACE.md                          This repo's own living PRD, written by TRACE
```

## The recursive proof

This repo's `TRACE.md` was written by TRACE itself.

Commit [`797daaf`](https://github.com/shandar/trace/commit/797daaf) is the first moment TRACE used TRACE to document itself: a Decision Log entry written by the hook, vetted through the review loop, committed to `main`. Every later entry in `## Decision Log`, `## Assumption Ledger` and `## Open Questions` followed the same path.

## Origin

Started at the [Built with Opus 4.7 hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon) as a terminal CLI, and rebuilt as Claude Code plugins.

## Author

Shandar Junaid, UX designer turned AI product builder. [Affordance Design Studio](https://affordance.design)

Most of the code in this repo was written by Claude Code under direction. The product calls, the architecture decisions and the story are mine.

## License

MIT. See [LICENSE](./LICENSE).
