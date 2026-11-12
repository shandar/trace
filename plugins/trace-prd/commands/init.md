---
description: Start a living PRD (TRACE.md) in this project
---

Set up TRACE for this project.

1. Check whether `TRACE.md` exists at the project root. If it does, tell the user and ask whether to replace it. Only replace it after a clear yes; otherwise stop here.

2. Create `TRACE.md` at the project root with exactly this content:

   ```markdown
   # TRACE: Living PRD

   ## Intent

   <!-- What are you building and why? -->

   ## Users

   <!-- Who is this for, and what job are they hiring it to do? -->

   ## In scope

   <!-- What must ship? -->

   ## Out of scope

   <!-- What are you explicitly not doing? -->

   ## Open Questions

   <!-- Unknowns that could change scope, design, or direction. -->

   ## Decision Log

   <!-- Choices that shape the product, and why. -->

   ## Assumption Ledger

   <!-- What the plan took for granted, and what the build showed. -->

   <!-- trace-prd: last-review none -->
   ```

3. Ask the user, in one question, what they are building and why. Write their answer into the **Intent** section in their own words, replacing the placeholder comment. If they would rather fill it in later, leave the placeholder.

4. If the user already described goals, users, or scope earlier in this conversation, offer to fill in those sections too. Do not invent content they have not given you.

5. Finish with two short lines:
   - While you work in this project, Claude will offer to log decisions, assumptions and open questions to TRACE.md at natural breaks. Nothing is written without a yes.
   - Run `/trace-prd:review` any time to catch the PRD up with recent commits.

$ARGUMENTS
