---
name: modify-panel
description: Modify an existing UI panel (TweaksPanel, ModulationPanel, TimelinePanel, ComposePanel, DiscordPanel, MidiPanel, AudioOutputsPanel) while preserving panel conventions. Use when the user prompts 'Modify panel'.
---

# Modify Panel Skill

**Trigger Keyword:** `Modify panel`

## Context
When the user prompts `Modify panel`, change one of the side/bottom panels under `frontend/src/panels/` without breaking the conventions every panel shares. Panels are user-facing surfaces with a small number of repeating concerns: mounting, toggling, persistence, API access, and (for some) a backend counterpart.

## Conventions Reference (do not violate)

1. **Source of truth** — All panel logic lives in `frontend/src/panels/`. Never edit legacy root-level files. Never edit `frontend/dist/`, `frontend/node_modules/`, `frontend/.vite/`.
2. **Right-side panel exclusivity** — `ModulationPanel`, `MidiPanel`, and `DiscordPanel` are mutually exclusive: opening one must close the others. If you add a new right-side panel, wire it into the same exclusivity group.
3. **API access** — Panels never call `fetch` directly. All HTTP traffic goes through `frontend/src/api/<domain>.js` wrappers built on `client.js → apiFetch()`. If a new endpoint is needed, add the wrapper first.
4. **WebSocket usage** — Panels that consume `/ws/levels` (or any WS) must resolve the URL through `VITE_API_BASE_URL` or the Vite proxy. **Never hardcode `127.0.0.1:8000`.** Reuse the module-level singleton in `useTimelineTransport.js`; do not open a second socket.
5. **Persistence** — User-preference settings (theme, accent, density, panel visibility) persist via `useTweaks()` to `localStorage`. Add new preferences to the `useTweaks` defaults rather than introducing a parallel storage layer.
6. **State scope** — Transient editor state lives in `useEditorState`. Container state lives in `useGraphSession`. Cross-cutting graph state lives in `GraphContext`. Pick the right hook for the value; do not mirror state across hooks.
7. **TimelinePanel decomposition** — `TimelinePanel.jsx` is composed of subcomponents in `frontend/src/panels/timeline/`. Lane-level UI changes go in the relevant subcomponent, not the parent panel.

## Execution Steps

### 1. Identify the target panel and scope

- Confirm which panel: `TweaksPanel`, `ModulationPanel`, `TimelinePanel`, `ComposePanel`, `DiscordPanel`, `MidiPanel`, `AudioOutputsPanel`, or a subcomponent under `panels/timeline/`.
- Restate the change in one sentence. Flag whether it adds new state, a new endpoint, a new persistent setting, or a new toggle.

### 2. Read the current state

Open these and confirm what exists today before drafting edits:

- `frontend/src/panels/<Name>Panel.jsx` — the panel itself.
- `frontend/src/app/AppShell.jsx` — where the panel is mounted and which prop drives visibility.
- `frontend/src/app/` topbar / `BottomUtilityDock.jsx` — where the toggle button lives.
- `frontend/src/api/<domain>.js` — if the panel hits the backend.
- `frontend/src/hooks/useTweaks.js` — if persistence is involved.
- For TimelinePanel: also `frontend/src/panels/timeline/*.jsx` and `useTimelineViewport.js`.
- For Modulation: also `nodes/base/ModulationIndicators.jsx` (ModDiamond) and `.docs/Modulation System.md`.
- For Compose: also `backend/routers/compose.py` and `agent_integration/`.

### 3. Determine the touchpoint set

For the proposed change, mark each as **touch** or **skip** with a one-phrase justification:

| Area | Touch when... |
|---|---|
| Panel JSX | UI / interaction / layout changes |
| `AppShell.jsx` | Mount/unmount, visibility prop, or layout slot changes |
| Topbar / BottomUtilityDock | Toggle icon, label, or exclusivity-group changes |
| `api/<domain>.js` | New or changed backend call |
| `backend/routers/<name>.py` | New endpoint shape required |
| `useTweaks.js` defaults | New persistent setting |
| `useEditorState.js` | New transient editor state needed |
| `useGraphSession.js` | Panel mutates container state |
| `panels/timeline/<sub>.jsx` | Timeline lane / ruler / transport / overview change |
| `.docs/Modulation System.md` / `.docs/LLM_Support_System.md` | Authoritative behavior changed (consult, do not edit unless the user asks) |

### 4. Draft and validate against conventions

- No direct `fetch` calls — route through `api/<domain>.js`.
- No hardcoded backend host/port. Use the wrapper or the Vite proxy.
- New right-side panels participate in the Modulation/MIDI/Discord exclusivity group.
- New persistent settings are added to `useTweaks` defaults with a sensible default value, not stored ad hoc.
- New backend endpoints have a matching frontend wrapper in the same change.
- Topbar icons follow the existing accent/contrast conventions.

### 5. Apply edits

- `Read` each file immediately before `Edit`/`Write`.
- Edit in this order:
  1. `useTweaks.js` (if new setting) or `api/<domain>.js` (if new endpoint) — declarations first.
  2. Backend router (if new endpoint).
  3. The panel JSX.
  4. `AppShell.jsx` mounting, then topbar / dock toggle wiring.

### 6. Verify

- Open the panel in the running dev server (`start.bat` or `npm run dev` from `frontend/`).
- Toggle the panel open and closed. Confirm exclusivity with other right-side panels if applicable.
- Exercise the new control end to end. If it hits the backend, confirm the request fires and the response is handled.
- Confirm persistence by reloading the page (for `useTweaks` settings).
- Scale verification per `CLAUDE.md` Verification Budget. State plainly if any step is skipped.

### 7. Report

One short message: which panel was modified, which conventions the change interacted with, and what was verified.
