# Cross-Page Visual System and Store Directory Design

**Date:** 2026-07-10  
**Status:** Approved visual direction; written specification pending user review

## Goal

Apply the approved Option C visual language to every existing screen and add the missing Store Directory page represented by `10-Store-Directory.png`. The result should feel darker, more deliberate, and more cohesive without weakening readability, speed, accessibility, or mobile usability.

## Approved Visual Direction

The interface uses near-black as its dominant field. Green behaves as a controlled light source rather than a full-page fill:

- Background blooms begin with muted cricket green near the top or a meaningful focal region, then resolve into near-black by the middle of the canvas.
- Primary panels use black-green surfaces with subtle tonal separation and restrained shadow depth.
- Lime remains reserved for primary actions, active navigation, progress, and important positive status.
- Hairline brackets use one-pixel partial corner strokes. They appear only on major page framing and selected operational cards, never around every component.
- Borders stay low-contrast by default. Status, focus, and validation signals remain stronger than decoration.
- Typography keeps the existing Space Grotesk and DM Sans pairing, with tighter hierarchy, shorter line lengths, and more consistent vertical rhythm.

The design must avoid bright neon outlines, heavy science-fiction ornament, excessive gradients, or decorative brackets on forms, tables, and dense repeated rows.

## Shared Visual Architecture

The visual system will be implemented through shared CSS tokens and reusable structural classes instead of page-specific copies.

### Surface tokens

- Canvas: near-black base with a short, low-opacity green radial bloom.
- Elevated surface: black-green panel with a subtle border and soft black shadow.
- Interactive surface: slightly brighter border and background on hover or keyboard focus.
- Active surface: restrained green tint, never an opaque green block unless it is the primary action.
- Status surfaces: semantic green, amber, and red with text/icon reinforcement.

### Shared structures

- `page-frame`: optional outer bracket treatment for feature-level pages.
- `page-intro`: consistent eyebrow, title, description, status/action alignment, and a short green hairline under the heading.
- `operational-card`: reusable dark surface with optional open/active emphasis.
- `bracket-accent`: partial top-left and bottom-right hairlines for selected high-value cards.
- Buttons: primary lime, secondary black-green, quiet text action, and danger treatment with consistent 44-pixel mobile targets.
- Dense collections: tables and lists remain unbracketed and use row separators to preserve scanning speed.

## Store Directory

### Access and navigation

Store Directory is visible to every signed-in user. It appears in the workspace side navigation and mobile drawer. The five-item bottom navigation remains unchanged to prevent crowding. Home feature priorities remain unchanged; the directory is reached through navigation rather than a new Home shortcut.

Area managers may edit all stores. Store managers may edit only their assigned store. Firestore rules will enforce that same boundary. Employees never see Edit controls.

### Page content

The page intro shows `CRICKET MONTANA`, `Store directory`, a short task-oriented description, and the count of stores currently open.

Each store card contains:

- Store name and open/closed status calculated in `America/Denver`.
- Address and published hours.
- Current closing time or next opening time.
- Scheduled employee count and current-worker context when schedule data exists.
- A primary Call action.
- Secondary Message, Map, and Store Schedule actions.
- A manager-only Edit action.

Cards render in two columns on wide screens and one column on phones. Mobile cards keep Call and Map in the primary action row, place Message and Schedule in a compact secondary row, and maintain at least 44-pixel touch targets.

### Store editing

Editing opens a focused dialog associated with the selected store. The same dialog becomes a near-full-width sheet on phones. It edits supported store contact fields without navigating away from the directory. Save, validation, cancellation, pending state, and failure state are explicit. Successful demo edits persist through demo state; live edits call the existing `saveStore` repository boundary.

The `Store` model and demo state will be made consistent with the already-subscribed live `stores` collection. The application update pipeline will include changed stores so live edits are actually persisted.

## Page-by-Page Treatment

### Welcome and sign-in

Deepen the background to black, keep one controlled green bloom behind the sign-in card, and add a single bracket treatment around the brand/card composition. Authentication choices remain visually dominant and error text remains semantic rather than decorative.

### Home

