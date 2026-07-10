---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints. Loads the plan, reviews it critically, executes each task with verification, and finishes via finishing-a-development-task.
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note on subagents:** This workflow is significantly higher quality on a platform with subagent support (e.g. Claude Code, Codex). If subagents are available, prefer `subagent-driven-development` instead of this skill.

## The Process

### Step 1: Load and Review Plan

1. Read the plan file.
2. Review critically — identify any questions or concerns about the plan.
3. If concerns: raise them with your human partner before starting.
4. If no concerns: create the task list (`TodoWrite` / host task tool) and proceed.

### Step 2: Execute Tasks

For each task:

1. Mark as in_progress.
2. Follow each step exactly (the plan has bite-sized steps).
3. Run verifications as specified.
4. Mark as completed.

### Step 3: Complete Development

After all tasks are complete and verified:

- Announce: "I'm using the finishing-a-development-task skill to complete this work."
- **Required sub-skill:** use `finishing-a-development-task`.
- Follow that skill to verify tests, present options, and execute the user's choice.

## When to Stop and Ask for Help

**Stop executing immediately when:**

- You hit a blocker (missing dependency, failing test, unclear instruction).
- The plan has critical gaps preventing you from starting.
- You don't understand an instruction.
- Verification fails repeatedly.

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**

- The partner updates the plan based on your feedback.
- The fundamental approach needs rethinking.

**Don't force through blockers** — stop and ask.

## Remember

- Review the plan critically first.
- Follow plan steps exactly.
- Don't skip verifications.
- Reference skills when the plan says to.
- Stop when blocked; don't guess.
- Never start implementation on `main`/`master` without explicit user consent.

## Integration

**Related workflow skills (in this collection):**

- **write-plan** — creates the phase-based `Fix_#.md` plan this skill can execute.
- **finishing-a-development-task** — completes development after all tasks are done.
- **subagent-driven-development** — same-session alternative that dispatches a fresh subagent per task with review checkpoints.
