# TRACE — Product Requirements Document

**Hackathon:** Built with Opus 4.7 (Anthropic × Cerebral Valley)
**Dates:** April 21–26, 2026
**Author:** Shandar Junaid, Affordance Design Studio
**Status:** Draft v0.1 — day-1 kickoff
**Framework:** PWP (plan → execute → verify → ship)

---

## 1. One-liner

**Every decision traced from intent to ship.**

TRACE is a Claude Code plugin that turns your PRD into a living trace of what you're actually building. You scaffold intent at the start of a project. Claude Code reads it, executes against it, and writes back — logging decisions, flagging drifted assumptions, and updating scope as the build progresses. At the end of the session, the PRD matches what shipped, not what was hoped.

---

## 2. Problem

Every builder using Claude Code faces the same loop:

1. Write a plan or PRD.
2. Start coding with Claude Code.
3. Make ten decisions in the first hour that contradict the plan.
4. Plan goes stale. Nobody updates it.
5. Ship something. Reconstruct the "why" from commit messages and memory.

The PRD is a write-once artefact. The code is the only living source of truth. The *reasoning* — why a tradeoff was made, what was cut, what was validated — is lost.

**TRACE closes the loop.** The PRD becomes a two-way surface: human writes intent, Claude writes evidence of execution.

---

## 3. Target user

- **Primary:** Solo builders and 2-person teams using Claude Code for agentic development (the exact hackathon audience).
- **Secondary:** Product designers and PMs who brief engineers via AI-first workflows.

**Anti-user:** Teams with heavy Jira/Linear governance. TRACE is for fast, AI-led builds where documentation currently loses to velocity.

---

## 4. Core insight

Claude Code already makes decisions in the open — every tool call, every commit, every file edit is observable. We don't need the human to "remember to update the PRD." We need Claude to *notice when the PRD is drifting from reality* and propose edits. The human approves or rejects.

This is the UX hook: **the PRD updates propose themselves, with a diff, in the doc itself.**

---

## 5. MVP scope (day 1–2, must ship)

### 5.1 Core flow

