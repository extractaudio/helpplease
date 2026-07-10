---
name: modify-node
description: Modify an existing node type (frontend component, factory, sizing, parameters, backend class) while enforcing the Node Architecture Mandates. Use when the user prompts 'Modify node'.
---

# Modify Node Skill

**Trigger Keyword:** `Modify node`

## Context
When the user prompts `Modify node`, change an existing node type in a way that preserves every Node Architecture Mandate. The authoritative mandate definitions are inline in `CLAUDE.md` (section "Node architecture mandates") and `GEMINI.md` (section "Node Architecture Mandates"). Read those sections before touching any code.

Node modifications are high-risk because they touch a coordinated set of files. A change that only updates the JSX without updating `parameterRegistry`, the backend node class, or the mutation handler will silently break modulation, the compose pipeline, or session round-tripping.

## Mandates Reference (do not violate)

Re-read these from `CLAUDE.md` / `GEMINI.md` for the full text. The compressed list:

1. **Universal Bar Structure** — HEADER (28 px) · CONNECTORS BAR (24 px) · BODY · optional FOOTER (20 px). All canvas pins live in the Connectors Bar at `PIN_Y = 40`. Constants live in `core/constants.js`. **Never add new usages of `PIN_Y_MAP`** — it is deprecated.
2. **State Ownership** — All audio-relevant node state lives in `graphContainers`. No component-local React state for audio-relevant values. All mutations go through `updNodes(cid, fn)`. The known `SourceNode.jsx` `localParams` violation must be migrated, not extended.
3. **Parameter Type System** — Every parameter declares `min`, `max`, `default`, and is one of `float` · `int` · `bool` · `enum`. No unbounded parameters. Required for modulation depth math, macro sliders, and the compose system.
4. **Pin Types & Fan Rules** — `chain` (1 out per source, replaces) · `trigger` (1 out per source, replaces) · `audio` (fan in + fan out, appends) · `param` (fan-out; 1 per target, replaces). Modulation **does not use canvas pins or wires** — sidebar only.
5. **Output Node** — Every container has exactly one `output` node (`id='output_{containerId}'`). Auto-created, undeletable, non-duplicable, no OUT pins. If the user asks to modify the Output node, restrict edits to the documented Output node shape.
6. **Run Graph** — Reachability is backward BFS from Output over `chains + audioConnections`. Trigger edges do NOT participate. `setContainerPlaying(cid, playing)` is the canonical entrypoint.

## Execution Steps

### 1. Identify the target node and scope of change

- Ask which node type is being modified if not stated (`output`, `audio`, `sampler`, `source`, `mixer`, `param`, `processor`, `trigger_source`).
- Restate the change in one sentence. Identify which mandate(s) the change interacts with.
- If the change would violate a mandate, stop and surface the conflict before proceeding.

### 2. Read the current state

Open these and confirm what exists today before drafting edits:

- `frontend/src/nodes/<type>/<Type>Node.jsx` — the component.
- `frontend/src/core/nodeFactory.js` — construction defaults.
- `frontend/src/core/nodeSizing.js` — natural width/height.
- `frontend/src/core/constants.js` — `NODE_TYPE_DEFS` entry, `SOURCE_PRESETS` if relevant.
- `frontend/src/core/parameterRegistry.js` — `nodeParameterDefs(node)` and `nodeModTargets(node)` for this type.
- `frontend/src/hooks/useGraphSession.js` — mutation handlers for this type (e.g. `onMixerChannelChange`, `onProcessorChange`).
- `frontend/src/nodes/NodeRenderer.jsx` — render case.
- `backend/audio/nodes/<type>.py` — backend class.
- For Source nodes only: also read `.docs/Source Node Redesign.md`.

### 3. Determine the touchpoint set

For the proposed change, mark each of these as **touch** or **skip** and justify in one phrase:

| Area | Touch when... |
|---|---|
| Component JSX | UI / interaction / layout changes |
| `nodeFactory.js` | Default construction values change |
| `nodeSizing.js` | Visible width/height changes |
| `NODE_TYPE_DEFS` in `constants.js` | Type metadata (label, color, default params shape) changes |
| `parameterRegistry.js` | Any parameter added, removed, renamed, or its range/type changed |
| `useGraphSession.js` mutation handler | New mutation surface needed |
| `NodeRenderer.jsx` | New props passed or rendering case changes |
| Backend `backend/audio/nodes/<type>.py` | Any change that affects audio output, parameter clamping, or modulation application |
| `backend/compose/engine.py` | Compose pipeline must construct the node with new defaults |
| Session migration in `ensureContainerDefaults` | Existing session files would deserialize incorrectly without a default |

A change is **not safe** if any "touch" row is left untouched.

### 4. Draft and validate against mandates

For the planned edits, verify against every mandate:

- All new canvas pins (if any) terminate in the ConnectorsBar at `PIN_Y = 40`. No literal pin Y offsets elsewhere.
- No new `useState` for any value that drives audio. All such state goes through `updNodes`.
- Every new parameter has `min`, `max`, `default`, and a declared type. Add it to `nodeParameterDefs`; if it should be modulatable, also add it to `nodeModTargets`.
- Pin fan-in/fan-out behavior matches the table above.
- Backend `apply_mods` (or equivalent) handles the new parameter; clamp ranges match the frontend declaration exactly.
- If the node has a `waveform` array, it is regenerated from seed on load and excluded from serialization.

### 5. Apply edits

- `Read` each file immediately before `Edit`/`Write` (harness requirement).
- Edit in this order to minimize broken intermediate states:
  1. `parameterRegistry.js` and `constants.js` (declarations first)
  2. Backend node class (so backend can accept the new shape)
  3. `nodeFactory.js`, `nodeSizing.js`, `NodeRenderer.jsx`
  4. The component JSX
  5. `useGraphSession.js` mutation handler
  6. `compose/engine.py` if defaults flow through compose
- Do not edit `frontend/dist/`, `frontend/node_modules/`, `frontend/.vite/`, `backend/.venv/`, `backend/__pycache__/`, or the legacy root-level `app.jsx` / `nodes/` / `ui/`.

### 6. Verify

- Backend: narrowest pytest that covers the touched path (e.g. `pytest backend/tests/test_audio_engine.py -v -k <name>`). For audio plumbing: `python -m backend.audio.engine selftest`.
- Frontend: visual check on the canvas — drag the node out, confirm pins sit at `PIN_Y = 40`, confirm bar structure, confirm parameter controls render and modulate correctly.
- Session round-trip: save and reload a container with the modified node to confirm serialization is intact.
- Scale verification per `CLAUDE.md` Verification Budget. State plainly if any step is skipped.

### 7. Report

One short message: which node was modified, which touchpoints were edited, which mandate(s) the change interacted with, and what was verified.
