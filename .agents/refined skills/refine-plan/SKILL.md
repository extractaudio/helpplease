---
name: refine-plan
description: Critically re-analyze and expand an existing Fix_#.md plan — deep codebase grounding, missing-coverage detection, and foolproof step-by-step detail — then overwrite the file in place. Use when the user says 'Refine_plan', or asks to deepen/harden/expand an existing plan.
---

# Refine Plan

**Trigger:** `Refine_plan` (also fires on "harden the plan", "expand the plan", "make the plan foolproof").

Critically re-analyze and significantly expand an existing `Fix_#.md` implementation plan. The goal is a holistic codebase analysis that adds exhaustive, executable detail so any agent can carry it out without guessing.

> **HARD GATE — planning only.** Refining means editing the plan file, not the code. Do NOT implement any of the planned changes.

## Execution Steps

### 1. Identify the target plan file

- If the user named a file (e.g. `Refine_plan Fix_3.md`), use it.
- Otherwise, list `Fix_<n>.md` files in the repository root, sort numerically, and default to the highest-numbered one.
- If no `Fix_#.md` files exist, stop and tell the user.

### 2. Holistic grounding and analysis (mandatory)

Do not just rewrite the markdown — understand what the plan is actually doing.

- Read the existing `Fix_#.md` file.
- Open and read **every** source file the plan says it will touch. Confirm the current code, symbol names, and signatures.
- Analyze the surrounding code to find what the original plan missed: forgotten dependencies, adjacent call sites, migration needs, edge cases, and error paths.
- Re-read relevant project mandates (`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`) and any `.docs/*.md` spec covering the area.

### 3. Refine and expand the plan

Keep the **exact same skeleton** the executor expects (`Goal`, `Non-Goals`, `Files Affected`, `Verification Strategy`, `Phases`). Within it:

- **Deepen every phase** into foolproof, ordered steps: specific files, specific functions, the precise nature of each edit, and why.
- **Close coverage gaps** — add any file, dependency, or system change the original omitted. If you add files, update `Files Affected` too.
- **Sharpen verification** — each phase's `Verification` must be a runnable command or a concrete observable check; each `Success Criteria` must be observable, not aspirational.
- **Improve the design where the code warrants it** — if reading the source reveals a cleaner or safer approach, adjust the plan and note why.
- Keep phase headings in the exact `### Phase <N>:` form and keep phases independently verifiable and non-forward-dependent.

### 4. Final reasoning loop (mandatory)

Before writing, re-read the whole plan and ask:

- Is every step unambiguous to an agent that has never seen this codebase?
- Does any phase depend on a later phase? (If so, reorder.)
- Are all referenced paths/symbols real and verified?
- Does the plan violate any project mandate? (If so, fix it.)

### 5. Overwrite the file and report

- Overwrite the original `Fix_#.md` in place (no `_refined.md`, no new number).
- Reply with one short sentence: e.g., `Refined Fix_3.md — 4 phases, added session-migration coverage.`
- Do **not** start executing. Wait for `Execute_plan`.

## Environment & version control

This skill edits a plan file only. It does **not** commit or open pull requests — leave version control to the user unless they ask otherwise. If running inside the **Jules / Codex** harness with an explicit PR-per-plan request, see the `jules-profile` skill for `submit` mechanics.
