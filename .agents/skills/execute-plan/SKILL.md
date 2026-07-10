---
name: execute-plan
description: Executes exactly one phase from a specified Fix_#.md implementation plan file and then removes that completed phase from the file. Use when the user prompts 'Execute_plan'.
---

# Execute Plan Skill

**Trigger Keyword:** `Execute_plan`

## Context
When the user prompts `Execute_plan`, implement exactly **one** phase from a specified `Fix_<n>.md` plan, verify it, and only then strike it from the plan file. Do not chain phases — the user re-invokes the skill for each one.
**CRITICAL**: You MUST immediately launch the `set_plan` tool when told `Execute_plan` to outline your steps for the current phase. You must absolutely **NOT** say "I have completed phase X should I start phase Y?" or try to execute phases one after the next automatically. You only execute ONE phase per invocation, and then you STOP completely.

## Execution Steps

### 1. Identify the target plan file

- If the user named a file (e.g. `Execute_plan Fix_3.md`), use it.
- Otherwise:
  - List `Fix_<n>.md` files in the repository root, sorted numerically.
  - If exactly one exists, use it and tell the user which.
  - If multiple exist, list them and ask the user to pick. Do not guess.
- If the named file does not exist, stop and tell the user.

### 2. Parse the plan and trigger `set_plan`

- Read the file.
- Locate the **first** heading matching `### Phase <N>:` (lowest N still present).
- The phase body spans from that heading down to (but not including) the next `### Phase` heading, or to the end of the file if it is the last phase.
- **Immediately call the `set_plan` tool** translating the phase's goals into your execution steps. You MUST do this before performing any codebase modifications.
- If no `### Phase` heading is found, the plan is complete:
  - Tell the user all phases are done.
  - Offer to delete the `Fix_<n>.md` file. Do not delete without confirmation.
  - Stop.

### 3. Re-ground in the current codebase

The plan may have been written in a prior session; the code may have drifted.

- For every file path the phase touches, verify it still exists (or is correctly marked `(new file)`).
- For every symbol the phase references, re-read the relevant file and confirm the symbol still exists at the expected location and signature.
- If any check fails, **stop**. Report which assumption is now invalid and ask the user whether to (a) revise the plan via `Write_plan`, (b) proceed with adjusted approach, or (c) abort. Do NOT remove the phase.

### 4. Implement the phase

- Follow the `Changes:` list in the phase, in order.
- Use `Read` immediately before any `Edit`/`Write` on a file (harness requirement).
- Honor the project mandates in `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` (state ownership, Output node, ConnectorsBar, no port `8000` hardcoding, no edits to legacy root-level files, no edits inside `frontend/dist/`, `node_modules/`, `.vite/`, `.venv/`, or `__pycache__/`).

### 5. Verify

- Run the `Verification:` step exactly as the phase specifies.
- Confirm each item in `Success Criteria:` is observably true.
- Scale verification per the `CLAUDE.md` **Verification Budget** — if the phase's verification is broader than the change warrants, narrow it; if narrower, broaden it. If verification is skipped because the change is low-risk or tooling is unavailable, say so plainly.

### 6. Decide whether to remove the phase

- **If verification passes:** remove the phase from the plan file.
  - Use `Edit` to delete the exact span from the `### Phase <N>:` heading line through the last line before the next `### Phase` heading (or end of file). Remove any trailing blank lines that would leave a double-gap.
  - Do not renumber remaining phases.
  - If, after the edit, no `### Phase` headings remain, leave the file in place — the next invocation will detect completion in step 2.
- **If verification fails or the phase turned out to be wrong:** do NOT remove the phase. Leave the file untouched, revert any partial edits that put the codebase in an inconsistent state, and report the failure with specifics.

### 7. Stop and report

- One short message: which phase was completed, which file was updated, and what was verified.
- Do **NOT** proceed to the next phase. Wait for the user to re-invoke `Execute_plan`.
- Do **NOT** ask "Should I start the next phase?" Just state what was completed and wait.
