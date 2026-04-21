# TRACE

**Every decision traced from intent to ship.**

TRACE is a Claude Code plugin that turns your PRD into a living document. You scaffold intent at the start of a project. Claude Code executes against it, and the doc writes back — logging decisions, flagging drifted assumptions, updating scope as the build progresses. At the end, the PRD matches what shipped, not what was hoped.

Built for the [Built with Opus 4.7](https://cerebralvalley.ai/e/built-with-4-7-hackathon) hackathon, April 21–26 2026.

## Status

Day 1. Scaffolding. See `TRACE.md` for the full PRD and build plan, `PLAYBOOK.md` for the daily checklist.

## Install (aspirational)

```bash
npx @affordance/trace init
```

This README gets audited by the `fresh-install-auditor` agent on day 5. Keep it honest as the project grows.

## Project layout

```
Trace/
├── TRACE.md                    Living PRD (also the spec the plugin reads)
├── PLAYBOOK.md                 Daily hackathon checklist
├── src/                        TypeScript plugin source
├── .claude/                    Hackathon kit — discipline + commands + agents
│   ├── skills/hackathon-discipline/
│   ├── commands/demo-check.md
│   ├── commands/daily-clip.md
│   └── agents/fresh-install-auditor.md
├── package.json
├── tsconfig.json
└── .gitignore
```

## Author

Shandar Junaid · [Affordance Design Studio](https://affordance.design)
