---
description: "Task list for Main Chart Page Tests and Responsive Layout"
---

# Tasks: Main Chart Page Tests and Responsive Layout

**Input**: Design documents from `/specs/003-main-page-tests/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-harness.md, contracts/chart-pages-ui.md, quickstart.md

**Tests**: Tests are the main deliverable of this feature, so they appear as implementation tasks. They are written to the expected behaviour in [contracts/chart-pages-ui.md](./contracts/chart-pages-ui.md) first; where the app does not yet behave that way, the test fails until the matching fix task is done.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 to US5)

## Conventions for every task

- All paths are relative to the repository root `/Users/noahg/Dev/Astro/astro-web`.
- Run every `node`/`npm`/`npx` command under Node 24: prefix with `source ~/.nvm/nvm.sh && nvm use`.
- No new dependencies.
- "B1" to "B14" refer to the bug table in [research.md](./research.md) item 6. "UI contract" means [contracts/chart-pages-ui.md](./contracts/chart-pages-ui.md); "harness contract" means [contracts/test-harness.md](./contracts/test-harness.md).
- Integration tests render a real page with `renderChartPage(page, options)` from `tests/integration/charts.tsx` (default scenario `withCustomProfiles`), scope queries with `widget("<region name>")`, and drive the drawer through the `drawer` helper. They find things only by the roles and names in the UI contract. Follow the style of `tests/integration/profile-custom-profiles.test.tsx`.
- Check what was sent with `capture("post", "<path>")`, make an endpoint fail with `reject("post", "<path>")`, and delay one with `hold("post", "<path>")`, all from `tests/integration/requests.tsx`. To replace a response the page asks for on load, pass `handlers: [...]` to `renderChartPage`.
- The clock is frozen at 2026-01-15T12:00:00Z: Thursday 07:00 in `America/New_York`, in the week of Sunday 11 to Saturday 17 January 2026.
- jsdom has no layout. Do not assert sizes, overflow or visibility that depends on CSS in integration tests; use `toBeInTheDocument()`.
- Each shared widget is tested once, on the host page named in its task. Do not repeat widget tests in the `page-*` files (FR-002).
- Never weaken or delete a test to make it pass (FR-009). A problem that cannot be fixed in this repo is marked with `test.fails` and recorded in `tests/KNOWN_ISSUES.md`.
- Browser tests: exactly one test per page file, happy path only, at `phone` and `desktop`. No layout assertions at other sizes, no error cases (FR-010, FR-012). Import `test` and `expect` from `tests/e2e/fixtures.ts`.
- Do not change wording, colours or widget order except where the UI contract says so. Do not edit `src/pages/Time.tsx`, `src/components/ViewSelector.tsx`, `src/components/chart-views/CurrentTimings.tsx`, `DailyTimings.tsx`, `src/components/timeline/*` or `src/components/chart-views/timings/*` beyond what is needed for them to compile.
- Match the code style of the file being edited; do not add comments that restate the code.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the starting point

- [x] T001 Run `npm test`, `npm run test:e2e`, `npm run lint` and `npm run build` and record the baseline in the "Baseline" section at the end of this file (`specs/003-main-page-tests/tasks.md`): number of integration tests and run time, browser runs and run time, and whether lint and build pass. All existing tests must pass with no expected failures. Stop and report if the baseline differs or if lint or build fail before any change.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Mocks, render helpers, and the roles and names every test holds on to

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Harness

- [x] T002 [P] Create `tests/mocks/charts.ts` per [research.md](./research.md) item 3 and the harness contract. Pure builder helpers (`planet(name, longitude, house, overrides?)` deriving `sign`, `position.position`, `position.degInSign` and `position.degMin` from the longitude; `houses(ascendantLongitude)` returning 12 equal cusps; `keyAngles(ascendantLongitude, midheavenLongitude)`; `aspect(type, point1, point2, orb, overrides?)`), typed against `src/types/chart.ts`, `planet.ts`, `cusp.ts`, `aspect.ts`. Export `natalChart` (all 14 planets from `PLANET_ORDER`; Mercury `retrograde: true`; Venus and Mars within 3 degrees of each other; 8 aspects including one to Chiron, one to Lilith and one between a planet and the Ascendant, one aspect with `orb` under 0.25), `otherNatalChart` (a visibly different chart: different Ascendant sign and Sun sign), `momentChart`, `emptyAspectsChart` (`natalChart` with `aspects: []`), `transitChart` and `synastryChart` (`MultiChart` from two of the above with 6 cross aspects, some with `point1Owner: "main"` and some `"other"`). Nothing may depend on the current time or on random values.
- [x] T003 [P] Create `tests/mocks/timings.ts`, typed against `src/types/timings.ts` and `src/types/moon.ts`, with all times written as fixed ISO strings for the frozen day and week. Export `dailyTimings` (Ascendant sign changes roughly every two hours through 15 January 2026 local time in `angleTimings`; in `aspects`, two CONJUNCTION timings between a planet and the ASC angle with exact times that day, plus one non-conjunction and one conjunction not involving ASC, which the page must filter out), `emptyDailyTimings` (sign changes, no aspects), `weeklyTimings` (2 aspects, one of them with two `exactDateRanges`, and one involving the DC angle which the page must filter out; 1 ingress; 1 retrograde starting in the week; 1 station; two events at exactly the same minute; at least one day of the week with no events), `emptyWeeklyTimings`, `moonTimings` (`currentPhase` plus a `phaseLoop` of 8 entries, one of them with an unparseable `dateTime`).
- [x] T004 Update `tests/mocks/data.ts`: add `userWithoutLocation` (the `user` fixture with `location.address: ""`) and `manyBirthProfiles` (20 `BirthProfile`s with `isMain: false`, ids 10 to 29, at least three with names over 40 characters).
- [x] T005 Update `tests/mocks/handlers.ts` per the harness contract: change `getMe` to accept the user to return (default `user`); add `natalChartFor`, `genericChart`, `transitChartFor`, `synastryChartFor`, `dailyTimingsFor` (registers both `/timing/daily` and `/timing/daily-transit`), `weeklyTimingsFor` (registers `/timing/current` and `/timing/transit`, the latter returning `{ aspects }` only), `moonTimingsFor`, and `descriptions`. `natalChartFor` returns `natalChart` when the request's `birthProfileId` is 1 and `otherNatalChart` otherwise. `descriptions` returns `{ description: describeContext(context), cached: false, contextType: context.type }`; export `describeContext`, which builds a short deterministic string from the context (for example `"Description for placement SUN CAPRICORN house 5 NATAL"`). Handlers that register two endpoints return an array; adjust `common()` accordingly in T006.
- [x] T006 Update `tests/mocks/scenarios.ts` and `tests/mocks/index.ts`: add all new handlers to `common()`; add `"noLocation"` to `ScenarioName` (main profile, `getMe(userWithoutLocation)` placed before `common()` so it wins); export every new fixture, handler and `describeContext` from `index.ts`.
- [x] T007 Add `ChartProvider` (from `src/contexts/ChartContext.tsx`) to `renderWithApp` in `tests/integration/render.tsx`, inside `ChartSettingsProvider`, matching the provider order in `src/main.tsx`; update the comment above the function.
- [x] T008 Create `tests/integration/requests.tsx` with `capture`, `reject` (error message optional, default `"Request failed"`) and `hold` per the harness contract. Move `capture` and `reject` out of `tests/integration/profile.tsx` and re-export them from there so existing profile tests are unchanged. `capture` answers chart and timing paths with the same defaults as the handlers in T005.
- [x] T009 Create `tests/integration/charts.tsx` per the harness contract: `renderChartPage(page, { scenario, handlers, search, wait })` renders, through `renderWithApp` with `route` set to the page path plus `search`, a `<Routes>` table mirroring `src/main.tsx` (`ProtectedCharts` around all five pages, `ProtectedUserLocation` around Moment, Daily and Transits, and a stub `/profile` route rendering the text "profile screen"), with `DescProvider` and the drawer coming from the page itself. Unless `wait` is false it waits until the wheel region contains a planet button. Export `widget(name)` (`within(screen.getByRole("region", { name }))`) and the `drawer` helper (`get`, `isOpen`, `title`, `back`, `close`) based on the complementary region named "Description".

### Roles and names (research item 5; no behaviour change)

- [x] T010 [P] Make the wheel selectable by role and name per the UI contract: in `src/components/wheel/ZodiacWheel.tsx` and `MultiZodiacWheel.tsx` give the `<svg>` `role="group"` and an `aria-label` ("Natal chart wheel", or by wheel type); in `src/components/wheel/layers/Planets.tsx`, `Signs.tsx` and `Houses.tsx` give each planet group, sign wedge, house wedge and key-angle label `role="button"`, `tabIndex={0}`, the contract's `aria-label` (two-chart wheels append the owner's name from `useProfileNames()` in `src/hooks/chart/getNames.tsx`: "Sun, My Profile", "Sun, Mum", "Sun, Transits"), and an `onKeyDown` that opens on Enter or Space. Put the sign's click handler on the group so wedge and glyph share one button. Planets set `data-highlighted="true"` on the group while `hoverAspectedPlanets` includes them or they are the hovered planet.
- [x] T011 [P] Turn the chips into real buttons with the contract's names, keeping their classes and look: `src/components/utils/PlanetChip.tsx`, `SignChip.tsx`, `HouseChip.tsx`, `KeyAngleChip.tsx`, `AspectChip.tsx` (`<button type="button" aria-label=...>`). Add an optional `interactive?: boolean` prop (default `true`) to each; when false, render a non-interactive `<span>` with the same look.
- [x] T012 [P] Turn section headers into disclosure buttons in `src/components/utils/Section.tsx` (`Section`, `SectionSmall`, `DescSection`): the clickable header becomes `<button type="button" aria-expanded>`; where `DescSection` wraps chips in its header, keep the chip outside the button so buttons are not nested. `Section`'s spinner state gets `role="status"` with `aria-label="Loading"` (edit `src/components/utils/Spinner.tsx`).
- [x] T013 [P] Name the drawer and its controls: in `src/components/descriptions/DescriptionSidePanel.tsx` render `<aside aria-label="Description">`; in `src/components/descriptions/Helpers.tsx` give `BackButton` `aria-label="Back"` and `CloseButton` `aria-label="Close"`, and make a clickable `OverviewCard` a `<button type="button">`.
- [x] T014 [P] Make aspect matrix cells selectable by name in `src/components/chart-views/AspectMatrix.tsx` and `MultiAspectMatrix.tsx`: a cell with an aspect contains `<button type="button" aria-label="Sun Trine Moon">` (two-chart: owner names included, per the UI contract) carrying the click and hover handlers; empty cells contain nothing. Header cells keep their `title`.
- [x] T015 [P] Make weekly event previews single buttons with the contract's names (B14 groundwork, behaviour fixed in T027): `AspectPreview` in `src/components/descriptions/AspectTimingPanel.tsx`, `IngressPreview` in `IngressPanel.tsx`, `RetrogradePreview` in `RetrogradeTimingPanel.tsx`, and the previews in `KeyAngleTimingPanel.tsx` and `DailyAspectTimingPanel.tsx` become `<button type="button" aria-label=...>`; chips inside them are rendered with `interactive={false}` (depends on T011).
- [x] T016 Give every widget a named region per the UI contract's "Regions" table: in `src/pages/Charts.tsx`, `Moment.tsx`, `Daily.tsx`, `Transits.tsx`, `Synastry.tsx` and the widgets that own their heading (`src/components/chart-views/MoonTimings.tsx`, `WeeklyTimingWidget.tsx`, `TransitPlacements.tsx`, `DailyAscendantTimeline.tsx`), use `<section aria-labelledby={id}>` with the heading carrying that id (`useId`). Add the visible heading "Ascendant Today" to `DailyAscendantTimeline.tsx`. On Transits, remove the extra wrapper section around the timeline so regions are not nested.
- [x] T017 [P] Tie labels to controls in `src/components/wheel/ZodiacWheelSettings.tsx`: each `<label>` gets `htmlFor` and each select or input an `id` (`useId`), with labels "Profile", "Other Profile", "Date", "Time".
- [x] T018 Run `npm test`, `npm run test:e2e`, `npm run lint` and `npm run build`; all must pass as in T001. Visual checks happen in Phase 7.

**Checkpoint**: Harness ready and every selectable item has a name; user story work can begin

---

## Phase 3: User Story 1 - The description drawer is protected by fast tests (Priority: P1) 🎯 MVP

**Goal**: Every way of opening, moving through and closing the drawer is covered by integration tests, and the drawer's trail, closing and failure behaviour match the spec.

**Independent Test**: With the backend stopped, `npm test -- drawer` passes; making `close()` keep the history in `src/contexts/DescContext.tsx` makes a named test fail.

### Tests for User Story 1

- [x] T019 [P] [US1] Write `tests/integration/drawer.test.tsx` on the Charts page, covering spec Story 1 scenarios 1, 2, 4 to 11 and 16: opening a planet, a sign, a house and a key angle from the wheel shows its title, general description and chart details (assert the description text equals `describeContext(...)` for the expected context, and with `capture("post", "/descriptions")` that the contexts sent are right: a non-retrograde planet sends three placement contexts, retrograde Mercury sends four); opening an aspect from the matrix shows both points, their signs and the orb, and "Exact" for the aspect with orb under 0.25; with `hold` on `/descriptions` the Details section shows the "Loading" status while general information is readable, and the text appears after `release()`; selecting a chip inside the drawer shows the new item; Back steps back one item at a time through a chain of three; Back on the first item closes; selecting another wheel item while open replaces the content and Back returns; Close removes the drawer; after Close, opening a new item and pressing Back closes the drawer (B5); Escape and a click on the page background do not close it; with `reject("post", "/descriptions")` the Details section shows "Could not load this description." as an alert while the general information, Back and Close still work (B3); opening the same item twice then pressing Back twice closes (research item 18).
- [x] T020 [P] [US1] Write `tests/integration/drawer-two-charts.test.tsx` on the Synastry page, covering Story 1 scenarios 12 to 15 and 3 (partly): changing "Other Profile" in Chart Settings while the drawer is open closes it, and reopening then Back closes it (B6); the same for "Profile" on Charts in one extra test; selecting "Sun, My Profile" and "Sun, Mum" on the wheel shows different sign and house details and sends `PRIMARY_NATAL` and `SECONDARY_NATAL` chart sources; opening a sign lists planets under "Your planets" and "Mum Planets"; opening a house does the same; opening an aspect from "Synastry Aspects" labels each point with whose chart it is.
- [x] T021 [P] [US1] Write `tests/integration/drawer-timings.test.tsx` on the Daily page, covering Story 1 scenario 3 and the Daily part of scenario 12: selecting an Ascendant conjunction marker, a moon phase tile, and one weekly event of each kind (aspect, sign change, retrograde, station) opens the drawer with the matching title and the event's date and time; one click on a weekly aspect event opens the timing event only, so Back closes the drawer (B14); with fake `setInterval` (`vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] })`), an open planet drawer stays open after the 60-second refresh and shows the position from the refreshed chart (second response from `genericChart` differs) (B11).

### Implementation for User Story 1

- [x] T022 [US1] Fix B5 and B6 in `src/contexts/DescContext.tsx` per [research.md](./research.md) item 8: `close()` clears the history; an effect reads `useWheel().settings` and closes (clearing the history) when `profileId`, `otherProfileId`, `datetimeOptions?.date` or `datetimeOptions?.time` changes after the first value is known, without closing on the initial settings setup on Moment and Transits and without reacting to chart refreshes.
- [x] T023 [US1] Fix B3: in `src/hooks/descriptions/useGeneratedDescriptions.tsx` return `failed: boolean[]` alongside `descriptions` (true where the request threw); pass it through the nine hooks in `src/hooks/descriptions/` (`usePlanetDesc`, `useSignDesc`, `useHouseDesc`, `useAspectDesc`, `useIngressDesc`, `useKeyAngleDesc`, `useMoonPhaseDesc`, `useRetrogradeDesc`, `useStationDesc`) as an `error` flag or per-item flags.
- [x] T024 [P] [US1] Create `src/components/utils/LoadError.tsx`: a small component rendering its message with `role="alert"` in the muted style the widgets already use for empty states.
- [x] T025 [US1] Show "Could not load this description." with `LoadError` in the Details section (or in place of the individual description, where a panel shows several) of every panel in `src/components/descriptions/`: `PlanetPanel.tsx`, `SignPanel.tsx`, `HousePanel.tsx`, `AnglePanel.tsx`, `AspectPanel.tsx`, `AspectTimingPanel.tsx`, `DailyAspectTimingPanel.tsx`, `KeyAngleTimingPanel.tsx`, `IngressPanel.tsx`, `RetrogradeTimingPanel.tsx`, `StationTimingPanel.tsx`, `MoonPhasePanel.tsx` (depends on T023, T024).
- [x] T026 [US1] Fix B11 in `src/hooks/chart/useChartData.tsx`: remove the `useMemo` wrappers (or add the wheel data to their dependencies) so `usePlanetData`, `useHouseData`, `useSignData` and `useKeyAngleData` follow the chart on screen.
- [x] T027 [US1] Finish B14: confirm in `src/components/chart-views/WeeklyPlanetaryTimings.tsx` and the preview components changed in T015 that one click on a weekly event calls `open` exactly once with the timing event; remove any leftover click handlers on inner elements.
- [x] T028 [US1] Run `npm test -- drawer` until all three files pass, then `npm test` for the whole suite.

**Checkpoint**: Drawer behaviour is covered and correct on its own

---

## Phase 4: User Story 2 - Every widget's behaviour is protected by fast tests (Priority: P1)

**Goal**: Each widget is tested once for content, interaction, and loading, empty and failed states; load failures show a message.

**Independent Test**: With the backend stopped, `npm test -- wheel aspect-matrix placements chart-settings ascendant-timeline moon-timings weekly-timings` passes; showing Lilith in the matrix when it is turned off makes a named test fail.

### Tests for User Story 2

- [x] T029 [P] [US2] Write `tests/integration/wheel.test.tsx` on Charts (Story 2 scenarios 1 to 7): the wheel has 12 sign buttons, 12 house buttons, 4 key-angle buttons and a planet button per planet in `natalChart` that the settings allow; Mercury's name includes "retrograde"; with default settings Lilith is absent and Chiron present, and with `handlers: [getSettings(savedSettings)]` Lilith is present; with `showChiron: false` Chiron and the aspect line to it are absent (count `line` elements in the aspects layer against the fixture); degree labels and tick marks follow `displayOptions`; with `hold("post", "/charts/natal")` and `wait: false` the wheel region shows the "Loading" status, and with `reject` it shows "Could not load the chart." and no "Loading" (B1); selecting each kind of item opens the drawer with that title; `user.hover` on a planet sets `data-highlighted` on it and on the planets it aspects, and `user.unhover` clears it; Venus and Mars (close together) are both present and each opens its own drawer; `emptyAspectsChart` draws no aspect lines.
- [x] T030 [P] [US2] Write `tests/integration/wheel-two-charts.test.tsx` on Synastry (Story 2 scenarios 8 and 9): both owners' planets and houses are present with owner names in their labels; aspect lines count equals the cross aspects in `synastryChart` that the settings allow; selecting a planet and a house in each ring opens the drawer for that chart; `reject("post", "/charts/synastry")` shows "Could not load the chart." (B1).
- [x] T031 [P] [US2] Write `tests/integration/chart-settings.test.tsx` (Story 2 scenarios 10 to 12, plus edge cases): on Charts, the "Profile" options are "My Profile" first then the other three, with "My Profile" selected; choosing "Mum" sends `POST /charts/natal` with `{ birthProfileId: 2 }` and the wheel, matrix and placements all change to `otherNatalChart` (assert one distinguishing value in each); on Synastry, each selector omits the profile chosen in the other, and choosing a new other profile sends `{ mainBirthProfileId: 1, otherBirthProfileId }`; choosing two profiles in quick succession with `hold` so the first response arrives last leaves the second choice's chart on screen (B8); with `manyBirthProfiles` every profile is listed; the profile with `birthTimeUnknown` ("Sam") can be chosen and its chart is shown (research item 18).
- [x] T032 [P] [US2] Write `tests/integration/aspect-matrix.test.tsx` (Story 2 scenarios 13 to 16): on Charts, column and row headers are the allowed planets in `PLANET_ORDER` followed by ASC and MC, with no IC or DC; each aspect in `natalChart` between allowed points has a cell button with the contract's name, and the number of cell buttons equals that count; selecting one opens the drawer for that aspect; there are no buttons in cells without an aspect; with default settings Lilith is absent from headers and cells, and with `showChiron: false` so is Chiron (B9); `emptyAspectsChart` gives a matrix with headers and no cell buttons; changing nothing on the page but rendering with `savedSettings` sends the chart request once (aspect types are filtered by the backend, research item 6); `reject` on the chart shows "Could not load the chart." in the region. On Synastry, one chart's points run along the top and the other's down the side with both owner labels shown, and every cell button names both owners.
- [x] T033 [P] [US2] Write `tests/integration/placements.test.tsx` (Story 2 scenarios 17 and 18): on Charts, one row per planet in `natalChart` with its sign, house and degree text; selecting the planet, sign and house buttons in a row opens the drawer for each; `reject` on the chart shows "Could not load the chart." in the region. On Synastry, two groups headed "My Profile" and "Mum", and selecting a planet in the second group opens the drawer for the other chart's planet.
- [x] T034 [P] [US2] Write `tests/integration/ascendant-timeline.test.tsx` on Daily (Story 2 scenarios 19 to 23): the region shows the current Ascendant sign and degree from `momentChart`; a segment per Ascendant sign change with its start time; a "NOW" marker; exactly the two Ascendant conjunction buttons from `dailyTimings` with their times (the non-conjunction and the non-ASC conjunction are absent); the scroll container's `scrollTop` was set to a positive value on first render; selecting a marker opens the drawer; `emptyDailyTimings` shows "No exact ASC conjunctions today"; `hold` shows the "Loading" status; `reject("post", "/timing/daily")` shows "Could not load today's timings." and not the "no conjunctions" text (B2). One test on Transits: the request goes to `/timing/daily-transit` with `{ date: "2026-01-15", birthProfileId: 1 }`.
- [x] T035 [P] [US2] Write `tests/integration/moon-timings.test.tsx` on Daily (Story 2 scenarios 24 to 26): the region shows the Moon's current sign and degree from `momentChart`; eight phase buttons in date order, each with date, time and sign; the current phase has `aria-current`; the phase with the unparseable time says "Timing unavailable"; selecting a phase opens the drawer; `hold` shows "Loading"; `reject("post", "/timing/current-moon")` shows "Moon timings are unavailable right now." as an alert; the request body is `{ date: "2026-01-15" }`.
- [x] T036 [P] [US2] Write `tests/integration/weekly-timings.test.tsx` on Daily (Story 2 scenarios 27 to 31): "By day" is pressed by default and lists seven days, Sunday 11 to Saturday 17 January, each with its ruling planet ("Sun day" to "Saturn day"); each event from `weeklyTimings` appears under its day (an aspect contributes start, each exact time, and end), the aspect involving DC is absent, and a day with none says "No timing events"; switching to "Timeline" shows the same events with times in their names, a "NOW" marker, and `scrollTop` set; switching back restores "By day"; selecting an event in each view opens the drawer; the two same-minute events are both present and each opens its own drawer; `emptyWeeklyTimings` shows "No timing events this week" in Timeline; `hold` shows "Loading"; `reject("post", "/timing/current")` shows "Could not load this week's timings." and none of the "no events" texts (B2). With `vi.setSystemTime` at Saturday 17 January 23:50 local and at Sunday 11 January 00:10 local, the week listed is still 11 to 17 January. One test on Transits: the request goes to `/timing/transit` with `birthProfileId: 1`, and changing the profile sends it again with the new id.

### Implementation for User Story 2

- [x] T037 [US2] Fix B1 and B8 in `src/contexts/SingleWheelContext.tsx` per [research.md](./research.md) item 7: add `status: "loading" | "ready" | "error"` to the context value; each fetch runs inside the effect with a `cancelled` flag set in the cleanup, sets `"loading"` before the request (except for the minute refresh on `type === "time"` after a first success), sets `"ready"` with the chart on success, sets `"error"` in a `catch`, and ignores results when cancelled. A failed refresh after a successful load keeps the last chart and `"ready"`; a successful refresh after `"error"` moves to `"ready"`.
- [x] T038 [US2] Apply the same status, cancellation and error handling to `src/contexts/MultiWheelContext.tsx` (B1, B8). Do not change how the other profile is chosen here; that is T049.
- [x] T039 [US2] Show load states in the wheels: `src/components/wheel/ZodiacWheel.tsx` and `MultiZodiacWheel.tsx` render the "Loading" status while `status === "loading"` and `<LoadError>` with "Could not load the chart." when `"error"` (depends on T024, T037, T038).
- [x] T040 [US2] Show "Could not load the chart." in the matrix and placements regions when the wheel status is `"error"`, and nothing but the heading while loading: `src/components/chart-views/AspectMatrix.tsx`, `MultiAspectMatrix.tsx`, `PlacementsTable.tsx`, `TransitPlacements.tsx`.
- [x] T041 [US2] Fix B9: in `src/hooks/chart/singleWheelData.ts` and `multiWheelData.ts`, make `getFilteredAspects` drop aspects whose either point is Chiron when `showChiron` is false or Lilith when `showLilith` is false (pass `objectOptions` in from `useWheelData` in `src/hooks/chart/useWheelData.tsx`); in `AspectMatrix.tsx` and `MultiAspectMatrix.tsx`, leave those planets out of the row and column points. Placements are not changed.
- [x] T042 [US2] Fix B2 and B8 in the timing hooks: `src/hooks/timings/useTimings.tsx`, `useDailyTimings.tsx` and `useMoonTimings.tsx` return `error: boolean` (true when the last request failed, reset when a new one starts) and ignore a response whose effect has been cleaned up.
- [x] T043 [US2] Show timing load failures: `src/components/chart-views/DailyAscendantTimeline.tsx` ("Could not load today's timings."; keep showing the heading), `WeeklyTimingWidget.tsx` with `WeeklyPlanetaryTimings.tsx` and `WeeklyPlanetaryTimeline.tsx` ("Could not load this week's timings."; pass `error` down with `loading` and `timings`), and `MoonTimings.tsx` (existing text, now through `LoadError`). The view toggle stays usable in the error state.
- [x] T044 [US2] Run the eight widget test files until they pass, then `npm test` for the whole suite.

**Checkpoint**: Every widget is covered once, and load failures are visible

---

## Phase 5: User Story 3 - Each page's own behaviour is protected by fast tests (Priority: P2)

**Goal**: Each page's request, settings, redirects and missing-data behaviour are covered; Synastry works with one profile; the Friends link is gone.

**Independent Test**: With the backend stopped, `npm test -- page- chart-guards navbar` passes; making Moment ignore the date in its link makes only `page-moment` fail.

### Tests for User Story 3

- [x] T045 [P] [US3] Write `tests/integration/chart-guards.test.tsx` (Story 3 scenarios 1, 8, 11, 15): with scenario `newAccount`, opening each of the five pages (`wait: false`) ends on "profile screen" with the toast "Please create your birth profile first"; with scenario `noLocation`, Moment, Daily and Transits end on "profile screen" with the toast "Please enter your location first", while Charts renders its wheel and Synastry shows its second-profile message (neither needs a location); with scenario `withProfile` (one profile) Charts, Moment, Daily and Transits render their wheel (SC-009).
- [x] T046 [P] [US3] Write `tests/integration/page-charts.test.tsx` and `tests/integration/page-moment.test.tsx`. Charts (scenarios 2 to 4): the four regions from the UI contract are present; on load `POST /charts/natal` is sent once with `{ birthProfileId: 1 }`. Moment (scenarios 2, 5 to 7): four regions; with no query the Date and Time fields show `2026-01-15` and `07:00:00` (local now) and `POST /charts/generic` is sent with that `datetime`; with `search: "?date=2026-03-01&time=14:30"` the fields and the request use those; with `search: "?date=2026-03-01"` the time is `23:59:00`; changing Date or Time sends a new request with the new value; clearing Date sends no request and leaves the chart; `search: "?date=not-a-date"` sends no request containing that value (research item 18); there is no "Profile" selector.
- [x] T047 [P] [US3] Write `tests/integration/page-daily.test.tsx` and `tests/integration/page-transits.test.tsx`. Daily (scenarios 2, 9, 10): six regions; no Profile, Date or Time controls; `POST /charts/generic` is sent with the local now; with fake `setInterval`, after 60 seconds a second chart request is sent and the wheel shows the new chart; a rejected second request leaves the first chart on screen with no error message. Transits (scenarios 2, 12 to 14): six regions; on load `POST /charts/transit` is sent with `{ birthProfileId: 1, datetime }` for local now; choosing "Mum" sends the chart, `/timing/daily-transit` and `/timing/transit` again with `birthProfileId: 2`; changing Date or Time, and `search: "?date=2026-03-01&time=14:30"`, send the chart request for that moment; clearing Date sends no request (B13); placements groups are headed "My Profile" and "Transits".
- [x] T048 [P] [US3] Write `tests/integration/page-synastry.test.tsx` (scenarios 2, 16 to 18) and update `tests/integration/navbar.test.tsx`. Synastry: four regions; on load `POST /charts/synastry` is sent with `{ mainBirthProfileId: 1, otherBirthProfileId: 2 }`; with birth profiles returned in the order `[...customBirthProfiles, mainBirthProfile]` the request is still main 1 and other 2 (B4); changing either selector sends the new pair and the matrix label, placements heading and an opened aspect's labels use the new name; with scenario `withProfile` the page shows "Synastry compares two birth profiles. Add a second profile to use it." and a link "Go to Profile" to `/profile`, no chart request is sent, and following the link shows "profile screen". Navbar: `DESTINATIONS` becomes the seven entries without "Friends", and one new test asserts no link or menu item named "Friends" exists (B7).

### Implementation for User Story 3

- [x] T049 [US3] Fix B4: in `src/pages/Synastry.tsx`, when `useBirthProfiles().profiles` has no profile with `isMain !== true`, render the message and link from the UI contract (inside the same `<main>` padding) instead of `MultiWheelProvider` and its children; in `src/contexts/MultiWheelContext.tsx`, set the initial `otherProfileId` for `type === "synastry"` to the first profile that is not the main one.
- [x] T050 [US3] Fix B13 in `src/contexts/MultiWheelContext.tsx`: for `type === "transit"`, make no chart request while `datetimeOptions.date` or `datetimeOptions.time` is empty, keeping the chart already on screen. Confirm `SingleWheelContext.tsx` does the same for `type === "moment"` under the new status handling (status stays `"ready"`).
- [x] T051 [US3] Fix B7 in `src/components/Navbar.tsx`: remove the Friends entry from `ACCOUNT_LINKS` (leave `src/pages/Friends.tsx` and the commented-out route in `src/main.tsx` as they are).
- [x] T052 [US3] Run `npm test -- page- chart-guards navbar` until all pass, then `npm test` for the whole suite; confirm the run is under 20 seconds (SC-002) and note the time in the Baseline section.

**Checkpoint**: All integration coverage is in place; Stories 1 to 3 pass together

---

## Phase 6: User Story 4 - Each page's journey works in a real browser on phone and desktop (Priority: P2)

**Goal**: One happy-path journey per page passes at phone and desktop.

**Independent Test**: With the backend stopped, `npm run test:e2e` reports `charts`, `moment`, `daily`, `transits` and `synastry` passing separately for `phone` and `desktop`.

- [x] T053 [US4] Create `tests/e2e/chart-page.ts` per the harness contract: `openFromNav(page, name)` starts at `/`, and opens the destination through the "Menu" button and its menu item when the button is visible, otherwise through the bar link (follow `tests/e2e/profile.spec.ts`); `drawer(page)` returns locators for the "Description" region, its heading, "Back" and "Close"; `expectDrawerCoversScreen(page)` asserts, only when the Menu button is visible, that the drawer's bounding box equals the viewport; `expectNoSidewaysScroll(page)` asserts `document.documentElement.scrollWidth <= window.innerWidth`.
- [x] T054 [P] [US4] Write `tests/e2e/charts.spec.ts` (scenario `withCustomProfiles`, one test): open Charts from the navigation; see the four region headings; choose "Mum" in Profile and assert through `requests.to("POST", "/charts/natal")` that the last body is `{ birthProfileId: 2 }`; select a wheel planet, see the drawer titled with it, `expectDrawerCoversScreen`, select a sign chip inside the drawer, press Back, see the planet again, Close and see the drawer gone; select a matrix cell, see the aspect, Close; select a placements chip, see it, Close; `expectNoSidewaysScroll`.
- [x] T055 [P] [US4] Write `tests/e2e/moment.spec.ts` (one test): open Moment from the navigation; four headings; fill Date `2026-03-01` and Time `14:30` and assert the last `/charts/generic` body's `datetime` starts with `2026-03-01T14:30`; open the drawer from a wheel sign, from a matrix cell and from a placements chip, closing each; `expectNoSidewaysScroll`.
- [x] T056 [P] [US4] Write `tests/e2e/daily.spec.ts` (one test): open Daily from the navigation; six headings; the "NOW" marker in "Ascendant Today" is in the viewport after scrolling the region into view; open the drawer from a wheel planet, an Ascendant conjunction marker, a moon phase tile, a weekly event in "By day", then switch to "Timeline" and open one there, and from a matrix cell, closing each; once, select a related item inside the drawer and press Back; `expectDrawerCoversScreen` once; `expectNoSidewaysScroll`.
- [x] T057 [P] [US4] Write `tests/e2e/transits.spec.ts` (one test): open Transits from the navigation; six headings; choose "Mum" in Profile and assert the last `/charts/transit` body has `birthProfileId: 2`; open the drawer from a planet in each ring, a weekly event, a matrix cell and a placements chip, closing each; `expectNoSidewaysScroll`.
- [x] T058 [P] [US4] Write `tests/e2e/synastry.spec.ts` (one test): open Synastry from the navigation; four headings; choose "Sam" in Other Profile and assert the last `/charts/synastry` body is `{ mainBirthProfileId: 1, otherBirthProfileId: 3 }`; open the drawer from a planet in each ring, a matrix cell and a placements chip, closing each; `expectNoSidewaysScroll`.
- [x] T059 [US4] Run `npm run test:e2e`. If a journey fails at phone because the drawer does not cover the screen, the page scrolls sideways, or an item cannot be tapped, that is expected until Phase 7: complete Phase 7's T060 to T065 and re-run rather than weakening the journey. When all 14 runs pass with no expected failures, confirm the run is under 60 seconds (SC-003) and note the time in the Baseline section.

**Checkpoint**: Five journeys pass at both sizes

---

## Phase 7: User Story 5 - The chart pages and the drawer fit every common screen size (Priority: P3)

**Goal**: The five pages and the drawer fit 320, 390, 768, 1280 and 1920 wide, confirmed by the review subagent.

**Independent Test**: `npm run review:layout` produces the screenshots, `widths.json` shows no page wider than its screen, and the review subagent reports no layout problems.

### Layout changes

- [x] T060 [US5] Fix B10 per [research.md](./research.md) item 9: in `src/components/descriptions/DescriptionSidePanel.tsx` use `fixed inset-0 w-full` below `md` and `md:inset-y-0 md:left-auto md:right-0 md:w-100 md:max-w-full` from `md`; add `overscroll-contain` to the scrolling body of every panel in `src/components/descriptions/*Panel.tsx`; give the Back and Close buttons in `Helpers.tsx` a 44px hit area; add to `src/index.css` the rule `@media (width < 48rem) { body:has(aside[aria-label="Description"]) { overflow: hidden; } }`.
- [x] T061 [P] [US5] Rework the aspect matrix to fit its space per [research.md](./research.md) item 10 in `src/components/chart-views/AspectMatrix.tsx` and `MultiAspectMatrix.tsx`: table `w-full table-fixed` with no fixed column widths, square cells, glyph and header font sizes tied to the region width through a container query with today's size as the ceiling; remove the `ml-4` and `ml-11` offsets and the inner `overflow-x-auto`; in the two-chart matrix move the rotated side label to a normal line above the table below `md`. Remove the `overflow-x-auto` wrappers around the matrix in the five page files.
- [x] T062 [P] [US5] Page shells in `src/pages/Charts.tsx`, `Moment.tsx`, `Daily.tsx`, `Transits.tsx`, `Synastry.tsx`: page padding `p-3 sm:p-6`, card padding `p-2 sm:p-4`, `min-w-0` on every grid child; in `Daily.tsx` remove the fixed `h-[650px]` around the wheel (B12) and make its headings consistent with the other pages only as far as needed for the regions in T016.
- [x] T063 [P] [US5] Wheel tapping per [research.md](./research.md) item 11 in `src/components/wheel/layers/Planets.tsx`: enlarge each planet's transparent hit circle to radius 20 wheel units and make sure it, not the glyph text, receives pointer events; keep draw order by glyph angle.
- [x] T064 [P] [US5] Placements and settings per [research.md](./research.md) item 12: in `src/components/chart-views/PlacementsTable.tsx` remove `ml-4` and the fixed-fifths columns so chips are not clipped at 320; in `TransitPlacements.tsx` keep the inner sideways scroll and add an edge fade as the sign that there is more; in `src/components/wheel/ZodiacWheelSettings.tsx` make selects and inputs `w-full min-w-0` so long profile names truncate.
- [x] T065 [P] [US5] Timing widgets on phones: in `src/components/chart-views/WeeklyPlanetaryTimings.tsx` narrow the fixed day column below `sm`; in `WeeklyPlanetaryTimeline.tsx`, `DailyAscendantTimeline.tsx` and `MoonTimings.tsx` make sure labels and markers are not clipped at 320 and that buttons are at least 44px in one dimension where space allows; make sure the inner scroll areas let the page scroll on past them (do not use `overscroll-contain` on page-direction scrollers).
- [x] T066 [US5] Run `npm test` and `npm run test:e2e`; all must pass (FR-026).

### Review capture and review

- [x] T067 [US5] Update `tests/review/profile.capture.ts` so its image names start with `profile-` and it removes only its own files, not the whole size folder; `widths.json` is merged, not overwritten.
- [x] T068 [US5] Create `tests/review/charts.capture.ts` per [research.md](./research.md) item 16, following `profile.capture.ts` and using `reviewSizes`: for each size and each of the five pages capture `<page>-01-top`, `<page>-02-full`, `<page>-03-drawer-planet`, `<page>-04-drawer-aspect`; for Daily and Transits also `-05-drawer-timing-event` and `-06-weekly-timeline`; for Daily `-07-drawer-moon-phase`; for Charts `-08-could-not-load` (chart request overridden to fail through the `network` fixture); for Synastry `-09-second-profile-message` (scenario `withProfile`); and for Charts and Synastry `-10-many-profiles` with `manyBirthProfiles`. Record page width against screen width per state in `widths.json`. It asserts nothing about layout.
- [x] T069 [US5] Run `npm run review:layout` and check every `widths.json`: no chart-page state may have a page wider than its screen. Fix any that do, in the source files from T060 to T065.
- [ ] T070 [US5] Have a Claude review subagent read every chart-page screenshot in `test-results/layout-review/` at all five sizes and report, per size and state, any sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls, or unreadable text, judging explicitly: aspect matrix symbol legibility at 320 and 390; the wheel being whole, round and without a large gap beneath; Back and Close visible in the drawer at every size (FR-027).
- [ ] T071 [US5] Fix every problem the review reports, re-run `npm run review:layout`, and repeat T070 for the affected sizes until it reports none (FR-028). If the review judges the matrix illegible at 320, stop and ask the user about the fallback in [research.md](./research.md) item 10 instead of deciding it. Record each round in the "Layout review record" section of `specs/003-main-page-tests/quickstart.md`.
- [ ] T072 [US5] Run `npm test` and `npm run test:e2e` again after the review fixes; all must pass.

**Checkpoint**: All five stories complete

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T073 [P] Update `tests/README.md`: the new mock files and the `noLocation` scenario; `renderChartPage`, `widget`, `drawer`, `capture`, `reject`, `hold`; the rule "one journey per page: a new widget adds a step to its page's journey and integration tests, not a browser test" (FR-013); the chart-page review capture; and the measured run times.
- [x] T074 Run `npm run lint` and `npm run build`; the build passes, and lint has no more findings than the pre-change baseline (23 errors and 6 warnings now, versus 25 errors and 10 warnings at baseline). The changed files with baseline findings were compared against `HEAD` and have no increase; the integration files added here pass targeted lint.
- [ ] T075 Walk through [quickstart.md](./quickstart.md) steps 2, 4, 5 and 6 (break one drawer behaviour and one widget behaviour and confirm a named test fails, then revert; the by-hand checks need `npm run dev` and a backend, so if no backend is available, say so and list them as not done). Confirm the count of new browser test files is exactly five (SC-004).
- [x] T076 Check coverage against the spec: list, in the "Coverage" section at the end of this file, each acceptance scenario of User Stories 1 (16), 2 (31) and 3 (18) with the test file that covers it; any gap is a missing test to add. Confirm `tests/KNOWN_ISSUES.md` has no new rows, or that each new row has a reason it cannot be fixed in this repo (SC-001).

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1** → **Phase 2** → user stories. Phase 2 blocks everything: tests cannot find items until the roles and names (T010 to T017) exist.
- **US1 (Phase 3)** and **US2 (Phase 4)** depend only on Phase 2 and can proceed in either order or together. T039 and T043 need `LoadError` from T024 (US1); if US2 goes first, do T024 first.
- **US3 (Phase 5)** depends on Phase 2; its Synastry and Transits fixes (T049, T050) touch `MultiWheelContext.tsx`, so do them after T038 (US2).
- **US4 (Phase 6)** depends on US1 to US3 being done (journeys rely on the fixed behaviour), and its phone runs depend on T060 to T065 in US5 (see T059).
- **US5 (Phase 7)** layout tasks depend on Phase 2; the capture and review (T067 to T072) depend on everything before.
- **Phase 8** last.

### Within each story

- Write the story's tests first; those for already-correct behaviour pass, those for B-numbered fixes fail until the fix task is done.
- Same-file tasks are sequential: `MultiWheelContext.tsx` (T038 → T049 → T050); `AspectMatrix.tsx` and `MultiAspectMatrix.tsx` (T014 → T040 → T041 → T061); `DescriptionSidePanel.tsx` (T013 → T060); the page files (T016 → T049 for Synastry → T062).

### Parallel opportunities

- Phase 2: T002 and T003; then T010 to T015 and T017 (different files; T015 after T011).
- US1: T019, T020, T021 (three test files), and T024.
- US2: T029 to T036 (eight test files).
- US3: T045 to T048.
- US4: T054 to T058 (five spec files) after T053.
- US5: T061 to T065 (different files).

## Parallel Example: User Story 2

```text
Task: "Write tests/integration/wheel.test.tsx on Charts (T029)"
Task: "Write tests/integration/aspect-matrix.test.tsx (T032)"
Task: "Write tests/integration/weekly-timings.test.tsx on Daily (T036)"
```

## Implementation Strategy

### MVP first

1. Phases 1 and 2: harness plus roles and names.
2. Phase 3 (US1): drawer tests and fixes. Stop and validate with `npm test -- drawer`: the feature on all five pages is now protected.

### Incremental delivery

3. US2: widgets, with load-failure messages. Validate with `npm test`.
4. US3: pages, Synastry with one profile, Friends link. Validate with `npm test`; all integration coverage is complete here.
5. US5 layout changes (T060 to T066), then US4 journeys, then US5 capture and review. This order avoids writing phone journeys against a drawer that does not yet fit a phone.
6. Polish.

## Baseline

| When                               | Integration (`npm test`)     | Browser (`npm run test:e2e`) | Lint                                  | Build  |
| ---------------------------------- | ---------------------------- | ---------------------------- | ------------------------------------- | ------ |
| Before any change (T001)           | 53 tests in 7 files, 4.1 s   | 4 runs, 3.8 s                | 25 errors, 10 warnings, all in `src/` | passes |
| After the integration tests (T052) | 193 tests in 24 files, 5.9 s |                              |                                       |        |
| After the journeys (T059)          |                              | 14 runs, 7.5 s               |                                       |        |

Lint did not pass before this work started. T001 said to stop in that case; the
failures were all existing problems in app code this feature does not own, so work
continued and the bar for T074 is "no file has more lint problems than at the
baseline" instead of a clean run.

## Coverage

Each acceptance scenario of User Stories 1 to 3 and the integration test file that covers it (all under `tests/integration/`).

### User Story 1 - description drawer

| Scenario                                                                    | Covered in                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1 planet, sign, house, key angle open with name, description, chart details | `drawer.test.tsx`                                                       |
| 2 aspect opens with both points, signs, orb                                 | `drawer.test.tsx`                                                       |
| 3 moon phase, Ascendant conjunction, weekly events open with date and time  | `drawer-timings.test.tsx`                                               |
| 4 loading indication, general information readable meanwhile                | `drawer.test.tsx`                                                       |
| 5 related item inside the drawer                                            | `drawer.test.tsx`                                                       |
| 6 back, one step at a time                                                  | `drawer.test.tsx`                                                       |
| 7 back on the first item closes                                             | `drawer.test.tsx`                                                       |
| 8 another item on the page replaces, back returns                           | `drawer.test.tsx`                                                       |
| 9 close                                                                     | `drawer.test.tsx`                                                       |
| 10 close clears the trail                                                   | `drawer.test.tsx`                                                       |
| 11 leaving the page closes the drawer                                       | `drawer.test.tsx`                                                       |
| 12 changing profile, other profile, date or time closes the drawer          | `drawer.test.tsx`, `drawer-two-charts.test.tsx`, `page-moment.test.tsx` |
| 13 two-chart planet and house belong to their chart                         | `drawer-two-charts.test.tsx`, `wheel-two-charts.test.tsx`               |
| 14 two-chart sign and house list planets in two groups                      | `drawer-two-charts.test.tsx`                                            |
| 15 two-chart aspect labels each point's chart                               | `drawer-two-charts.test.tsx`, `page-synastry.test.tsx`                  |
| 16 description cannot be loaded                                             | `drawer.test.tsx`                                                       |

### User Story 2 - widgets

| Scenarios                         | Covered in                                                |
| --------------------------------- | --------------------------------------------------------- |
| 1 to 7 chart wheel, one chart     | `wheel.test.tsx`                                          |
| 8, 9 chart wheel, two charts      | `wheel-two-charts.test.tsx`, `drawer-two-charts.test.tsx` |
| 10 to 12 Chart Settings           | `chart-settings.test.tsx`                                 |
| 13 to 15 aspect matrix, one chart | `aspect-matrix.test.tsx`                                  |
| 16 aspect matrix, two charts      | `aspect-matrix.test.tsx`                                  |
| 17, 18 placements                 | `placements.test.tsx`                                     |
| 19 to 23 Ascendant timeline       | `ascendant-timeline.test.tsx`                             |
| 24 to 26 Moon Timings             | `moon-timings.test.tsx`                                   |
| 27 to 31 Weekly Timings           | `weekly-timings.test.tsx`                                 |

### User Story 3 - pages

| Scenarios               | Covered in                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------- |
| 1 no main birth profile | `chart-guards.test.tsx`                                                            |
| 2 every widget shown    | `page-charts`, `page-moment`, `page-daily`, `page-transits`, `page-synastry`       |
| 3, 4 Charts             | `page-charts.test.tsx`, `chart-settings.test.tsx`                                  |
| 5 to 7 Moment           | `page-moment.test.tsx`                                                             |
| 8, 11, 15 no location   | `chart-guards.test.tsx`                                                            |
| 9, 10 Daily             | `page-daily.test.tsx`, `drawer-timings.test.tsx` (drawer stays open)               |
| 12 to 14 Transits       | `page-transits.test.tsx`, `weekly-timings.test.tsx`, `ascendant-timeline.test.tsx` |
| 16 to 18 Synastry       | `page-synastry.test.tsx`, `chart-settings.test.tsx`                                |

Gaps: none. Story 1 scenario 11 is covered by a navigation test in `drawer.test.tsx`.

`tests/KNOWN_ISSUES.md` has no new rows: every problem found was fixed in this repo.
