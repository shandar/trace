---
name: trace
description: Keeps a living PRD (TRACE.md) in sync with the build. Use when working in a project that has a TRACE.md and a product or engineering decision gets made, a planned assumption turns out right or wrong, or a new unknown appears. Also use when the user says "log this decision", "add that to the PRD", "update TRACE", "trace this", or asks what was decided and why.
---

# TRACE: keep the PRD honest while you build

TRACE.md is the project's living PRD. The human writes intent at the top. You keep three sections at the bottom current with what actually happens:

| Section | What belongs there |
|---|---|
| **Decision Log** | A choice that shapes the product or the code, and why it was made over the alternative. |
| **Assumption Ledger** | Something the plan took for granted that the work has now validated, contradicted, or newly exposed. |
| **Open Questions** | An unknown that could change scope, design, or direction, and is not resolved yet. |

## When to act

Only in a project with a `TRACE.md` at its root. Do nothing in other projects.

Watch for these moments while you work:
- You chose one approach over another for a reason worth remembering (a library, a data shape, a scope cut, a UX pattern).
- The code or a test showed that something in TRACE.md's intent or scope was wrong, or right in a way that matters.
- A question came up that the user has not answered and that affects what gets built.

Routine work (renames, small fixes, formatting, reading code) is not worth an entry.

## How to log

1. **Wait for a natural break.** Finish the task the user asked for first. Never interrupt work in progress to propose entries.
2. **Propose, do not write.** In one short block at the end of your reply, list at most three entries, each tagged with its section. Ask whether to add them. Example:

   > TRACE entries from this task:
   > - Decision Log: Chose SQLite over Postgres for v1 because the app is single-user and must run offline.
   > - Open Questions: Do we need multi-device sync before launch?
   >
   > Add these to TRACE.md?

3. **Write only after a yes.** Read TRACE.md, then append each accepted entry as a bullet at the end of its section, in the form `- YYYY-MM-DD: entry`. Create the section at the end of the file if it is missing. Do not touch any other part of the file.
4. **If the user says no or ignores it,** drop those entries and do not raise them again.

## Writing good entries

- One sentence, two at most. It must make sense to someone reading TRACE.md months later with no other context.
- Say *why*, not just *what*. "Switched to server-side rendering" is weak; "Switched to server-side rendering because the landing page must be indexable for launch" is useful.
- Ground every entry in what actually happened in this session. Never invent decisions or guess at the user's reasons; if the reason is unclear, ask or leave it out.
- Do not repeat what TRACE.md already says. If an entry changes an earlier one, say so ("Reverses the 2026-10-02 decision to ...").
- Never put credentials, personal data, or file contents into TRACE.md. It is usually committed to the repo.

For a full catch-up across commits, suggest `/trace-prd:review`.
