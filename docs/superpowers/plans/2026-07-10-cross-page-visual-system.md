# Cross-Page Visual System and Store Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the missing Store Directory and apply the approved near-black, controlled-green, hairline-bracket visual system across every existing page.

**Architecture:** Keep the existing React/Vite structure and central CSS file. Add a focused Store Directory feature component plus pure store-state and status helpers, make stores a first-class part of `AppState`, and route edits through the existing demo/live update boundary. Apply the visual treatment through shared tokens, pseudo-elements, and existing component classes rather than duplicating page-specific styles.

**Tech Stack:** React, TypeScript, Vite, Vitest, Firebase/Firestore, Lucide React, CSS

## Global Constraints

- Use near-black as the dominant field; green is a controlled light source that resolves into near-black by the middle of the canvas.
- Reserve lime for primary actions, active navigation, progress, and important positive status.
- Use one-pixel partial corner brackets only on page framing and selected operational surfaces.
- Do not apply bracket decoration to forms, inputs, tables, dense rows, or every card.
- Preserve visible focus rings, text contrast, non-color status labels, and 44-by-44-pixel mobile primary touch targets.
- All business-time calculations remain in `America/Denver`.
- Store Directory is visible to every signed-in user.
- Area managers may edit all stores; store managers may edit only their assigned store; employees cannot edit stores.
- Keep the five-item bottom navigation unchanged.
- Do not add a new styling framework or component library.
- The current workspace is not a valid Git repository. Do not run `git init` or create a commit until the user explicitly selects repository initialization or restoration.

---

### Task 1: Make Store Data a First-Class Application State

**Files:**
- Modify: `src/types.ts`
- Modify: `src/data.ts`
- Modify: `src/app/useApplicationState.ts`
- Modify: `src/repository.test.ts`
- Create: `src/app-state.ts`
- Create: `src/app-state.test.ts`

**Interfaces:**
- Produces: `AppState.stores: Store[]`
- Produces: `hydrateAppState(value: Partial<AppState>): AppState`
- Produces: `storesForDisplay(remoteStores: Store[]): Store[]`
- Consumes: `initialState`, seeded `stores`, `saveStore(Store): Promise<void>`

- [ ] **Step 1: Write failing state hydration tests**

```ts
import { describe, expect, it } from 'vitest'
import { hydrateAppState, storesForDisplay } from './app-state'
import { stores } from './data'

describe('app state hydration', () => {
  it('adds seeded stores to legacy demo state', () => {
    expect(hydrateAppState({ profiles: [] }).stores).toEqual(stores)
  })

  it('preserves edited store data', () => {
    const edited = [{ ...stores[0], phone: '(406) 555-9999' }]
    expect(hydrateAppState({ stores: edited }).stores[0].phone).toBe('(406) 555-9999')
    expect(hydrateAppState({ stores: edited }).stores).toHaveLength(5)
  })

  it('overlays partial live store data onto all five seeded stores', () => {
    const remote = [{ ...stores[1], address: 'Updated address' }]
    expect(storesForDisplay(remote)).toHaveLength(5)
    expect(storesForDisplay(remote).find(store => store.id === 'bozeman')?.address).toBe('Updated address')
  })
})
```

- [ ] **Step 2: Run the focused test and verify red state**

Run: `npx vitest run src/app-state.test.ts`

Expected: FAIL because `src/app-state.ts` and `AppState.stores` do not exist.

- [ ] **Step 3: Add the store field and hydration helpers**

```ts
// src/types.ts
export interface AppState {
  profiles: UserProfile[]
  entries: DailyEntry[]
  goals: MonthlyGoal[]
  rules: MilestoneRule[]
  shifts: ScheduleShift[]
  notifications: ScheduleNotification[]
  stores: Store[]
  currentUserId: string
  trustedDevice: boolean
}

// src/data.ts, inside initialState
stores,

// src/app-state.ts
import { initialState, stores as seededStores } from './data'
import type { AppState, Store } from './types'

export function storesForDisplay(available: Store[]) {
  const byId = new Map(available.map(store => [store.id, store]))
  return seededStores.map(store => byId.get(store.id) || store)
}

export function hydrateAppState(value: Partial<AppState>): AppState {
  return { ...initialState, ...value, stores: storesForDisplay(value.stores || []) }
}
```

