---
name: refine-plan
description: Critically reanalyzes and further refines an existing Fix_#.md plan file to add highly detailed logic, ensure complete codebase coverage, and create a foolproof, step-by-step implementation guide. Use when the user prompts 'Refine_plan'.
---

# Refine Plan Skill

**Trigger Keyword:** `Refine_plan`

## Context
When the user prompts `Refine_plan`, critically reanalyze and significantly expand upon an existing `Fix_#.md` implementation plan. The goal is to perform a holistic codebase analysis and add exhaustive detail to the plan. You must use a reasoning loop to refine the plan with any missing data or account for future errors that may have been missed. The refined plan should be at least triple the size of the original `Write_plan` output, laying out a foolproof, step-by-step guide that can be seamlessly executed by other agents.

## Execution Steps

### 1. Identify the target plan file

- If the user named a file (e.g. `Refine_plan Fix_3.md`), use it.
- Otherwise, list `Fix_<n>.md` files in the repository root, sort them numerically, and default to the highest numbered `Fix_#.md` file as a fallback.
- If no `Fix_#.md` files exist, stop and tell the user.

### 2. Holistic Grounding and Analysis (Mandatory)

Do not just rewrite the markdown. You must deeply understand what the plan is doing.
- Read the existing `Fix_#.md` file.
- Perform a full parsing of the actual scripts and files that the plan indicates need to be modified. Use your read tools to fetch the current source code.
- Analyze the codebase to identify any missing files, forgotten dependencies, edge cases, or potential errors that the original plan missed.

### 3. Refine and Expand the Plan

Critically reanalyze and further refine the plan based on your holistic analysis. Make sure highly detailed logic is summarized within the plan.
- The refined plan MUST maintain the exact same markdown structure (`Goal`, `Non-Goals`, `Files Affected`, `Verification Strategy`, `Phases`) as the original plan.
- **Triple the Detail:** Add descriptive information, clear objectives, and rigorous technical details. Expand the phases to be foolproof step-by-step instructions.
- Ensure the plan covers all files and system changes that must happen for the plan to work.
- Make any adjustments or improvements to the design or the implementation of the logic based on your deep understanding of the source code.
- **Final Loop:** Before finishing, run a final reasoning loop: "Is this plan completely clear? Does it lay out a step-by-step, foolproof plan that can be easily carried out by an executing agent?"

### 4. Overwrite the Original File

- Use the `Write` tool to overwrite the original `Fix_#.md` file with your refined, expanded plan. Do not create a new file (e.g., no `_refined.md`).

### 5. Create a Pull Request (PR)

- After the refined plan is written and the file is saved locally, you MUST commit the `Fix_#.md` file and submit a Pull Request.
- Use the `submit` tool to create the commit and PR. Ensure the branch name is descriptive (e.g., `plan/refine-fix-3`) and the commit message reflects the refinement of the plan.
- Only create the PR after you have thoroughly refined the plan and saved the overwritten file.
