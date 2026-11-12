---
description: Catch TRACE.md up with recent work, reviewing each proposed entry (accept, reword, or skip)
---

Bring this project's living PRD up to date. Proposals are only written to TRACE.md after the user accepts them.

## 1. Load the PRD

Read `TRACE.md` at the project root. If it does not exist, tell the user to run `/trace-prd:init` and stop.

Find the marker line near the end of the file: `<!-- trace-prd: last-review <commit or none> -->`.

## 2. Gather what happened since the last review

Use what you can, in this order:

1. **This conversation.** Decisions, trade-offs and surprises discussed in this session are the richest source.
2. **Git history,** if the project is a git repository. If the marker has a commit, run `git log --oneline <commit>..HEAD` and `git diff --stat <commit>..HEAD`; otherwise look at the last 20 commits with `git log --oneline -20`. Add `git status --short` for uncommitted work. Open individual diffs only where a commit message is unclear about a decision.
3. **Changed docs and config** (README, plans, package manifests) when the history points to them.

Do not read `.env` files, credentials, or anything outside the project.

## 3. Draft proposals through three lenses

- **Decision Log:** what engineering or product decisions were made, and why?
- **Assumption Ledger:** which assumptions in the PRD were validated or contradicted, and which new ones surfaced?
- **Open Questions:** what unknowns emerged that could change the build?

Rules:
- Each entry is one or two sentences that stand alone and say *why*, not just *what*.
- Ground every entry in the evidence above. Never invent a decision or a reason.
- Skip anything already in TRACE.md, and skip routine changes.
- Aim for quality over volume: usually zero to six proposals in total. If nothing qualifies, say so, update the marker (step 5), and stop.

## 4. Review with the user

Ask with AskUserQuestion, up to four proposals per call, one question per proposal. Put the section and the full entry text in the question. Options: **Accept**, **Skip**, **Stop reviewing**. The user can type a reworded entry through the free-text option; treat that as accepting their wording.

For each accepted entry, append a bullet at the end of its section in TRACE.md, in the form `- YYYY-MM-DD: entry`. Create the section at the end of the file, above the marker, if it is missing. Do not change anything else in the file.

If the user chooses **Stop reviewing**, leave the remaining proposals unwritten and go to step 5.

## 5. Move the marker

If this is a git repository, replace the marker with `<!-- trace-prd: last-review <current HEAD commit> -->` (from `git rev-parse --short HEAD`). Otherwise use today's date. If the marker is missing, add it as the last line.

## 6. Wrap up

One line: how many entries were added, skipped, and left unreviewed.

$ARGUMENTS