- [ ] **Step 4: Route demo and live state through the helpers and persist store changes**

```ts
// src/app/useApplicationState.ts imports
import { hydrateAppState, storesForDisplay } from '../app-state'
import { saveEntry, saveGoal, saveNotification, saveProfile, saveStore } from '../repository'

// demo initializer
const [state, setState] = useState<AppState>(() => {
  try { return hydrateAppState(JSON.parse(localStorage.getItem(storageKey) || '')) }
  catch { return initialState }
})

// live state merge
const state = liveAccess && firebaseEnabled && session.user && remote.profile && remote.data
  ? { ...demo, ...remote.data, stores: storesForDisplay(remote.data.stores), currentUserId: remote.profile.uid }
  : demo

// Promise.all persistence list
...changed(state.stores, next.stores, 'id').map(saveStore)
```

- [ ] **Step 5: Run focused tests and type-check build**

Run: `npx vitest run src/app-state.test.ts src/repository.test.ts`

Expected: all focused tests PASS.

Run: `npm run build`

Expected: TypeScript and Vite build exit 0.

---

### Task 2: Add Store Status and Directory Action Helpers

**Files:**
- Modify: `src/store-hours.ts`
- Modify: `src/store-hours.test.ts`
- Create: `src/store-directory.ts`
- Create: `src/store-directory.test.ts`

**Interfaces:**
- Produces: `storeHoursSummary(status: StoreOpenStatus, instant: Date): string`
- Produces: `phoneHref(phone: string, scheme: 'tel' | 'sms'): string | null`
- Produces: `mapHref(address: string): string | null`
- Produces: `canEditStore(user: UserProfile, storeId: StoreId): boolean`
- Consumes: `storeStatusAt`, `StoreOpenStatus`, `UserProfile`, `StoreId`

- [ ] **Step 1: Extend store-hours tests with exact Mountain Time copy**

```ts
import { coverageFor, storeHoursSummary, storeStatusAt } from './store-hours'

it('describes an open store with its closing time', () => {
  const instant = new Date('2026-07-11T17:00:00Z')
  expect(storeHoursSummary(storeStatusAt('helena', instant, []), instant)).toBe('Open until 7 PM')
})

it('describes the next Sunday opening after Saturday close', () => {
  const instant = new Date('2026-07-12T02:00:00Z')
  expect(storeHoursSummary(storeStatusAt('helena', instant, []), instant)).toBe('Opens tomorrow at 12 PM')
})
```

- [ ] **Step 2: Write failing directory-helper tests**

```ts
import { describe, expect, it } from 'vitest'
import { canEditStore, mapHref, phoneHref } from './store-directory'
import type { UserProfile } from './types'

const profile = (role: UserProfile['role'], storeId: UserProfile['storeId'] = 'helena'): UserProfile => ({
  uid: 'u1', fullName: 'User', workEmail: 'u@example.com', personalGoogleEmail: 'u@gmail.com',
  cellPhone: '', jobTitle: '', storeId, role, status: 'active'
})

describe('store directory helpers', () => {
  it('normalizes phone actions', () => {
    expect(phoneHref('(406) 555-0130', 'tel')).toBe('tel:+14065550130')
    expect(phoneHref('', 'sms')).toBeNull()
  })

  it('creates an encoded map destination', () => {
    expect(mapHref('2750 North Montana Ave, Helena, MT')).toContain('query=2750%20North%20Montana')
  })

  it('enforces role and store edit boundaries', () => {
    expect(canEditStore(profile('area_manager'), 'bozeman')).toBe(true)
    expect(canEditStore(profile('store_manager'), 'helena')).toBe(true)
    expect(canEditStore(profile('store_manager'), 'bozeman')).toBe(false)
    expect(canEditStore(profile('employee'), 'helena')).toBe(false)
  })
})
```

