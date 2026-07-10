---
name: modify-frontend-backend
description: Make a coordinated change across the frontend and backend so the two halves stay in lockstep. Use when the user prompts 'Modify Frontend + Backend'.
---

# Modify Frontend + Backend Skill

**Trigger Keyword:** `Modify Frontend + Backend`

## Context
When the user prompts `Modify Frontend + Backend`, the change crosses the FE/BE contract surface (REST, WebSocket, node shape, session shape, compose pipeline, modulator behavior). Both halves must be updated **in the same change** or the graph ends up in an inconsistent state — sessions fail to round-trip, modulators produce wrong values, the compose pipeline emits containers the frontend can't render, or the audio engine silently drops parameters.

This skill exists because Jules (and any agent) tends to update the JSX, declare "done," and leave the backend behind. The workflow here forces a contract-first approach: identify what crosses the boundary, then update both sides together.

## Contract Surfaces (the bridges that must stay synced)

Every coordinated change interacts with at least one of these:

| Surface | Frontend side | Backend side | Parity rule |
|---|---|---|---|
| **Node shape** | `core/nodeFactory.js`, `core/parameterRegistry.js`, node JSX | `backend/audio/nodes/<type>.py` | Param `min`/`max`/`default` must match clamp ranges. |
| **Modulator** | `panels/ModulationPanel.jsx`, `core/modulation.js` | `backend/audio/modulators.py`, `_topo_sort_modulators` | Inter-mod chaining (`positionInput`, `inputSocket`) topology must remain acyclic on both sides. |
| **Session format** | `state/GraphContext.jsx`, `ensureContainerDefaults` in `hooks/useGraphSession.js` | `backend/routers/sessions.py`, audio engine container intake | Version bumps require a migration path. `waveform` arrays excluded from serialization. |
| **Compose pipeline** | `panels/ComposePanel.jsx`, `api/compose.js` | `backend/compose/{bridge,engine,models}.py`, `data/preset_map.json`, `data/mood_curves.json` | `SOURCE_PRESETS` in `core/constants.js` must match `data/preset_map.json` keys. |
| **Waveform generation** | `core/waveformGen.js` | `backend/compose/waveform.py` | **Bit-for-bit identical.** Enforced by `backend/tests/test_waveform_parity.py`. |
| **Timeline transport** | `hooks/useTimelineTransport.js` | `backend/routers/levels.py`, `AudioEngine.set_transport`, `GraphRuntime.set_transport_time` | WS message shape `{type:"transport", time, playing}`. Never hardcode `127.0.0.1:8000`. |
| **Audio endpoints** | `api/<domain>.js` | `backend/routers/<name>.py` | Request/response shape, status codes, error messages must match. |
| **Device I/O** | `panels/AudioOutputsPanel.jsx`, `api/devices.js` | `backend/routers/devices.py`, `MonitorSink` | Device IDs round-trip through PortAudio identifiers, not browser MediaDevices. |
| **Levels / VU** | `hooks/useLevels.js`, `components/TopbarVU.jsx` | `backend/routers/levels.py`, `compute_levels()` | Frame shape: structured RMS/peak per channel. Never reintroduce synthetic VU animation. |

## Execution Steps

### 1. Identify the contract surface

- Restate the change in one sentence.
- Map it to one or more rows in the **Contract Surfaces** table above.
- If no row applies, the change is probably not actually cross-cutting — ask the user whether `Modify node` or `Modify panel` would fit better.

### 2. Read both sides

Open the relevant files on each side of the surface. At minimum:

- Frontend: every file listed in the table's "Frontend side" column for the surfaces in scope.
- Backend: every file listed in the "Backend side" column.
- For session-shape changes: also read `ensureContainerDefaults` and any existing migration logic. Read `CLAUDE.md` section "Session format (`.loom`)".
- For waveform changes: read `backend/tests/test_waveform_parity.py` — this test will fail loudly if the parity is broken, and is the canonical proof of correctness.
- Read the relevant `.docs/` design spec if one exists for the surface (`Modulation System.md`, `LLM_Support_System.md`, `Source Node Redesign.md`, `Timeline Imlementation plan.md`).

### 3. Design the contract change

Before editing, write out the contract delta as a short block — request/response shape, message shape, or data shape — and confirm both halves will conform.

For shape changes, decide explicitly:

- **Is a version bump required?** If existing session files won't deserialize, write the migration into `ensureContainerDefaults` before bumping anything.
- **Is a new field optional or required?** Optional fields with defaults are safer than required fields.
- **Does the field need clamping?** Add the clamp on the backend, declare the range on the frontend.
- **Does it need to flow through the compose pipeline?** If yes, update `engine.py` defaults and any preset data.

### 4. Apply edits — backend first

The order matters. Backend changes go first so the frontend has a real endpoint to call against during verification.

1. Backend data/model definitions (e.g. `compose/models.py`, node class fields).
2. Backend logic (router, node `render`, modulator `render`, audio engine plumbing).
3. Backend tests for the new shape.
4. Frontend API wrapper in `api/<domain>.js` (if applicable).
5. Frontend declarations (`parameterRegistry.js`, `constants.js`, `nodeFactory.js`).
6. Frontend UI (panel, node JSX, hook).
7. Frontend migration (`ensureContainerDefaults`) if session shape changed.

`Read` immediately before each `Edit`/`Write` (harness requirement). Do not edit `frontend/dist/`, `frontend/node_modules/`, `frontend/.vite/`, `backend/.venv/`, `backend/__pycache__/`, or the legacy root-level `app.jsx` / `nodes/` / `ui/`.

### 5. Verify both sides

Pick the **narrowest** verification per `CLAUDE.md` Verification Budget that exercises the contract end to end.

- Backend unit: `pytest backend/tests/test_<area>.py -v` for the touched router/engine/modulator/compose path.
- Waveform parity (if waveform touched): `pytest backend/tests/test_waveform_parity.py -v`. This MUST pass.
- Audio engine smoke (if engine touched): `python -m backend.audio.engine selftest`.
- Frontend: start the dev server, exercise the feature, watch the network tab / WebSocket frames to confirm the wire shape matches.
- Session round-trip (if session shape changed): save a session, reload the page, confirm the container deserializes correctly.

If a verification step is skipped because the change is low-risk or tooling is unavailable, say so plainly. Do not imply success.

### 6. Report

One short message: which contract surface was changed, what the delta is, which files on each side were touched, and what was verified.
