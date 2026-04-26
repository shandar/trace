# TRACE Demo — Recording Script

**Record:** Saturday 25 April, evening IST
**Runtime target:** 2:50 · **Hard cap:** 3:00
**Upload:** YouTube Unlisted

---

## Part 1 — Pre-flight (15 min)

### Environment

1. Close Slack, Chrome tabs, email, Spotify.
2. macOS → Focus → Do Not Disturb, 1 hour.
3. Plug in to power. Silence phone.
4. Mic test: record 10s, listen for hum.

### Screen layout

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   VS CODE (top half)                                │
│   File: ~/demo-target/TRACE.md                      │
│   16pt · sidebar hidden (Cmd+B) · auto-save ON      │
│                                                     │
├──────────────────────────┬──────────────────────────┤
│   TERMINAL 1 (bottom-L)  │  TERMINAL 2 (bottom-R)   │
│   Claude Code session    │  tail -f pending.jsonl   │
│   16pt · dark theme      │  16pt · dark theme       │
└──────────────────────────┴──────────────────────────┘
```

- VS Code stays top-half the entire recording. Cmd+Tab to focus it for Beat 5; don't resize.
- Both terminals: 16pt minimum. Dark theme.
- If your prompt is long (`user@MacBook ~/...`), shorten in zsh: `PROMPT='%1~ %% '`.

### Scratch directory — full reset

```bash
rm -rf ~/demo-target
mkdir ~/demo-target
cd ~/demo-target
cp -r ~/Downloads/Trace/.claude .
git init -q && echo "# Demo Target" > README.md && git add -A && git commit -qm "initial"
mkdir -p .trace && : > .trace/pending.jsonl

# Verify clean state
ls -la
# Expect: .claude/  .git/  .trace/  README.md
# (NO TRACE.md, NO greet.js)

cat .trace/pending.jsonl
# Expect: empty

