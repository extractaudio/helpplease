---
name: coordinated-change
description: Make a change that spans multiple files or a contract boundary (API/UI, schema/consumers, protocol/clients) so every side stays in lockstep. Use for any coordinated multi-file edit where updating one side without the others would silently break the system — the general, app-agnostic version of modify-node / modify-panel / modify-frontend-backend.
---

# Coordinated Change

**Use when** a single logical change has to land in several places at once — two sides of an API, a schema and everything that reads it, a shared type and its implementations, a protocol and its clients. The failure mode this prevents: updating one side, declaring "done," and leaving the other side silently broken (data that won't round-trip, callers that pass the wrong shape, defaults that never propagate).

This is the reusable pattern. Project-specific instances (with concrete file lists and parity rules) can specialize it — e.g. `modify-frontend-backend`, `modify-node`, `modify-panel` do this for a specific graph-audio app.

## The core idea: contract first

A coordinated change is defined by the **contract** that crosses the boundary — the shape both sides must agree on (request/response body, message envelope, table columns, function signature, event payload, file format). Change the contract deliberately and explicitly; then bring every side into conformance in one change.

## Execution Steps

### 1. Name the contract surface

- Restate the change in one sentence.
- Identify the boundary it crosses and the exact contract on that boundary: the shape, its fields, their types, and any invariants (ranges, ordering, required vs optional).
- If nothing actually crosses a boundary, this is a single-file edit — you don't need this skill.

### 2. Enumerate every side (the touchpoint set)

List each place that must change and why. A useful default table:

| Side | Touch when... |
|---|---|
| Producer / writer | It emits or stores the contract shape |
| Consumer(s) / reader(s) | They parse or depend on the shape |
| Shared type / schema / interface | The contract is declared here |
| Validation / clamping | Bounds or required-field checks live here |
| Persistence / migration | Existing stored data must still deserialize |
| Tests / fixtures | They assert the old shape |
| Docs / examples | They describe the contract |

Mark each row **touch** or **skip** with a one-phrase justification. The change is **not safe** while any "touch" row is unaddressed. Use search (grep/references) to find every consumer — do not rely on memory.

### 3. Design the contract delta

Write the before → after of the contract as a short explicit block. Decide:

- **New field: optional or required?** Optional-with-default is safer and usually backward compatible.
- **Migration needed?** If stored/persisted data won't deserialize under the new shape, write the migration *before* bumping any version.
- **Where do invariants live?** Validate/clamp at the authoritative side; declare the same bounds at the other side so they can't drift.
- **Backward compatibility:** can old and new coexist during rollout, or is this a breaking change that must land atomically?

### 4. Apply edits in dependency order

Edit declarations before their consumers so intermediate states stay as coherent as possible:

1. Shared type / schema / contract declaration.
2. Authoritative side (the producer or the validating side).
3. Persistence and migration, if the stored shape changed.
4. Consumer sides.
5. Tests and fixtures.
6. Docs/examples.

Adapt the order to your dependency direction — the rule is "the thing others depend on changes first." Read each file immediately before editing it.

### 5. Verify the contract end to end

Pick the narrowest check that actually exercises the boundary, not just one side:

- A test that sends the new shape through the producer and asserts the consumer accepts it.
- A round-trip test if data is persisted (write → read back → compare).
- A schema/type check or contract test if one exists.
- A manual end-to-end exercise (watch the real request/message/frame) when automated coverage is thin.

If you skip a check because the change is low-risk or tooling is unavailable, say so plainly — never imply success you didn't verify.

### 6. Report

One short message: which contract changed, the delta, which sides were touched, and what was verified.

## Anti-patterns

- Updating one side and calling it done ("the UI works" while the API still returns the old shape).
- Adding a required field with no migration for existing data.
- Declaring bounds on one side only, so the two drift apart later.
- Guessing the list of consumers instead of searching for them.
- Verifying only the side you find convenient.

## Environment

- **Announcing steps:** use the host's planning tool before editing (`set_plan` under Jules/Codex — see `jules-profile`; `TodoWrite` under Claude/Cowork; inline checklist otherwise).
- **Version control:** no auto-PR. Leave commits to the user unless they ask otherwise.
