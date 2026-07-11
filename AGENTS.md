# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Montana PQH Team: an installable, mobile-first performance PWA for five Montana stores. Google sign-in/profile onboarding, role-aware Firestore data, daily performance entry, monthly goals, milestone payouts, leaderboard, employee administration, store directory, live store-open status, and schedule calendar exports. Also packaged as a debug Android APK via Capacitor.

The repo has three independently-versioned parts:
- `app/` — the React client (its own `package.json`, own `node_modules`)
- `functions/` — Firebase Cloud Functions backend (its own `package.json`)
- Repo root — Firebase project config only: `firebase.json`, `firestore.rules`, `firestore.indexes.json`

Always `cd app` (or `cd functions`) before running npm commands — there is no root `package.json`.

## Commands

Setup (Windows convenience scripts, from repo root): `install.bat` installs both `app/` and `functions/` deps and creates `app/.env.local` from the example if missing; `start.bat` self-installs if needed and launches the dev server, opening the browser automatically. Manually:

```powershell
cd app
npm install
npm run dev          # Vite dev server, opens browser automatically (server.open in vite.config.ts)
npm run test         # vitest run — all tests, once
npm run build         # tsc -b && vite build
npm run preview       # preview the production build
```

Run a single test file or filter by name:

```powershell
npx vitest run src/domain/store-hours.test.ts
npx vitest run -t "DST spring-forward"
```

Typecheck only (no emit): `npx tsc -b` from `app/`.

Cloud Functions (`cd functions`):

```powershell
npm install
npm run build          # tsc, emits to build/
npm run deploy         # build then firebase deploy --only functions
```

Android debug APK (`cd app`, requires Node 22+, a JDK, and Android SDK API 36 / Build Tools 36.0.0):

```powershell
npm run android:sync    # build + cap sync android
npm run android:apk     # sync, then gradlew.bat assembleDebug
```
Output: `app/android/app/build/outputs/apk/debug/app-debug.apk`. This build bundles Demo mode and the Live path's Firebase web config from `app/.env.local`; it has no native Google auth and is not Play Store or release-signing ready.

There is no linter/formatter configured in this repo — don't invent lint commands.

## Architecture

The client (`app/src/`) is layered, with strict downward dependencies: `app → features → shared → {domain, data, services}`. Everything imports via the `@/*` alias (resolves to `app/src/*`); never use deep relative paths (`../../..`) across a layer boundary. Within a feature/shared folder, import siblings by direct path (`./ShiftCard`), not through that folder's own barrel — importing a folder's own `index.ts` from inside itself is a self-cycle.

- **`app/src/app/`** — the shell. `App.tsx` does only entry-mode gating (welcome → demo/live → onboarding → loading → ready) and composition; it holds no page logic. `AppShell.tsx` is chrome (topbar/sidebar/drawer/bottom-nav). `AppRouter.tsx` is the page switch that wires feature components to state. `useApplicationState.ts` is the single source of truth for whether the app is reading/writing to local demo state or live Firestore — see below. `entry/` holds Welcome, LoadingCard, Onboarding.
- **`app/src/domain/`** — framework-free business logic and types, no React/Firebase imports. `types.ts` (all domain types), `metrics.ts` (metric math, pace, payout — all date logic anchored to `America/Denver`), `schedule.ts` (App Schedule row validation/ICS export — the row contract here must stay byte-identical to `functions/src/schedule-sync.ts`'s expectations), `store-hours.ts` (open/closed status, DST-safe "opens tomorrow" logic), `store-directory.ts`, `entry-mode.ts`, `app-state.ts`. Unit tests are co-located (`*.test.ts` next to the module).
- **`app/src/data/`** — seed/config data only (`stores`, `metric-labels`, `initial-state`), re-exported through `data/index.ts`.
- **`app/src/services/`** — infrastructure. `firebase.ts` exports `firebaseEnabled` (sync, cheap — just checks `import.meta.env`) and `loadFirebase()`, which lazily `import()`s `firebase/app`/`auth`/`firestore` on first real use so the ~700KB SDK never ships to a demo-only page load. `auth.ts` and `repository.ts` build on `loadFirebase()` but keep their own external signatures unchanged (sync functions that return an `Unsubscribe` stay sync-returning even though the actual Firestore listener attaches asynchronously inside — this is deliberate so callers in `useAppData.ts` never had to change). `useAppData.ts` holds the raw `useFirebaseSession`/`useRemoteData` hooks.
- **`app/src/shared/`** — presentational primitives (`ui/`: Stat, MetricForm, PageIntro, PendingCard, `format.ts`'s `initials`) and `navigation/` (nav item list + NavButton/SideNav). No business logic.
- **`app/src/features/{performance,schedule,administration,stores}/`** — one component per file, each folder exposing its public components through `index.ts`. Feature-local helpers that don't belong in `domain/` (e.g. `features/schedule/helpers.ts`) stay in the feature folder — but if a helper duplicates something `domain/` already does correctly (e.g. store-hours math), prefer calling the domain version over re-deriving it locally; this codebase has had real bugs from exactly that kind of drift.

**State model (`useApplicationState.ts`):** there are two parallel data sources — `demo` (React state persisted to `localStorage`, always available) and `remote` (Firestore, only populated once signed in). Which one is authoritative is decided by one boolean, `liveReady = liveAccess && firebaseEnabled && session.user && remote.profile && remote.data` — this same boolean gates both which state is *read* (`state`) and where writes go in `update()`. Never let those two decisions diverge (a bug where they did caused demo-derived writes to reach the live database).

**Firestore is the source of truth for live mode; `firestore.rules` is the actual authorization boundary**, not the client. `isManagerFor(storeId)` = area manager (any store) or store manager (own store only). Grant the narrowest verb a rule actually needs (e.g. `stores/{storeId}` is `update`-only for store managers, `create`/`delete` stays area-manager-only) — there is no rules-emulator test suite in this repo, so a rules change gets no automated check; verify manually or via the Firebase emulator before trusting it.

**Cloud Functions** (`functions/src/`): `index.ts` has three triggers — `auditDailyEntry`/`rebuildEmployeeSummary` (Firestore-triggered, on `dailyEntries` writes) and `syncAppSchedule` (scheduled every 15 min, reads the `App Schedule!A:I` Google Sheet, calls `reconcileScheduleRows` from `schedule-sync.ts` to diff against existing `scheduleShifts`, and batch-writes shifts/notifications or records a failed `scheduleSyncRuns` entry on any row/header mismatch — never applies a partial import). `app/src/features/schedule/schedule-sync.test.ts` lives in the client's test tree but imports and tests `functions/src/schedule-sync.ts` directly by relative path (the one import in the codebase that intentionally crosses the `app`/`functions` package boundary) — root `tsc -b` inside `app/` type-checks it transitively, so don't move it into `functions/`.

## Operational rules encoded in the domain logic

- All business dates use `America/Denver`. Date/time math must stay DST-safe — this repo has had a real bug from naively adding `24 * 60 * 60 * 1000` ms to find "tomorrow" across a DST transition; the fixed pattern (see `domain/store-hours.ts`) anchors at a fixed UTC hour (safely mid-day in both MST and MDT) before doing day arithmetic.
- Daily entries are never deleted; corrections are audited via `auditDailyEntry`.
- Accessory commission is a 10–22% band, excluded from fixed milestone payout totals (`payoutFor` in `domain/metrics.ts`) until a sales-dollar basis exists.
- The client falls back to local demo mode whenever no Firebase config is present (`firebaseEnabled === false`); this must keep working with zero network calls.