# Verify env
echo $ANTHROPIC_API_KEY | head -c 15     # expect sk-ant-api03-...
which trace-prd                          # expect a real path
```

In **Terminal 2**, start the tail:
```bash
cd ~/demo-target
tail -f .trace/pending.jsonl
```

In **VS Code**, open the `~/demo-target` folder. No file open yet (TRACE.md doesn't exist until Beat 2).

---

## Part 2 — The take

### Final check (30 seconds before recording)

- [ ] Terminal 1: in `~/demo-target`, fresh shell
- [ ] Terminal 2: tailing pending.jsonl, empty
- [ ] VS Code: `~/demo-target` folder open, no file shown yet
- [ ] Recorder armed: QuickTime → New Screen Recording → mic = Internal Microphone
- [ ] Phone face down

Hit record. Hold 2 seconds of silence before speaking — gives you trim buffer.

---

### Beat 1 — Hook (0:00–0:25)

**On screen:** All three panes visible. Terminals empty. VS Code empty.

**Voice (unhurried, confident):**

> "Every engineer writes a PRD, starts building, and watches it go stale within the hour.
>
> The PRD becomes a tombstone. The code is the only source of truth. Every tradeoff, every broken assumption, every open question — disappears into commit messages.
>
> I'm Shandar. I'm a UX designer. I built a tool that fixes this."

*Pause 1 beat. Hands to keyboard.*

---

### Beat 2 — Setup (0:25–0:45)

**Voice:**

> "This is TRACE. One command scaffolds a living PRD."

**Type in Terminal 1:**
```bash
trace-prd init
```

*(TRACE.md appears in `~/demo-target`. Cmd+Tab to VS Code, open `TRACE.md`. Scroll so section headers are visible.)*

**Voice:**

> "Then I start Claude Code — nothing special, just like any project."

**Back to Terminal 1:**
```bash
claude
```

*(Welcome prompt appears.)*

---

### Beat 3 — Live loop (0:45–1:50)

**Paste into Claude Code (don't narrate while typing):**

> Create a `greet.js` script here that reads a name from either a `--name` CLI flag OR a `NAME` environment variable. If both are set, only one can win. Pick one order and add an inline comment explaining why you picked it over the other.

**Voice (begin as Claude Code starts working — covers the 30–45s of execution):**

> "Every time Claude Code takes an action, a hook fires. The event gets piped into Opus 4.7 sub-agents running in parallel.
>
> The first asks: what did we decide this turn?
>
> The second asks: what assumption did we just break — or validate?
>
> The third asks: what open question did this surface?
>
> Same event. Different lenses. Different answers."

*(Claude Code finishes. 1–2s pause. Proposals stream into Terminal 2. Don't talk over.)*

**Voice (after proposals land, ~3s of silent reading):**

> "One turn. Multiple proposals. Different sections. In parallel."

*(Hold 2 more seconds on Terminal 2.)*

> *Note: Rehearsal produced 2 proposals (Decision Log + Assumption Ledger), no Open Questions. The narration above adapts cleanly to 2 or 3. If 3 land, "multiple" still works.*

---

### Beat 4 — The money beat (1:50–2:35)

**Stop the tail in Terminal 2 first** to prevent any redraw glitch when review rewrites pending.jsonl:

Press `Ctrl+C` in Terminal 2. *(Silent, 1 second.)*

**In Terminal 1 — exit Claude Code, run review:**

```bash
/exit
trace-prd review
```

*(First proposal appears — Decision Log.)*

**Voice:**

> "I review each one. Accept what's real."

*(Press `a`.)*

*(Second proposal appears — Assumption Ledger. **THIS IS THE MONEY MOMENT.** Let the viewer READ it for 4 full seconds before speaking.)*

**Voice (slower, deliberate, weight on each line):**

> "Notice this one.
>
> The model didn't just summarize what happened. It tested its own choice — actually ran the script — and validated the behavior in the proposal itself.
>
> That's not a log. That's verification."

*(Press `a`. If a third proposal exists, press `a` or `s` based on quality. Either is fine.)*

---

### Beat 5 — Payoff (2:35–2:50)

**Cmd+Tab to VS Code.** TRACE.md is already open from Beat 2, auto-reloaded.

**Scroll slowly:** Decision Log shows a new bullet. Assumption Ledger shows a new bullet.

**Voice (over the scroll):**

> "The PRD just updated itself. Not from memory. From evidence."

---

### Beat 6 — Close (2:50–2:55)

**Final frame:** VS Code window with the populated sections. Hold still.

**Voice:**

> "TRACE. Every decision traced from intent to ship."

*(Hold 1 second on the final frame.)*

**Stop recording.**

---

## Part 3 — Post-recording

### Immediate

1. Save as `~/Desktop/trace-demo-take-1.mov`.
2. Water. 2 minutes away from screen.
3. Watch once through, no pausing, no scrubbing.

### Assessment

- [ ] Under 3:00
- [ ] First line audible and clear
- [ ] "UX designer" line landed by 0:25
- [ ] Terminal 2 proposals legible as they streamed
- [ ] Assumption Ledger proposal readable on screen for 4+ seconds
- [ ] TRACE.md scroll at end shows the new bullets
- [ ] "Opus 4.7" said at least once
- [ ] No dead air > 4 seconds
- [ ] No visible errors or bugs on screen
- [ ] Clean stop, no awkward trailing silence

### Decision rule

| Boxes checked | Action |
|---|---|
| 9–10 | Keep. Do Take 2 anyway for safety. Pick the better one. |
| 6–8 | One specific fixable issue → Take 2 targeting it. |
| 0–5 | Environmental problem (mic, layout, prompt). Fix, then retake. |

**Never do a Take 3 unless Take 2 has one specific fixable issue.** Take 3 is almost always worse than Take 2.

---

## Part 4 — Edit & upload

### Trim (iMovie or QuickTime)

1. Cut the 2s buffer at start.
2. Cut any silence > 1.5s.
3. **Optional zoom** at ~1:45 on Terminal 2 when proposals land.
4. **Optional zoom** at ~2:00 on the Assumption Ledger proposal text.
5. Export 1080p.

### YouTube

- Title: `TRACE — Built with Opus 4.7 Hackathon`
- Description: *Every decision traced from intent to ship. A Claude Code plugin that turns your PRD into a living document. github.com/shandar/trace*
- Visibility: **Unlisted**
- Thumbnail: `trace-banner.png` from the repo
- Copy `youtu.be/...` short link → paste into `SUBMISSION.md`

---

## Emergency fallbacks

**Only 1 proposal appears (or 0):**
- 1 proposal: push through, narration handles it. Beat 4 still works on a single accept.
- 0 proposals: hook didn't fire. Stop recording. Verify API key is exported in the shell that launched Claude Code. Verify `.claude/settings.json` exists in `~/demo-target`. Retake.

**You flub a line in the first 30 seconds:**
Stop, restart recording. Early flubs are cheap to retake.

**You flub a line after 1:00:**
Push through. Edit in post. Never abandon mid-take after the 1-minute mark.

**Audio picks up room noise:**
Fix in post. iMovie can isolate audio, record voiceover separately, remux video + new audio.