- [ ] **Step 3: Run focused tests and verify red state**

Run: `npx vitest run src/store-hours.test.ts src/store-directory.test.ts`

Expected: FAIL because the new helpers do not exist.

- [ ] **Step 4: Implement the pure helpers**

```ts
// src/store-directory.ts
import type { StoreId, UserProfile } from './types'

export function phoneHref(phone: string, scheme: 'tel' | 'sms') {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return null
  const normalized = digits.length === 10 ? `+1${digits}` : `+${digits}`
  return `${scheme}:${normalized}`
}

export const mapHref = (address: string) => address.trim()
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`
  : null

export const canEditStore = (user: UserProfile, storeId: StoreId) =>
  user.role === 'area_manager' || (user.role === 'store_manager' && user.storeId === storeId)
```

Implement `storeHoursSummary` using `America/Denver` date parts. Before opening, return `Opens today at …`; after closing, compute the next day’s Sunday or weekday opening and return `Opens tomorrow at …`; while open, return `Open until …`. Format `10:00`, `12:00`, `17:00`, and `19:00` as `10 AM`, `12 PM`, `5 PM`, and `7 PM`.

- [ ] **Step 5: Run focused tests**

Run: `npx vitest run src/store-hours.test.ts src/store-directory.test.ts`

Expected: all focused tests PASS.

---

### Task 3: Build the Store Directory Route and Editor

**Files:**
- Create: `src/features/stores/StoreDirectoryPage.tsx`
- Modify: `src/components/navigation.tsx`
- Modify: `src/App.tsx`
- Modify: `firestore.rules`

**Interfaces:**
- Produces: `StoreDirectoryPage({ state, user, onChange, onSchedule }: { state: AppState; user: UserProfile; onChange: (change: (state: AppState) => AppState) => void; onSchedule: (storeId: StoreId) => void })`
- Adds: `Page = ... | 'directory'`
- Consumes: `storeStatusAt`, `storeHoursSummary`, `phoneHref`, `mapHref`, `canEditStore`

- [ ] **Step 1: Add the page contract and navigation entry**

```ts
// src/components/navigation.tsx
import { ..., Store } from 'lucide-react'
export type Page = 'home' | ... | 'directory' | 'profile'

// append after Store status so bottom navigation's first five items remain unchanged
{ page: 'directory', label: 'Store Directory', icon: Store }
```

- [ ] **Step 2: Create the directory page with live status and actions**

Use a `now` value initialized when the component renders. For each `state.stores` item:

```tsx
const status = storeStatusAt(store.id, now, state.shifts)
const call = phoneHref(store.phone, 'tel')
const message = phoneHref(store.phone, 'sms')
const map = mapHref(store.address)

<article className={`directory-card operational-card bracket-accent ${status.isOpen ? 'is-open' : ''}`}>
  <div className="directory-card-top">
    <h2>{store.name}</h2>
    <span className={`store-state ${status.isOpen ? 'open' : 'closed'}`}>
      {status.isOpen ? 'Open now' : 'Closed now'}
    </span>
  </div>
  <p>{store.address}</p>
  <p>{storeHoursSummary(status, now)} · {status.scheduledEmployees.length} scheduled</p>
  {status.currentWorkers.length > 0 && <p>Working now: {status.currentWorkers.join(', ')}</p>}
  <div className="directory-actions">
    {call && <a className="primary" href={call}>Call</a>}
    {map && <a className="secondary" href={map} target="_blank" rel="noreferrer">Map</a>}
    {message && <a className="secondary directory-secondary-action" href={message}>Message</a>}
    <button className="secondary directory-secondary-action" onClick={() => onSchedule(store.id)}>Schedule</button>
    {canEditStore(user, store.id) && <button className="quiet-action" onClick={() => setDraft(store)}>Edit</button>}
  </div>
