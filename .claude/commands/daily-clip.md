---
description: Draft a 30-second build-loud clip script and caption based on today's shippable progress. Run this at the end of each working session during a hackathon to fuel a daily build-in-public thread.
---

Pick the single most interesting thing that shipped today and package it as a 30-second phone-recorded clip.

## Steps

1. `git log --since=midnight --oneline` — what shipped today.
2. If `.trace/decisions.jsonl` exists, read today's entries.
3. Pick one shippable thing that a non-technical viewer can grasp in 30 seconds. Prefer visible changes (UI, working flow, CLI output) over invisible ones (refactors, tests, config).

## Output

**Hook (0:00–0:03)** — one punchy line. No jargon.

**Demo (0:03–0:25)** — what to show on screen, frame by frame. Specify which window, file, or command. Example: "Terminal, run `trace init`, cut to VS Code showing the generated TRACE.md."

**Payoff (0:25–0:30)** — what just happened and why it matters to someone who is not you.

**Caption draft** — 2 to 3 sentences for LinkedIn or X. Plain English. Include one hashtag for the project. Match the user's style: line-break pacing, italics only for emphasis, no emoji unless the user's recent posts used them.

**Screenshot targets** — 1 to 3 specific moments worth capturing as stills for the thread.

## Rules

- If nothing visible shipped today, say so. Suggest either (a) skipping tonight's post or (b) a 20-second "behind the scenes" clip framed around one decision from the log.
- Keep the full response under 200 words. The user is recording on their phone, not reading a script aloud.
- Default project name in hashtags is the repo name. If unclear, ask once.
