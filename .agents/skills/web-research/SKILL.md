---
name: web-research
description: Researches the open questions, external dependencies, and risky assumptions behind the current Fix_#.md plan. Sizes the subject's heaviness up front, scouts many online sources, deep-reads the best, and loops for as many passes as the subject warrants — dynamically cranking up the depth when the topic is heavy or another pass could still materially improve the plan. Logs every round to an append-only Research_#.md audit trail, synthesizes a Brief_#.md, then refines and bolsters that same Fix_#.md in place with the researched knowledge. Runs in sequence with Write_plan / Refine_plan / Execute_plan. Use when the user prompts 'Plan_Research'.
---

# Plan Research Skill

**Trigger Keyword:** `Plan_Research`

## Context
`Plan_Research` is a stage in the planning pipeline: **`Write_plan` → `Refine_plan` → `Plan_Research` → `Execute_plan`.** It does not invent its own deliverable. Its job is to take the **current `Fix_<n>.md` plan**, research the things that plan is uncertain about online, and then **refine, refactor, and bolster that same `Fix_<n>.md`** with grounded, real-world knowledge so the executing agent has fewer unknowns.

It produces two supporting artifacts as a traceable audit trail, numbered to match the plan:

1. A **Research Log** (`.agents/research/Research_<n>.md`) — an **append-only** record of the scope, the heaviness sizing, the scout phase, the deep-read findings, and every loop iteration. Never overwritten.
2. A **Research Brief** (`.agents/research/Brief_<n>.md`) — a synthesis of the log, focused on the questions the plan raised. This is the bridge between raw research and the plan edits.

The investigation runs as a loop — **scope from the plan → size the subject's heaviness → scout wide → deep-read the best → log findings → gap-check → loop or converge.** The number of passes is **not fixed**: it scales to how heavy the subject is. A lightweight, well-trodden topic may converge in one round; a heavy, novel, or risky one is *required* to keep stacking passes until the research stops materially changing the plan. Every fact carries a stable source ID (`[S1]`, `[S2]`, …), and every edit made to the plan must trace back to one.

**CRITICAL DIRECTIVE:** This skill is STRICTLY for research and planning. You MUST NOT implement any code or modify source files. Your deliverables are the research artifacts AND the bolstered `Fix_<n>.md` plan — nothing more. Implementation happens later, under `Execute_plan`.

## Execution Steps

### 1. Identify the target plan file

- If the user named a file (e.g. `Plan_Research Fix_3.md`), use it.
- Otherwise, list `Fix_<n>.md` files in the repository root, sort them **numerically**, and default to the highest-numbered `Fix_<n>.md`.
- If no `Fix_<n>.md` files exist, **stop** and tell the user to run `Write_plan` first. This skill refines an existing plan; it does not create one from nothing.
- Record the plan's number `<n>` — the Research Log and Brief will reuse it.

### 2. Read the plan and derive the research questions

The plan defines what to research. Do not research in the abstract.

- Read the target `Fix_<n>.md` in full — Goal, Non-Goals, Files Affected, Verification Strategy, and every Phase.
- Extract the **research-worthy unknowns** the plan depends on but does not ground, for example:
  - external APIs, libraries, SDKs, or protocols the plan relies on (correct signatures, version-specific behavior, deprecations);
  - best-practice or idiomatic approaches for the technique the plan uses;
  - edge cases, failure modes, race conditions, security or performance considerations;
  - any assumption the plan states as fact but did not verify.
- Fold in any **explicit research focus** the user added to the prompt (e.g. `Plan_Research Fix_3.md how does WHEP reconnect work?`).
- Distill these into 3–7 concrete **research questions**. Define **stopping criteria** (every question answered with confidence + corroboration). State all of this; the loop budget is set in Step 3.

### 3. Size the subject — set the depth tier, the rounds floor, and the loop budget

This is the step that prevents "scout once, every time." Before searching, **score how heavy the subject is**, and turn that score into a **minimum number of rounds (a floor, not just a ceiling)** plus a loop budget. A heavy subject is *required* to make multiple passes; it cannot converge early just because the first round looked complete.

Score each signal **0, 1, or 2** and sum (range 0–12):

| Signal | 0 | 1 | 2 |
|--------|---|---|---|
| **Breadth** — # research questions | 1–2 | 3–5 | 6+ |
| **External surface** — distinct external APIs/SDKs/protocols the plan leans on | 0–1 | 2–3 | 4+ |
| **Novelty / maturity** | mature, well-documented | mixed | bleeding-edge, sparse docs, air-gapped, or custom |
| **Risk class** | cosmetic | functional | security / performance / data-loss / irreversible / safety-critical |
| **Blast radius** — phases or files the plan touches | 1–2 | 3–5 | 6+ or cross-cutting |
| **Pressure** — user emphasis or contradiction signals | none | some | user flagged it "heavy / major / important," or scouting already shows sources disagreeing |

Map the total to a **depth tier**:

| Score | Tier | Min rounds (floor) | Loop budget (cap) |
|-------|------|--------------------|-------------------|
| 0–3 | **T1 — Light** | 1 | 2 |
| 4–6 | **T2 — Standard** | 2 | 4 |
| 7–9 | **T3 — Heavy** | 3 | 6 |
| 10–12 | **T4 — Critical** | 4 | 8 |

