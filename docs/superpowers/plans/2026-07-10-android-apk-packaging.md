# Android APK Packaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a directly installable, one-off debug APK of Montana PQH Team with bundled Demo mode and the existing Firebase-backed Live path.

**Architecture:** Capacitor wraps the existing Vite `dist/` output in a generated Android project whose `MainActivity` hosts the application WebView. Vite embeds the existing Firebase web configuration during the production build; Demo remains local and Live continues through the existing Firebase service boundary.

**Tech Stack:** React, TypeScript, Vite, Vitest, Firebase Web SDK, Capacitor 8, Android Gradle tooling, Android SDK API 36

## Global Constraints

- Display name is exactly `Montana PQH Team`.
- Android application ID is exactly `com.montanapqh.team`.
- Distribution is direct sideload only using one-off Android debug signing.
- The existing Demo entry remains the primary experience and must work from bundled assets.
- Full native Google authentication, Auth0, release signing, AAB generation, and Play Store publishing are out of scope.
- The APK must not contain service-account credentials, private keys, or backend secrets.
- Existing Firestore rules and authorization boundaries must not be weakened.

---

## File Map

- `app/package.json`: owns Capacitor dependencies and repeatable Android build commands.
- `app/package-lock.json`: locks the matching Capacitor dependency graph.
- `app/capacitor.config.ts`: declares native application identity and the Vite output directory.
- `app/src/platform/android-package.test.ts`: verifies native identity, web asset location, and Android scripts.
- `app/android/`: generated Capacitor Android wrapper and Gradle wrapper.
- `.gitignore`: excludes Android local SDK paths, build caches, and generated APK output.
- `README.md`: documents prerequisites, APK generation, output path, Firebase behavior, and sideloading.

### Task 1: Add the tested Capacitor contract

**Files:**
- Create: `app/src/platform/android-package.test.ts`
- Create: `app/capacitor.config.ts`
- Modify: `app/package.json`
- Modify: `app/package-lock.json`

**Interfaces:**
- Consumes: Vite output at `app/dist/` and existing `app/.env.local` Firebase values.
- Produces: default-exported `CapacitorConfig` with `appId`, `appName`, and `webDir`; npm commands `android:sync` and `android:apk`.

- [ ] **Step 1: Install matching Capacitor packages**

Run from `app/`:

```powershell
npm install @capacitor/core@^8.0.0 @capacitor/android@^8.0.0
npm install --save-dev @capacitor/cli@^8.0.0
```

Expected: `package.json` and `package-lock.json` contain matching major version 8 Capacitor packages.

- [ ] **Step 2: Write the failing packaging contract test**

Create `app/src/platform/android-package.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import capacitorConfig from '../../capacitor.config'
import packageJson from '../../package.json'

describe('Android packaging contract', () => {
  it('uses the approved Android identity and bundled Vite output', () => {
    expect(capacitorConfig).toMatchObject({
      appId: 'com.montanapqh.team',
      appName: 'Montana PQH Team',
      webDir: 'dist'
    })
  })

  it('exposes repeatable sync and debug APK commands', () => {
    expect(packageJson.scripts['android:sync']).toBe('npm run build && cap sync android')
    expect(packageJson.scripts['android:apk']).toBe('npm run android:sync && cd android && gradlew.bat assembleDebug')
  })
})
```

- [ ] **Step 3: Run the test and verify it fails**

Run from `app/`:

```powershell
npm test -- src/platform/android-package.test.ts
```

Expected: FAIL because `capacitor.config.ts` and the Android scripts do not exist.

- [ ] **Step 4: Add the minimal Capacitor configuration**

Create `app/capacitor.config.ts`:

```ts
import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.montanapqh.team',
  appName: 'Montana PQH Team',
  webDir: 'dist'
}

export default config
```

Add these keys to the existing `scripts` object in `app/package.json`:

```json
"android:sync": "npm run build && cap sync android",
"android:apk": "npm run android:sync && cd android && gradlew.bat assembleDebug"
```

- [ ] **Step 5: Run the focused test and production build**

Run from `app/`:

```powershell
npm test -- src/platform/android-package.test.ts
npm run build
```

Expected: the focused test passes and Vite produces `app/dist/index.html`.

- [ ] **Step 6: Commit the Capacitor contract**

```powershell
git add app/package.json app/package-lock.json app/capacitor.config.ts app/src/platform/android-package.test.ts
git commit -m "feat: configure Android packaging"
```

### Task 2: Generate and validate the native Android wrapper

**Files:**
- Create: `app/android/` using Capacitor CLI
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `app/capacitor.config.ts` and `app/dist/`.
- Produces: Gradle wrapper `app/android/gradlew.bat`, native package `com.montanapqh.team`, and bundled assets under the generated Android project.

