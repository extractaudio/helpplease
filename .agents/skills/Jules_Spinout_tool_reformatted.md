# Jules Spinout Tool: Architectural Guardrails Implementation

> A comprehensive, step-by-step implementation plan for architecting guardrails and constraints for the Jules agent system.

---

## Table of Contents

1. [Global Context & Overrides](#step-1-global-context--overrides-gemini.md)
2. [Project-Specific Guardrails](#step-2-project-specific-guardrails-agents.md)
3. [The "Always On" Dynamic Rule](#step-3-the-always-on-dynamic-rule)
4. [Active RTK Interception](#step-4-active-rtk-interception-the-nuclear-option)
5. [Workspace Initialization](#step-5-workspace-initialization)
6. [Ensuring Skill Discovery via CLI](#step-6-ensuring-skill-discovery-via-the-cli)
7. [Offloading Compute](#step-7-offloading-compute-the-preview-environment-pivot)
8. [Interactive Review via Planning Critic](#step-8-interactive-review-via-the-planning-critic)

---

## Step 1: Global Context & Overrides (GEMINI.md)

Your first line of defense is establishing immutable, global constraints that the agent cannot ignore.

### Action
Create a `GEMINI.md` file in your global configuration directory (`~/.gemini/GEMINI.md`) or at the absolute root of your project.

### Define Your Non-Negotiable Testing Parameters

```markdown
# Global Testing Constraints

- **Max Retries:** 1
- **Failure Protocol:** If the test suite fails after 1 run, you must halt immediately. Do not attempt additional log-grepping, and do not execute repeated retries.

### Summary of Failure
1. Bullet point one
2. Bullet point two
3. Bullet point three

### Execute Rollback
Execute the smallest possible code rollback.

### Open PR
Explicitly open the pull request.

---

#### Caveats & Risks

- `GEMINI.md` is proprietary to Google and will **permanently override** `AGENTS.md` if they sit in the exact same directory.
- The Path Traversal Algorithm conducts a Downward BFS Scan that imposes a hard limit of **max 200 folders** to prevent OOM errors. If you bury this file deep in your repository, Jules will not read it.
- Embedding these core architectural constraints systemically elevates task success rates from ~56% to near 100%, removing the need for the model to dynamically retrieve baseline knowledge.
```

---

## Step 2: Project-Specific Guardrails (`AGENTS.md`)

Next, map out the localized topography of your repository so Jules knows exactly how to interact with your specific tech stack.

### Action
Create an `AGENTS.md` file at the root of your monorepo.

### The Code/Content

```markdown
# Project Architecture & Routing

@./.agents/rules/test-loop-breaker.md

- **Frontend:** TypeScript visualizer UI (`.spec.cjs` tests)
- **Backend:** Python analytics
- **Deterministic Commands:** Always use `npm run test:visualizer` for UI tests. Do not assume standard npm flows.

---

#### Caveats & Risks

> You must provide exact bash strings for navigation and testing rather than vague generalizations.

To prevent the "Lost in the Middle" token degradation phenomenon, do not bloat this file. Use the **Hook Method** (the `@` import above) to route the agent to specific context fragments without merging conflicts.
```

---

## Step 3: The "Always On" Dynamic Rule

This creates the specific, targeted constraint file referenced by the hook in Step 2.

### Action
Execute:
```bash
mkdir -p .agents/rules
```

Then create `.agents/rules/test-loop-breaker.md` with the following content:

```markdown
# Always On: Anti-Grep/Test Loop Protocol

If a testing script fails, you are **strictly forbidden** from entering a diagnostic loop. Do not read error logs and run `grep` to trace the failure more than once.

You will not delete intermediate diagnostic work. Push to version control and wait for human review.

---

#### Caveats & Risks

- This file is strictly limited to **12,000 characters** [cite: 1]
- You must ensure the Activation Trigger is set to **Always On** so it is universally applied [cite: 1]. If it accidentally defaults to Glob Pattern Matching (e.g., only firing on `*.js` files), Jules might bypass the rule when modifying `.cjs` or markdown logs [cite: 1]
```

---

## Step 4: Active RTK Interception (The Nuclear Option)

If Jules probabilistically ignores the text-based markdown rules and attempts to run `grep` a second time, you need programmatic enforcement.

### Action
Define your Rule Toolkit configuration at `.agents/rules/antigravity-rtk-rules.md` [cite: 1]

### The Code/Content

```yaml
plugins:
  - name: obey
    hooks:
      PreToolUse:
        block_commands:
          - command: "grep"
            condition: "execution_count > 1"
            action: "intercept"
            message: "Test limit reached. Halt and open PR."
```

---

#### Caveats & Risks

> This is highly potent.

The `obey` plugin utilizes **PreToolUse** lifecycle hooks for active blocking mechanisms [cite: 1]. If Jules attempts a shell command violating this rule, the plugin actively intercepts the action at runtime, blocking the agent and forcing it to rethink [cite: 1].

> You must be incredibly precise.

If you configure the syntext crate integration poorly, you might accidentally block Jules from utilizing built-in read or grep tools for legitimate, single-pass diagnostic work [cite: 1]
```

---

## Step 5: Workspace Initialization

With your structures in place, bootstrap the environment to ingest the rules.

### Action
Spin up your session using the Gemini CLI ecosystem. Run your `/init` command to mount the workspace, ensuring the CLI recursively loads the `.agents/` folder and reads the RTK YAML correctly.

---

#### Caveats & Risks

> Relying on standard GUI extensions instead of your CLI tools might result in the initialization scripts skipping the `~/.gemini/` global traversal phase [cite: 1], which would completely neutralize the rules established in Step 1.
```

---

## Step 6: Ensuring Skill Discovery via the CLI

Models occasionally fail to recognize local skills, assuming pre-training is sufficient, which can cause them to ignore the rules you have painstakingly established [cite: 1].

### Implementation
You must inject the **skills-cli** utility into your `/init` script or your root `AGENTS.md` [cite: 1]

### The Command
```bash
uvx --from skills-cli skills to-prompt ./.agents/skills/* --format yaml [cite: 1]
```

### Prompt Directive
You must explicitly instruct Jules:
> "Always run the discovery command first; if you do not know the available skills, run the command—do not assume." [cite: 1]

---

#### Caveats & Risks

- **Failure to run this discovery command** forces the model to rely on its internal training data, which can lead to hallucinated command structures or missed environmental context [cite: 1]
- Ensure the path `./.agents/skills/*` correctly points to your folder structure; if the scan fails, the YAML manifest will be incomplete, causing the model to miss the "test-loop-breaker" directive [cite: 1]
```

---

## Step 7: Offloading Compute (The Preview Environment Pivot)

Your current hang-ups with `backend_server.log` and `frontend_server.log` suggest that your Jules VM is likely hitting memory limits or disk space constraints while attempting to manage the complexity of your monorepo [cite: 1].

### Action
Explicitly forbid local containerization within your `AGENTS.md` file [cite: 1]

### Strategy
Pivot entirely to **"Preview Environments"** [cite: 1]. Your setup scripts must orchestrate the spin-up of temporary cloud environments (via Terraform, Pulumi, or provider CLIs) and dynamically inject the resulting connection strings into the Jules Secret Store [cite: 1]

---

#### Caveats & Risks

- The Jules VM is a lightweight, short-lived container with **~20GB of storage** [cite: 1]. Attempting to run a Supabase stack or heavy database containers locally will cause fatal "no space left on device" errors or silent failures [cite: 1]
- By offloading compute to a cloud provider, you keep the Jules VM focused solely on code compilation and logical testing, which significantly stabilizes the agent's performance [cite: 1]
```

---

## Step 8: Interactive Review via the Planning Critic

Finally, to address the ambiguity in your visualizer phase logic, you must utilize the **"Planning Critic"** framework.

### Action
Before writing any code to address the test-results errors, force Jules to generate a detailed, step-by-step natural language plan [cite: 1]

### Engagement
Use your interactive chat interface to meticulously review this plan [cite: 1]. You must actively intercept the agent to command revisions, point out overlooked dependencies, or force specific architectural routing before the execution phase begins [cite: 1]

---

#### Caveats & Risks

- If you skip this phase, Jules will make probabilistic guesses and spend compute cycles rewriting perfectly functional code, leading to regressions [cite: 1]
- The execution phase is only as reliable as the rigor applied during the plan approval stage; treat this as the most critical bottleneck in your pipeline [cite: 1]

---

## Summary

By layering these static rules, programmatic intercepts, and discovery protocols, you move from managing a volatile, "fire-and-forget" agent to orchestrating a **deterministic, autonomous engineering pipeline** [cite: 1].

