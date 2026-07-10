# Kernel_Farmer — Document Templates

Read before creating any FARM/ document type for the first time each session. Templates are the *minimum* structure; add sections when content earns them, never to look thorough.

Conventions:
- Dates `YYYY-MM-DD`; cycles zero-padded (`CYCLE_007`); dispatches `D014_scout_booleans.md`.
- Task IDs: `<CLASS>-<field-slug>-<NN>` (`DEEPFIX-intersect-03`). Feature IDs: `F-<slug>` (`F-crawl-seam`).
- Epistemic tags on load-bearing math: **[EST]** / **[EXT]** (assumptions listed) / **[SPEC]** (falsification test attached).

---

## FEATURES.md — the registry (the sun)

```markdown
# FEATURE REGISTRY — <kernel name>
**As of:** cycle 012 · Portfolio: 2 SEED · 1 SPROUT · 4 GREEN · 2 HARDENED · 3 SEALED
**Mode pressure:** GREEN:SEALED = 4:3 (ok) · un-hardened GREEN = 4 → HARDEN forced soon

## Sealed (off the work surface — Surveyor watch only)
| Feature | Conf | Sealed | Certificate | Watch note |
|---|---|---|---|---|
| F-surface-jet | 94 | c009 | reviews/SEAL_F-surface-jet.md | stable 3 cycles |

## Hardened
| Feature | Conf | Missing for seal |
|---|---|---|
| F-crawl-step | 82 | rows 9 (adversarial), 12 (docs) — Skeptic dispatch queued |

## Green
| Feature | Conf | Battery rows earned (evidence) |
|---|---|---|
| F-force-gravity | 55 | 1 (tests/gravity.rs), 2 (golden/grav_011.png), 3, 4-partial |

## Sprout / Seed
| Feature | State | Registry source (design doc, quoted line) |
|---|---|---|
| F-bezier-clip | SPROUT | "Bézier clipping enumerates the full root set…" — RAYFIELD_BUILD_2 §17 |

## Breach history
| Feature | Breached | Ground (evidence) | Re-sealed |
|---|---|---|---|
```

Rules: confidence numbers always carry evidence pointers (kept in the Green/Hardened tables or an appendix). State changes happen only in Verify/book-keeping with the Assayer's scoring note. The "Mode pressure" line is recomputed every cycle — it drives the Steward's forcing table.

---

## VALUE_QUEUE.md

```markdown
# VALUE QUEUE — refreshed cycle 012 · mode declared: HARDEN
**Drought gauges:** viable candidates 6 ✓ · shelf fresh ✓ · confidence moving ✓ (no SCOUT force)

| # | Candidate (canonical phrasing) | Feature | Need | Lev | Conf↑ | Time | Cost⁻¹ | Pen | Rank note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | we must attempt a deeper fix for : Newton grazing divergence | F-ray-intersect | 5 | 5 | 4 | 4 | 3 | — | bounty 3 → debts first |
| 2 | we need to refine : crawl docs to battery row 12 | F-crawl-step | 3 | 2 | 3 | 3 | 5 | — | unlocks seal |
| 3 | we need to add : reflection trajectory | F-ray-reflect | 4 | 3 | 3 | 2 | 4 | ritual −2 | resembles c010 add w/o new evidence — held |

**Not chosen & why:** <one line each — this section is the drift audit>
```

Each axis 1–5 with the one-line rationale living in the rank note or an appendix. Penalties named, never silent. Held/penalized items stay visible — hiding them is how ritual sneaks back.

---

## STATE.md

```markdown
# FARM STATE — <kernel name>
**Cycle:** 012 (last completed) · **Updated:** 2026-07-03
**Budget:** 4 granted (invocation "Kernel_Farmer #4") · 3 spent · 1 returned (early stop: compass)
**Drought gauges (last check c012):** queue 5 viable ✓ · shelf fresh ✓ · confidence moving ✓
**Next action:** "Run Cycle 013, mode RESCUE; default: DEEPFIX-intersect-03 at bounty 3
  (friends pass + alternatives memo owed)."

## Standing context
- Repo root / FARM root: <paths> · Test cmd: `cargo test -p <crate>` · Golden manifest: golden/manifest.md
- Visual method: <e.g. OBJ dump + golden/tools/raster.py>
- Reference fields (COMPARE-only, never farmed): <massa-sdf, modified truck kernel, …>

## Open flares
| Flare | Raised | Awaiting |
|---|---|---|
| FLR-002 f64-in-wgpu wall | c011 | user decision (default: accept limitation, FALLOW) |

## Open bounties ≥ 2
| Task | Bounty | Next required arsenal |
|---|---|---|

## Decision log (newest first) / Dissent log / FALLOW re-open watch / File manifest
<as before — one line each, auditable>
```

