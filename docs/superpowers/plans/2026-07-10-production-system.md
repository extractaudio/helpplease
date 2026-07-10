# Production System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the local Montana PQH demo into a Firebase-backed, role-aware PWA with live performance, administration, schedule, and reporting workflows.

**Architecture:** Keep React as the UI layer but replace `AppState` browser persistence with an authenticated Firestore repository and scoped real-time subscriptions. Cloud Functions own trusted Google Sheet imports, audit/summary maintenance, change notifications, and export generation; the client only reads data allowed by Firestore rules.

**Tech Stack:** React, TypeScript, Vite PWA, Firebase Authentication, Cloud Firestore, Firebase Cloud Functions v2, Google Sheets API, Vitest.

## Global Constraints

- Preserve the five configured Montana stores and all existing performance metric keys.
- Use `America/Denver` for all business dates, schedules, store-open calculations, and calendar exports.
- Keep employee scope limited to their own performance and assigned-store schedule; managers receive only their permitted data.
- Do not store a Google service-account credential in the browser; use a Firebase secret in Cloud Functions.
- Retain PWA installability and offline read support after the Firestore migration.

---

### Task 1: Authentication, Profile Onboarding, and Firestore Repository

**Files:**
- Create: `src/repository.ts`, `src/useAppData.ts`, `src/auth.ts`
- Modify: `src/firebase.ts`, `src/App.tsx`, `src/types.ts`, `firestore.rules`
- Test: `src/repository.test.ts`

**Interfaces:**
- Produces `signInWithGoogle(): Promise<void>`, `signOutUser(): Promise<void>`, `subscribeAppData(profile: UserProfile, onValue, onError): Unsubscribe`, and `saveProfile(profile: UserProfile): Promise<void>`.
- `UserProfile` gains `personalGoogleEmail`, `createdAt`, and `updatedAt`; the current authenticated UID is the document ID in `users`.

- [ ] **Step 1: Write failing repository tests** for mapping Firestore documents into complete profiles, daily entries, goals, stores, shifts, and notifications; verify missing optional data becomes an empty collection rather than a crash.
- [ ] **Step 2: Implement Firebase Auth helpers** with `GoogleAuthProvider`, `signInWithPopup`, `onAuthStateChanged`, and `signOut`; request only `email` and `profile` scopes because Sheets access is server-side.
- [ ] **Step 3: Implement the Firestore repository** with `onSnapshot` queries scoped by role, `setDoc` upserts for profiles/goals/stores/entries, and server timestamps. Keep `initialState` available only when Firebase configuration is absent.
- [ ] **Step 4: Replace `useStoredState`** with an auth-loading state and `useAppData` subscription; present Google sign-in, profile-completion, authorization-pending, error, and offline-read states explicitly.
- [ ] **Step 5: Update Firestore rules** to require immutable `uid`, validate the profile schema, constrain employee self-edits to contact fields, and keep role/status/store changes manager-controlled.
- [ ] **Step 6: Run** `npm run test` and `npm run build`; expected result: all tests pass and the client builds without demo persistence being required.

### Task 2: Operations Administration and Contact Directory

**Files:**
- Create: `src/admin.ts`, `src/admin.test.ts`
- Modify: `src/App.tsx`, `src/data.ts`, `src/types.ts`, `firestore.rules`

**Interfaces:**
- Produces `validateProfileDraft(draft): ValidationResult`, `toCsv(rows): string`, and `Store` records managed at `stores/{storeId}`.
- Adds manager-only employee create/edit, role/status changes, and store contact/address editing.

- [ ] **Step 1: Write failing validation and CSV tests** covering required profile fields, unique email behavior, all five accepted stores, quote-safe CSV cells, and inactive employees.
- [ ] **Step 2: Implement employee administration** as a manager-only form for name, work email, personal Google email, cell phone, job title, store, role, and active status. Area managers can assign all roles; store managers can only manage employees in their store.
- [ ] **Step 3: Implement a Store Directory page** that reads each Firestore store document and provides manager edit controls for phone/address plus `tel:`, `sms:`, email, maps, and schedule links.
- [ ] **Step 4: Add Manager Notes** stored by store/date/author, readable by the affected store and area manager, with a visible recent-notes panel on Home.
- [ ] **Step 5: Run** `npm run test` and `npm run build`; expected result: admin validation, CSV serializer, and current UI tests pass.

### Task 3: Live Performance, Goals, Dashboard, and Reports

**Files:**
- Create: `src/reports.ts`, `src/reports.test.ts`
- Modify: `src/App.tsx`, `src/logic.ts`, `functions/src/index.ts`, `firestore.indexes.json`

**Interfaces:**
- Produces `buildPerformanceRows(data, scope): ReportRow[]`, `toCsv(rows): string`, and manager-only report downloads for daily performance and schedules.
- Cloud Functions maintain both employee and store monthly summaries when daily entries or monthly goals change.