- Record the per-signal scores, the total, the tier, the **min rounds**, and the **loop budget** in the Research Log (see skeleton).
- The min-rounds floor is **binding**: you may not write the Brief (Step 8) until at least that many full scout→deep-read→findings rounds are complete, even if you believe the questions are already answered. The point of the extra passes is to *stack* corroboration, surface second-order edge cases, and pressure-test the plan — not just to reach "answered."
- **Re-scoring is allowed and encouraged.** Heaviness is an estimate; scouting reveals the truth. If a round uncovers contradictions, a far larger external surface, or that the topic is more novel than it looked, **re-score and escalate the tier** — raise both the floor and the budget — and log the escalation. This is how depth dynamically cranks up. (Only escalate, never silently downgrade a tier mid-run.)

### 4. Initialize the Research Log (append-only)

- Create the `.agents/research/` directory if it does not exist.
- Open `.agents/research/Research_<n>.md` using the **same `<n>` as the plan**. If it already exists (a prior `Plan_Research` run on this plan), append a new `## Run` section rather than overwriting — the file is append-only.
- Write/append the Log header using the **Research Log skeleton** below (Target Plan, Research Questions, Stopping Criteria, Constraints, Heaviness Sizing, Sources table).

### 5. Scout phase — discover many sources (wide net)

Cast a wide net. Breadth and triage, **not** deep reading yet.

- Issue **multiple search queries from different angles** (synonyms, opposing viewpoints, primary vs secondary framings, technical vs plain language). On later rounds, aim the queries at the specific gaps and contradictions the previous round exposed — do not re-run the same searches.
- Collect a generous candidate list. For each: a source ID (`[S1]`, `[S2]`, …), URL, title, source type (primary / official docs / peer-reviewed / news / blog / forum), a one-line "why relevant," a credibility signal (authority, recency, bias), and the publication/access date.
- Append a **`## Scout — Round <r>`** section to the Log with this candidate table. Add every new source to the master Sources table.

### 6. Deep research — read the best chosen sources

- **Select for quality:** prefer primary sources and official documentation over SEO blogs and unsourced opinion. Drop duplicates and low-credibility candidates (note why in the Log).
- **Deep-read** each chosen source. Extract concrete facts, figures, signatures, logic, and direct quotes — each tagged inline with its `[S#]`.
- **Cross-check:** for every key claim, note whether it is confirmed by **≥2 independent sources**, single-source, uncertain, or **contradicted**.

### 7. Document the findings

- Append a **`## Findings — Round <r>`** section to the Log.
- Organize findings **by research question**, each with inline `[S#]` citations.
- Mark which findings are **new this round** vs. corroboration of an earlier round — this feeds the dry-round test in Step 8.
- Include **`### Contradictions & Uncertainties`** (conflicts + single-source/low-confidence claims) and a **`### Coverage Checklist`** marking each research question `[x] answered` / `[~] partial` / `[ ] open` with its corroboration level.

### 8. Gap check — loop or converge (the gate)

Run an explicit reasoning loop. Evaluate the gates **in order** and act on the first that fires:

1. **Floor gate.** Have you completed at least **min rounds** for the current tier? If **not**, you MUST loop — refine the queries toward the weakest-covered questions, increment the round, return to **Step 5**. Convergence is forbidden below the floor, no matter how complete the coverage looks.
2. **Re-score gate.** Recompute the heaviness score with what you now know. Did it climb into a higher tier (new contradictions, bigger external surface, more novelty than assumed)? If so, **escalate** — raise the floor and budget, log it, and loop.
3. **Value gate (the "stacking logic" test).** Would another pass still *materially change* `Fix_<n>.md`? Loop if **any** of these hold and the budget is not spent:
   - this round surfaced ≥1 **new material finding** (a fact, signature, edge case, failure mode, or better/safer approach) not known before;
   - a question is still `[~] partial` or `[ ] open` with material consequence for the plan;
   - a contradiction between sources is unresolved;
   - the research hinted at a better or safer design than the plan currently uses, but has not yet pinned it down.
4. **Converge** only when **none** of the above fire — i.e. the floor is met, the tier is stable, and the latest round was a **dry round** (a full scout→deep-read pass that added no new material findings) with no material open/partial questions and no unresolved contradictions. This is genuine diminishing returns, not first-pass optimism. Convergence is also forced when the **loop budget is exhausted**; in that case carry any remaining unknowns forward as **Open Questions** — do not keep searching past the budget.

Append a short **`## Gate Decision — Round <r>`** note recording: rounds done vs. min/budget, current tier (and any escalation), the **value delta** (count of new material findings this round / whether it was a dry round), the decision (loop / escalate / converge / budget-spent), and the reason.

### 9. Write the Research Brief (synthesis)

- Create `.agents/research/Brief_<n>.md` using the **same `<n>`** as the plan, following the **Research Brief skeleton** below. Leave the Research Log intact.
- This is the synthesis you will fold into the plan in Step 10 — facts and logic, organized by the research questions, every claim cited `[S#]`.