</article>
```

Pass `onSchedule(store.id)` from the action so `Schedule` routes to `storeSchedule`. The first implementation routes without adding cross-page global state; the existing role-scoped schedule selector remains authoritative.

- [ ] **Step 3: Add the responsive edit dialog**

The dialog uses a copied `Store` draft and requires non-empty name, phone, and address. The save handler replaces only the matching store:

```ts
const save = () => {
  if (!draft || !draft.name.trim() || !phoneHref(draft.phone, 'tel') || !draft.address.trim()) {
    setError('Name, phone, and address are required.')
    return
  }
  onChange(current => ({
    ...current,
    stores: current.stores.map(store => store.id === draft.id ? draft : store)
  }))
  setDraft(null)
  setError('')
}
```

Use `role="dialog"`, `aria-modal="true"`, a labelled heading, Cancel, and Save. On mobile the same dialog CSS becomes a bottom sheet with near-full viewport width.

- [ ] **Step 4: Render the route from App**

```tsx
import { StoreDirectoryPage } from './features/stores/StoreDirectoryPage'

{page === 'directory' && <StoreDirectoryPage
  state={state}
  user={user}
  onChange={update}
  onSchedule={_storeId => selectPage('storeSchedule')}
/>}
```

- [ ] **Step 5: Align Firestore authorization with the UI**

```rules
match /stores/{storeId} {
  allow read: if signedIn();
  allow write: if isManagerFor(storeId);
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm run test`

Expected: all Vitest suites PASS.

Run: `npm run build`

Expected: TypeScript and Vite build exit 0.

---

### Task 4: Apply the Approved Visual System Across Every Page

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/ui.tsx`
- Modify: `src/features/performance/PerformancePages.tsx`
- Modify: `src/features/schedule/SchedulePages.tsx`
- Modify: `src/features/admin/AdministrationPages.tsx`
- Modify: `src/app/EntryScreens.tsx`
- Modify: `src/features/stores/StoreDirectoryPage.tsx`

**Interfaces:**
- Produces CSS tokens: `--canvas`, `--surface`, `--surface-raised`, `--line`, `--line-strong`, `--lime`, `--text`, `--muted`
- Produces shared classes: `.operational-card`, `.bracket-accent`, `.quiet-action`, `.directory-*`
- Consumes existing semantic classes without changing domain behavior

- [ ] **Step 1: Introduce the shared tokens and black morph**

Replace hard-coded canvas/surface colors incrementally with:

```css
:root{
  --canvas:#020403;
  --canvas-soft:#071008;
  --surface:#090e0a;
  --surface-raised:#0f1710;
  --surface-active:#152417;
  --line:rgba(130,151,128,.22);
  --line-strong:rgba(163,219,66,.4);
  --lime:#a3db42;
  --text:#f6f8f1;
  --muted:#9ea99f;
}
body{
  background:
    radial-gradient(circle at 72% -8%,rgba(86,132,39,.27) 0,rgba(17,31,13,.56) 20%,rgba(4,8,5,.95) 48%,transparent 67%),
    var(--canvas);
}
```

- [ ] **Step 2: Add page-heading and bracket accents**

```css
.page-intro{position:relative;padding-bottom:14px;border-bottom:1px solid rgba(163,219,66,.12)}
.page-intro:after{content:"";position:absolute;left:0;bottom:-1px;width:64px;border-bottom:1px solid rgba(163,219,66,.7)}
.bracket-accent{position:relative}
.bracket-accent:before,.bracket-accent:after{content:"";position:absolute;width:18px;height:18px;border-color:rgba(163,219,66,.55);pointer-events:none}
.bracket-accent:before{top:-1px;left:-1px;border-top:1px solid;border-left:1px solid;border-radius:14px 0 0 0}
.bracket-accent:after{right:-1px;bottom:-1px;border-right:1px solid;border-bottom:1px solid;border-radius:0 0 14px 0}
```

Apply `bracket-accent` only to the Home hero, milestone payout card, leaderboard container, sign-in card, store status operational cards, and Store Directory cards. Do not add it to form cards, fields, tables, checklist rows, shift rows, or employee rows.

- [ ] **Step 3: Normalize surfaces, buttons, focus, and card depth**

Use the shared surface tokens for stat, goal, feature, form, table, schedule, employee, sign-in, and dialog surfaces. Keep primary buttons lime, secondary buttons near-black, danger buttons red text, and focus outlines gold/lime with at least three-pixel visual weight. Add `transition` only for color, border, background, and transform; disable it under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Add directory desktop and mobile layout CSS**

```css
.directory-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.directory-card{padding:20px;background:linear-gradient(135deg,rgba(16,24,17,.98),rgba(3,6,4,.99));border:1px solid var(--line);border-radius:14px}
.directory-card.is-open{border-color:rgba(117,154,67,.42)}
.directory-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.directory-actions a{text-decoration:none;min-height:44px}
.store-dialog-backdrop{position:fixed;inset:0;z-index:60;background:#000b;display:grid;place-items:center;padding:18px}
.store-dialog{width:min(540px,100%);background:var(--surface-raised);border:1px solid var(--line-strong);border-radius:16px;padding:24px}
@media(max-width:800px){
  .directory-grid{grid-template-columns:1fr}
  .store-dialog-backdrop{align-items:end;padding:0}
  .store-dialog{width:100%;border-radius:18px 18px 0 0;padding:22px 16px max(22px,env(safe-area-inset-bottom))}
}
```

- [ ] **Step 5: Perform a source-level design and skeptic pass**

Review every page component and confirm:

- Page intro hierarchy is consistent.
- Forms and dense rows have no bracket decoration.
- Lime is not used as a broad background fill.
- Open/closed, success/failure, and active states include text or icons.
- Mobile rules preserve 44-pixel primary controls and do not clip action labels.
- Store Directory uses the same status helper as Store Status.
- No domain calculations were copied into CSS or presentation components.

Correct each issue before running verification.

- [ ] **Step 6: Run full verification**

Run: `npm run test`

Expected: all Vitest suites PASS with zero failures.

Run: `npm run build`

Expected: TypeScript and Vite build exit 0 and PWA assets are generated.

---

### Task 5: Final QA, Documentation, and Commit Preparation

**Files:**
- Modify: `README.md`
- Review: `docs/superpowers/specs/2026-07-10-cross-page-visual-system-design.md`
- Review: all files changed in Tasks 1-4

**Interfaces:**
- Produces a verified implementation and a commit-ready file set
- Consumes the complete test suite and production build

- [ ] **Step 1: Document the Store Directory behavior**

Add a concise README note under the pilot/demo section:

```md
Store Directory is available to all signed-in roles. Area managers can edit every store; store managers can edit their assigned store; employees have read-only contact, map, messaging, schedule, and live-status actions.
```

- [ ] **Step 2: Run the final test suite and production build from a clean command invocation**

Run: `npm run test`

Expected: exit 0 with zero failed tests.

Run: `npm run build`

Expected: exit 0 with no TypeScript or Vite errors.

- [ ] **Step 3: Audit the final file set**

Because Git is currently unavailable, use `Get-ChildItem` timestamps and targeted file reads to confirm only the planned source, test, CSS, rules, README, spec, and plan files changed. Exclude `.superpowers/brainstorm/`, `node_modules/`, `dist/`, and local environment files from any future commit.

- [ ] **Step 4: Resolve repository ownership before committing**

Stop and obtain one explicit user choice:

1. Restore the intended `.git` metadata from the original repository; or
2. Initialize a new repository in `D:\VSCode_Projects\Mikes_app\helpplease`, create a `.gitignore` covering `node_modules/`, `dist/`, `.env*`, and `.superpowers/`, and make an initial commit.

- [ ] **Step 5: Commit after repository resolution**

When Git is valid, run:

```powershell
git status --short
git add README.md firestore.rules src docs/superpowers/specs/2026-07-10-cross-page-visual-system-design.md docs/superpowers/plans/2026-07-10-cross-page-visual-system.md
git commit -m "feat: add store directory and refine app visual system"
```

Expected: commit succeeds and `git status --short` is clean except for intentionally excluded user files.