- [ ] **Step 1: Write failing report tests** for metric totals by employee/store, all eleven goal fields, pace colors, and CSV escaping.
- [ ] **Step 2: Subscribe the existing daily-entry, goals, milestone, dashboard, and leaderboard pages** to Firestore data; keep the date/store controls explicit and restrict a normal employee to own entries.
- [ ] **Step 3: Expand the dashboard** with total numbers by employee and store, per-metric goal progress/color, and export actions allowed only to managers.
- [ ] **Step 4: Add `monthlyStoreSummaries` maintenance** to the daily-entry/goal Cloud Function triggers and query indexes for manager reports.
- [ ] **Step 5: Run** `npm run test`, `npm run build`, and `cd functions; npm run build`; expected result: repository, report, and function compilation all pass.

### Task 4: Google Sheet Sync, Notifications, and Calendar

**Files:**
- Create: `functions/src/schedule-sync.ts`, `functions/src/schedule-sync.test.ts`
- Modify: `functions/src/index.ts`, `src/schedule.ts`, `src/App.tsx`, `firestore.rules`

**Interfaces:**
- Produces `reconcileScheduleRows(rows, profiles, existingShifts): ScheduleReconciliation` with `upserts`, `deletes`, and employee notifications.
- The schedule contract remains `App Schedule!A:I` with the nine documented columns.

- [ ] **Step 1: Write failing reconciliation tests** for valid imports, changed shifts, removed shifts, duplicate IDs, name/store/email matching, and overlap detection.
- [ ] **Step 2: Move schedule import logic into `schedule-sync.ts`** and use a Firestore transaction/batched writes to upsert changed shifts, delete no-longer-published shifts, record the sync run, and create affected-user notifications.
- [ ] **Step 3: Wire the client schedule pages to live `scheduleShifts` and `scheduleNotifications`**, refresh after sign-in/open through the subscription, and show a clear last-sync/error state.
- [ ] **Step 4: Complete calendar actions** for one shift, today, this week, and all upcoming shifts via RFC 5545 `.ics` downloads; generate Google Calendar event links that include store name, address, phone, and notes.
- [ ] **Step 5: Run** client tests, function tests, and both builds; expected result: shifted/removed schedule rows result in the correct Firestore mutations and notification records.

### Task 5: Schedule and Store-Open Dashboards

**Files:**
- Create: `src/store-hours.ts`, `src/store-hours.test.ts`
- Modify: `src/App.tsx`, `src/schedule.ts`, `src/types.ts`

**Interfaces:**
- Produces `storeStatusAt(storeId, instant, shifts): StoreOpenStatus`, `coverageFor(shifts, date): CoverageSummary`, and role-scoped schedule filters.
- `StoreOpenStatus` includes `isOpen`, `opensAt`, `closesAt`, `scheduledEmployees`, and `currentWorkers`.

- [ ] **Step 1: Write failing store-hour tests** for weekday, Sunday, boundary minutes, current workers, split-shift coverage, missing opener/closer coverage, and time-zone behavior.
- [ ] **Step 2: Add an all-stores Open Dashboard** with five status cards, published hours, employee counts, and current worker names; use green/red state without relying on one shift spanning an entire business day.
- [ ] **Step 3: Complete My Schedule widgets** for next-shift countdown, coworkers today, upcoming days off, and calendar shortcut.
- [ ] **Step 4: Complete Store Schedule views** with daily/weekly/monthly controls, employee/job-title/time/date filters, labor totals, gaps, and overlapping shifts. Employees see their store; managers/area managers receive the required broader selector.
- [ ] **Step 5: Run** `npm run test` and `npm run build`; expected result: schedule calculations remain deterministic for the Montana timezone.

### Task 6: Deployment, Security Review, and Acceptance Verification

**Files:**
- Modify: `README.md`, `.env.example`, `firebase.json`, `firestore.rules`, `firestore.indexes.json`
- Test: Firebase Emulator manual acceptance checklist in `README.md`

- [ ] **Step 1: Document exact required Firebase variables** including app configuration, `SCHEDULE_SHEET_ID`, service-account secret deployment, OAuth authorized domains, and first area-manager provisioning.
- [ ] **Step 2: Add a role-matrix acceptance checklist** for employee, store-manager, and area-manager permissions across performance, profiles, store data, schedules, notes, exports, and notifications.
- [ ] **Step 3: Validate Firebase rules in the Emulator** with allowed and denied scenarios for every collection.
- [ ] **Step 4: Run** `npm run test`, `npm run build`, `cd functions; npm run build`, and a production preview; expected result: builds pass, PWA manifest remains installable, and no secret appears in client output.
