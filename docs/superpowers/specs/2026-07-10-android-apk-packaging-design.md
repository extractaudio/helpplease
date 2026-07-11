# Montana PQH Team — Android APK Packaging Design

**Status:** Approved

**Date:** July 10, 2026

## Objective

Package the existing React/Vite application as a directly installable Android APK. The existing Demo entry remains the primary experience and continues to work from bundled web assets. The existing Live entry receives the Firebase web configuration at build time and connects to the current Firebase backend when the device has network access.

## Selected Approach

Add Capacitor to the existing `app/` package and generate an Android project from the production Vite bundle. Capacitor is preferred over a Trusted Web Activity because it bundles the client locally and does not require a hosted website for Demo mode. A plain PWA installation is not sufficient because the requested deliverable is an APK.

## Application Identity and Distribution

- Display name: `Montana PQH Team`
- Android application ID: `com.montanapqh.team`
- Distribution: direct sideload only
- Signing: one-off Android debug signing
- Store publishing: out of scope
- Upgrade-stable release signing: out of scope

## Architecture

The Vite build remains the source of the application UI. Capacitor's `webDir` points to `dist`, and `cap sync android` copies that production output into the native Android project. The Android `MainActivity` hosts the Capacitor WebView. No native data layer is introduced.

The resulting flow is:

1. Vite loads Firebase environment values from `app/.env.local` during the production build.
2. Vite produces the static application in `app/dist/`.
3. Capacitor copies the static bundle into the Android application assets.
4. Gradle assembles a debug-signed APK.
5. On launch, the bundled client displays the existing welcome screen with Demo as the primary path.
6. Demo uses browser-local state; Live loads the Firebase web SDK and connects to the configured Firebase project.

## Authentication Boundary

This packaging pass preserves the current Firebase web authentication implementation. Full native Google authentication and Auth0 are explicitly deferred. Firebase `signInWithPopup` may be unreliable in an embedded Android WebView, so Live authentication is not a release gate for this one-off Demo-first APK. The APK must not weaken Firestore rules or bypass backend authorization.

## Build Tooling

The app package gains matching Capacitor core, CLI, and Android dependencies plus repeatable scripts for:

- building the Vite client;
- syncing web assets into Android;
- assembling the debug APK; and
- copying the final APK to a stable repository output location.

The generated Android project is retained in source control so future APK builds use the same application identity and native configuration. Build caches, local SDK paths, generated APK intermediates, and secrets remain ignored.

## Error Handling

- The build must fail if the web production build fails.
- Capacitor sync must fail if `dist/` is absent or invalid.
- The Android build must fail clearly when the Android SDK or a compatible JDK is missing.
- Firebase connection or authentication errors remain user-visible through the existing Live-mode error path and must not prevent Demo mode from opening.
- Firebase configuration values may be embedded as normal Firebase web configuration, but no server credentials, service-account JSON, signing secrets, or private keys may enter the APK.

## Verification

The packaging change is complete only when all applicable checks pass:

1. Existing Vitest suite.
2. TypeScript/Vite production build using the current Firebase configuration.
3. Capacitor configuration validation and Android sync.
4. Gradle debug APK assembly.
5. Confirmation that the APK exists, is non-empty, and reports the expected package ID.
6. APK signature verification using Android build tools when available.

Device installation is optional because no connected Android device is assumed. The delivered APK must be suitable for transfer to a phone and installation after Android permits installs from the chosen file source.

## Deliverables

- Capacitor dependencies and configuration in `app/`.
- Generated Android wrapper project in `app/android/`.
- Repeatable npm build/package scripts.
- A one-off debug-signed APK in a clearly documented output location.
- Updated README instructions for rebuilding and installing the APK.

## Non-Goals

- Google Play submission or AAB generation.
- Production release signing or keystore lifecycle management.
- Native Auth0 or native Google sign-in.
- Firebase schema, Cloud Function, Firestore rule, or role-policy changes.
- UI redesign or unrelated application refactoring.
