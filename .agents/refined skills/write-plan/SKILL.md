---
name: write-plan
description: Produce a detailed, phase-based implementation plan and write it to a uniquely numbered Fix_#.md file in the repository root. Planning only — never implements. Use when the user says 'Write_plan', or asks to plan/scope/spec out a change before coding.
---

# Write Plan

**Trigger:** `Write_plan` (also fires on "plan this", "scope out", "write an implementation plan").

Produce a detailed, codebase-grounded implementation plan and write it to a Markdown file in the repository root. The plan is consumed later by the `execute-plan` skill, so its structure must be machine-parseable and unambiguous.

> **HARD GATE — planning only.** You MUST NOT implement any code changes during this step. Your only outputs are the `Fix_#.md` file and a one-line report. Do not edit source files.

## Execution Steps

### 1. Pick a unique filename

- List files in the repository root matching `Fix_<n>.md` where `<n>` is one or more digits.
- Sort the integers **numerically** (not lexicographically). Pick `next = max(existing) + 1`, or `1` if none exist.
- The output file MUST be named `Fix_<next>.md`. NEVER overwrite an existing `Fix_#.md`.

### 2. Ground the plan in the real codebase

Do not plan from memory or from documentation alone. The plan must reflect the code as it exists today.

- Read whichever system documentation files are present (`CLAUDE.md`, `AGENTS.md`, `GEMINI.md`) to orient on architecture and locate the relevant areas.
- If the task touches an area covered by a `.docs/*.md` design spec, read the spec and reflect its constraints in the plan.
- **Then verify against the actual code.** Open the specific source files involved and confirm symbol names, signatures, and call sites. Docs drift from code — trust the code.
- If the feature/area the user describes does not exist in the codebase, surface that gap to the user before writing the plan instead of inventing one.

### 3. Required plan structure

The `Fix_<next>.md` file MUST follow this exact skeleton so the executor can parse it deterministically:

```markdown
# Fix <n>: <short title>

## Goal
<1-3 sentences: what this plan achieves and why.>

## Non-Goals
- <Explicit items intentionally excluded from this plan.>

## Files Affected
- `path/to/file.ext` — <one-line reason>
- ...

## Verification Strategy
<Scaled to the change. State exactly which test(s), smoke command(s), or visual check(s) cover the change. If the project defines a Verification Budget (e.g. in CLAUDE.md), honor it. If verification will be skipped because the change is low-risk, say so here.>

## Phases

### Phase 1: <imperative title>
**Objective:** <one sentence>

**Changes:**
- `path/to/file.ext`: <specific edit — function name, what is added/removed/changed, why>
- ...

**Verification:**
- <Concrete command, file to inspect, or behavior to confirm. Must be runnable / checkable.>

**Success Criteria:**
- <Observable condition that proves this phase is done. Used by `execute-plan` as the stopping test.>

### Phase 2: ...
(same structure)
```

Rules for phases:

- A phase is the smallest unit that leaves the codebase in a **coherent, verifiable state**. If a change cannot be verified independently, fold it into the next phase rather than splitting it.
- Phase headings MUST use `### Phase <N>:` exactly — the executor parses this pattern.
- Number phases sequentially starting at 1.
- Each phase must name specific files, functions, and the nature of the edit. Vague phases ("clean up the module") are rejected.

### 4. Internal refinement pass (mandatory)

Before writing the file, re-read your draft and check:

- Every file path in `Files Affected` and in each phase actually exists (or is explicitly marked `(new file)`).
- Every function/symbol name referenced was verified by reading the source, not guessed.
- No phase depends on a later phase's changes.
- `Success Criteria` for each phase is **observable**, not aspirational ("tests pass" is fine; "code is cleaner" is not).
- The plan respects any project mandates in `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` (protected directories, ownership constraints, forbidden ports, etc.). Do not plan a change that violates them.

### 5. Write the file and report

- Write the plan to the repository root using the file-write tool.
- Reply with one short sentence naming the file: e.g., `Plan written to Fix_3.md (4 phases).`
- Do **not** start executing. Wait for the user to invoke `Execute_plan`.

## Environment & version control

This skill writes a plan file only. It does **not** commit or open pull requests — leave version control to the user unless they ask otherwise.

If you are running inside the **Jules / Codex** harness and the user has explicitly asked for a PR-per-plan flow, follow the `jules-profile` skill for the `submit` mechanics. Otherwise, stop after writing the file.