- [ ] **Step 1: Confirm the native wrapper is absent before generation**

Run from `app/`:

```powershell
Test-Path android\gradlew.bat
```

Expected: `False`.

- [ ] **Step 2: Generate the Android project**

Run from `app/`:

```powershell
npx cap add android
npm run android:sync
```

Expected: Capacitor reports Android added and copied web assets from `dist`.

- [ ] **Step 3: Verify the generated identity and assets**

Run from the repository root:

```powershell
rg -n "com\.montanapqh\.team" app/android/app/build.gradle app/android/app/src/main
Test-Path app/android/app/src/main/assets/public/index.html
```

Expected: Gradle declares `com.montanapqh.team`; the asset check returns `True`.

- [ ] **Step 4: Protect local and generated Android artifacts**

Append the following repository-level ignores to `.gitignore` if the generated project does not already cover them:

```gitignore
/app/android/.gradle/
/app/android/local.properties
/app/android/app/build/
```

- [ ] **Step 5: Run all client tests after native generation**

Run from `app/`:

```powershell
npm test
```

Expected: all Vitest test files pass.

- [ ] **Step 6: Commit the native wrapper**

```powershell
git add .gitignore app/android
git commit -m "feat: add Capacitor Android wrapper"
```

### Task 3: Build, inspect, and document the APK

**Files:**
- Modify: `README.md`
- Generate (ignored): `app/android/app/build/outputs/apk/debug/app-debug.apk`

**Interfaces:**
- Consumes: compatible JDK, Android SDK API 36, Gradle wrapper, generated Android project, and the Firebase-enabled Vite bundle.
- Produces: directly installable debug APK at `app/android/app/build/outputs/apk/debug/app-debug.apk`.

- [ ] **Step 1: Provision the build toolchain for this machine**

Install a compatible JDK and Android command-line SDK under the temporary build-tool directory. Configure the current shell only:

```powershell
$env:JAVA_HOME = 'C:\tmp\android-apk-toolchain\jdk'
$env:ANDROID_HOME = 'C:\tmp\android-apk-toolchain\android-sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin;$env:Path"
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0"
```

Expected: `java -version` succeeds and `sdkmanager --list_installed` includes platform 36 and build-tools 36.0.0. The concrete local paths are environment-specific and must never be committed.

- [ ] **Step 2: Assemble the APK through the repeatable command**

Run from `app/`:

```powershell
npm run android:apk
```

Expected: Gradle ends with `BUILD SUCCESSFUL` and creates `android/app/build/outputs/apk/debug/app-debug.apk`.

- [ ] **Step 3: Inspect the APK identity and signature**

Run from `app/` with Android build tools on `PATH`:

```powershell
Get-Item android/app/build/outputs/apk/debug/app-debug.apk | Select-Object FullName,Length,LastWriteTime
aapt dump badging android/app/build/outputs/apk/debug/app-debug.apk | Select-String "package: name='com.montanapqh.team'"
apksigner verify --verbose --print-certs android/app/build/outputs/apk/debug/app-debug.apk
```

Expected: the APK is non-empty, `aapt` reports `com.montanapqh.team`, and `apksigner` reports verification success.

- [ ] **Step 4: Document rebuild and sideload instructions**

Add an `Android APK` section to `README.md` that states:

```markdown
## Android APK

The Android package bundles Demo mode locally and includes the Firebase web configuration from `app/.env.local` for the existing Live path. Full native Google authentication is not part of this one-off build.

Prerequisites: Node.js 22+, a compatible JDK, and Android SDK API 36 with Build Tools 36.0.0.

Build from `app/` with `npm run android:apk`. The directly installable debug APK is written to `app/android/app/build/outputs/apk/debug/app-debug.apk`.

To install it, transfer the APK to an Android phone, allow installs from the file/browser source when Android prompts, open the APK, and choose Install. This debug build is for direct testing and is not Play Store or release-signing ready.
```

- [ ] **Step 5: Run the complete verification gate**

Run from `app/`:

```powershell
npm test
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
```

Expected: all tests pass, Vite build succeeds, Capacitor sync succeeds, and Gradle reports `BUILD SUCCESSFUL`.

- [ ] **Step 6: Commit documentation**

```powershell
git add README.md
git commit -m "docs: add Android APK instructions"
```

- [ ] **Step 7: Confirm the final working tree and deliverable**

Run from the repository root:

```powershell
git status --short
Get-FileHash app/android/app/build/outputs/apk/debug/app-debug.apk -Algorithm SHA256
```

Expected: no unintended tracked changes remain and a SHA-256 hash is printed for the delivered APK.
