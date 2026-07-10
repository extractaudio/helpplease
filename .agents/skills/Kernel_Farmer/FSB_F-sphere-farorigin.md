# FIVE STEPS BACK — F-sphere row-7 far-origin conditioning
**Trigger:** bounty 2 + a fix that didn't move the metric (naive==stable at 1e8)
**Review mode:** same-session cold re-read isolating formula vs representation (probe: /tmp/cancel_probe.rs)

1. **Original ask:** "agreement within integrator tolerance" / precision at large origin.
2. **Shared assumption across attempts:** that the ERROR is in the ROOT FORMULA. Both attempts
   attacked the formula.
3. **Real task or symptom?** Symptom. Evidence: at 1e8, `c = oc·oc − r²` loses the −1 to f64
   representation (2^53 ceiling) BEFORE any root formula runs; naive and stable both = 1e-8.
4. **Greenfield answer:** entity-local precision framing (the kernel's own tolerance policy), not a
   cleverer quadratic. Assert correctness at representable scale (1e6 → <1e-12); treat 1e8/unit-sphere
   as below-resolution by design and document the contract.
5. **Verdict: REDEFINE** the acceptance test. The stable quadratic is still adopted (correct idiom for
   well-separated large roots) but is NOT what "fixes" 1e8 — nothing at f64 can, and that's honest.
