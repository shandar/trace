# trace-prd

**Every decision traced from intent to ship.**

TRACE turns your PRD into a living document. You write the intent at the start of a project. As Claude builds against it, TRACE keeps three sections of `TRACE.md` current: the **Decision Log** (what was chosen and why), the **Assumption Ledger** (what the plan took for granted, and what the build showed), and **Open Questions** (unknowns that could change direction). At the end of a session, the document matches what shipped, not what you hoped.

## Install

```
/plugin install trace-prd
```

Or from this repository's marketplace:

```
/plugin marketplace add shandar/trace
/plugin install trace-prd@trace-marketplace
```

## Use

1. **`/trace-prd:init`** creates `TRACE.md` and helps you write the Intent.
2. **Build as usual.** In any project with a `TRACE.md`, Claude offers up to three entries at natural breaks in the work, for example after finishing a task. Nothing is written without your yes.
3. **`/trace-prd:review`** catches the PRD up with everything since the last review: this conversation, plus commits and uncommitted changes if the project uses git. You accept, reword, or skip each proposal.

That is the whole loop.

## What it does and does not do

- Markdown only: one skill and two commands. No hooks, no scripts, no MCP servers, no API keys.
- Reads `TRACE.md`, your conversation, and git history in the current project. Writes only to `TRACE.md`, and only entries you accepted.
- Sends nothing anywhere beyond your normal Claude session. Stores nothing outside your project.
- Uses your normal permission prompts for file edits and git commands.

Want capture that does not depend on Claude remembering to offer? See [`trace-prd-auto`](../trace-prd-auto), which uses hooks.

## License

MIT. See [LICENSE](./LICENSE).