### 10. Refine and bolster the Fix plan (primary deliverable)

Now apply the researched knowledge back into `Fix_<n>.md`. This is the point of the skill.

- **Preserve the exact plan structure** (`Goal`, `Non-Goals`, `Files Affected`, `Verification Strategy`, `Phases`). Phase headings MUST remain `### Phase <N>:` so `Execute_plan` can still parse them.
- **Bolster, don't gut.** Keep the plan's valid existing detail; augment it. Specifically:
  - Correct or confirm external API signatures, library/SDK versions, and protocol details with what the research found.
  - Inject discovered edge cases, failure modes, gotchas, and security/performance notes into the phases they affect.
  - Where the research reveals a clearly better or safer approach, adjust the design and the affected phases — and say what changed and why.
  - Tighten Verification Strategy if the research surfaced a concrete way to test something.
- **Cite the basis.** Where research changed or grounded a decision, reference it inline with the same `[S#]` IDs (and/or a short "Research basis:" note) so the executor and a human can trace the reasoning to `Brief_<n>.md` / `Research_<n>.md`.
- **Final loop:** before saving, ask — "Is this plan now foolproof and grounded in the research? Does every external dependency it relies on have a verified basis?" Then **overwrite `Fix_<n>.md` in place** with the bolstered plan. Do not create a `_research` variant of the plan.

### 11. Internal verification pass (mandatory)

Before reporting, confirm:

- Every new fact or changed decision injected into `Fix_<n>.md` traces to a `[S#]` that exists in `Research_<n>.md`. No uncited claims smuggled into the plan.
- The plan still follows the required structure and `### Phase <N>:` headings are intact.
- No phase now depends on a later phase, and `Success Criteria` remain observable.
- The min-rounds floor for the final tier was met, and convergence was reached by a dry round or a spent budget — not by stopping early.
- Open Questions the research could not resolve are surfaced in the plan (e.g. in the relevant phase or Non-Goals) rather than silently dropped.

### 12. Report

- Reply with one or two short sentences naming all three files and the depth actually reached: e.g., `Researched Fix_3.md (Heavy tier, 4 rounds, 14 sources) → log .agents/research/Research_3.md, brief Brief_3.md; bolstered Fix_3.md in place.`
- Do **not** commit, open a PR, run code, or start executing. Hand back to the user, who runs `Execute_plan` when ready.

---

## Research Log skeleton (`Research_<n>.md`)

```markdown
# Research Log <n>: <short topic title>

## Target Plan
`Fix_<n>.md` — <its Goal in one line>

## Research Questions
1. <question / claim to verify, derived from the plan's unknowns>
2. ...

## Stopping Criteria
<every question answered with confidence + corroboration; converge only on a dry round>

## Constraints
- Recency: <e.g. last 2 years / N/A>
- Preferred sources: <...>   Distrusted sources: <...>

## Heaviness Sizing
| Signal | Score (0–2) | Note |
|--------|-------------|------|
| Breadth | _ | <# questions> |
| External surface | _ | <APIs/SDKs/protocols> |
| Novelty / maturity | _ | ... |
| Risk class | _ | ... |
| Blast radius | _ | ... |
| Pressure | _ | ... |
| **Total** | **_/12** | **Tier: T_ (<Light/Standard/Heavy/Critical>)** |

- Min rounds (floor): <N>   ·   Loop budget (cap): <N>
- Escalations: <none, or "Round 2: T2→T3 — contradictions on X surfaced">

## Sources
| ID | Title | URL | Type | Credibility / Date | Used? |
|----|-------|-----|------|--------------------|-------|
| S1 | ...   | ... | ...  | ...                | yes/no |

---

## Scout — Round 1
<candidate table for this round>

## Findings — Round 1
### By Research Question
- Q1: ... [S1][S3]   *(new this round)*
### Contradictions & Uncertainties
- ...
### Coverage Checklist
- [x] Q1 (confirmed, 2 sources)  - [~] Q2 (single source)  - [ ] Q3 (open)

## Gate Decision — Round 1
<rounds 1/min N, budget N · tier T_ · value delta: K new findings / not dry · decision: loop — reason>

## Scout — Round 2
...
```

## Research Brief skeleton (`Brief_<n>.md`)

```markdown
# Research Brief <n>: <short topic title>

> Source log: `.agents/research/Research_<n>.md` · Bolsters: `Fix_<n>.md`

## Question
<the plan unknowns this brief resolves, in one or two sentences>

## Executive Summary
<3–6 sentences answering the questions directly>

## Key Findings
- <finding> [S2]
- <finding> [S4][S7]

## Reasoning & Logic
<how the findings connect — the logical thread the plan edits will rest on>

## Impact on the Plan
- <which phase / section of Fix_<n>.md this changes, and how> [S#]

## Confidence & Caveats
- <claim>: high/medium/low — <why; corroboration level>

## Open Questions
- <anything unresolved, including items carried past a spent loop budget>

## Sources
| ID | Title | URL |
|----|-------|-----|
| S2 | ...   | ... |
```
