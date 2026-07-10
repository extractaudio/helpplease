# Plan→Execute chain — hardening pass

This folder contains hardened versions of your Plan→Execute category. Because your live `skills/` folder is write-protected in this session, everything was built here for you to review and copy across.

## How to install

Each subfolder maps 1:1 to a skill in your `skills/` directory. To adopt a change, copy the subfolder's files over the matching skill.

- **Full-folder skills** (safe to copy the whole folder): `write-plan`, `refine-plan`, `execute-plan`, `modify-node`, `modify-panel`, `modify-frontend-backend`.
- **New skills** (drop the whole folder into `skills/`): `jules-profile`, `coordinated-change`.
- **SKILL.md-only changes** (copy just the `SKILL.md`; leave the existing `agents/openai.yaml` and prompt files in place): `executing-plans`, `subagent-driven-development`.

You can delete the `_probe/` folder — it was just a write test.

## What changed and why

### Portability (cross-agent parity)
- `write-plan`, `refine-plan`, `execute-plan` no longer hard-depend on the Jules/Codex-only `set_plan` and `submit` tools. They now use whatever the host provides (`set_plan` → `update_plan`/`TodoWrite` → inline checklist) and degrade gracefully on Claude, Gemini, and bare CLIs.
- Added `agents/openai.yaml` interface files to all six custom skills (previously only the superpowers-lineage skills had them), so the OpenAI/Codex surface is complete.

### No auto-PR (per your call)
- Removed the forced `submit`/PR step from `write-plan` and `refine-plan`. Version control is now the user's decision everywhere. This also makes `execute-plan` consistent (it never PR'd).
- The Jules `submit`/PR flow still exists but is **opt-in** and documented in the new `jules-profile`.

### New: `jules-profile`
- One small reference skill documenting the Jules/Codex `set_plan` and `submit` mechanics that the plan and modify skills defer to. Keeps the main skills host-agnostic while preserving your Jules behavior.

### New: `coordinated-change`
- The generic, app-agnostic "contract-first multi-file change" pattern that underlies `modify-node`/`modify-panel`/`modify-frontend-backend`. Reusable in any codebase. The three app-specific skills now cross-link to it.

### Fixed dangling cross-references
- `executing-plans` and `subagent-driven-development` referenced sibling skills that don't exist under those names (`superpowers:writing-plans`, `superpowers:finishing-a-development-branch`). Repointed to your real skills: `write-plan`, `finishing-a-development-task`, `requesting-code-review`, `test-driven-development`. Also fixed an internal inconsistency in `executing-plans` (it said both `finishing-a-development-branch` and `finishing-a-development-task`).
- Dropped the `superpowers:` namespace prefixes since these all live in one flat collection.

### Standardization (applied across the set)
- Unified frontmatter `description`s to state the trigger AND the natural-language cases that should fire the skill (better auto-triggering, fewer collisions).
- Standardized the trigger callout to `**Trigger:**` and added an `## Environment` section (planning tool + version control) to every skill in the chain.

## Reviewed, no change needed
- `dispatching-parallel-agents` — already clean, correct refs, has its `openai.yaml`. Left as-is.

## Companion files NOT touched (still valid)
- `subagent-driven-development/{implementer,spec-reviewer,code-quality-reviewer}-prompt.md`
- Existing `agents/openai.yaml` for `executing-plans` and `subagent-driven-development`.
