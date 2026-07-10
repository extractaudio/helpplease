# Client Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic client component with feature-owned modules while preserving all app behavior and Firebase contracts.

**Architecture:** `App.tsx` becomes a small composition root. Entry/state, shared UI, and each user-facing feature receive typed props and call existing repository/domain helpers; no feature imports Firestore directly.

**Tech Stack:** React, TypeScript, Firebase, Vite PWA, Vitest.

## Global Constraints

- Do not change Firestore collection names, user roles, metric keys, schedule headers, or PWA configuration.
- Preserve demo isolation: demo mode cannot write live Firebase data.
- Preserve the current navigation pages and user-visible actions.

---

### Task 1: Extract Application Entry, State, and Shared UI

**Files:**
- Create: `src/app/useApplicationState.ts`, `src/app/AppEntry.tsx`, `src/components/navigation.tsx`, `src/components/ui.tsx`
- Modify: `src/App.tsx`
- Test: `src/entry-mode.test.ts`

- [ ] Move local/demo state and live write dispatch into `useApplicationState(liveAccess)`.
- [ ] Move Welcome, loading, onboarding, navigation, page-intro, stat, and metric-form components into app/shared modules.
- [ ] Keep `App.tsx` responsible only for mode gating, selected page, and feature composition.
- [ ] Run `npm run test` and `npm run build`.

### Task 2: Extract Performance and Schedule Features

**Files:**
- Create: `src/features/performance/PerformancePages.tsx`, `src/features/schedule/SchedulePages.tsx`
- Modify: `src/App.tsx`
- Test: existing `src/logic.test.ts`, `src/schedule-quality.test.ts`, `src/store-hours.test.ts`

- [ ] Move daily entry, dashboard, goals, milestones, and leaderboard into the performance feature.
- [ ] Move my schedule, store schedule, shift card, calendar helpers, and open dashboard into the schedule feature.
- [ ] Reuse existing `logic.ts`, `schedule.ts`, and `store-hours.ts`; do not duplicate domain calculations.
- [ ] Run the full test suite and client build.

### Task 3: Extract Administration and Verify Backend Boundaries

**Files:**
- Create: `src/features/admin/AdministrationPages.tsx`
- Modify: `src/App.tsx`, `README.md`
- Test: `src/repository.test.ts`, `src/schedule-sync.test.ts`

- [ ] Move employee setup and profile pages into the administration feature.
- [ ] Remove unused in-file components/imports from `App.tsx`.
- [ ] Document the module map in README.
- [ ] Run `npm run test`, `npm run build`, and `functions/npm run build`.
