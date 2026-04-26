# TRACE — Demo Script v2

*3:00 target, 3:00 hard cap · recording Saturday · uploaded to YouTube Unlisted*

---

## Framing

**The rubric we're optimizing for:**
- Impact 30% — show the problem, show who wins
- Demo 25% — it has to hold up live, be cool to watch
- Opus 4.7 Use 25% — name the model, show the capability that surprises
- Depth 20% — show that this was wrestled with, not hacked

**The story arc:**
1. Problem (PRDs go stale) — 20s
2. Setup (fresh project, empty PRD) — 20s
3. Live loop (Claude Code builds, TRACE watches, proposals land) — 90s
4. The money beat (multi-lens synthesis on a real decision) — 30s
5. Payoff (scroll the finished PRD) — 15s
6. Close (designer framing + credits) — 15s

**The task Claude Code performs on camera:**
Not `--version`. Needs to be a *real* engineering decision with visible tradeoffs. Proposal from Day 4 dogfood (`trace init` becoming interactive) is the template. Proposed task:

> "Make `trace-prd init` refuse to overwrite a non-empty TRACE.md unless `--force` is passed. Print a helpful error otherwise."

That's: a real behavior change (Decision Log lens fires), a prior assumption being replaced (Assumption lens fires), and a design question that could go 2 ways — `--force` vs interactive prompt (Question lens fires).

One turn, three lenses, all three proposals visibly distinct. That's the demo gold.

---

## Screen setup

```
┌─────────────────────────────────────────────────────────────┐
│  VS CODE — TRACE.md open, scrolled to Decision Log          │
│  Auto-save ON. Font 16pt. Sidebar hidden.                   │
├──────────────────────────────┬──────────────────────────────┤
│  TERMINAL 1 (left, 80 cols)  │  TERMINAL 2 (right, 60 cols) │
│  Claude Code session         │  tail -f .trace/pending.jsonl│
│  16pt font, dark theme       │  16pt font, dark theme       │
│                              │  Pretty-print via jq if tight│
└──────────────────────────────┴──────────────────────────────┘
```

**Pre-flight (not recorded):**
```bash
cd ~/demo-project       # a fresh scratch directory, NOT ~/Downloads/Trace
cp -r ~/Downloads/Trace/.claude ./   # copy the hook config
trace-prd init          # fresh empty TRACE.md
: > .trace/pending.jsonl
# Terminal 2: tail -f .trace/pending.jsonl | jq -c .
# Arm screen recorder
echo $ANTHROPIC_API_KEY | head -c 15  # verify
```

---

## Beat 1 — Hook (0:00–0:20)

**On screen:** VS Code full-width, TRACE.md with empty section headers.

**Voice:**
> "Every engineer writes a PRD, starts building, and watches it go stale within an hour. The PRD becomes a tombstone. The code is the only source of truth, and every tradeoff, every broken assumption, every open question disappears into commit messages."

> "I'm Shandar. I'm a UX designer. I built a tool that fixes this."

**(Pause 1 beat before Beat 2.)**

*Why this open:* names the problem, names the pain, and reveals the unlikely-crossover before the tech shows up. Judges who've watched 30 hackathon demos today will notice.

---

## Beat 2 — Setup (0:20–0:40)

**On screen:** Split-screen view reveals. Terminal 1 is fresh and empty.

**Voice:**
> "This is TRACE. One command scaffolds a structured living PRD."

**Type in Terminal 1:**
```bash
trace-prd init
```

*(Beat. TRACE.md appears in VS Code with section headers.)*

**Voice:**
> "Then I start Claude Code normally."

**Type in Terminal 1:**
```bash
claude
```