The resume test: could a fresh session with *only this file* find everything else and continue? If not, a line is missing.

---

## FIELD_MAP.md

Unchanged in spirit from v1 — subsystems scored 0–5 on Correct/Capab/Effic/Docs/Visual, `—` for N/A, median computed, rotation-eligibility callout, scores move only on evidence named in scoring notes. Reference fields listed but never scored for farming. Sealed features' fields keep their scores frozen with a `🔒` note.

---

## LEDGER.md — the bounty board

As v1: Open (task header in canonical phrasing, **bounty**, feature line, attempt post-mortems written at fail time, "next required arsenal" line), Fallow (best hypothesis + re-open condition), Closed → HARVEST_LOG index. New in v2: every task header names its `F-<slug>` registry line; a task that can't is rejected at triage, not logged.

## HARVEST_LOG.md

As v1 — one line per harvest, newest first, `| Cycle | Task | Price | One-line harvest | Visual |` — plus retroactive entries at farm start from archived "STATUS: IMPLEMENTED" roadmaps. This file and the seal list are the redundancy detector's grep targets; keep target phrasing searchable.

---

## FLARES.md + the flare format

```markdown
# SIGNAL FLARES

## 🔥 OPEN — FLR-002 · f64 GPU bake wall
**Raised:** cycle 011 (bounty 4 on ADD-gpubake-01) · **Blocks:** F-bake-displacement, F-bake-masks
**Attempt digest:** c008 wgpu native f64 — unsupported; c009 emulated double-double — 40× slow;
c010 split-precision boundary — precision loss at seams (golden/bake_seam_010.png).
**Best hypothesis:** wall is upstream (wgpu/ecosystem), not our design.
**Options:** (a) accept limitation, f32 at bake boundary only, document the contract — cheap;
(b) CPU-side bake, GPU display only — medium, costs interactivity; (c) wait on ecosystem — free, indefinite.
**Decision needed:** pick a/b/c. **Default if deferred:** (a), task → FALLOW, re-open on wgpu f64 news.

## Resolved
| Flare | Resolution | Cycle | Logged lesson |
```

Flares are duplicated at the **top of the gate message** verbatim-in-spirit: plain, priced, with a default. Resolution lessons are one line — enough that the same wall is never rediscovered.

## Compass check (chat, top of gate — direction, where a flare is walls)

```markdown
🧭 COMPASS — exact B-Rep booleans vs SDF/manifold hybrid as the boolean spine
**Found:** D019 (OCCT GFA study, conf 7) supports exact-path viability at high effort; D021
(Manifold + SDF fallback survey, conf 8) shows the hybrid shipping today. Dossiers coherent but fork.
**Directions:** (a) exact B-Rep spine — 8–12 cycles, unlocks tolerant-modeling parity, high math risk;
(b) hybrid now, exact later behind the GeometryKernel trait — 3 cycles to capability, defers the risk;
(c) scout one more level (Parasolid boolean docs) before choosing — 1 cycle, may not resolve.
**Steer needed.** Default if deferred: (b) — capability first, exact path stays open behind the trait.
```

Logged in STATE.md's decision log with the answer or consumed default; a fork is never re-asked.

## Gate message under a cycle budget

