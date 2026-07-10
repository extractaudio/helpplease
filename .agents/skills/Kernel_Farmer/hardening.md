# Kernel_Farmer — Hardening Battery & Confidence Rubric

"Stressed and tested in many ways" is a checklist, not a feeling. This file defines what a feature must survive to advance through GREEN → HARDENED → SEALED, and exactly how its confidence score (0–100) is earned. The Assayer scores; the Skeptic can strike; nobody asserts.

Confidence movement rules:
- Points come **only** from battery rows with named evidence (a test file, a plot, a doc section). The evidence pointer is recorded next to the score in FEATURES.md.
- The Skeptic strikes points with counter-evidence; strikes are logged with the evidence, and struck rows must be re-earned, not argued back.
- A regression on any earned row zeroes that row the same cycle (Surveyor's watch). On a SEALED feature, any drop below 90 is an automatic breach.
- Rows marked **(M)** are mandatory for sealing regardless of total score.

Thresholds: **GREEN** requires rows 1–3. **HARDENED** ≥ 70 with rows 1–8. **SEALED** ≥ 90, all (M) rows, plus the Skeptic's certificate.

---

## The battery

| # | Row | Pts | What earns it |
|---|---|---|---|
| 1 | **Unit correctness (M)** | 10 | Core math pinned against analytic ground truth (sphere/torus/plane closed forms, known integrals) — not against the code's own output |
| 2 | **Visual proof (M)** | 10 | Baseline render/plot in `golden/`, viewed and described by the Assayer; before/after pair if the feature changed existing behavior |
| 3 | **API honesty (M)** | 5 | Geometric failure returns `Result`, never panics; error variants tested |
| 4 | **Degenerate battery (M)** | 12 | The inputs nobody wants: zero-length/zero-area, coincident, tangent/grazing, collinear, repeated knots, closed/periodic seams, empty sets. Each case is a named test |
| 5 | **Scale sweep** | 8 | Behavior verified at ~1e-6 and ~1e6 model scale; tolerances proven local (scale-derived), not a global epsilon in disguise |
| 6 | **Property / fuzz** | 10 | Invariants under randomized input: watertightness, manifoldness, symmetry/idempotence laws, round-trips (insert-then-remove, split-then-join), conservation where applicable |
| 7 | **Numeric conditioning** | 10 | Known cancellation points identified and tested; convergence *order* asserted where an iterative solver claims one (the quadratic tail measured, not assumed); Lipschitz/bound claims locked by test |
| 8 | **Long-run / accumulation** | 8 | Drift, energy, or error growth measured over long integrations or large batches, with an asserted bound |
| 9 | **Adversarial (Skeptic-authored)** | 10 | The Skeptic writes cases the Grower didn't imagine; feature survives them. This row cannot be scored by the Assayer alone |
| 10 | **Cross-check vs reference** | 7 | Outputs compared against an independent implementation or a Scout dossier's reference math on shared cases; discrepancies explained or fixed |
| 11 | **Performance floor** | 5 | Hot path profiled once; no allocation storms or accidental O(n²); a budget stated so future regressions are detectable |
| 12 | **Docs a stranger can extend (M)** | 5 | Design note + worked example that actually executes; a newcomer could add the next variant from the docs alone |

Total: 100. Rows that genuinely don't apply to a feature (e.g. long-run drift for a pure data structure) are marked N/A by the Assayer *with justification*, and the denominator shrinks accordingly — N/A is a judgment on record, not an exemption to grab.

---

## Battery design notes

- **Row 1 vs row 10**: row 1 pins math against *closed forms*; row 10 pins it against *someone else's implementation*. A feature can pass one and fail the other — that's exactly the discrepancy worth catching.
- **Row 4 is where kernels die.** The degenerate list above is the floor; the feature's own geometry suggests more (a crawl feature adds seam-crossing and pole cases; a boolean adds coplanar-face cases). The Assayer extends the list per feature and records the extension in the seal-eligibility note.
- **Row 9 exists because builders test what they thought of.** It is deliberately unscoreable without a second mind (or a fresh-context dispatch). No adversarial row, no seal.
- **Visual rows compound**: every battery row that produces geometry should leave a picture. The seal certificate links the feature's full visual set — that gallery *is* the "stressed in many ways" receipt.

## Seal certificate (written by the Skeptic to `reviews/SEAL_<feature>.md`)

States: the confidence total and per-row evidence pointers; the adversarial cases run and their outcomes; the visual gallery reviewed; the explicit sentence "I attempted to break this and here is what I tried"; and the certification. A certificate missing the attempted-break narrative is invalid — certification is a record of aggression survived, not a signature ceremony.
