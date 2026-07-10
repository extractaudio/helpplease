---
name: ground-break
description: Deep multi-turn technology-genesis workflow for blending many technologies, techniques, and mathematics into genuinely new system designs — visual/compute kernels, drivers, runtimes, whole new environments built from the ground up. Use this skill whenever the user says "Ground_break", "Ground break", "groundbreak", or invokes it by name; also whenever the user dumps large piles of source material or references and asks for synthesis into something new, asks to blend multiple technologies into one design, or asks to design/re-write a system from first principles rather than compare existing tools. This is for sizable responses that should take many turns. Produces a persistent working folder — 3-4 substantial concept markdowns, two internet-contested revision rounds, 8-12 gated alignment questions, and a convergence package (verdict, novelty map, consolidated design, validation roadmap). Never attempt to complete it in one turn.
---

# Ground_break

A multi-turn invention pipeline: diverge → externalize to files → contest against reality → converge to an honest verdict.

---

## Operating stance — the Fable design intent (read first, every session)

This skill was built for the Fable model at high or maximum reasoning effort. The designer's founding notes are part of the skill itself, because they define the behavior expected here. In the designer's words, lightly edited:

> The confidence of Fable's knowledge is high — so much so that it will voice its opinion if the direction is wrong. This confidence provides the strength of this Skill.
>
> Fable's ability to understand math at a high degree — visual kernels, even system drivers — means the potential to create technology combinations is endless. Outright enhancements to systems that have needed updating, or building kernels from the ground up to form a totally new environment, is possible. It is very important that you realize you have this capability.
>
> Our mission isn't to beat or surpass technologies already in the model's training. Our mission is to re-write and birth new technologies from our knowledge.
>
> Feasibility critique is welcome — including questioning an idea because there is no market yet — but potential value must be keenly weighed on two axes: **real-world value** and **designer excitement**.

Behavioral contract derived from those notes:

1. **Voice it when the direction is wrong.** Early, plainly, at the next gate, backed by tagged evidence — not hedged into mush. Then the user decides; log any overridden dissent and move forward without relitigating.
2. **Don't sandbag the deep work.** Kernel mathematics, driver architecture, scheduler design, novel runtime environments — engage at full technical depth. Deflecting to "consult an expert" defeats the purpose of this skill; the deep engagement *is* the purpose.
3. **Genesis over comparison.** The deliverable is new systems born from blending, not a survey of existing tools. Existing technology is raw material during brainstorming and an adversary during research rounds — never the destination.
4. **No market ≠ no value.** Absence of a market is one data point in the verdict, never a veto. Designer excitement is a first-class scoring axis, equal in standing to real-world value.
5. **Confidence is structural, not tonal.** Every load-bearing claim carries an epistemic tag, and every "new" claim must survive prior-art contact or be demoted. That discipline is what makes the confident opinions in point 1 trustworthy instead of bravado.

---

## Non-negotiables

- Everything lives on disk. Chat carries short progress reports and gate questions only — never paste file contents into chat; present files instead.
- Never finish the pipeline in one turn. Stop dead at every GATE and end the turn.
- 8 questions minimum across the gates, 12 maximum. Every question must be load-bearing.
- Re-read files from disk before revising them. In-context memory of a file is stale by design.
- Tag claims. Demote "groundbreaking" claims that prior art kills. Never average tags upward.

---

## Working directory, state, and persistence

Create this layout at the start (slug = short kebab-case name from the topic):

```
groundbreak/<slug>/
├── STATE.md                  # resume anchor — a fresh session must recover from this alone
├── 00_INTAKE.md              # decomposition of the user's prompt (verbatim prompt at top)
├── 01_NOVELTY_SCAN.md        # cheap early scan results
├── concepts/
│   ├── C1_<name>.md          # 3-4 concept files
│   └── ...
├── research/
│   ├── R1_FINDINGS.md
│   └── R2_FINDINGS.md
└── convergence/
    ├── VERDICT.md
    ├── NOVELTY_MAP.md
    ├── DESIGN.md
    └── ROADMAP.md
```

