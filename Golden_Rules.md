# Golden Rules of Programming — Asimov's Laws of AI Coding
## boxMind Project — Claude Code Compliance Rules
## Created: 2026-02-26
## Purpose: Single source of truth for ALL coding rules Claude must follow.

---

These rules are **NON-NEGOTIABLE**. Every rule exists because of a real mistake
or a proven best practice. Claude MUST follow ALL of them for EVERY code change.
Violating any rule is a **FAILURE**.

The rules are organized in three tiers:
- **Golden Rules (1–22):** Universal programming principles that apply to every task.
- **Hard Rules (HR1–HR6):** Specific technical rules born from real bugs in this project.
- **Total: 28 rules.**

---

## GOLDEN RULES (Universal Principles)

### RULE 1: Plan First — MANDATORY
> Never write code without showing the user a plan first.

- Present the approach in bullets or use plan mode.
- Wait for the user to say "go" or "approved" before touching any code.
- WHY: Rewriting wrong code costs 10x more than spending 2 minutes planning.

### RULE 2: Do NOT Rush Into Implementation
> Stop. Think. Read. THEN code.

- Claude's natural tendency is to immediately start writing code. Resist this.
- Read the relevant files first. Understand the context. Propose a solution.
- Speed that produces wrong code is slower than carefulness that produces right code.

### RULE 3: Understand the WHOLE Picture
> Never change code you don't fully understand.

- Before modifying anything, read the entire surrounding context — the function,
  the class, the file, the callers.
- A fix in one place can silently break three other places.
- If you don't understand how something connects, ask the user.

### RULE 4: Use EXISTING Code Patterns
> Follow the codebase's conventions. Do not invent new patterns.

- If the project already has a way of doing logging, config loading, error handling,
  etc., use that same pattern.
- Only create new patterns when explicitly told to or when nothing exists.
- WHY: Consistency makes code readable. Mixed patterns make it confusing.

### RULE 5: Say "I Don't Know" — Ask When in Doubt
> A question costs seconds. A wrong guess costs hours.

- If you are unsure about requirements, architecture, or approach — ASK.
- Never bluff. Never assume. The user would rather answer a question than debug wrong code.
- "I'm not sure about X, could you clarify?" is always acceptable.

### RULE 6: KISS — Keep It Simple, Stupid
> The best solution is the simplest one that works.

- No over-engineering. No unnecessary abstractions. No "future-proofing."
- If 5 lines solve the problem, do NOT write a 50-line framework.
- Complexity is a cost, not a feature. Every line of code is a liability.

### RULE 7: DRY — Don't Repeat Yourself
> If the same logic exists in two places, extract it into one.

- Duplicated logic means duplicated bugs.
- BUT: Rule 6 (KISS) takes priority. Don't over-abstract for the sake of DRY.
  Three similar lines are better than a premature abstraction.

### RULE 8: Double-Check Code — Validate Line Counts
> After every edit, verify you didn't delete or duplicate code.

- Compare old vs new. Count the lines. Read the final result.
- Did you accidentally remove an important block? Did you duplicate a section?
- The Edit tool can silently eat code if the old_string match is wrong.
- READ the result before telling the user it's done.

### RULE 9: If It's Not Broken, Don't Fix It
> Touch ONLY what needs to be touched. Leave the rest alone.

- Do NOT "improve" or "clean up" working code while fixing a bug.
- Refactoring for aesthetics while solving a real problem introduces new bugs.
- The scope of your change should match the scope of the request.

### RULE 10: Always Verify You Have the LATEST Code
> Never edit from memory. Always re-read the file first.

- Files change: the user edits them, git pull updates them, other tools modify them.
- Before every edit, use the Read tool to get the current content.
- Editing based on stale context is how you overwrite the user's work.

### RULE 11: Do NOT Fix One Issue to Cause Others
> Every change must be evaluated for side effects.

- After making a change, ask: "What else depends on this? What could break?"
- Check callers, importers, tests, config files.
- If you're not sure about side effects, ask the user or run the QA agent.

### RULE 12: Root Cause Analysis — No Brute-Forcing
> Find the WHY before writing the fix.

- Do NOT guess-and-check. Do NOT retry the same thing hoping it works.
- If something fails, understand the root cause before proposing a solution.
- A band-aid today becomes a mystery bug tomorrow.

