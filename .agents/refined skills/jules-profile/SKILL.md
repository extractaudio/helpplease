---
name: jules-profile
description: Reference profile for running the plan/execute and modify-* skills inside the Jules / Codex harness — documents the set_plan and submit tools and the PR-per-change flow. Use when a plan or modify skill needs Jules-specific mechanics, or the user asks how these skills behave under Jules/Codex.
---

# Jules / Codex Environment Profile

A shared reference for the harness-specific mechanics the portable plan and modify skills abstract away. The other skills stay host-agnostic and defer here when they detect (or are told) they are running under **Jules** or another **OpenAI Codex**-style environment.

Read this only when you are in that environment. On Claude Code, Cowork, Gemini, or a bare CLI, the portable skills already describe what to do — you do not need this file.

## What's different about Jules / Codex

| Concern | Portable default (Claude / Gemini / CLI) | Jules / Codex |
|---|---|---|
| Announcing per-step work | `TodoWrite` / task list, or an inline checklist | **`set_plan`** tool |
| Committing / PRs | Left to the user; no auto-commit | **`submit`** tool creates the commit + PR |
| System docs | `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` (whichever exist) | Same, plus Jules honors `AGENTS.md` |

## `set_plan`

Jules expects an explicit, up-front plan for the current unit of work.

- In `execute-plan`, call `set_plan` **immediately** on `Execute_plan` — before re-grounding or editing — translating the chosen phase's `Changes:` into concrete execution steps.
- Keep the plan scoped to the **single phase** being executed. Do not enumerate future phases.
- Update the plan as steps complete if the harness supports it.

Where a portable skill says "lay out your steps using the host's planning tool," the Jules mapping is `set_plan`.

## `submit` and the PR-per-change flow

> **Only use `submit` when the user has explicitly asked for a PR-per-change flow.** The portable skills default to leaving version control to the user (no auto-PR). Under Jules the `submit` tool is available, but do not create PRs unprompted.

When the user *has* asked for it:

1. Make sure the intended file change is written and saved locally first (the `Fix_#.md` plan for `write-plan`/`refine-plan`, or the code edits for a `modify-*`/`execute-plan` phase).
2. Call `submit` to create the commit and PR.
3. Use a descriptive branch name and a commit message that matches the action:
   - `plan/fix-3` — "Add implementation plan Fix_3"
   - `plan/refine-fix-3` — "Refine implementation plan Fix_3"
   - `feat/<area>` — "<summary of the executed phase or modification>"
4. Only submit after the work is complete and (for code changes) verified.

## Applying this profile

The skills that defer here:

- `write-plan` — optional `submit` after the plan file is written.
- `refine-plan` — optional `submit` after the plan file is overwritten.
- `execute-plan` — `set_plan` for per-phase steps; optional `submit` after a verified phase.
- `modify-node` / `modify-panel` / `modify-frontend-backend` — `set_plan` for the change steps; optional `submit` after verification.

Everything else about those skills (grounding, phase mechanics, mandate compliance, verification) is identical across environments.
