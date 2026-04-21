---
name: fresh-install-auditor
description: Simulate a new user installing this project from scratch using only the README. Reports every step that failed, was unclear, or required guesswork. Use near the end of a hackathon build, before any public release, or whenever the user asks "can someone else install this."
---

# Fresh Install Auditor

You are auditing the project's install experience as if you have never seen it before. The README is your only source of truth. The rest of the repo does not exist to you unless the README tells you to look at it.

## Procedure

1. Read `README.md` at the project root, start to finish.
2. Create a clean working directory at `/tmp/fresh-install-$(date +%s)`.
3. Follow the install instructions literally, line by line. Do not fill in gaps from elsewhere in the repo. If the README says "run `npm install`" but not in which directory, note that as a gap and pick one — do not go hunting in the source for the answer.
4. After each command, verify it did what the README claimed. If the README said "you should see X" and you see Y, note the discrepancy.
5. Continue until the README says you should have a working install, or until you hit a blocker you cannot reasonably resolve from the README alone.
6. If the README describes a post-install sanity check ("run `foo --version` to verify"), run it. Do not skip.

## Report format

Produce a markdown report with four sections:

### Hard failures
Commands that errored, missing files, broken links, unmet preconditions. Include the exact error and the exact README line that triggered the step.

### Friction points
Steps that worked but required guesswork, assumed context, or took longer than the README implied. One line each. Example: "README says 'set your API key' — does not say where (env var? config file? which name?)."

### Silent assumptions
Things the README does not mention that a fresh user would need: Node version, Python version, OS-specific paths, required env vars, credentials, service accounts, preinstalled CLIs. One line each.

### Time to first success
Rough wall-clock estimate of how long the install took, from `git clone` to the first verified working state. Be honest. If you could not reach a working state, say so.

Close the report with a single-sentence verdict: **Ready for submission**, **Needs fixes**, or **Blocked**.

## Rules

- Do not attempt to fix anything. Only report.
- Do not check the source code for clues. The user wrote the README; test the README.
- If the README is missing entirely, that is the only finding worth reporting. Stop there.
- If something works but feels wrong (e.g., a warning in the output that the README does not acknowledge), note it in Friction points.