### RULE 13: Show the Problem Before Suggesting a Fix
> Never say "your code should be X" without showing what's wrong and why.

- Point to the exact line. Explain what is wrong. Explain WHY it's wrong.
- THEN propose the fix.
- The user needs to understand the problem to evaluate the solution.

### RULE 14: Keep Records of All Work and Lessons Learned
> Every bug fixed, every lesson learned, every task done — document it.

- Update memory files with insights from bugs and fixes.
- Remind the user periodically to review completed work.
- Future sessions should benefit from past mistakes.

### RULE 15: Write Secure Code
> Balance practicality with security. No hardcoded secrets. No injection vectors.

- No hardcoded tokens, passwords, or API keys in source code.
- Validate all inputs at system boundaries (user input, external APIs).
- Follow OWASP principles, but don't add security theater.

### RULE 16: Always Use Debug Logging
> Every significant action must be traceable in logs.

- Server-side: use debug_log or logger with appropriate levels.
- Client-side: use mylog.
- Silent code is undebuggable code. If it doesn't log, it didn't happen.

### RULE 17: Write Tests BEFORE Implementation When Possible
> Test-first catches bugs before they exist.

- For new functions or bug fixes, write the test first. Confirm it fails.
- Then write the code until the test passes.
- Do NOT modify the test to make it pass — modify the CODE.
- Tests and implementation should be committed separately when practical.

### RULE 18: Commit Early and Often — One Task Per Commit
> Small commits are easy to debug. Large commits hide bugs.

- After completing each discrete task, commit immediately. Do NOT batch.
- Each commit should compile and work on its own.
- If something breaks later, small commits make bisection easy.

### RULE 19: All AI-Generated Code Must Be Reviewed by the User
> Claude's code is a DRAFT until the user approves it.

- Never assume your code is correct. Present it, explain it, wait for review.
- Especially critical for code that runs on expensive GPU servers or production.
- The user is the final authority on whether code ships.

### RULE 20: Manage Context Aggressively
> Long conversations cause Claude to lose track. Fight context decay.

- When the conversation is long, RE-READ files before editing — don't trust memory.
- If context is getting large, suggest the user /clear and start a focused session.
- Re-read the CLAUDE.md rules if the session has been running for a while.

### RULE 21: Test Edge Cases and Boundary Conditions Explicitly
> Every conditional has an edge case. Find it before the user does.

- After writing code, list the edge cases and verify each one.
- Common traps: off-by-one, empty input, zero division, first/last iteration,
  None/null values, negative numbers, maximum values.
- If a function takes a number, what happens at 0? At -1? At MAX_INT?

### RULE 22: One Change at a Time — Atomic Changes Only
> Do ONE thing per edit. If it breaks, you know exactly what caused it.

- Do NOT combine multiple unrelated fixes in one edit.
- If the user asks for 3 things, do them as 3 separate steps.
- A big rewrite that breaks is impossible to debug. Three small changes are easy.

---

## HARD RULES (Specific Technical Rules from Real Bugs)

These rules were added after Claude produced real bugs in this project.
Each rule maps to a specific failure that cost real debugging time.

### HARD RULE 1: Never Trust "Grouping by Purpose" as Correct Nesting
> Related code does NOT mean same scope.

- Just because code is "related" (logging, reporting, emails) does NOT mean
  it belongs inside the same if-block.
- Before placing code inside ANY existing block, ask: "Does this new code
  ACTUALLY need the outer condition?" If not, it goes OUTSIDE.
- **Origin:** Progress email was nested inside a log_interval block, causing
  emails to fire every 3000 steps instead of every 1000 steps.

### HARD RULE 2: Always Do a Dry-Run Trace Before Delivering Code
> If you can't trace it, it's not ready.

- After writing or modifying code, MANUALLY TRACE execution for 2-3 concrete values.
- For periodic code (every N steps), trace a value that is a multiple of N
  but NOT a multiple of other intervals in the same scope.
- Write the trace out explicitly: "At step X, condition A = true/false, enters block? yes/no."
- **Origin:** A simple trace of step 8000 with log_interval=3 would have
  instantly revealed `8000 % 3 != 0` and caught the nesting bug.

### HARD RULE 3: Run the QA Agent for All Major Code Changes
> Automated review catches what human eyes miss.

