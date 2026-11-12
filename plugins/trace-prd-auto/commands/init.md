---
description: Start a living PRD (TRACE.md) in this project and turn on TRACE logging
allowed-tools: Bash(node:*), Read, Edit
---

Set up TRACE for this project.

1. Run:

   ```bash
   node "${CLAUDE_PLUGIN_ROOT}/scripts/trace.mjs" init
   ```

2. If it exits with code 3 (TRACE.md already exists), tell the user and ask whether to overwrite it. Only if they clearly say yes, run the same command with `--force`. Never overwrite without a yes.

3. Once TRACE.md exists, help the user fill in the **Intent** section: ask what they are building and why, in one or two sentences, and write their answer into that section. If they want to skip this, leave the placeholder.

4. Finish with a short note:
   - From now on, TRACE logs tool activity in this project to `.trace/sessions/` (gitignored, secrets redacted).
   - Run `/trace-prd-auto:review` at any point to turn recent work into Decision Log, Assumption Ledger and Open Questions entries.
   - Optional: setting an Anthropic API key in the plugin options turns on background proposals after each turn.

$ARGUMENTS