Per-cycle **inline checkpoints** compress each gate to ~5 lines in chat (mode, harvests, registry Δ,
anything consumed as default) with the full content living in that cycle's report. The **consolidated
gate** at run end carries everything: flares/compass first, merged harvest table with visuals, registry
movement across all cycles, map snapshot, bounties ≥2, queue top, **budget accounting** ("spent 3 of 4 —
1 returned: compass raised c015") and **defaults consumed** (listed for retro-veto), then next default.

---

## dispatches/D<NNN>_<role>_<slug>.md

```markdown
# DISPATCH D014 — SCOUT — boolean robustness precedent
**Cycle:** 012 · **Charge:** <one charge, one question>
**Context given:** FARM/ + <specific files> (nothing else — clean context is the point)

## Reference Appetite card (Scout dispatches)
- **Question:** How do production kernels guarantee manifold output from B-Rep booleans
  when faces are near-coplanar?
- **Named targets:** OCCT BOPAlgo docs; Manifold library wiki; CGAL Nef_3; internal Repo-boolmesh.md first
- **Satisfied by:** the classification math written out + each kernel's tolerance strategy + failure cases they document

**Chain (drought L3 only):** seeded by D0NN's `Next question:` — that dossier attached as context.

## RETURN (appended by the dispatched role)
<dossier / audit findings / certification — per the role's brief in guild.md>
**Return confidence:** <0–10> · **Would change my mind:** <one line>
**Next question:** <the sharpest question these findings raised — mandatory on Scout returns; fuels L3 chaining>
```

Audit and certification dispatches use the same file shape; the Appetite card section is Scout-only.

---

## cycles/CYCLE_NNN.md

```markdown
# CYCLE 012 — 2026-07-03 · MODE: HARDEN (forced: 4 un-hardened GREEN)

## 1 · Survey — deltas, test run vs golden (Δ), registry watch (sealed regressions?), map moves
## 2 · Queue — top 5 with scores; NOT-chosen list with reasons; redundancy grep results
## 3 · Dispatch — who was sent, with what charge, and why them
## 4 · Work — narrative with tags; alternatives considered; dispatches returned (summarized, files linked)
## 5 · Verification — three locks with evidence; visuals VIEWED (what the eye confirmed, anomalies → tasks);
     battery rows earned/struck; lifecycle crossings flagged
## 6 · Book-keeping — harvests at price / bounties +1 with post-mortems; registry, map, queue, flare updates
## 7 · Next-cycle default — mode + focus, one sentence
```

The rhyme check: before writing, skim the previous two reports. If this one could be swapped with either, say so in §7 and force AUDIT next.

## Gate message (chat) — shape, not template
Order is fixed: **flares → harvests + visuals → registry movement (states, confidence Δ, seals) → map snapshot → bounties ≥2 → queue top → next mode + default** ("unless redirected…"). Zip FARM/ if the environment resets. Then stop.

---

## reviews/ — three document types

**FSB_<task>.md — Five-Steps-Back** (unchanged from v1): trigger; review mode (fresh session / subagent / cold re-read); the five steps — original ask quoted, shared assumption across attempts, real-task-or-symptom, greenfield answer, verdict from {REDEFINE, SPLIT, DESCEND, FALLOW, PROCEED} (PROCEED must argue why the failures were execution accidents — high bar on purpose).

**BREACH_<feature>.md:**
```markdown
# BREACH — F-surface-jet
**Ground (evidence, one of):** reproducible regression <test/case> / design-doc requirement (quoted) /
Skeptic finding <dispatch link> / user order <quote>
**Proposed by:** <role> · **Reviewed by Skeptic:** <verdict + note>
**Effect:** SEALED → GREEN at conf <n>; battery rows zeroed: <list>; re-hardening plan: <tasks opened>
```
No valid ground, no breach — "a nicer way to write it" is not ground.

**SEAL_<feature>.md:** per `references/hardening.md` — confidence total with per-row evidence pointers, adversarial cases run, visual gallery reviewed, the mandatory "I attempted to break this and here is what I tried" narrative, certification. Missing the break-attempt narrative → invalid certificate.

---

## gather/G-<field>-<NN>.md — research note

As v1: sources (internal corpus first, then fetched — dated); **the math written out** (equations, numbered algorithm steps, convergence + edge conditions — implementable offline); an alternative formulation and when it wins; known failure modes of each (this section is why bounty-2 mandates GATHER); implementation notes for scratch f64 Rust (cancellation points, tolerance placement, Result-over-panic spots). Test of a gather note: could the next attempt implement from this note alone, offline?

## golden/ conventions

As v1: `manifest.md` authoritative test list (Survey diffs against it); visuals `<field>_<what>_<cycle>.png` with before/after stems `_before`/`_after`; `tools/` holds the small, dependency-light raster/plot scripts written once. New in v2: per-feature visual galleries indexed from the seal certificate — the gallery is the "stressed in many ways" receipt.