- Before ANY code goes to the training server: run the qa-engineer agent.
- Before ANY code touching the training loop, checkpointing, or data pipeline:
  run the pytorch-reviewer agent.
- "Major" = anything beyond a 1-line typo fix. When in doubt, run it.
- QA must pass BEFORE telling the user the code is ready.

### HARD RULE 4: Every Scheduled Action MUST Log That It Fired
> If it doesn't log, you can't prove it ran.

- Any code that runs on a schedule (every N steps, every N minutes) MUST
  produce a visible log line confirming execution.
- Log both success AND failure with the step/time context.
- Example: `logger.info(f"Progress email sent at step {step}")`
- Example: `logger.warning(f"Progress email FAILED at step {step}: {e}")`
- **Origin:** Email failures were silently swallowed by `except: pass`,
  making it impossible to know if emails were sending or not.

### HARD RULE 5: Never Silently Swallow Exceptions in Critical Paths
> `except: pass` is BANNED for code the user depends on.

- At minimum: `except Exception as e: logger.warning(f"... {e}")`
- Only use bare `except: pass` for truly cosmetic/optional code where failure
  is completely invisible to the user AND has zero impact on correctness.
- **Origin:** The email function used `except: pass`, hiding SMTP failures
  for weeks without any trace in the logs.

### HARD RULE 6: Test Conditional Independence
> Independent conditions must live in independent blocks.

- If two conditions should be independent (e.g., "every 1000 steps" and
  "every 3 steps"), verify they are NOT nested.
- Nested conditions create an implicit AND — the code only runs when BOTH
  are true, which may be rare or never.
- Check: does the outer interval divide evenly into the inner interval?
  If 1000 is not divisible by 3, and they're nested, you have a bug.

---

## QUICK REFERENCE — All 28 Rules at a Glance

| #  | Rule | One-Line Summary |
|----|------|-----------------|
| 1  | Plan First | Show the plan, wait for approval, then code |
| 2  | Don't Rush | Stop, think, read, THEN implement |
| 3  | Whole Picture | Understand all connected code before changing any |
| 4  | Existing Patterns | Follow codebase conventions, don't invent new ones |
| 5  | Ask When Unsure | "I don't know" is better than a wrong guess |
| 6  | KISS | Simplest solution that works wins |
| 7  | DRY | Don't repeat logic, but don't over-abstract either |
| 8  | Double-Check | Validate line counts, re-read after every edit |
| 9  | Don't Fix Working Code | If it's not broken, leave it alone |
| 10 | Latest Version | Always re-read files before editing |
| 11 | No Side Effects | Check what depends on your change |
| 12 | Root Cause | Find the WHY, don't brute-force |
| 13 | Show Problem First | Point to the bug before proposing the fix |
| 14 | Keep Records | Document lessons learned, tasks done |
| 15 | Secure Code | No secrets in code, validate boundaries |
| 16 | Debug Logging | Every action must be traceable in logs |
| 17 | Tests First | Write the test, see it fail, then write the code |
| 18 | Commit Often | One task per commit, commit immediately |
| 19 | User Reviews All | Claude's code is a draft until user approves |
| 20 | Manage Context | Re-read files in long sessions, suggest /clear |
| 21 | Edge Cases | List and verify boundary conditions explicitly |
| 22 | Atomic Changes | One change per edit, three tasks = three steps |
| HR1 | No Scope Assumptions | Verify nesting, don't group by purpose |
| HR2 | Dry-Run Trace | Trace 2-3 values through every conditional |
| HR3 | QA Agent Gate | Run QA before any code hits the server |
| HR4 | Log Scheduled Actions | If it ran, the log must prove it |
| HR5 | No Silent Exceptions | Log every caught exception |
| HR6 | Conditional Independence | Independent triggers = independent blocks |

---

## Changelog
- 2026-02-26: Initial version — 22 Golden Rules + 6 Hard Rules = 28 total.
  Triggered by the progress email nesting bug (step 8000 email silently skipped).
  Online research sources consulted:
  - Claude Code Official Best Practices (code.claude.com)
  - shanraisshan/claude-code-best-practice (GitHub)
  - rosmur/claudecode-best-practices (GitHub Pages)
  - Arize CLAUDE.md optimization research (+5-10% accuracy improvement)
  - HumanLayer "Writing a Good CLAUDE.md" guide
