# TRACE Hackathon Playbook

**Built with Opus 4.7 · Tue 21 Apr → Mon 27 Apr, 2026**
A working checklist. Tick things off. Skip what doesn't apply.

---

## Confirmed event facts (pulled from the details page, Apr 21)

- **Official dates:** Tue 21 Apr (kickoff) → Sun 26 Apr 8 PM EST (submission) → Mon 27 + Tue 28 (judging)
- **IST deadline:** Mon 27 Apr, 6:30 AM IST (submission must be in by Sun 8 PM EST)
- **Format:** Fully virtual, 500 builders max, team cap 2
- **Discord:** anthropic.com/discord — join ASAP, get custom hackathon role assigned
- **Submission needs:**
  - 3-minute demo video (YouTube, Loom, or similar) — up from the 90s we planned
  - GitHub repo (fully open source)
  - Written description 100–200 words
- **Credits:** $500 API credits per participant · prize pool below

### Key times in IST

| When (IST) | What | Priority |
|---|---|---|
| Tue 21, 10:30 PM | **Kickoff** — rules, prizes, judging, tech talks | **MANDATORY** |
| Tue 21, 11:00 PM | Hacking officially begins | **MANDATORY** |
| Wed 22, 9:30 PM | **AMA with Thariq Shihipar (Claude Code MTS)** | **MANDATORY** |
| Thu 23, 8:30 PM | Michael Cohen on Claude Managed Agents | High (if chasing Managed Agents prize) |
| Fri 24, 9:30 PM | Mike Brown — 1st place Opus 4.6 winner, insights | High — free strategic intel |
| Sun 26, 9:30 PM | Michal Nedoszytko — 3rd place 4.6 winner | Optional |
| Daily, 2:30–3:30 AM | Anthropic office hours | Skip most; one or two for questions |
| Mon 27, 6:30 AM | **Submission deadline** | Submit by 2 AM IST at the latest |

### Judging rubric (memorize this)

| Category | Weight | What to optimize |
|---|---|---|
| Impact | 30% | Real-world potential. Who benefits? Fit to problem statement. |
| Demo | 25% | Working, holds up live, cool to watch |
| Opus 4.7 Use | 25% | Creative use. Surface capabilities that surprise even Anthropic |
| Depth & Execution | 20% | Pushed past first idea. Real craft. |

### Problem statement fit

TRACE → **"Build For What's Next"** — a living PRD is a workflow that only makes sense because Claude Code exists. Frame the pitch here.

### Prizes

- 1st: $50K credits · 2nd: $30K · 3rd: $10K
- Most Creative Opus 4.7 Exploration: $5K
- Keep Thinking Prize: $5K
- **Best Use of Claude Managed Agents: $5K** — TRACE's proposer sub-agent could be a Managed Agent. Worth considering if Thursday's talk confirms fit.

### Rules to reread at kickoff

- Open source — every part, approved license
- **"New work only, from scratch during hackathon, no previous work"** — verify at kickoff that planning artefacts (PRD, README, scaffold) are acceptable. If mods say no, stash the scaffold and regenerate after 11 PM IST.
- Disqualifications: policy violations, unlicensed assets

---

## Before hacking begins (Tue, before 11 PM IST)

### Environment

- [ ] `node --version` confirm 20+
- [ ] `tsc --version`, `claude --version`
- [ ] `cd ~/Downloads/Trace && claude` launches cleanly and sees the `.claude/` kit
- [ ] `ANTHROPIC_API_KEY` exported
- [ ] Terminal theme, font, window size locked — what you see tonight is what judges see Sunday
- [ ] Screen recording + audio tested
- [ ] Second monitor or split-screen verified

### Admin

- [ ] **Join Discord at anthropic.com/discord** — get the hackathon role
- [ ] Put all 5 key IST times (above) on calendar with alarms
- [ ] Kickoff at 10:30 PM IST — attend
- [ ] Solo or pair? If pair, message them now
- [ ] CLI name call: `@affordance/trace` vs `trace-cli` for npm. (Local CLI stays `trace`.)

### Sharpen the spec

- [ ] Reread `TRACE.md`. Note: section 10 build plan and section 11 demo script still reflect pre-event assumptions (5 days, 90s video). Update both with Claude Code on day 1 as your first dogfooding moment.
- [ ] **Rewrite demo script to 3 minutes.** Expand current beats, don't add new ones. Pacing at 3 min: 30s hook + setup, 90s core loop demo, 60s payoff + stretch or tease.
- [ ] Rank stretch items 1–5. Bottom two cut by Friday.