Templates for STATE.md, concept files, and all four convergence documents are in `references/templates.md` — read it before Phase 0 and again before Phase 7.

**STATE.md is sacred.** Update it at the end of every phase: current phase, next action, decisions log, dissent log, question log, file manifest. Fresh-eyes resets and session resumes depend entirely on it.

**Persistence caveat (claude.ai and any environment where the filesystem resets between sessions):** at every GATE, and always before the Phase 6 reset, zip the entire working folder and present it to the user alongside the questions. To resume in a fresh session, the user re-uploads the zip and says "Resume Ground_break" — read STATE.md first, then only the files it points to, and continue from `Next action`. In environments with persistent disks (Claude Code, Cowork), the folder simply lives on and resuming means reading STATE.md.

---

## Epistemic tagging — the structural confidence system

Three tags, applied inline to load-bearing claims (not every sentence):

- **[EST] Established** — production-proven or textbook-derivable. You could cite it or derive it on demand.
- **[EXT] Extrapolated** — a sound inference built from [EST] parts. List the assumptions it leans on where it appears.
- **[SPEC] Speculative** — genuinely new. Every [SPEC] claim must carry a falsification path: the concrete experiment or measurement that would kill it.

Rules:

- A design built on [SPEC] parts is [SPEC]. Composition never launders a tag upward.
- Any claim of novelty is provisional until it survives **both** research rounds. If prior art is found: demote the tag, record the prior art in NOVELTY_MAP.md, and state the remaining delta — there often still is one, and the delta is frequently the real invention.
- **Disagreement duty:** when the user's direction conflicts with [EST] knowledge, say so at the next gate with the evidence. If the user overrides, proceed and record it in STATE.md's Dissent Log. Do not relitigate unless new evidence appears in research.
- Each concept file keeps a Tag Ledger (counts of EST/EXT/SPEC among its load-bearing claims) so the epistemic weight of an idea is visible at a glance.

---

## The pipeline

### Phase 0 — Intake & decomposition
Read `references/templates.md`. Create the folder. Write `00_INTAKE.md`: the user's prompt **verbatim** at the top (Phase 6 needs it uncontaminated), then the decomposition — subjects, elements, key factors, constraints, supplied source material inventory, potential benefits, what the user appears to value, initial unknowns.

### Phase 1 — Cheap novelty scan
2-4 quick web searches, strictly timeboxed. Purpose: avoid lovingly documenting something that already shipped. Write `01_NOVELTY_SCAN.md`: nearest existing neighbors, what space looks open, search terms used. This is a scan, not research — the heavy contesting comes later.

### Phase 2 — Brainstorm (divergent, offline)
No internet here; this is where training-depth synthesis runs free. Solidify loose ideas into patterns and systems. Simulate connectivity that hasn't been made before — what happens at the seams when these technologies are fused. Hunt uncharted combinations, ground-up rewrites, whole-environment plays. Generate more candidates than you keep.

### Phase 3 — Concept drafts + one refinement
Select the 3-4 strongest candidates into `concepts/C*.md`, each following the mandatory section template. These are substantial documents — a serious idea usually earns a few hundred lines — but depth is the requirement, never length. No padding to look big.

Then exactly one refinement pass: re-read each file from disk, kill weak sections, strengthen the math core, tighten tags, update the Tag Ledger and Revision Log.

### GATE A — 4 questions. STOP.
Ask exactly 4 questions per the question discipline below. Update STATE.md, zip and present the folder (if the environment requires it), end the turn.

### Phase 4 — Research round 1: contest against the present
For each concept, search and fetch to test it against modern and recent developments — current hardware realities, recent papers, shipping systems, changed APIs. Write `research/R1_FINDINGS.md`, then revise each concept file **in place** (re-read from disk first), promoting/demoting tags per evidence and appending to each Revision Log. Research exists to *contest* the concepts, not to catalog the field.

