# Montana PQH Team

Installable, mobile-first performance PWA for five Montana stores. It supports Google sign-in/profile onboarding, role-aware Firestore data, performance entry, goals, milestones, live reporting, leaderboard, employee administration, store-open status, schedule calendar exports, PWA support, Firestore rules, and Cloud Function audit/summary artifacts.

## Run the reviewable pilot

```powershell
npm install
npm run dev
```

The app launches in a fully interactive local demo mode, seeded with an area manager, store manager, active employee, a pending employee, current goals, and daily performance data. Use the profile menu to sign out and preview each role from the sign-in demo selector. Browser storage retains demo changes; clear site storage to reset.

Store Directory is available to all signed-in roles. Area managers can edit every store; store managers can edit their assigned store; employees have read-only contact, map, messaging, schedule, and live-status actions.

## Connect Firebase

1. Copy `.env.example` to `.env.local` and insert the Firebase web-app configuration values.
2. In Firebase Authentication, enable Google and Email/Password; authorize the deployed hostname.
3. Create dev, staging, and production Firebase projects; then run `firebase use <project-id>`.
4. Install root dependencies and `cd functions; npm install`.
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

- `src/App.tsx` is the composition root for entry mode, navigation, and feature routing.
- `src/app/` owns demo/live state dispatch plus Welcome, sign-in, and onboarding gates.
- `src/components/` contains shared navigation and presentation primitives.
- `src/features/performance/`, `src/features/schedule/`, and `src/features/admin/` own their respective screens.
- `src/repository.ts`, `src/logic.ts`, `src/schedule.ts`, and `src/store-hours.ts` remain framework-light domain and data-access boundaries.

The detailed module and operational design is documented in `docs/system-design.md`.

## Verify

```powershell
npm run test
npm run build
```
