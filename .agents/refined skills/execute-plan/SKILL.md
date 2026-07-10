---
name: execute-plan
description: Execute exactly ONE phase from a Fix_#.md plan, verify it, then strike that phase from the file. Never chains phases. Use when the user says 'Execute_plan', or asks to run/implement the next phase of a plan.
---

# Execute Plan

**Trigger:** `Execute_plan` (also fires on "run the next phase", "implement phase N").

Implement exactly **one** phase from a `Fix_<n>.md` plan, verify it, and only then strike it from the file. Do not chain phases — the user re-invokes the skill for each one.

> **CRITICAL — one phase, then STOP.** Execute a single phase per invocation, then stop completely. Never say "I finished phase X, should I start phase Y?" and never roll into the next phase automatically.

## Execution Steps

### 1. Identify the target plan file

- If the user named a file (e.g. `Execute_plan Fix_3.md`), use it.
- Otherwise list `Fix_<n>.md` files in the repository root, sorted numerically:
  - Exactly one exists → use it and tell the user which.
  - Multiple exist → list them and ask the user to pick. Do not guess.
- If the named file does not exist, stop and tell the user.

### 2. Parse the plan and lay out your steps

- Read the file.
- Locate the **first** heading matching `### Phase <N>:` (lowest N still present).
- The phase body spans from that heading to (but not including) the next `### Phase` heading, or to end of file if it is the last phase.
- **Lay out your execution steps for this one phase before touching code.** Use the host's planning tool if one exists (`set_plan`, `update_plan`, `TodoWrite`); otherwise write the steps inline as a short checklist. See "Environment" below.
- If no `### Phase` heading is found, the plan is complete:
  - Tell the user all phases are done.
  - Offer to delete the `Fix_<n>.md` file. Do not delete without confirmation.
  - Stop.

### 3. Re-ground in the current codebase

The plan may have been written in a prior session; the code may have drifted.

- For every file path the phase touches, verify it still exists (or is correctly marked `(new file)`).
- For every symbol the phase references, re-read the relevant file and confirm the symbol still exists at the expected location and signature.
- If any check fails, **stop**. Report which assumption is now invalid and ask the user whether to (a) revise the plan via `Refine_plan`/`Write_plan`, (b) proceed with an adjusted approach, or (c) abort. Do NOT remove the phase.

### 4. Implement the phase

- Follow the `Changes:` list in the phase, in order.
- Use `Read` immediately before any `Edit`/`Write` on a file (harness requirement).
- Honor project mandates in `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` (state ownership, protected directories, forbidden ports, etc.).

### 5. Verify

- Run the phase's `Verification:` step exactly.
- Confirm each item in `Success Criteria:` is observably true.
- Scale verification to the change (honor a project Verification Budget if defined): narrow it if broader than warranted, broaden it if too narrow. If verification is skipped because the change is low-risk or tooling is unavailable, say so plainly — never imply success.

### 6. Decide whether to remove the phase

- **If verification passes:** remove the phase from the plan file.
  - Use `Edit` to delete the exact span from the `### Phase <N>:` heading line through the last line before the next `### Phase` heading (or end of file). Remove trailing blank lines that would leave a double gap.
  - Do not renumber remaining phases.
  - If no `### Phase` headings remain after the edit, leave the file in place — the next invocation detects completion in step 2.
- **If verification fails or the phase was wrong:** do NOT remove the phase. Leave the file untouched, revert any partial edits that left the codebase inconsistent, and report the failure with specifics.

### 7. Stop and report

- One short message: which phase was completed, which file(s) changed, and what was verified.
- Do **NOT** proceed to the next phase. Do **NOT** ask "Should I start the next phase?" — just report and wait for the user to re-invoke `Execute_plan`.

## Environment

**Planning tool (step 2).** This skill assumes you announce your per-phase steps before editing. Use whatever your host provides:

- **Jules / Codex:** `set_plan` — call it immediately on `Execute_plan`, before any modification. See the `jules-profile` skill.
- **Claude Code / Cowork:** `TodoWrite` / the task list.
- **Other / none:** write the steps inline as a short checklist in your first message.

**Version control.** This skill does **not** commit or open pull requests. Striking a completed phase from the plan file is the only file change it makes beyond the code edits themselves. Leave commits/PRs to the user.