1. User runs `trace init` in any Claude Code project.
2. TRACE scaffolds a `TRACE.md` file with structured sections:
   - Intent (what we're building and why)
   - Users & jobs-to-be-done
   - In scope (v1)
   - Out of scope
   - Open questions
   - Decision log (auto-populated)
   - Assumption ledger (auto-populated)
3. User writes their intent in plain English (or pastes an existing brief).
4. User runs Claude Code as normal.
5. TRACE hooks into `PostToolUse` events and detects:
   - **Decisions** (file choices, library swaps, architectural picks)
   - **Scope creep** (code touching areas not mentioned in "In scope")
   - **Assumption violations** (code contradicting a stated assumption)
6. After each meaningful action, TRACE appends a proposed edit to `TRACE.md` marked as `<!-- proposed:pending -->`.
7. User reviews proposed edits via `trace review` — single-key accept / reject / edit.
8. Accepted edits become part of the doc. Rejected edits are logged for learning.

### 5.2 Acceptance criteria (PWP quality gates)

- [ ] `TRACE.md` is a plain markdown file — greppable, git-diffable, portable.
- [ ] No proposed edit is ever auto-applied. Human-in-the-loop on every write.
- [ ] Decision log entries include: timestamp, trigger (tool call or commit), one-sentence summary, link to diff.
- [ ] Works offline-first — Claude Code session is the only required runtime.
- [ ] Strict TypeScript, no silent failures, errors bubble to the CLI.
- [ ] Mobile-first not applicable (CLI + markdown).
- [ ] WCAG AA applies to the optional web viewer only.

### 5.3 The "60-second demo" we're optimising for

Split screen in the submission video:
- **Left half:** `TRACE.md` rendered in VS Code preview.
- **Right half:** Claude Code terminal running a real task ("build a todo app with local storage").
- As Claude Code picks libraries, makes scope decisions, and commits, the PRD on the left morphs — decision log entries appear, the "open questions" section shrinks, an "assumption validated" note lands.
- Final frame: the finished PRD tells the entire story of the build in one scroll.

---

## 6. Stretch scope (day 3–5, if time permits)

- **TRACE viewer** — lightweight web app (React + Vite + Tailwind, neubrutalist design system) that reads `TRACE.md` and renders a timeline view of decisions vs intent.
- **IX Lens mode** — decisions tagged against the five IX lenses (Intent, Interpretation, Interaction, Inference, Impact) so you can see which layer each decision affected.
- **Replay** — step backward through the decision log to see the PRD state at any commit.
- **Multi-session memory** — TRACE reads prior session logs when resuming a project, so Claude Code starts with full "why" context, not just "what."
- **Team mode** — TRACE entries include author (human or agent), supporting 2-person team collaboration for the hackathon partner format.

---

## 7. Out of scope (explicitly)

- Integrations with Jira, Linear, Notion, Confluence. Markdown only.
- Real-time multi-user editing. Git is the sync layer.
- Non-Claude-Code agents. This is a Claude-Code-native tool.
- A hosted service. Everything runs locally.
- Authentication, billing, accounts.

---

## 8. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code CLI                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  TRACE plugin                                      │  │
│  │  ├─ skill: trace/SKILL.md                          │  │
│  │  ├─ hooks:                                        │  │
│  │  │   ├─ PostToolUse  → detect decisions           │  │
│  │  │   ├─ PostCommit   → summarise diff             │  │
│  │  │   └─ SessionEnd   → propose PRD revisions      │  │
│  │  ├─ commands:                                     │  │
│  │  │   ├─ trace init    → scaffold TRACE.md           │  │
│  │  │   ├─ trace review  → review pending edits       │  │
│  │  │   └─ trace replay  → timeline view (stretch)    │  │
│  │  └─ core/                                         │  │
│  │      ├─ parser.ts    → TRACE.md ↔ AST              │  │
│  │      ├─ detector.ts  → drift detection rules      │  │
│  │      └─ proposer.ts  → draft edit generator       │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
      TRACE.md                         .trace/ (metadata)
   (source of truth)          decisions.jsonl, state.json
```

### Key design calls

1. **Markdown as the source of truth.** No database, no proprietary format. `TRACE.md` is a regular file, committable, diffable, human-editable.
2. **`.trace/` sidecar for metadata.** JSONL decision log, state snapshot. Gitignorable if preferred, or committed for team history.
3. **Hooks, not polling.** Claude Code's hook system (PostToolUse, PostCommit, SessionEnd) is the trigger surface. Zero-latency, zero-overhead when idle.
4. **Proposer is a sub-agent.** A dedicated Claude sub-agent gets the diff + the current `TRACE.md` section and returns a proposed edit as a unified diff. Keeps the main agent's context clean.

---

## 9. Tech stack

| Layer | Choice | Rationale |
|---|---|---|
| Plugin runtime | Claude Code plugin SDK (TypeScript) | Native, matches hackathon theme |
| Parser | `remark` + `remark-parse` | Battle-tested markdown AST |
| CLI | `commander` + `ink` (React for CLI) | Neubrutalist CLI UI out of the box |
| State | Plain JSONL files in `.trace/` | Grep-friendly, append-only |
| Sub-agent | Claude Opus 4.7 via Claude Code sub-agent API | The hackathon model |
| Stretch viewer | React 18 + Vite + Tailwind | Standard Shandar stack |
| Stretch design | Neubrutalist system (Outfit / Inter / Zen Dots, OKLCH, hard shadows) | `shandar-os` skill |

---

## 10. Build plan (PWP-aligned)

**Real timeline:** Tue 21 Apr kickoff 10:30 PM IST → hacking begins 11 PM IST. Active build = Wed 22 through Sun 26. Submit by Mon 27 Apr 6:30 AM IST (target 2 AM IST for buffer).

### Kickoff — Tue 21 Apr (night, post-11 PM IST)
- [ ] Attend kickoff 10:30 PM IST, confirm scaffold rules
- [ ] Scaffold repo: `trace/` with plugin manifest, skill, hook stubs
- [ ] `trace init` stub writes a template `TRACE.md`
- [ ] **Gate:** fresh shell runs `trace init` clean

### Day 1 — Wed 22 Apr — Core loop
- [ ] PostToolUse hook with decision detection
- [ ] Proposer sub-agent (diff in → edit proposal out)
- [ ] `trace review` TUI (accept / reject / edit)
- [ ] Attend Thariq AMA 9:30 PM IST
- [ ] **Gate:** real Claude Code session triggers a real proposed edit

### Day 2 — Thu 23 Apr — End-to-end + rough cut
- [ ] E2E dogfood on a real side project
- [ ] Tighten detector rules (confidence threshold, `.trace/noise.log`)
- [ ] 3-min rough demo recording exists
- [ ] Attend Managed Agents talk 8:30 PM IST — decide MA prize chase
- [ ] **Gate:** PRD updates meaningfully during a live session

### Day 3 — Fri 24 Apr — Polish OR stretch (discipline check)
- [ ] README with install + quickstart
- [ ] Stretch: web viewer or IX Lens tagging — only if core is rock solid
- [ ] Attend Mike Brown (1st place 4.6) 9:30 PM IST
- [ ] **Gate:** no new surface area after 2 AM IST Sat

### Day 4 — Sat 25 Apr — Feature freeze + audit
- [ ] `fresh-install-auditor` clean pass
- [ ] Final 3-min demo locked
- [ ] `SUBMISSION.md` polished to 150 words
- [ ] **Gate:** someone else could install from a fresh checkout in <2 min

### Day 5 — Sun 26 Apr — Ship
- [ ] `git-clean` pass over commit history
- [ ] Public GitHub repo, MIT verified
- [ ] Submission form: video URL, repo URL, description
- [ ] **Submit by 2 AM IST Mon 27** (4h buffer before 6:30 AM deadline)

---

## 11. Demo plan (for judges)

**Format:** 3-minute video (hackathon requires 3 min) + public GitHub repo + 100–200-word written description.

**Pacing target:** 30s hook + setup · 90s core loop demo · 60s payoff + stretch tease.

**Script beats:**

1. **(0:00–0:15) Hook.** Cold open on a dead PRD. Voiceover: "Your PRD dies the moment you start coding. TRACE keeps it alive." Cut to title card.
2. **(0:15–0:30) Setup.** Split screen: `TRACE.md` rendered in VS Code preview on the left, Claude Code terminal on the right, brand-new empty project. One sentence on what TRACE is: "A Claude Code plugin. The PRD updates itself as Claude builds."
3. **(0:30–0:50) Intent capture.** User runs `trace init`, types a plain-English brief into the Intent section ("build a todo app with local storage"), saves.
4. **(0:50–1:30) Core loop — decisions land live.** User kicks off Claude Code. As Claude picks a library, makes a scope call, and commits, proposed edits cascade into `TRACE.md` on the left — decision log entries appear, an assumption flips to "validated," an open question closes. Show `trace review` accepting two and rejecting one with a keystroke.
5. **(1:30–2:00) Scope-drift catch.** Claude touches a file outside the declared "in scope" list. TRACE surfaces a proposed scope amendment. User reads it, edits it, accepts. This is the bidirectional magic — judges must see the *reject/edit* path, not just accept.
6. **(2:00–2:30) Payoff.** Fast scroll through the finished `TRACE.md`: intent at the top, decision log at the bottom, timestamps and diff links throughout. Voiceover: "One scroll. The whole build's reasoning, committed alongside the code."
7. **(2:30–2:50) Stretch tease (optional).** 10s glimpse of the web viewer timeline OR IX Lens tagging if shipped. If not shipped, use this slot to show a second project also traced — proof of generalisation.
8. **(2:50–3:00) CTA.** "One command. `npx trace init`. Every decision traced, from intent to ship." End card with repo URL.

---

## 12. Risks & mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Hook API surface changes mid-week | Low | Pin Claude Code version, document in README |
| Proposer generates too many low-signal edits | Medium | Detector has a confidence threshold; edits below threshold go to `.trace/noise.log`, not the PRD |
| Judges see it as "just a markdown tool" | Medium | Demo leads with the *bidirectional* magic, not the file format |
| Scope creep — tempted to build the viewer too early | High | Viewer is explicitly day 4. Day 1–3 is CLI-only |
| Sub-agent latency makes review feel sluggish | Medium | Batch proposals; queue them; surface via `trace review` on user's cadence, not realtime |

---

## 13. Success metrics (for self-assessment)

- Ship a working plugin by end of day 2.
- At least one external builder (someone not on the team) installs it and reports back during the hackathon week.
- Demo video completed by end of day 3.
- Public GitHub repo with a clean README by submission.
- Personal bar: would I use this on my next Claude Code project? If no, pivot.

---

## 14. Open questions

- [ ] Should `.trace/` be gitignored by default or committed? (Lean: committed — decision history is valuable.)
- [ ] How aggressive should drift detection be on day 1? (Lean: conservative — false positives kill trust.)
- [ ] Name: TRACE is clean and action-oriented, but `trace` clashes with `strace`/`ltrace`-family CLI conventions. Consider a scoped npm name (`@affordance/trace` or `trace-cli`) for publication.
- [ ] Do we support non-English PRDs in MVP? (Lean: no, English-only for v1.)

---

## 15. Appendix — why this plays to Shandar's strengths

- **PWP is the spec.** TRACE is essentially a PWP-compliance tool. The framework already exists; TRACE is the UI layer.
- **IX Framework slots in naturally** as the stretch tagging system.
- **Neubrutalist design system** from `shandar-os` skill is already production-ready for the stretch viewer.
- **Fast React/Vite/Tailwind execution** covers both CLI (ink) and web (viewer).
- **`git-clean` skill** applies directly to the submission repo hygiene.
- **Artefact-first communication style** — TRACE literally makes artefacts better.

---

## 16. Problem-statement fit & rubric alignment

### Problem statement: "Build For What's Next"

TRACE is a direct answer to the hackathon's headline prompt. A living, bidirectional PRD is a workflow that **only makes sense because Claude Code exists.** Before agentic coding, a PRD was static because the builder was the only source of decisions — so nobody needed it updated in-flight. With Claude Code, a second decision-maker sits inside the loop, making real calls the human didn't write down. TRACE is the doc surface for that new reality. It's not a markdown tool; it's the artefact layer for human-agent co-authorship.

**One-line pitch against the theme:** *"A living PRD. The workflow didn't exist before because Claude Code didn't exist before."*

### Rubric alignment

| Category | Weight | How TRACE scores |
|---|---|---|
| Impact | 30% | Every Claude Code user has the stale-PRD problem. Fit to "Build For What's Next" is direct, not shoehorned. |
| Demo | 25% | Split-screen bidirectional write-back is literally visual. The PRD morphing on screen is the demo. |
| **Opus 4.7 Use** | **25%** | **Primary lever — see below.** |
| Depth & Execution | 20% | Hooks + sub-agent + skill + CLI + optional viewer. Not a one-trick prompt; it's a Claude-Code-native plugin. |

### The 25% Opus 4.7 Use play

This is where TRACE has to surface something that even Anthropic finds interesting. Candidates:

- **Proposer as an isolated sub-agent.** The proposer gets the diff plus a single PRD section, nothing else. Clean context per proposal, no pollution of the main coding agent. This showcases sub-agent context isolation as a *product primitive*, not just a dev convenience.
- **Skills composing unexpectedly.** TRACE's skill reads `TRACE.md`; `hackathon-discipline` reads the demo script section; `git-clean` reads the decision log. One doc, multiple skills reasoning against it. That's a capability story.
- **Hooks as the trigger surface.** PostToolUse / PostCommit / SessionEnd as the entire event system — no scheduler, no queue, no daemon. Zero-infra observability of an agentic build.
- **Managed Agents candidate (optional).** If Thursday's talk confirms fit, the proposer becomes a Managed Agent — long-running, stateful across sessions. Chases the $5K side prize without distorting the main build.

**Rule:** optimise Impact + Demo + Opus-Use (80% of the score). Depth follows naturally from doing those three honestly. Do not chase Depth by adding features.

---

*Plan ready. Execute mode next.*
