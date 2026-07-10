# FEATURE REGISTRY — massa-rayfield
**As of:** cycle 001 (dry-run seed) · Portfolio: 14 SEED · 0 SPROUT · 0 GREEN · 0 HARDENED · 0 SEALED
**Mode pressure:** nothing built in-farm yet → first real cycle is GROW from M1; SDF reference stack seeds separately.
**Seed source:** RAYFIELD Build_1.md milestone list M0–M17 (each milestone = one registry line, acceptance test quoted).

## Sealed (off the work surface — Surveyor watch only)
_none yet_

## Hardened
_none yet_

## Green
_none yet_

## Sprout / Seed
| Feature | State | Registry source (design doc, quoted acceptance) |
|---|---|---|
| F-core-types (M1) | SEED | "Ray::point_at(t) returns origin + t*dir; RayState defaults alive=true, intensity=1.0" |
| F-surface-adapter (M2) | SEED | "finite-difference derivative checks gate everything downstream" — SampledSurface trait |
| F-analytic-cast (M3) | SEED | plane/sphere/cylinder/cone/torus closed-form intersect |
| F-patch-newton (M4) | SEED | "NURBS-sphere vs analytic-sphere" agreement; two-plane Newton |
| F-bezier-clip (M5) | SEED | "Bézier clipping enumerates the full root set" — global root isolation |
| F-bvh (M6) | SEED | "narrow-phase invocation count drops sharply; hit identical to brute force" |
| F-trim-reject (M7) | SEED | "ray through the hole's parameter region returns no hit" |
| F-topo-bind (M8) | SEED | "same face identified after upstream param change + re-resolve" |
| F-force-gravity (M9) | SEED | "impact time t*=√(2h/9.81); zero-force ≡ straight cast to 1e-9" |
| F-trajectory (M10) | SEED | Trajectory trait: Straight, ForceIntegrated |
| F-crawl-metric (M11) | SEED | "metric uniformity" via first fundamental form ds²=E du²+2F du dv+G dv² |
| F-fields (M12) | SEED | "isocurve coincidence"; GravityProjected v=g−(g·n)n, UvAxis |
| F-spline-emit (M13) | SEED | crawl path → NurbsCurve3D via curvo interpolation |
| F-ray-curve (M14) | SEED | 2×2 Newton in (t,s); (R−C)·d=0 ∧ (R−C)·C'=0 |

## Reference fields (COMPARE/GATHER only — NEVER farmed)
| Reference | Role | Note |
|---|---|---|
| massa-sdf | SDF mesher stack | adaptive-octree MDC; idiom source for field math, Lipschitz bounds |
| modified truck kernel | NURBS analytic base | truck-geometry evaluators; the surface-eval idiom to match |
| curvo | NURBS ops library | closest-parameter Newton, derivatives — standing GATHER shelf |
| crater-rs | ray-cast strategy | Newton nudge-fallback pattern — COMPARE target for M4 |

## Breach history
_none_