*(Claude Code welcome prompt appears. Terminal 2's `tail -f` is visible and empty on the right.)*

---

## Beat 3 — Live loop (0:40–2:10)

**On screen:** All three panes visible. Attention flows terminal → right pane → doc → right pane.

**Voice (over the setup):**
> "Every time Claude Code takes an action, a hook fires. Three Opus 4.7 sub-agents read the action in parallel. Each asks a different question."

**Paste into Claude Code:**
> Make `trace-prd init` refuse to overwrite a non-empty TRACE.md unless `--force` is passed. Print a helpful error otherwise.

*(Claude Code works — reads file, edits, runs build. Takes ~30s. During this, Terminal 2 stays empty — proposals come at Stop, not PostToolUse.)*

**Voice (over Claude Code's work, unhurried):**
> "The first sub-agent asks: what was decided this turn?"
> "The second asks: what assumption did we just validate, or break?"
> "The third asks: what open question did this surface?"
> "Same event. Three lenses. In parallel."

*(Claude Code finishes its turn. ~1-2 second pause. Three JSON blobs stream into Terminal 2 simultaneously.)*

**Voice (as proposals land):**
> "One turn. Three proposals. Different lenses, different sections."

*(Let the viewer read them for ~5 seconds. Don't narrate the JSON.)*

---

## Beat 4 — The money beat (2:10–2:40)

**Type in Terminal 1:**
```bash
trace-prd review
```

*(First proposal appears — Decision Log.)*

**Voice:**
> "I review each one. Accept what's real..."

*(Press `[a]`. Second proposal — Assumption Ledger. This is the money proposal. Let the viewer read it.)*

**Voice (slower, let the line land):**
> "This one is the thing. It noticed the prior implicit assumption. It detected that the current turn contradicted it. It named the architectural consequence. Not a log. An *inference*."

*(Press `[a]`. Third proposal — Open Questions.)*

**Voice:**
> "Skip what's noise. Accept what matters."

*(Press `[a]` or `[s]` based on the proposal's actual quality.)*

---

## Beat 5 — Payoff (2:40–2:55)

**Attention snaps to VS Code.** Scroll through TRACE.md — Decision Log now has a bullet, Assumption Ledger has a bullet, Open Questions has a bullet. **Three sections. Three lenses. Live.**

**Voice (over the scroll):**
> "The PRD just updated itself. Not from memory. From evidence."

---

## Beat 6 — Close (2:55–3:00)

**On screen:** Scroll lands at bottom of TRACE.md, or cut to title card with `TRACE` wordmark + `github.com/shandar/trace`.

**Voice:**
> "TRACE. Built with Claude Code and Opus 4.7. The PRD in this repo was written by TRACE itself."

*(Final frame holds for 1 second. End.)*

---

## What NOT to do on camera

- **Don't read the JSON blobs aloud.** The viewer should glance, not study. They're texture.
- **Don't explain the hook system.** The visible fact that proposals appear is the explanation.
- **Don't cross 3:00.** Hard cap.
- **Don't mouse-highlight things while explaining.** Let the screen do the work.
- **Don't re-record on a single flub under 30 seconds in.** Push through. Cut later.

## Signal killers — any 2 of these = re-take

- [ ] Dead air > 4 seconds
- [ ] A visible bug or error that isn't the point of the beat
- [ ] Audio peaks, distortion, or keyboard bleed
- [ ] Total length under 2:20 or over 3:00
- [ ] Opus 4.7 never named in voiceover
- [ ] The designer framing isn't in the first 20 seconds

## Take plan

- **Take 1:** full run, messy, no stopping. Reference take.
- **Take 2:** full run, tighter. Usually the keeper.
- **Take 3:** only if Take 2 has a fixable issue.
- After Take 3, stop. Editing fixes more than re-shooting.

## Post-production checklist

- [ ] Trim to under 3:00
- [ ] Normalize audio levels
- [ ] One subtle cut at the 1:40 mark where Claude Code is working — skip the boring middle if needed
- [ ] Optional: zoom in on the Assumption Ledger proposal at 2:20-ish so the text is readable
- [ ] Export at 1080p or 4K, whichever renders cleaner on YouTube
- [ ] Upload to YouTube Unlisted, not Public — submission requires the link, and Unlisted keeps it off your channel feed

---

## Open questions before Saturday

- [ ] Confirm `trace-prd` rename is committed and the binary actually works before recording
- [ ] Test the exact prompt ("Make `trace-prd init` refuse to overwrite...") on a fresh Claude Code session — make sure it actually produces 3 distinct lens proposals, not 1 or 2
- [ ] Decide: screen-recorder tool (QuickTime vs. ScreenFlow vs. OBS)
- [ ] Decide: voiceover recorded live or separately in post? (Live is safer; separate lets you re-take just the audio)