Retain the hero but reduce broad green fill. Use black depth around the hero, a shorter green light source, and one frame bracket. Stat and feature cards receive consistent surface depth; only important quick actions receive bracket accents.

### Dashboard

Keep data density and table scanning primary. Use the revised page heading and black morph, but do not bracket rows or individual metrics. Progress and pace colors remain stronger than decorative accents.

### Daily number entry and monthly goals

Forms receive darker grouped surfaces, clearer section rhythm, and consistent input focus states. Bracket decoration is not applied to forms or individual inputs. Save actions remain visually dominant.

### Milestones and leaderboard

The milestone payout card and overall leaderboard container use a bracket accent. Repeated checklist and leaderboard rows use separators and controlled highlights instead of per-row framing.

### Manager notes

Apply the same page frame, dark note composer, and structured recent-note surfaces. Note text, authorship, store, and date remain more prominent than decoration.

### My Schedule and Store Schedule

Status and coverage cards use the operational-card treatment. Current shift, coverage gaps, and notifications keep semantic priority. Calendar and import actions follow the shared button hierarchy. Schedule rows remain unbracketed.

### Store status

Reuse Store Directory status logic and operational-card styling. Open stores receive a restrained green edge; closed cards stay near-black with red status text. Avoid duplicating store-contact calculations.

### Employee setup and profile

Apply darker form surfaces, improved grouping, consistent avatar/status treatments, and the revised page heading. Do not add brackets to every employee row. The mobile setup flow remains single-column with large controls.

## Data Flow and Component Boundaries

- Store status remains owned by `store-hours.ts`.
- Store contact data comes from `state.stores`, with the static seed used only as the demo fallback.
- Store updates pass through the application `update` function; live mode detects changed stores and calls `saveStore`.
- Store Directory owns presentation and edit-state behavior but does not duplicate repository or time-zone logic.
- Shared visual behavior stays in `styles.css` and small reusable presentation primitives rather than a new styling framework.
- Existing page components keep their domain responsibilities; the visual pass does not rewrite performance, schedule, authentication, or reporting logic.

## Error and Empty States

- Missing live store documents fall back to known seeded store records so the directory remains complete during setup.
- Missing schedule coverage displays neutral copy rather than treating the store as closed or unscheduled.
- Invalid phone or address values disable their relevant action and show a concise manager-facing validation message in edit mode.
- Failed live saves preserve the draft and show an inline retryable error.
- Empty data screens use the same dark surface system and remain descriptive, not decorative.

## Accessibility and Responsive Requirements

- Maintain WCAG-friendly contrast for body text, muted text, status pills, and buttons.
- Do not rely on color alone for open/closed, success/failure, or active navigation.
- Preserve visible keyboard focus rings above decorative borders.
- Maintain at least 44-by-44-pixel primary touch targets on mobile.
- Test at approximately 390-pixel phone, 768-pixel tablet, and 1440-pixel desktop widths.
- Ensure bracket pseudo-elements never intercept pointer events or obscure focus outlines.
- Respect reduced-motion settings; this scope does not require decorative animation.

## Verification

- Add unit coverage for store data fallback/merge behavior and store update persistence.
- Add and test a store-hours display helper for current closing or next opening copy.
- Run the full Vitest suite and production build.
- Review every reference page at phone, tablet, and desktop widths.
- Perform a skeptic pass for excess ornament, low contrast, uneven spacing, unclear action hierarchy, clipped content, and duplicated status logic.
- Confirm Store Directory links use valid `tel:`, `sms:`, map, and schedule destinations.
- Confirm employees cannot edit stores and managers see only authorized edit controls.

## Out of Scope

- Replacing the current React/CSS architecture or introducing a component library.
- Adding decorative animation, 3D effects, or a new icon system.
- Redesigning domain workflows, Firebase authentication, performance formulas, or schedule synchronization.
- Changing the five-store Montana operating model or the `America/Denver` business-time rule.

## Commit Constraint

The workspace currently has an empty `.git` directory and is not recognized as a Git repository. Implementation can proceed after spec approval, but creating a commit requires either restoring the intended repository metadata or explicitly initializing a new repository with an appropriate `.gitignore`.
