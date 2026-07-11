# Montana PQH Team

Installable, mobile-first performance PWA for five Montana stores. It supports Google sign-in/profile onboarding, role-aware Firestore data, performance entry, goals, milestones, live reporting, leaderboard, employee administration, store-open status, schedule calendar exports, PWA support, Firestore rules, and Cloud Function audit/summary artifacts.

## Run the reviewable pilot

```powershell
cd app
npm install
npm run dev
```

The frontend lives in `app/` (its own package), the backend Cloud Functions in `functions/`, and Firebase configuration (`firebase.json`, `firestore.rules`, `firestore.indexes.json`) at the repository root.

The app launches in a fully interactive local demo mode, seeded with an area manager, store manager, active employee, a pending employee, current goals, and daily performance data. Use the profile menu to sign out and preview each role from the sign-in demo selector. Browser storage retains demo changes; clear site storage to reset.

Store Directory is available to all signed-in roles. Area managers can edit every store; store managers can edit their assigned store; employees have read-only contact, map, messaging, schedule, and live-status actions.

## Connect Firebase

1. Copy `app/.env.example` to `app/.env.local` and insert the Firebase web-app configuration values.
2. In Firebase Authentication, enable Google and Email/Password; authorize the deployed hostname.
3. Create dev, staging, and production Firebase projects; then run `firebase use <project-id>`.
4. Install dependencies in both packages: `cd app; npm install` and `cd functions; npm install`.
5. Set `SCHEDULE_SHEET_ID=1IfltogEvNsk4PmXsuwdjN-X1fGk4D7CHKGlalt0h86o` for Functions and run `firebase functions:secrets:set SCHEDULE_SERVICE_ACCOUNT_JSON` with a Google service account that has read-only access to the `App Schedule` sheet.
6. Deploy rules, indexes, hosting, and functions with `firebase deploy`.
7. Seed the five store documents and create the first area-manager profile using an Admin SDK session. Do not promote users through the browser.

`firestore.rules` defaults to deny and enforces employee/store/area-manager data boundaries. Cloud Functions append audit records, maintain employee summary documents, and reconcile Google Sheet schedule changes into shifts and employee notifications. The client retains a local demo mode only when no Firebase configuration is supplied.

## Key operational guardrails

- All business dates use `America/Denver`.
- Daily entries cannot be deleted; corrections are auditable.
- Accessory commission remains a 10–22% band and is excluded from fixed payout totals until a sales-dollar basis is introduced.
- No customer, account, scheduling, calendar, or Google Sheets data is collected in Phase 1.
- Ask users before persisting Firestore data offline on a shared device.

## Client architecture

The client lives in `app/` and is organized into layered modules under `app/src/`. Imports use the `@/*` alias, which resolves to `app/src/*`.

- `app/src/app/` is the application shell: `App.tsx` (entry-mode gating + composition), `AppShell.tsx` (chrome), `AppRouter.tsx` (page routing), `useApplicationState.ts` (demo/live state dispatch), and `entry/` (Welcome, sign-in, onboarding gates).
- `app/src/domain/` holds framework-free business logic and types: `types.ts`, `metrics.ts`, `schedule.ts`, `store-hours.ts`, `store-directory.ts`, `entry-mode.ts`, and `app-state.ts`. Unit tests are co-located here.
- `app/src/data/` holds seed and configuration data: `stores.ts`, `metric-labels.ts`, and `initial-state.ts` (re-exported via `data/index.ts`).
- `app/src/services/` isolates infrastructure: `firebase.ts`, `auth.ts`, `repository.ts`, and `useAppData.ts`.
- `app/src/shared/` contains reusable UI: `ui/` (Stat, MetricForm, PageIntro, PendingCard) and `navigation/` (nav items, NavButton, SideNav).
- `app/src/features/performance/`, `app/src/features/schedule/`, `app/src/features/administration/`, and `app/src/features/stores/` each own their screens, one component per file, exposed through an `index.ts` barrel.

The detailed module and operational design is documented in `docs/system-design.md`.

## Verify

```powershell
cd app
npm run test
npm run build
```

## Android APK

The Android package bundles Demo mode locally and includes the Firebase web configuration from `app/.env.local` for the existing Live path. Full native Google authentication is not part of this one-off build.

Prerequisites: Node.js 22+, a compatible JDK, and Android SDK API 36 with Build Tools 36.0.0.

Build from `app/` with `npm run android:apk`. The directly installable debug APK is written to `app/android/app/build/outputs/apk/debug/app-debug.apk`.

To install it, transfer the APK to an Android phone, allow installs from the file/browser source when Android prompts, open the APK, and choose Install. This debug build is for direct testing and is not Play Store or release-signing ready.
