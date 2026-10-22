---
description: "Task list for Planetary Hours on Daily"
---

# Tasks: Planetary Hours on Daily

**Input**: Design documents from `/specs/004-planetary-hours/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/planetary-hours-api.md, contracts/planetary-hours-ui.md, quickstart.md

**Tests**: Requested in the spec (User Story 3, FR-021 to FR-023). Each story's integration tests are written before its implementation and fail until it is done.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 to US3)

## Conventions for every task

- All paths are relative to the repository root `/Users/noahg/Dev/Astro/astro-web`.
- Run every `node`/`npm`/`npx` command under Node 24: prefix with `source ~/.nvm/nvm.sh && nvm use`.
- No new dependencies. `src/utils/api.ts` is not changed.
- "API contract" means [contracts/planetary-hours-api.md](./contracts/planetary-hours-api.md); "UI contract" means [contracts/planetary-hours-ui.md](./contracts/planetary-hours-ui.md). Roles, names and message texts in tasks come from the UI contract and must match it exactly.
- Integration tests render a real page with `renderChartPage(page, options)` from `tests/integration/charts.tsx`, scope queries with `widget(name)` / `findWidget(name)`, and find things only by role and name; no test ids. Use `capture`, `reject` and `hold` from `tests/integration/requests.tsx`. To replace a response the page asks for on load, pass `handlers: [...]` to `renderChartPage`.
- The clock is frozen at 2026-01-15T12:00:00Z: Thursday 07:00 in `America/New_York`. To test another moment, call `vi.setSystemTime(new Date("2026-01-15T17:00:00Z"))` (12:00 local) before rendering.
- Expected values for the fixture (hour, ruler, day ruler, span, next) are in the "Moments used by tests" table of [data-model.md](./data-model.md).
- jsdom has no layout. Do not assert sizes, overflow or CSS-dependent visibility in integration tests.
- Timing widgets are tested once, on Daily. Browser tests: happy path only, one journey per page, at `phone` and `desktop`; no new browser test file.
- Never weaken or delete an existing test to make it pass (FR-023). Existing tests change only where a task says so.
- Match the code style of the file being edited; do not add comments that restate the code.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the starting point

- [X] T001 Run `npm test`, `npm run lint` and `npm run build` and confirm all pass before any change; note the `npm test` duration for comparison in T022

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The types, the mock and the pure functions that both the widget and the timeline column need

**⚠️ CRITICAL**: The mock (T003 to T005) must exist before the provider sends its first request, because an unmocked request fails every Daily and Transits test

- [X] T002 [P] Create `src/types/planetaryHours.ts` with `ClassicalPlanet` (`"SUN" | "MOON" | "MARS" | "MERCURY" | "JUPITER" | "VENUS" | "SATURN"`), `PlanetaryHour` (`hour: number` 1 to 24; `ruler` and `dayRuler: ClassicalPlanet`; `period: "DAY" | "NIGHT"`; `dateTime: string`) and `PlanetaryHoursType` (`date`, `dayRuler`, `sunrise`, `sunset`, `dayEnd`, `hours: PlanetaryHour[]`), as in data-model.md
- [X] T003 Add the `planetaryHours` fixture to `tests/mocks/timings.ts`, built by a small helper from four times (previous sunset 2026-01-14T17:00:00, sunrise 2026-01-15T07:12:00, sunset 2026-01-15T17:00:00, next sunrise 2026-01-16T07:12:00): 12 equal day hours (49 minutes) and 12 equal night hours (71 minutes) per planetary day, rulers in Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon) starting from the day ruler. Entries: Wednesday's hours 18 to 24 (`dayRuler` MERCURY; hour 18 starts 2026-01-14T22:55:00), then Thursday's hours 1 to 24 (`dayRuler` JUPITER): 31 in all. Top-level `dayRuler` JUPITER, `dayEnd` 2026-01-16T07:12:00. Times have no zone suffix (depends on T002)
- [X] T004 Add `planetaryHoursFor(data = planetaryHours)` (POST `${API_URL}/timing/planetary-hours`, 200) and `planetaryHoursUnavailable()` (same path, 422 with `{ error: "PlanetaryHoursUnavailable", message: "No sunrise or sunset at this location on this date", status: 422 }`) to `tests/mocks/handlers.ts` (depends on T003)
- [X] T005 Add `planetaryHoursFor()` to `common()` in `tests/mocks/scenarios.ts` and export `planetaryHours`, `planetaryHoursFor` and `planetaryHoursUnavailable` from `tests/mocks/index.ts`; run `npm test` and confirm everything still passes (depends on T004)
- [X] T006 [P] Move `fakeTheMinuteTimer` and `aMinutePasses` from `tests/integration/page-daily.test.tsx` to `tests/integration/charts.tsx` as exports and import them back in `page-daily.test.tsx`; `fakeTheMinuteTimer` takes an optional `now: Date = FIXED_NOW`. Run `npm test -- page-daily`
- [X] T007 Create `tests/integration/planetary-hours.test.tsx` with tests for the two pure functions against the `planetaryHours` fixture; they fail until T008. `currentPlanetaryHour(data, now)`: at 07:00 returns hour 24, ruler SATURN, dayRuler MERCURY, end 07:12, next ruler JUPITER; at 12:00 hour 6 MOON, dayRuler JUPITER; at 20:00 hour 15 JUPITER, next MARS; exactly at 07:12:00 returns hour 1 (an hour starting exactly at `now` is the current one); the last entry's `end` is `dayEnd` and its `next` is undefined; returns undefined before the first hour's start and at or after `dayEnd`. `planetaryHourBlocks(data, dayStart, dayEnd)` for 15 January local midnight to midnight: 25 blocks; first block's `top` is midnight while its `start` is 14 January 22:55; last block is Thursday's hour 18 with `bottom` at the next midnight and `end` at 00:06; each block's `top` equals the previous block's `bottom`; hours with no overlap are dropped (depends on T005)
- [X] T008 Create `src/utils/planetaryHours.ts` with `currentPlanetaryHour` (returns `{ hour, end: Date, next?: PlanetaryHour } | undefined`) and `planetaryHourBlocks` (returns `{ hour, start, end, top, bottom }[]` with times as epoch milliseconds), following the rules in data-model.md "Derived values"; parse times with `new Date(dateTime)`. Run `npm test -- planetary-hours` until T007's tests pass (depends on T002, T007)
- [X] T009 [P] Move `formatTime` from `src/components/chart-views/DailyAscendantTimeline.tsx` to `src/utils/funcs.ts` as an export (same body: `toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })`, taking epoch milliseconds) and import it in the timeline; run `npm test -- ascendant-timeline`

**Checkpoint**: The endpoint is mocked in every scenario and the calculations are tested; nothing visible has changed

---

## Phase 3: User Story 1 - See the current planetary day and hour at a glance (Priority: P1) 🎯 MVP

**Goal**: A Planetary Hour widget on Daily showing the day ruler, the hour ruler, the hour's number, period and span, the next hour, and sunrise and sunset

**Independent Test**: `npm test -- planetary-hours page-daily` passes; on the running app the widget on Daily names the correct day and hour rulers for now

### Tests for User Story 1

- [X] T010 [US1] Add widget tests to `tests/integration/planetary-hours.test.tsx`, rendering `renderChartPage("daily")` and scoping to `findWidget("Planetary Hour")`; they fail until T013. (a) at the frozen 07:00, before sunrise: group "Day ruler: Mercury", group "Hour ruler: Saturn" containing "Hour 24 · Night" and "6:01 AM – 7:12 AM", text "Next:" with "Jupiter at 7:12 AM", and "Sunrise 7:12 AM · Sunset 5:00 PM"; (b) at 12:00: day ruler Jupiter, hour ruler Moon, "Hour 6 · Day", "11:17 AM – 12:06 PM", next Saturn at 12:06 PM; (c) at 20:00: day ruler Jupiter, hour ruler Jupiter, "Hour 15 · Night"; (d) with `fakeTheMinuteTimer(new Date("2026-01-15T12:11:30Z"))` (07:11:30 local), after `vi.setSystemTime` to 07:12:30 and `aMinutePasses()` the hour ruler becomes Jupiter and the day ruler Jupiter with no new request; (e) with the fake interval starting at 23:59:30 local on 15 January, after moving the clock to 00:00:30 and a minute passing, a second request is sent with `{ date: "2026-01-16" }`; (f) `hold("post", "/timing/planetary-hours")` shows `status` "Loading" under the heading, then the content after `release()`; (g) `handlers: [planetaryHoursUnavailable()]` shows an `alert` with exactly "Planetary hours are not available for this location today."; (h) `reject("post", "/timing/planetary-hours")` shows an `alert` with exactly "Could not load planetary hours." and the "Moon Timings" widget still shows its content; (i) `capture` shows exactly one request with body `{ date: "2026-01-15" }`; (j) the widget contains no button; (k) a response whose hours all start after `now` shows "Could not load planetary hours." (depends on T008, T006)
- [X] T011 [US1] In `tests/integration/page-daily.test.tsx`, add "Planetary Hour" to `REGIONS` after "Zodiac Wheel" and rename the test to "shows its seven widgets and no settings"; it fails until T014 (depends on T006)

### Implementation for User Story 1

- [X] T012 [US1] Create `src/contexts/PlanetaryHoursContext.tsx` with `PlanetaryHoursProvider` and `usePlanetaryHours()` (throws when used outside the provider, like the other contexts). State: `status: "loading" | "ready" | "unavailable" | "error"`, `data: PlanetaryHoursType | null` (set only when `ready`), `now: Date` updated by a `window.setInterval` every `60 * 1000` ms (cleared on unmount). An effect keyed on `user` (from `useAuth`) and the local date derived from `now` with `getLocalISODate()` posts `{ date }` to `/timing/planetary-hours` with `apiFetch`; sends nothing while there is no user; sets `unavailable` when the caught error's `message` is `"PlanetaryHoursUnavailable"`, otherwise `error` (with `console.error`); ignores a late answer with a `cancelled` flag, as `src/hooks/timings/useDailyTimings.tsx` does (depends on T002)
- [X] T013 [US1] Create `src/components/chart-views/PlanetaryHourWidget.tsx`: a `section` with `aria-labelledby="planetary-hour-heading"`, classes as `MoonTimings` (`border-t border-gray-200 py-5`), and an `h2` "Planetary Hour" (`text-lg font-semibold text-gray-900`). `loading`: `Spinner`. `unavailable`: `LoadError` "Planetary hours are not available for this location today.". `error`, or `ready` with no current hour: `LoadError` "Could not load planetary hours.". Otherwise a `grid grid-cols-2 gap-2` of two tiles: `role="group"` `aria-label="Day ruler: <name>"` with label "Day", the symbol and the name, taking the ruler from the current hour's `dayRuler`; and `role="group"` `aria-label="Hour ruler: <name>"` with label "Hour", symbol, name, "Hour <n> · Day|Night" and "<start> – <end>", with the emphasised border `border-gray-800 bg-gray-100` (the day tile uses `border-gray-200 bg-white`). Symbols are `aria-hidden`, dark grey, on a rounded tint of the planet's colour (`${PlanetsData[ruler].color}24`). Below, a `flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-gray-600` line: "Next: <symbol> <name> at <time>" (omitted when there is no next hour) and "Sunrise <time> · Sunset <time>". Times use `formatTime` from `src/utils/funcs.ts`. No buttons (depends on T008, T009, T012)
- [X] T014 [US1] In `src/pages/Daily.tsx`, wrap the page content in `PlanetaryHoursProvider` (inside `DescProvider`) and render `<PlanetaryHourWidget />` first in the side-widget stack, above `<DailyAscendantTimeline />`. Run `npm test` until T010, T011 and all existing tests pass (depends on T013)

**Checkpoint**: The widget works on Daily, with all its states tested; the timeline is unchanged

---

## Phase 4: User Story 2 - See planetary hours alongside the rising sign in the day timeline (Priority: P2)

**Goal**: A planetary hour column in "Ascendant Today", beside the rising-sign column, on Daily and Transits

**Independent Test**: `npm test -- ascendant-timeline` passes, including the tests that existed before, unchanged

### Tests for User Story 2

- [X] T015 [US2] Add column tests to `tests/integration/ascendant-timeline.test.tsx` without changing the existing tests; they fail until T016. (a) on Daily the region has a `list` "Planetary hours" with 25 `listitem`s; (b) names include "Jupiter hour, 18 of 24, night, 10:55 PM to 12:06 AM" (first, cut off at midnight but labelled with its true span), "Saturn hour, 24 of 24, night, 6:01 AM to 7:12 AM", "Jupiter hour, 1 of 24, day, 7:12 AM to 8:01 AM", "Moon hour, 13 of 24, night, 5:00 PM to 6:11 PM" and "Venus hour, 18 of 24, night, 10:55 PM to 12:06 AM" (last); each item's `title` equals its name; (c) exactly one item has `aria-current="time"`, the Saturn hour 24, matching the widget's "Hour ruler: Saturn"; at 12:00 it is "Moon hour, 6 of 24, day, 11:17 AM to 12:06 PM"; (d) the texts "Sunrise" and "Sunset" are in the list; (e) with `planetaryHoursUnavailable()` and, separately, with `reject("post", "/timing/planetary-hours")`, there is no list "Planetary hours" and no `alert` in the "Ascendant Today" region, while the 13 sign blocks, the two conjunction markers and "NOW" are all still there; (f) with `hold` on planetary hours the timeline shows its sign blocks and "NOW" without the list, and the list appears after `release()`; (g) on `renderChartPage("transits")` the list is present with 25 items and exactly one `/timing/planetary-hours` request is sent with `{ date: "2026-01-15" }` (depends on T014)

### Implementation for User Story 2

- [X] T016 [US2] In `src/components/chart-views/DailyAscendantTimeline.tsx`: read `{ status, data, now }` from `usePlanetaryHours()` and use that `now` in place of `new Date()`; when `status === "ready"`, compute `planetaryHourBlocks(data, dayStart, dayEnd)` and render a fourth grid column between the sign column and the markers, with the grid classes `grid-cols-[3rem_4.5rem_2.25rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_6.5rem_3rem_minmax(0,1fr)]` (otherwise keep today's three-column classes; write both class strings out in full so Tailwind sees them). The column is `role="list"` `aria-label="Planetary hours"`, `relative border-r border-gray-200`; each block is `role="listitem"`, absolutely positioned with `top`/`height` percentages from the block's `top`/`bottom` exactly as the sign blocks are, with `aria-label` and `title` "<Planet> hour, <n> of 24, day|night, <start> to <end>" from the block's true `start`/`end`, `aria-current="time"` on the block where `top <= now < bottom`, the planet symbol centred (`aria-hidden`, `text-base text-gray-800`), `bg-amber-50` for DAY and `bg-slate-200/70` for NIGHT, and `border-b border-white/80 overflow-hidden`. Hour 1 and hour 13 blocks carry a caption at their top edge, "Sunrise" and "Sunset" (`text-[8px] font-semibold uppercase leading-none text-gray-500`). In `src/pages/Transits.tsx`, wrap the page content in `PlanetaryHoursProvider` (inside its `DescProvider`). Run `npm test` until T015 and every existing test pass (depends on T015)

**Checkpoint**: Both stories work; the widget and the timeline read one clock and one response

---

## Phase 5: User Story 3 - Planetary hours are protected by automated tests (Priority: P3)

**Goal**: The Daily browser journey covers the new widget and column; the tests are shown to catch a regression; the layout review can see the new states

**Independent Test**: `npm run test:e2e` passes at phone and desktop with the same number of tests as before; quickstart step 2 makes a test fail

- [X] T017 [US3] In `tests/e2e/daily.spec.ts`, add "Planetary Hour" to the list of widget names after "Zodiac Wheel", and add one step before the Ascendant timeline step: the widget's group "Hour ruler: Saturn" is visible and contains "Hour 24 · Night"; then, in the existing Ascendant step after the NOW check, the listitem "Saturn hour, 24 of 24, night, 6:01 AM to 7:12 AM" in `ascendant.getByRole("list", { name: "Planetary hours" })` is in the viewport. Run `npm run test:e2e` and confirm every journey passes at both sizes; do not add a test or touch `tests/e2e/transits.spec.ts` (depends on T016)
- [X] T018 [US3] Carry out quickstart step 2: temporarily make `PlanetaryHourWidget` take the day ruler from `data.dayRuler`, run `npm test -- planetary-hours`, confirm the before-sunrise test fails and names the behaviour, then revert (depends on T014)
- [X] T019 [US3] In `tests/review/charts.capture.ts`, add a Daily state captured with planetary hours unavailable (override the response with the 422 body from the API contract, following how the file overrides other responses and names its states); confirm the normal Daily and Transits captures now include the widget and the column (depends on T016)

**Checkpoint**: All three stories are complete

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T020 Layout review (standing acceptance criterion, SC-007): run `npm run review:layout`; a Claude review subagent reads the Daily and Transits images at 320, 390, 768, 1280 and 1920 wide, including the unavailable state, and reports sideways scrolling, clipped or overlapping content in the widget or the four-column timeline, conjunction markers narrower than 44px or with clipped time labels, and unreadable symbols or captions. Fix each finding in `src/components/chart-views/PlanetaryHourWidget.tsx` or `DailyAscendantTimeline.tsx` (fallback for a squeezed marker column at 320: narrow the sign column on phones), capture again, and repeat until a round finds nothing. Record the rounds under step 4 of `specs/004-planetary-hours/quickstart.md` (depends on T019)
- [X] T021 [P] Update `tests/README.md`: mention planetary hours in the `mocks/timings.ts` line, the handler pair, that `fakeTheMinuteTimer()` now lives in `integration/charts.tsx`, and the measured timings and test count
- [X] T022 Run `npm run lint`, `npm run build`, `npm test` and `npm run test:e2e`; confirm all pass, that `npm test` is no more than a few seconds slower than in T001 (SC-006), and that the number of browser tests is unchanged (depends on T020, T021)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none
- **Foundational (Phase 2)**: after Setup; blocks all stories
- **US1 (Phase 3)**: after Foundational
- **US2 (Phase 4)**: after US1, because it reuses the provider created in T012 and its tests compare the timeline with the widget
- **US3 (Phase 5)**: after US2 (T018 needs only US1)
- **Polish (Phase 6)**: after US3

### Within Each User Story

- Tests are written first and fail before the implementation task that makes them pass
- Types before functions, provider before widget, widget before page

### Parallel Opportunities

- T002, T006 and T009 touch different files and can run together
- T010 and T011 are different files
- T021 can run alongside T020

## Parallel Example: Foundational

```text
Task: "Create src/types/planetaryHours.ts"                                   (T002)
Task: "Move fakeTheMinuteTimer and aMinutePasses to tests/integration/charts.tsx"  (T006)
Task: "Move formatTime to src/utils/funcs.ts"                                 (T009)
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 and Phase 2
2. Phase 3: the widget on Daily
3. Stop and validate: `npm test`, then look at Daily in the running app

### Incremental Delivery

1. Foundational: mock and calculations, nothing visible
2. US1: the widget (MVP)
3. US2: the timeline column on Daily and Transits
4. US3 and Polish: browser step, capture, layout review, docs

## Notes

- The work is small enough for one person in sequence; the [P] markers are for convenience, not a team plan
- Block names must not contain " from ": the existing timeline tests count sign blocks by that word
- Blocks are list items, not buttons: the existing timeline tests assert the region's buttons are exactly the two conjunction markers