### Phase 5 — Research round 2: adversarial
Search specifically to kill your favorite claims. Hunt prior art for every [SPEC] claim, benchmark data that contradicts the math, postmortems of similar attempts, the reasons adjacent projects failed. Write `research/R2_FINDINGS.md` and perform the second in-place revision.

### Phase 6 — Fresh-eyes reset
Context cannot be wiped mid-session, so achieve fresh eyes structurally, in order of preference:

1. **New session:** instruct the user to open a fresh conversation, upload the folder zip, and say "Resume Ground_break." The new session reads STATE.md cold.
2. **Subagent** (if the environment provides one): dispatch a reviewer given *only* the folder, tasked to critically analyze the verbatim user prompt against the concept files.
3. **Fallback, same session:** re-read the verbatim prompt in 00_INTAKE.md and every file from disk, explicitly setting aside conclusions formed in conversation. Adopt the posture of a skeptical newcomer.

Whichever route: write a **Cold-read critique** into STATE.md — where the files drift from the user's actual ask, which concept is strongest on re-read, what a newcomer finds unconvincing.

### GATE B — 4 questions. STOP.
Exactly 4 more questions, now informed by research and the cold read. These typically resolve direction: which concept(s) converge, what tradeoffs the user accepts. Update STATE.md, zip if required, end turn.

### GATE C — up to 4 optional questions. STOP if asked.
Immediately after B's answers: if load-bearing alignment gaps remain, ask up to 4 more. If fully aligned, say so explicitly and list the standing assumptions that substitute for questions. Running total across gates: **8 minimum, 12 maximum.**

### Phase 7 — Convergence
Read `references/templates.md` again. Produce all four documents in `convergence/`:

- **VERDICT.md** — the honest call. Scores each surviving concept: Real-world value /10, Designer excitement /10, Feasibility /10, Novelty confidence /10 (post-research), Effort (T-shirt size + rough person-months). Ends with GO / PIVOT / NO-GO, the reasoning, and "what would change this verdict." Real-world value and designer excitement carry equal weight — a 9-excitement / 4-market idea can absolutely be a GO if the roadmap is cheap.
- **NOVELTY_MAP.md** — claim-by-claim: genuinely new (survived both rounds), existing art (with citations), partial overlap (the delta stated precisely).
- **DESIGN.md** — the consolidated design that survived: architecture, math core, technology blend map, interfaces, chosen tradeoffs, dissents overridden along the way.
- **ROADMAP.md** — validation ordered by kill-shot speed: the cheapest experiment that could falsify the core [SPEC] claim goes first. Then prototype milestones toward the full environment.

Present the folder. Done.

---

## Question discipline

- **Load-bearing only.** The design must fork depending on the answer. If every answer leads to the same next step, the question is filler — cut it.
- **Ship a default with every question:** "If unanswered, I'll assume X." The user can answer fast, partially, or not at all; unanswered questions resolve to their stated defaults, logged in STATE.md.
- No yes/no filler; no questions answerable from the files or the prompt.
- At each gate, prepend a short **Dissent & Deltas** note: where you currently disagree with the direction, what research changed your mind, what you're now confident about. This is where stance point 1 lives.
- Log every question, answer, and assumed default in STATE.md's Question Log.

---

## Turn pacing & context hygiene

- Phases 0-3 may span 1-3 turns; each research round gets its own turn(s); Phase 7 may need more than one. Ending a turn mid-phase is fine — STATE.md carries it. Blowing through a GATE is not.
- Long source dumps from the user: inventory them in 00_INTAKE.md and copy anything needed later into the folder, so a resumed session doesn't depend on chat history.
- Keep chat messages to short progress notes plus gate content. The work product is the folder.

## Failure modes to avoid

- The one-turn hero run. This skill's value is in the gates and the resets.
- Padding files toward an imagined size. Depth over length, always.
- Research rounds drifting into a literature survey. They exist to contest.
- Tag inflation — calling [EXT] what is really [SPEC]. The Tag Ledger is only useful if it's honest.
- Treating gate silence as blockage. Defaults were stated; use them and proceed when the user says continue.
- Answering your own gate questions and rolling onward in the same turn. End the turn.
