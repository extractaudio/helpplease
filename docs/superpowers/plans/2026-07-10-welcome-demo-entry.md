# Welcome and Demo Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every app launch an explicit choice between secure live access and a safe sample-data demo.

**Architecture:** Add a small entry-mode state machine in `App.tsx`. The Welcome view is shown before either data path; demo mode uses existing local state only, while live mode requires Firebase OAuth and its existing profile/data gates.

**Tech Stack:** React, TypeScript, Firebase Authentication, Vitest.

## Global Constraints

- Demo mode must never call Firebase writes or require Firebase configuration.
- Live mode must remain unavailable until the user intentionally selects secure sign-in.
- Leaving demo or signing out returns to Welcome.

---

### Task 1: Entry-Mode State and Welcome View

**Files:**
- Modify: `src/App.tsx`
- Test: `src/entry-mode.test.ts`

**Interfaces:**
- Produces `EntryMode = 'welcome' | 'demo' | 'live'` and `nextEntryMode(current, action): EntryMode`.

- [ ] **Step 1: Write `src/entry-mode.test.ts`** asserting welcome transitions to demo/live, and either demo exit or live sign-out returns welcome.
- [ ] **Step 2: Run** `npm run test -- src/entry-mode.test.ts`; expected result: import failure before implementation.
- [ ] **Step 3: Add the pure entry-mode helper** and use it in `App.tsx` before Firebase/profile routing.
- [ ] **Step 4: Add Welcome UI** with Explore Demo, Sign In Securely, Firebase-not-configured copy, and an existing-session live-workspace action.
- [ ] **Step 5: Run** `npm run test` and `npm run build`; expected result: all tests and client build pass.
