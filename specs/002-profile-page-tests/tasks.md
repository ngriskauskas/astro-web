---

description: "Task list for Profile Page Tests and Responsive Layout"
---

# Tasks: Profile Page Tests and Responsive Layout

**Input**: Design documents from `/specs/002-profile-page-tests/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-harness.md, contracts/profile-ui.md, quickstart.md

**Tests**: Tests are the main deliverable of this feature, so they appear as implementation tasks. They are written to the expected behaviour in [contracts/profile-ui.md](./contracts/profile-ui.md) first; where the app does not yet behave that way, the test fails until the matching fix task is done.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 to US3)

## Conventions for every task

- All paths are relative to the repository root `/Users/noahg/Dev/Astro/astro-web`.
- Run every `node`/`npm`/`npx` command under Node 24: prefix with `source ~/.nvm/nvm.sh && nvm use`.
- No new dependencies.
- Integration tests follow `tests/integration/new-account-modal.test.tsx`: render with `renderWithApp`, override one response with `server.use(http.<method>(...))`, and capture what was sent by reading `await request.json()` inside a per-test handler override.
- Integration tests render the real page: `renderWithApp(<Profile />, { scenario })` with `Profile` from `src/pages/Profile.tsx`. The page has three "Save Changes" buttons and several place fields, so scope queries to a section, for example `within(screen.getByRole("heading", { name: "Account Info" }).parentElement!)`.
- A failed save in the mocks is `HttpResponse.json({ error: "<message>" }, { status: 422 })`; `apiFetch` turns that into an `Error` with that message.
- Do not change wording, colours or section order except where [contracts/profile-ui.md](./contracts/profile-ui.md) says so.
- Never weaken or delete a test to make it pass (FR-007). A problem that cannot be fixed in this repo is marked with `test.fails` and recorded in `tests/KNOWN_ISSUES.md`.
- Browser tests stay as one happy-path journey per file at `phone` and `desktop`. Do not add layout assertions or more sizes to `tests/e2e/` (FR-010).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the starting point

- [X] T001 Run `npm test` and `npm run test:e2e` and confirm the baseline before any change: 2 integration tests pass; `tests/e2e/new-account-modal.spec.ts` passes on `desktop` and is an expected failure on `phone` (KI-001). Stop and report if the baseline differs.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mocks and render helper that every profile test needs

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add fixtures to `tests/mocks/data.ts`, all fixed literals typed against the app's types: `customBirthProfiles` (three `BirthProfile`s with ids 2, 3, 4 and `isMain: false`; one with `birthTimeUnknown: true` and `birthTime: ""`; one with a name of about 60 characters and a `location` of about 120 characters); `defaultSettings` (an `AstrologySettings` equal to `DEFAULT_SETTINGS` in `src/contexts/ChartSettingsContext.tsx`); `savedSettings` (an `AstrologySettings` differing from the defaults in every group: `zodiacType: "SIDEREAL"` with a non-`LAHIRI` ayanamsa from `src/types/ayanamsa.ts`, a non-`PLACIDUS` house system from `src/types/house-system.ts`, one aspect with `show: false`, one aspect with a changed `minOrb`, `showLilith: true`, `tickMarks: false`)
- [X] T003 Update `tests/mocks/handlers.ts` per [contracts/test-harness.md](./contracts/test-harness.md): add `putBirthProfile` (`PUT {API_URL}/birth-profiles/:id`, returns the request body plus `id: Number(params.id)`), `deleteBirthProfile` (`DELETE {API_URL}/birth-profiles/:id`, 204 with no body), `putSettings` (`PUT {API_URL}/settings`, returns the request body), `resetSettings` (`POST {API_URL}/settings/reset`, returns `defaultSettings`); change `postBirthProfile` to return `id: 100` instead of `id: 1`; change `getSettings` to accept the data to return, defaulting to the existing `settings` fixture
- [X] T004 Update `tests/mocks/scenarios.ts`: add the four new handlers to `common()`; add `"withCustomProfiles"` to `ScenarioName` returning `getBirthProfiles([mainBirthProfile, ...customBirthProfiles])` plus `common()`. Export `customBirthProfiles`, `savedSettings`, `defaultSettings` and the `getSettings` handler from `tests/mocks/index.ts`
- [X] T005 Add `ChartSettingsProvider` (from `src/contexts/ChartSettingsContext.tsx`) to `renderWithApp` in `tests/integration/render.tsx`, inside `BirthProfilesProvider` and wrapping `{ui}` and `<Toaster />`, matching the provider order in `src/main.tsx`; update the comment above the function
- [X] T006 Run `npm test` and `npm run test:e2e` and confirm the result is the same as T001 (the pilot tests are unaffected by the mock and render changes)

**Checkpoint**: Harness ready; user story work can begin

---

## Phase 3: User Story 1 - Every profile screen behaviour is protected by fast tests (Priority: P1) 🎯 MVP

**Goal**: Integration tests cover all 24 acceptance scenarios of User Story 1, and every behaviour bug they expose is fixed.

**Independent Test**: With no backend, `npm test` passes in under 10 seconds; breaking one profile behaviour makes a test fail and name it.

### Tests for User Story 1

Scenario numbers refer to User Story 1 in [spec.md](./spec.md). Tests marked "fails until T0nn" are expected to fail when first written.

- [X] T007 [P] [US1] Create `tests/integration/profile-account-info.test.tsx` (scenario `withProfile`): (1) username and location are pre-filled from the `user` fixture and editable, email is shown and disabled; (2) changing the username, typing "Lond" in Location and picking `places[1]`, then saving sends `PUT /me` with `username` and `location.address`/`latitude`/`longitude` equal to what was entered (do not assert `location.timezone`, see research item 10) and shows "Profile Updated"; (3) with `PUT /me` overridden to return 422 `{ error: "Username is taken" }`, saving shows that message and the entered values remain; (24) typing in Location without picking, then saving, sends no `PUT /me` and shows "Pick a place from the suggestions" (fails until T014)
- [X] T008 [P] [US1] Create `tests/integration/profile-birth-info.test.tsx` (scenario `withProfile`, the "My Birth Info" section): (4) date, time, unknown-time and place are pre-filled from `mainBirthProfile` and there is no Name field; (5) editing date, time and picking a new place then saving sends `PUT /birth-profiles/1` with exactly those values, `isMain: true`, `name: "My Profile"`, and shows "Profile updated"; (6) ticking "Unknown time?" clears and disables the time field, and saving sends `birthTimeUnknown: true` with `birthTime: ""`; (7) with the PUT overridden to 422, an error toast starting "Failed to update Profile" is shown and the entered values remain; (24) typing in Birth Place without picking then saving sends nothing and shows "Pick a place from the suggestions" (fails until T013); edge: clearing the birth date and saving sends nothing and the date field is invalid (fails until T013); edge: clearing the time with "Unknown time?" unticked and saving sends nothing (fails until T013); edge: typing in Birth Place then restoring the original text by hand allows the save
- [X] T009 [P] [US1] Create `tests/integration/profile-custom-profiles.test.tsx`: (8) in `withCustomProfiles`, each custom profile name is listed collapsed and "My Profile" is not in the list; (9) opening one shows its details pre-filled, opening another collapses the first; (10) "Add New", filling name, date, time, picking a place and "Submit" sends `POST /birth-profiles` with those values and `isMain: false`, closes the form, shows the new name in the list and "Profile updated"; (11) "Cancel" on the new form closes it and sends nothing; (12) editing an open profile and "Save Changes" sends `PUT /birth-profiles/<id>` with the new values; (13) "Delete" shows "Delete this profile?" with Cancel and Confirm and sends nothing; Cancel restores the buttons and sends nothing; Confirm sends `DELETE /birth-profiles/<id>`, removes it from the list and shows "Profile deleted" (fails until T013); (14) with POST, PUT and DELETE each overridden to fail in turn, an error toast is shown and the list is unchanged; (15) in `withProfile`, only the "Custom Profiles" heading and "Add New" are shown; edge: submitting the new form with Name, date or place missing sends nothing (fails until T013); edge: opening a profile while the new form is open closes the new form, and "Add New" closes an open profile (fails until T015); edge: with `GET /birth-profiles` overridden to return the main profile plus 20 custom profiles, all 20 are listed
- [X] T010 [P] [US1] Create `tests/integration/profile-chart-settings.test.tsx` (scenario `withProfile`, the "Chart Default Settings" section): (16) with `server.use(getSettings(savedSettings))` every control shows its saved value, and "Loading settings..." is shown before the response arrives (delay the handler); (17) choosing Sidereal shows an Ayanamsa select defaulting to Lahiri, choosing Tropical removes it, and saving in Tropical sends no `ayanamsa`; (18) unticking an aspect disables its orb input and re-ticking enables it; (19) changing one control in each group (zodiac, house system, an aspect toggle, an orb, Chiron/Lilith, a display option) and "Save Chart Settings" sends `PUT /settings` matching what is on screen and shows "Astrology settings updated"; (20) "Reset" sends `POST /settings/reset`, the controls return to `defaultSettings` and "Settings reset to defaults" is shown; (21) with PUT then reset overridden to 422 `{ error: "..." }`, that message is shown; edge: typing an orb of 20 results in 15 and typing a negative results in 0, and a cleared orb is sent as 0 (the clamp cases fail until T016)
- [X] T011 [P] [US1] Create `tests/integration/profile-place-search.test.tsx` (scenario `withProfile`, using the Location field in "Account Info"): (22) typing two characters and waiting past the 300ms debounce makes no place-search request and shows no suggestions (count requests with a `server.use` override of `PLACE_SEARCH_URL`); (23) typing three or more characters shows `places` by `display_name`, and picking one puts it in the field and closes the list; edge: with the search overridden to return `[]`, no suggestions are shown and the field stays editable; edge: with the search overridden to `HttpResponse.error()`, no suggestions are shown, the field stays editable, and the test does not fail on an unhandled rejection (fails until T012)

### Fixes for User Story 1

Bug ids refer to [research.md](./research.md) item 8.

- [X] T012 [US1] Update `src/components/profile/BirthPlacePicker.tsx`: wrap the search `fetch` in try/catch and set no suggestions on failure (B4); track the last picked address (initially `initialAddress`, then each picked `display_name`) and add an optional prop `onPendingChange?: (pending: boolean) => void`, called whenever it changes, where pending means the field text differs from the last picked address (B3). The prop is optional so `src/components/NewAccountModal.tsx` is unaffected.
- [X] T013 [US1] Update `src/components/profile/BirthInfoForm.tsx`: make the Save/Submit button `type="submit"` with no click handler so the form's `onSubmit` runs and the browser enforces `required`; give Cancel and Delete `type="button"` (B1); add `required={!unknownTime}` to the time input (B2); hold the picker's picked state via `onPendingChange` and, on submit when it is not picked, send nothing and show "Pick a place from the suggestions" under the Birth Place field with `role="alert"`, clearing it once a place is picked (B3, FR-018b); replace the immediate delete with an inline confirmation: Delete swaps the button row for the text "Delete this profile?" with "Cancel" and "Confirm" buttons, Confirm calls the existing delete, Cancel restores the row (B5, FR-018a). Keep all toast messages as they are.
- [X] T014 [P] [US1] Update `src/components/profile/AccountInfoForm.tsx`: hold the picker's picked state via `onPendingChange` and, on submit when it is not picked, send nothing and show "Pick a place from the suggestions" under the Location field with `role="alert"` (B3, FR-018b). An account with no location yet and an untouched empty field may still save its username.
- [X] T015 [P] [US1] Update `src/components/profile/CustomProfileList.tsx` so at most one of an existing profile or the new-profile form is open: opening a profile closes the new form, as "Add New" already closes an open profile (B6)
- [X] T016 [P] [US1] Update `handleOrbChange` usage in `src/components/profile/AstrologySettingsForm.tsx` to clamp the typed value to 0 to 15, keeping a cleared field as 0 (B7)
- [X] T017 [US1] Ask the user whether the backend derives the account timezone from coordinates (research item 10). If it does not, add an assertion to scenario 2 in `tests/integration/profile-account-info.test.tsx` that the timezone sent matches the picked place, and fix `src/components/profile/AccountInfoForm.tsx` to send it (B9); if it does, add a one-line comment in the test saying why timezone is not asserted. Do not block the other tasks on the answer.
- [X] T018 [US1] Run `npm test`. For every failing test, decide whether the test or the app is wrong against [contracts/profile-ui.md](./contracts/profile-ui.md); fix the app for any further behaviour bug found (FR-007), and add each one to the bug table in `specs/002-profile-page-tests/research.md` item 8. Only for a problem that cannot be fixed in this repo, mark the test with `test.fails` and add a `KI-00N` row to `tests/KNOWN_ISSUES.md`. Finish with all tests passing in under 10 seconds.
- [X] T019 [US1] Verify SC-004 and SC-001: temporarily stop sending `location` in `handleSubmit` in `src/components/profile/BirthInfoForm.tsx`, run `npm test`, confirm a test fails and its name identifies the behaviour, then revert. Check that each of the 24 acceptance scenarios in User Story 1 of `specs/002-profile-page-tests/spec.md` has at least one test.

**Checkpoint**: User Story 1 is complete and independently verifiable with `npm test`

---

## Phase 4: User Story 2 - The profile journey works in a real browser on phone and desktop (Priority: P2)

**Goal**: One happy-path profile journey passes at phone and desktop, reaching the profile screen through the navigation as it appears at each size.

**Independent Test**: With no backend, `npm run test:e2e` reports the profile journey passing on `phone` and on `desktop`, with no expected failures anywhere.

The navigation change is in this phase because the phone journey reaches Profile through the menu and the pilot's phone run is blocked by the navigation overflow (KI-001).

- [X] T020 [P] [US2] Create `tests/integration/navbar.test.tsx` rendering `<Navbar />` from `src/components/Navbar.tsx` with `renderWithApp` (scenario `withProfile`). jsdom applies no CSS, so both the bar links and the menu are in the DOM; scope queries to the menu. Tests: the "Menu" button reports `aria-expanded="false"` initially and `"true"` after a click; the open menu contains Charts, Moment, Daily, Transits, Synastry, Friends, Profile and Logout; choosing a link in the menu closes it; while closed, the menu's links are not accessible (`queryByRole` inside the menu finds none); choosing Logout clears the session token from `localStorage`. These fail until T021.
- [X] T021 [US2] Update `src/components/Navbar.tsx` per [contracts/profile-ui.md](./contracts/profile-ui.md): below `md` show only the Astro logo and the menu button (the five chart links become `hidden md:flex` like Friends/Profile/Logout); the slide-out menu lists all eight destinations in the order Charts, Moment, Daily, Transits, Synastry, Friends, Profile, Logout and is never shown at `md` and above; the menu button gets `aria-label="Menu"` and `aria-expanded`; choosing any menu destination or tapping the backdrop closes the menu; while closed the menu is `inert` (or equivalent) so its links are out of the tab order and the accessibility tree
- [X] T022 [US2] Update `tests/e2e/new-account-modal.spec.ts`: remove the `test.fail(...)` KI-001 marker and the now-unused `testInfo` parameter, and find the menu button with `nav.getByRole("button", { name: "Menu" })` instead of `nav.locator("> button")`. Remove the KI-001 row from `tests/KNOWN_ISSUES.md`, leaving the table header.
- [X] T023 [US2] Create `tests/e2e/profile.spec.ts` with `test.use({ scenario: "withProfile" })` and one test, importing `test`/`expect` from `./fixtures`: go to `/`; reach Profile through the navigation (click the "Menu" button if it is visible, then the Profile link; branch on visibility, not on the project name) and expect the URL to end `/profile`; in Account Info change the username, type "Lond" in Location, pick `places[1]`, save, expect "Profile Updated" and `requests.to("PUT", "/me")` to have one request with the entered username and place; in My Birth Info change the birth date, save, expect "Profile updated" and one `PUT /birth-profiles/1` with that date; in Custom Profiles click "Add New", fill name, date, time, pick `places[0]`, "Submit", expect the new name in the list and one `POST /birth-profiles` with those values; in Chart Default Settings tick "Show Black Moon Lilith", "Save Chart Settings", expect "Astrology settings updated" and one `PUT /settings` with `objectOptions.showLilith: true`. Happy path only.
- [X] T024 [US2] Run `npm test` and `npm run test:e2e`. Expect all integration tests passing and 4 browser results (2 files x `phone`, `desktop`) all passing with no expected failures, in under 60 seconds. If the phone journey cannot complete because of a layout problem on the profile screen, fix that problem in the relevant file under `src/` now rather than marking it.

**Checkpoint**: User Stories 1 and 2 both pass on their own commands

---

## Phase 5: User Story 3 - The profile screen and navigation fit every common screen size (Priority: P3)

**Goal**: At 320, 390, 768, 1280 and 1920 wide, the navigation and every state of the profile screen fit with nothing clipped, overlapping or unreachable, confirmed by a Claude review subagent.

**Independent Test**: `npm run review:layout` produces screenshots for every size and state, and the review subagent reports no responsive layout problems.

There is no automated layout test. Do not add one.

### Layout fixes known in advance (research item 11)

- [X] T025 [P] [US3] In `src/pages/Profile.tsx`, reduce the page and card padding on small screens (for example `p-4 sm:p-6`) so a 320px screen keeps a usable content width; keep `max-w-2xl mx-auto` so content stays centred at 1920
- [X] T026 [P] [US3] In `src/components/profile/AstrologySettingsForm.tsx`, make the "Objects & Asteroids" and "Wheel Display Options" grids one column on small screens and two from `sm` up, matching the "Systems & Calculation" grid; let each aspect row wrap so the label and the "Max Orb" input never overlap at 320; make sure the Reset and Save buttons fit on one row or wrap cleanly at 320
- [X] T027 [P] [US3] In `src/components/profile/CustomProfileList.tsx` and `src/components/profile/BirthPlacePicker.tsx`, make a very long profile name wrap inside its row without pushing the +/− indicator off-screen, and make long place names in the suggestion list wrap within the list width

### Review capture

- [X] T028 [P] [US3] Create `tests/review/sizes.ts` exporting the five review sizes from [data-model.md](./data-model.md): `small-phone` 320 x 568, `phone` 390 x 844, `tablet` 768 x 1024, `laptop` 1280 x 800, `large-monitor` 1920 x 1080
- [X] T029 [US3] Create `tests/review/playwright.config.ts`: `testDir` set to `tests/review`, `testMatch` `**/*.capture.ts`, one Chromium project, and the same `baseURL`, port 5174, `webServer`, `launchOptions`, `timezoneId` and `locale` as the root `playwright.config.ts` (import or copy; do not change the root config). Add `"review:layout": "playwright test -c tests/review/playwright.config.ts"` to the scripts in `package.json`. If `eslint.config.js` has a block for `tests/e2e/**/*.ts`, extend it to `tests/review/**/*.ts`.
- [X] T030 [US3] Create `tests/review/profile.capture.ts` using `test` from `tests/e2e/fixtures.ts` with `test.use({ scenario: "withCustomProfiles" })`. For each size in `tests/review/sizes.ts`, set the viewport, go to `/profile`, and save a screenshot to `test-results/layout-review/<size>/<nn>-<state>.png` for each state: page top with navigation; navigation menu open (only when the "Menu" button is visible); Account Info with place suggestions open; My Birth Info; Custom Profiles collapsed; the long-named custom profile expanded; its delete confirmation showing; new-profile form open; Chart Default Settings in sidereal mode; a success toast showing right after a save; and a full-page screenshot. It asserts nothing about layout. Run `npm run review:layout` and confirm the folders and files exist.

### Review and fix

- [X] T031 [US3] Launch a Claude review subagent (Agent tool) with this brief: run `npm run review:layout` under Node 24 in `/Users/noahg/Dev/Astro/astro-web`, read every image under `test-results/layout-review/`, and report per size and state any responsive layout problem: sideways scrolling or content wider than the screen, clipped or overlapping content, controls that are unreachable or too small to tap, unreadable text, a toast covering the control just used, content stretched rather than centred at 1920, or the navigation not matching [contracts/profile-ui.md](./contracts/profile-ui.md). It must report only, not edit files, and must say explicitly when a size has no problems.
- [X] T032 [US3] Fix every problem the review reported, in `src/components/Navbar.tsx`, `src/pages/Profile.tsx`, `src/components/profile/*.tsx`, or the `Toaster` position in `src/App.tsx`, without changing behaviour (FR-017). Then repeat T031 and this task until the subagent reports no problems at any of the five sizes (FR-020). Record the final clean result (date and sizes reviewed) in a short "Layout review" note at the end of `specs/002-profile-page-tests/quickstart.md`.
- [X] T033 [US3] Confirm FR-017 and FR-018 after the layout changes: run `npm test` and `npm run test:e2e` (all passing, no expected failures), then start `npm run dev` and give the user the URL so they can check one other signed-in screen (for example Charts) at phone and desktop width for navigation regressions

**Checkpoint**: All three user stories are complete

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T034 [P] Update `tests/README.md`: add `withCustomProfiles` to the scenario table; add `npm run review:layout` to the commands with a short "Layout review" section (five sizes, screenshots in `test-results/layout-review/`, read by a review subagent, not a test); note that `renderWithApp` now includes `ChartSettingsProvider`; replace the KI-001 example in the "Known issues" section with a generic one and mention `test.fails` for integration tests; refresh the measured run times
- [X] T035 [P] Update the "Mocked endpoints" list in `specs/002-profile-page-tests/contracts/test-harness.md` and the bug table in `specs/002-profile-page-tests/research.md` if implementation differed from them
- [X] T036 Run `npm run lint` and `npm run build` and fix anything they report in files this feature touched
- [X] T037 Walk through `specs/002-profile-page-tests/quickstart.md` steps 1 to 5 and 7 and confirm each expected result; list step 6 (manual checks with a real account) for the user to do

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies
- **Foundational (Phase 2)**: after Setup; blocks all user stories
- **User Story 1 (Phase 3)**: after Foundational
- **User Story 2 (Phase 4)**: after Foundational; T023 also needs T012 to T014 (the journey saves forms whose place handling changes there), so in practice after User Story 1
- **User Story 3 (Phase 5)**: after User Story 2 (the capture uses the "Menu" button from T021 and the delete confirmation from T013)
- **Polish (Phase 6)**: after all user stories

### Within Each User Story

- US1: T007 to T011 (tests) in parallel, then T012, then T013 (needs T012), with T014 (needs T012), T015 and T016 alongside; T017 any time; T018 then T019 last
- US2: T020 alongside T021's design, T021, then T022, T023, T024
- US3: T025 to T028 in parallel; T029, T030; then T031 and T032 as a loop; T033 last

### Parallel Opportunities

- T007, T008, T009, T010, T011: five different new test files
- T014, T015, T016: three different component files (after T012)
- T025, T026, T027, T028: different files
- T034, T035: different documents

## Parallel Example: User Story 1

```text
Task: "Create tests/integration/profile-account-info.test.tsx"      (T007)
Task: "Create tests/integration/profile-birth-info.test.tsx"        (T008)
Task: "Create tests/integration/profile-custom-profiles.test.tsx"   (T009)
Task: "Create tests/integration/profile-chart-settings.test.tsx"    (T010)
Task: "Create tests/integration/profile-place-search.test.tsx"      (T011)
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phases 1 and 2: baseline and harness
2. Phase 3: integration tests and behaviour fixes
3. **Stop and validate**: `npm test` passes; the profile screen's behaviour is protected and its known bugs are fixed

### Incremental Delivery

1. User Story 1: fast tests and behaviour fixes
2. User Story 2: navigation fix, KI-001 closed, browser journey at phone and desktop
3. User Story 3: layout fixes and the subagent review at five sizes
4. Polish: docs, lint, build, quickstart

## Notes

- The number of behaviour fixes is open: T018 covers any bug beyond B1 to B7 that the tests expose.
- T017 needs an answer from the user about the backend; everything else can proceed without it.
- T031 and T032 repeat until the review is clean; that loop, not a test, is what closes User Story 3.
- Do not commit unless the user asks; each phase checkpoint is a natural place to offer one.