### Strategic prep (new)

- [ ] Draft your 100-word written description. Save as `SUBMISSION.md` — update through the week.
- [ ] Pick your angle on "Opus 4.7 Use 25%." What surprises them? Examples to think through: sub-agents with isolated context for diff analysis, managed agents for the proposer, creative use of hooks, skills composing unexpectedly.
- [ ] Frame TRACE's 1-line pitch against "Build For What's Next": *"A living PRD. The workflow doesn't exist yet because Claude Code didn't exist yet."*

### Body

- [ ] Eat a real dinner before 9 PM IST
- [ ] Tell the household
- [ ] Coffee/snacks stocked
- [ ] Ideally nap 8–10 PM IST before kickoff

---

## After hacking begins

### Daily rhythm

**Every morning (first 30 min)**
- [ ] Run `/demo-check`
- [ ] Pick today's *one* must-ship
- [ ] One-liner post: "Day N of Trace, shipping X today"

**Throughout the day**
- [ ] Trust `hackathon-discipline` when it fires
- [ ] Commit every 30–45 min, messy is fine
- [ ] Decision-log one-liners as you make real calls

**Every evening (last 30 min)**
- [ ] Run `/daily-clip`, post it
- [ ] Add one tradeoff line to PRD decision log
- [ ] Update `SUBMISSION.md` draft (aim for 150 words by Friday)

### Day by day

| Day | Date | Focus | Evening gate |
|---|---|---|---|
| Kickoff | Tue 21 night (post-11 PM IST) | Attend kickoff → start scaffolding → `trace init` stub working | Fresh shell runs `trace init` |
| 1 | Wed 22 | Core loop: hook → proposer → review | Attend Thariq AMA 9:30 PM · Real Claude Code session triggers real proposed edit |
| 2 | Thu 23 | End-to-end working + rough demo cut | Attend Managed Agents talk 8:30 PM · 3-min rough recording exists |
| 3 | Fri 24 | Stretch OR polish (discipline check) | Attend Mike Brown talk 9:30 PM · **No new surface area after 2 AM IST Sat** |
| 4 | Sat 25 | Feature freeze · audit · final cut | `fresh-install-auditor` clean · Final demo locked |
| 5 | Sun 26 | Submit early · buffer for fixes | **Submit by 2 AM IST Mon — 4h buffer to deadline** |

### Non-negotiables

- [ ] Eat real meals. Sleep 5h+ every night.
- [ ] Don't rewrite the PRD manually — let TRACE update it as decisions land. That's literally the product.
- [ ] Attend the 3 sessions marked mandatory/high above. Watch the 4.6 winner's talk live Friday.
- [ ] Submit early. Always replace if you finish more. **Target 2 AM IST Mon, not 6:30 AM.**

---

## Sunday (day 5) hard gates before submit

- [ ] Run `fresh-install-auditor` agent. Fix every hard failure.
- [ ] Final 3-min demo recording. Clean audio. No UI debris.
- [ ] README honest about what works
- [ ] GitHub public, open source license committed (MIT already in package.json — verify)
- [ ] Clean commit history (`git-clean` skill)
- [ ] `SUBMISSION.md` polished to 150 words
- [ ] Submission form filled: video URL, GitHub URL, description
- [ ] **Submitted by 2 AM IST Monday**

### If chasing the Managed Agents prize (optional)

- [ ] Does the proposer sub-agent genuinely benefit from being a Managed Agent (long-running, meaningful handoff)?
- [ ] If yes: mention explicitly in written description + one demo beat
- [ ] If no: leave it. Forcing the fit loses the main rubric.

---

## If things go sideways

- **Claude Code stops cooperating** — new session, same directory. The `.claude/` kit reloads.
- **Stuck on one bug for 90 min** — stop. Hardcode. Log it. Move on.
- **Scope creep** — if you're overriding `hackathon-discipline` three times a day, the PRD is lying. Cut, don't push through.
- **Demo feels flat on day 3** — fix is almost never "more features." Usually "clearer first 10 seconds."
- **A judge joins an office hour** — don't pitch, just demo. Their feedback in a 5-min window beats a day of guessing.
- **Mods say scaffold counts as prior work** — stash the scaffold, regenerate equivalents after 11 PM IST Tue, keep going.

---

*Last update: Tue 21 Apr, post-details-page read. Update this file as the week unfolds.*
