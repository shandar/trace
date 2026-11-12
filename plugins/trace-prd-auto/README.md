# trace-prd-auto

**TRACE with automatic capture.**

Same living PRD as [`trace-prd`](../trace-prd), but capture does not depend on Claude remembering to offer entries: hooks record every tool event in projects that have a `TRACE.md`, and `/trace-prd-auto:review` turns them into Decision Log, Assumption Ledger and Open Questions proposals. With your own API key, proposals can also be generated in the background after each turn.

This edition runs local Node scripts from hooks, so it is distributed from this repository's marketplace rather than the plugin directory.

## Install

```
/plugin marketplace add shandar/trace
/plugin install trace-prd-auto@trace-marketplace
```

**Requirements:** Claude Code, and Node.js 18 or later on your `PATH`. The scripts have no dependencies and no build step.

Install either `trace-prd` or `trace-prd-auto` in a project, not both.

## Use

```
/trace-prd-auto:init      create TRACE.md and start logging in this project
/trace-prd-auto:review    turn recent activity into proposals; accept, reword, or skip each
```

## How it works

1. **PostToolUse hook** records each tool event (trimmed and redacted, see below) to `.trace/sessions/<session>.jsonl`. It only runs in projects that have a `TRACE.md`.
2. **`/trace-prd-auto:review`** reads events since the last review through three lenses (decision, assumption, question), queues proposals in `.trace/pending.jsonl`, and walks you through them.
3. **Optional background mode.** With your own Anthropic API key set in the plugin options, a **Stop hook** runs the three lenses after each turn that edited files. Read-only turns are skipped, and each event is sent at most once.

### Plugin options

Open `/plugin`, select **trace-prd-auto**, and set:

| Option | What it does |
|---|---|
| `anthropic_api_key` | Your own key. Stored in your OS credential store, never in a file. Leave empty to generate proposals in-session only. |
| `model` | Model for background proposals. Default `claude-sonnet-5-5`. Three short calls per editing turn, billed to your key. |

## Data and privacy

| Data | Where | Leaves your machine? |
|---|---|---|
| Tool events (tool name, inputs, outputs) | `.trace/sessions/` in your project | **In-session:** no new destination. **Background mode:** sent to `api.anthropic.com` with your key, nowhere else. |
| Proposals | `.trace/pending.jsonl` | No |
| Accepted entries | `TRACE.md` | No |

- **Redaction before anything is written.** Keys and tokens (Anthropic, OpenAI, GitHub, Slack, AWS, Google, JWTs), `Bearer` headers, private key blocks, and `NAME=value` pairs whose name looks like a credential become `[REDACTED]`.
- **Trimmed payloads.** Each string is capped at 2,000 characters; transcript paths, working directory and permission mode are not stored.
- **Raw logs stay out of git.** TRACE writes `.trace/.gitignore` containing `sessions/`.
- **Your key stays yours.** It is only sent as the `x-api-key` header to `api.anthropic.com`, and is never logged, printed, or written to disk.
- **No telemetry.** No other network calls.

## Layout

```
trace-prd-auto/
├── .claude-plugin/plugin.json   Manifest and options
├── hooks/hooks.json             PostToolUse (logger) and Stop (background proposer)
├── commands/                    /trace-prd-auto:init, /trace-prd-auto:review
└── scripts/
    ├── lib.mjs                  Paths, redaction, queue, TRACE.md section writer
    ├── event-logger.mjs         PostToolUse hook
    ├── session-proposer.mjs     Stop hook (background mode only)
    └── trace.mjs                Helper behind the commands; owns every file write
```

## Known limitations

- Needs a local Node.js runtime, so it is built for Claude Code only.
- Tested on macOS. Linux should work; Windows is untested.

## License

MIT. See [LICENSE](./LICENSE).
