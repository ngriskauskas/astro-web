# Research: Main Chart Page Tests and Responsive Layout

Decisions taken before design. Each was checked against the current code (`src/pages/*`, `src/components/chart-views/*`, `src/components/wheel/*`, `src/components/descriptions/*`, `src/contexts/*`, `src/hooks/*`, `tests/`).

## 1. How the integration tests are organised

**Decision**: Three groups of files under `tests/integration/`, matching User Stories 1 to 3.

| Group | Files | Renders |
|-------|-------|---------|
| Drawer | `drawer.test.tsx`, `drawer-two-charts.test.tsx`, `drawer-timings.test.tsx` | A real page (Charts, Synastry, Daily), then drives the drawer |
| Widgets | `wheel.test.tsx`, `wheel-two-charts.test.tsx`, `chart-settings.test.tsx`, `aspect-matrix.test.tsx`, `placements.test.tsx`, `ascendant-timeline.test.tsx`, `moon-timings.test.tsx`, `weekly-timings.test.tsx` | The page that hosts the widget, queries scoped to the widget's region |
| Pages | `page-charts.test.tsx`, `page-moment.test.tsx`, `page-daily.test.tsx`, `page-transits.test.tsx`, `page-synastry.test.tsx`, `chart-guards.test.tsx` | The page inside the real route guards |

Each shared widget is tested on one host page per form: one-chart widgets on Charts, two-chart widgets on Synastry, timing widgets on Daily (and one test each on Transits for what differs: the profile is sent). Page files assert only headings present, the request made, and page-specific behaviour.

**Rationale**: FR-002 forbids repeating shared widget tests page by page. Rendering the real page instead of the bare widget keeps the real providers and catches wiring (the pattern chosen in `002`, research item 1). One file per widget lets `npm test -- aspect-matrix` run one area.

**Alternatives considered**: Rendering each widget alone inside hand-built providers (misses page wiring, and every widget needs a wheel provider anyway). One file per page containing everything (five near-copies of the wheel and matrix tests).

## 2. Render helper for chart pages

**Decision**: Add `tests/integration/charts.tsx` with `renderChartPage(page, options)`. It calls `renderWithApp` with a small route table that mirrors `src/main.tsx`: the page route wrapped in `ProtectedCharts` (and `ProtectedUserLocation` for Moment, Daily, Transits), plus a stub `/profile` route that renders the text "profile screen" so redirects can be asserted. `renderWithApp` gains `ChartProvider`, in the same position as in `main.tsx`.

The helper waits until the chart has been drawn (the wheel region contains a planet), and exposes `widget(name)` to scope queries to one region, the same idea as `section()` in `tests/integration/profile.tsx`. `capture()` and `reject()` move from `profile.tsx` to a shared `tests/integration/requests.tsx` so both helpers use them; `profile.tsx` re-exports them so existing tests are untouched.

**Rationale**: The redirect scenarios (Story 3, scenarios 1, 8, 11, 15) need the guards and a destination. `ChartProvider` is required by both wheel providers.

**Alternatives considered**: Rendering `<App />` with the full router (pulls in the navbar and the new-account modal on every test; slower and noisier).

## 3. Mock data for charts and timings

**Decision**: Add `tests/mocks/charts.ts` and `tests/mocks/timings.ts`, built from small pure helpers so fixtures stay readable:

```ts
planet("SUN", 294.6, 5)                 // longitude in degrees, house; sign and degInSign derived
planet("MERCURY", 281.2, 4, { retrograde: true })
houses(12.4)                            // 12 equal cusps from an Ascendant longitude
aspect("TRINE", "SUN", "MOON", 1.8)
```

| Fixture | Content |
|---------|---------|
| `natalChart` | 14 planets (Mercury retrograde, Chiron and Lilith present), 12 houses, 4 key angles, 8 aspects including one to Chiron, one to Lilith and one to the Ascendant; Venus and Mars within 3 degrees of each other |
| `otherNatalChart` | A second, visibly different chart for profile id 2 |
| `momentChart` | Chart for the fixed "now" |
| `transitChart`, `synastryChart` | `MultiChart` built from two of the above plus 6 cross aspects with `point1Owner` set |
| `emptyAspectsChart` | `natalChart` with no aspects |
| `dailyTimings` | Ascendant sign changes through the fixed day, two Ascendant conjunctions |
| `weeklyTimings` | For the fixed week (Sun 11 Jan to Sat 17 Jan 2026): 2 aspects (one with two exact times), 1 sign change, 1 retrograde, 1 station; two events at the same minute |
| `emptyWeeklyTimings`, `emptyDailyTimings` | No events |
| `moonTimings` | Current phase plus an 8-phase loop, one phase with no usable time |

Derivation is arithmetic on literals, not on the clock or random values, so the rule in `tests/mocks/data.ts` ("nothing is derived from the current time") still holds. Fixtures are typed against `src/types/*`.

**Rationale**: A chart is about 30 objects; writing each `position`, `degInSign`, `degMin` and `sign` by hand invites inconsistent fixtures. The contents are chosen to hit the spec's cases: retrograde mark, optional objects, close planets, key-angle aspects, same-minute events.

**Alternatives considered**: Recording real backend responses (large, opaque, and they change with the backend). Fully hand-written literals (error-prone).

## 4. New mocked endpoints and scenarios

**Decision**: Ten handlers, all added to `common()` so every scenario has them:

| Method and path | Default response |
|-----------------|------------------|
| `POST /charts/natal` | `natalChart` for profile 1, `otherNatalChart` otherwise |
| `POST /charts/generic` | `momentChart` |
| `POST /charts/transit` | `transitChart` |
| `POST /charts/synastry` | `synastryChart` |
| `POST /timing/daily`, `POST /timing/daily-transit` | `dailyTimings` |
| `POST /timing/current`, `POST /timing/transit` | `weeklyTimings` (transit: aspects only) |
| `POST /timing/current-moon` | `moonTimings` |
| `POST /descriptions` | `{ description: "Description for <summary of the context>", cached: false, contextType }` |

The descriptions handler echoes a short summary of the request context (for example `"Description for placement SUN CAPRICORN house 5 NATAL"`), so a test can assert that the right text reached the right place and that the right context was sent, without a fixture per item.

One new scenario, `noLocation` (a main profile, user with an empty location), built by letting `getMe` take a user override. Existing scenarios cover the rest: `withProfile` is the "only their own profile" user (Synastry message), `withCustomProfiles` is the normal chart-page user, `newAccount` is the "no main profile" user.

**Rationale**: Any request with no mock fails the test (FR-006), so every endpoint the pages call must exist in every scenario. Echoing descriptions avoids dozens of fixtures.

**Alternatives considered**: A scenario per page (unnecessary; scenarios describe the user, not the page).

## 5. Selecting things on the wheel and elsewhere: accessible names

**Decision**: Give every selectable item a role and an accessible name, and make non-SVG ones real `<button>` elements. Tests and journeys locate items only by role and name.

- Wheel: the `<svg>` gets `role="group"` and a label ("Natal chart wheel"). Each planet, sign wedge, house wedge and key-angle label gets `role="button"`, `tabIndex={0}`, an `aria-label`, and Enter/Space handling. On two-chart wheels the label carries the owner ("Sun, My Profile" / "Sun, Mum" / "Sun, Transits").
- Chips (`PlanetChip`, `SignChip`, `HouseChip`, `KeyAngleChip`, `AspectChip`), the timing previews that are `<div onClick>` today (`IngressPreview`, `AspectPreview`, `RetrogradePreview`), `OverviewCard` when clickable, and the three `Section` headers become `<button type="button">`.
- Aspect matrix cells with an aspect contain a `<button>` named "Sun Trine Moon"; empty cells contain nothing.
- Drawer: `<aside aria-label="Description">`; `BackButton` and `CloseButton` get `aria-label="Back"` and `aria-label="Close"`.
- Each widget is a `<section aria-labelledby>` so `getByRole("region", { name: "Aspect Matrix" })` works, as on the profile screen.

Exact names are in [contracts/chart-pages-ui.md](./contracts/chart-pages-ui.md).

**Rationale**: Today most selectable items are `<div onClick>` or bare SVG shapes with no name. They cannot be found by role, cannot be reached by keyboard, and in a real browser can only be clicked by coordinates. Naming them is what makes the tests possible and stable; it is also the cheapest way to make FR-024 (nothing reachable only by hover) verifiable. The visible design does not change.

**Alternatives considered**: `data-testid` attributes (works for tests, does nothing for users, and the repo's existing tests use roles and labels throughout). Clicking SVG coordinates in browser tests (breaks whenever the fixture or wheel geometry changes).

## 6. Behaviour problems found in the current code

Each becomes a failing test first, then a fix (FR-009). Numbered for reference from tasks.

| # | Problem today | Expected | Where |
|---|---------------|----------|-------|
| B1 | A failed chart request is an unhandled rejection; the wheel shows "Loading..." for ever | "Could not load the chart" in the wheel, matrix and placements regions; rest of page works (FR-014) | `SingleWheelContext`, `MultiWheelContext`, wheels |
| B2 | Failed timing requests are swallowed into empty lists, so the widget says "no events" as if that were true | "Could not load" message in the widget (FR-014) | `useTimings`, `useDailyTimings`, timing widgets |
| B3 | Failed description requests become empty text with no explanation | "Could not load this description" in the drawer's Details section (FR-014) | `useGeneratedDescriptions`, panels |
| B4 | `MultiWheelProvider` reads `profiles[1].id`: Synastry throws for a user with one profile, and picks the wrong profile if the main profile is not first in the list | Synastry shows the "second profile" message; otherwise compares with the first non-main profile (FR-015) | `Synastry.tsx`, `MultiWheelContext` |
| B5 | Closing the drawer keeps its history; back after reopening returns to an old item | Close clears the trail (FR-016) | `DescContext` |
| B6 | The drawer stays open on stale data when the user changes profile, date or time | Drawer closes (FR-016a) | `DescContext` |
| B7 | Friends link leads to a blank page | Link hidden (FR-016b) | `Navbar` |
| B8 | Two quick setting changes can leave the earlier chart on screen if its response arrives last | Last choice wins (FR-017) | Both wheel contexts, timing hooks |
| B9 | The aspect matrix shows Chiron and Lilith, and their aspects, even when the user has turned them off (`getFilteredAspects` filters nothing) | Hidden in the matrix (Story 2, scenario 15) | `singleWheelData`, `multiWheelData`, both matrices |
| B10 | The drawer is 400px wide at every size | Full screen below 768px, side panel no wider than the screen above (FR-020) | `DescriptionSidePanel` |
| B11 | Drawer details are memoised on the item name only (`useChartData`), so after the minute refresh on Daily an open drawer shows the old position | Details follow the chart on screen | `useChartData` |
| B12 | Daily's wheel sits in a fixed 650px-high box, leaving a large gap under the wheel on a phone | Box follows the wheel (Story 5, scenario 3) | `Daily.tsx` |
| B13 | Clearing the date or time on Transits sends a request with an empty value; Moment already skips it | No request until both are filled (edge case) | `MultiWheelContext` |
| B14 | Weekly event previews are clickable boxes that contain clickable chips, so one click on the chip opens the plain aspect (or planet) and then the timing event on top of it, leaving two items on the trail | One click on a weekly event opens that timing event only; chips inside a preview are display-only | `AspectPreview`, `IngressPreview`, `RetrogradePreview`, chips |
| B15 | On two-chart pages, opening a key angle looked its sign up through a calculation that finds nothing when the angle sits at the start of the wheel, so opening the Ascendant failed | The angle's own sign is used | `multiWheelData.ts` |
| B16 | The drawer did not pass on which chart a key angle belongs to, so the other chart's Ascendant showed the user's own sign | The owner is passed on | `DescriptionSidePanel.tsx` |
| B17 | `src/types/chart.ts` used `KeyType` without importing the app's own, so it silently meant an unrelated browser built-in type | Imported | `src/types/chart.ts` |

B15 to B17 were found while writing the tests, after this table was first drawn up.

Not treated as a bug: placements tables list Chiron and Lilith regardless of the setting. The spec only requires the wheel and matrix to follow it; placements are left as they are.

Turning an aspect type off is applied by the backend (the pages re-request the chart when aspect settings change). The frontend test for "aspect type turned off" therefore asserts the re-request, and that the matrix shows exactly the aspects returned.

## 7. Load states in the wheel contexts and hooks

**Decision**: Give each data source an explicit status instead of inferring from empty arrays.

- `SingleWheelContext` and `MultiWheelContext` expose `status: "loading" | "ready" | "error"`. Each fetch effect uses a cancelled flag in its cleanup, sets `"error"` in a `catch`, and ignores a response whose effect has been cleaned up (this is also the fix for B8).
- `useCurrentTimings`, `useDailyTimings` and `useMoonTimings` return `{ timings, loading, error }`.
- `useGeneratedDescriptions` returns `{ loading, descriptions, failed }` where `failed[i]` is true when request `i` threw.
- A shared `LoadError` component (`src/components/utils/LoadError.tsx`) renders the message with `role="alert"`.
- On Daily, a failed minute refresh keeps the last good chart on screen and does not switch to the error state; only a failed first load shows the message. The next successful refresh clears an error (FR-014).

**Rationale**: "Loading for ever" and "empty means failed" both come from having no error state. A status field is the smallest change that lets widgets tell the three states apart.

**Alternatives considered**: A toast per failure (rejected in clarification). An error boundary (does not catch async failures).

## 8. Drawer behaviour changes

**Decision**:

- `close()` clears the history as well as the active item (B5).
- `DescProvider` sits inside the wheel provider on every page, so it reads `useWheel().settings` and closes when `profileId`, `otherProfileId`, `datetimeOptions.date` or `datetimeOptions.time` changes after the first render (B6). The minute refresh on Daily changes none of these, so it leaves the drawer open, as the spec requires.
- Leaving the page already closes the drawer because each page has its own `DescProvider`; a test pins this down.
- No Escape key, no tap-outside, no device-back handling (clarified).

**Rationale**: Watching the settings object is simpler and more precise than having each control call `close()`, and it cannot be forgotten when a new setting is added.

**Alternatives considered**: Closing from `ZodiacWheelSettings` handlers (misses link-driven date changes on Moment and Transits).

## 9. Drawer layout

**Decision**: `fixed inset-0 w-full` below `md` (768px); `md:inset-y-0 md:right-0 md:left-auto md:w-100 md:max-w-full` from `md` up. The panel header (back, title, close) stays outside the scrolling area, as it is today. The scrolling area gets `overscroll-contain`. While the drawer is open below `md`, the page behind is locked with one CSS rule in `src/index.css`:

```css
@media (width < 48rem) { body:has(aside[aria-label="Description"]) { overflow: hidden; } }
```

Back and close buttons get a 44px hit area.

**Rationale**: Matches the clarified answer (full screen on phones, side panel from tablet). The `:has()` rule needs no JavaScript and no effect cleanup. Chromium, the only engine covered, supports it, as do current Safari and Firefox.

**Alternatives considered**: A bottom sheet or narrower side panel (rejected in clarification). Locking scroll from a React effect (more code, same result).

## 10. Aspect matrix that fits its space

**Decision**: Replace the fixed 48px columns with a table that is `w-full table-fixed`, square cells (`aspect-square`), no fixed widths, and glyph size tied to the widget's width through a container query (`@container` on the widget, font size in `cqw` with a pixel ceiling so it does not grow past today's size on wide screens). Remove the `ml-4` / `ml-11` offsets and the `overflow-x-auto` wrappers. On two-chart pages the rotated side label moves to a normal line above the table on narrow widths. Page padding drops from `p-6` to `p-3` below `sm`, and card padding from `p-4` to `p-2`, to give the matrix more room.

Sizes to expect, with all 14 planets plus Ascendant and Midheaven (17 columns including labels):

| Screen | Space for the matrix | Cell |
|--------|----------------------|------|
| 320 | about 280px | about 16px |
| 390 | about 350px | about 20px |
| 768 | about 700px | about 41px |
| 1280 and up | 48px ceiling | 48px |

With Lilith off (the default) there are 16 columns, so about 17px at 320.

**Rationale**: This is the clarified answer (shrink, do not scroll). The spec already makes matrix cells the one exception to comfortable tap size (FR-018a). A 16px cell is small: the symbols are single glyphs and stay recognisable at about 11px, but this is the item most likely to be challenged in the layout review. If the review judges 320 illegible, the fallback to raise with the user is hiding the two angle rows and columns below 360px, not reintroducing scrolling.

**Alternatives considered**: Sideways scroll with a sticky first column, and a list on phones (both offered and declined in clarification). CSS `transform: scale()` (blurry text, wrong hit areas).

## 11. Wheel sizing and tapping on phones

**Decision**: The wheels already scale through `viewBox` and `width="100%"`. Changes: remove Daily's fixed-height box (B12); reduce page and card padding on phones (shared with item 10) so the wheel is about 280px across at 320; add an invisible, larger hit circle behind each planet glyph (radius 20 in wheel units, up from 14), drawn in glyph-angle order so later planets do not cover earlier ones.

At 320 wide a planet's hit area is about 16px across. That is below a comfortable tap size and cannot be made larger without planets overlapping each other, so the acceptance check is the spec's wording: tapping a planet opens that planet, not a neighbour. The browser journeys tap planets at phone size, and the layout review covers the rest. Signs and houses are large wedges and are not a concern.

**Rationale**: The wheel is a dense diagram; the placements table, with full-size chip buttons for the same planets, is the comfortable route on a phone.

**Alternatives considered**: Pinch-zoom or a tap-to-magnify layer (a redesign, out of scope).

## 12. Layout of timing widgets and tables on phones

**Decision**: Keep the structure, fix what does not fit. Known items from reading the code: `PlacementsTable` has an `ml-4` offset and fixed-fifths columns that clip chips at 320; the two-chart placements table has `min-w-[440px]` and so scrolls inside its own area, which the spec allows (Story 5, scenario 7a) and gets an edge fade as the "more" sign; the weekly "By day" grid has a fixed 7rem first column; `ZodiacWheelSettings` selects need `w-full min-w-0` so long profile names truncate instead of widening the card. Inner scroll areas (`max-h-[460px]`, `max-h-[520px]`) keep `overscroll-contain` off the page-level direction so the page can still be scrolled past them (Story 5, scenario 9). Anything else is whatever the review finds (FR-025).

**Rationale**: The exact list of layout fixes cannot be known before looking at screenshots; this records what is already visible in the code.

## 13. Browser journeys

**Decision**: Five files, one test each, scenario `withCustomProfiles`: `tests/e2e/charts.spec.ts`, `moment.spec.ts`, `daily.spec.ts`, `transits.spec.ts`, `synastry.spec.ts`. Shared steps live in `tests/e2e/chart-page.ts`: `openFromNav(page, "Charts")` (menu on phone, bar on desktop, branching on what is visible), `drawer(page)`, `expectNoSidewaysScroll(page)`.

Each journey: open from the navigation; see each widget's heading; change one setting where the page has any and assert the request body through the `requests` fixture; from each main widget select one item and see the drawer show it, then close; once per journey select a related item inside the drawer, press back, and close. On phone, assert the drawer covers the viewport and that the page width equals the screen width at the end.

| Journey | Setting changed | Drawer opened from |
|---------|-----------------|--------------------|
| Charts | Profile to "Mum" | Wheel planet, matrix cell, placements chip |
| Moment | Date and time | Wheel sign, matrix cell, placements chip |
| Daily | none | Wheel planet, Ascendant conjunction, moon phase, weekly event in By day and in Timeline, matrix cell |
| Transits | Profile | Wheel planet of each ring, weekly event, matrix cell, placements chip |
| Synastry | Other profile | Wheel planet of each ring, matrix cell, placements chip |

**Rationale**: FR-010 and FR-011. One file per page lets Playwright run them in parallel workers. Today's two spec files take about 10 seconds for four runs; ten more runs of similar length across workers should keep the full run near 30 to 40 seconds, inside the 60-second budget (SC-003). The width check on phone is a behaviour assertion of the journey ("completes without scrolling the page sideways", Story 4 scenario 2), not a layout test at extra sizes.

**Alternatives considered**: One test per widget, and one journey for all pages (both declined in clarification).

## 14. Time in tests

**Decision**: Keep the frozen clock: 2026-01-15T12:00:00Z, which is Thursday 07:00 in `America/New_York`, in the week of Sunday 11 to Saturday 17 January. Fixtures in `timings.ts` are written for that day and week.

The minute refresh on Daily needs a fake interval. That one test calls `vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] })` and advances 60 seconds; every other test keeps real timers, as `tests/integration/setup.ts` sets up. The browser journeys do not test the refresh.

Near-midnight and week-boundary edge cases are integration tests that call `vi.setSystemTime` with another instant before rendering.

**Rationale**: The harness freezes `Date` only, so debounces and async utilities keep working; widening that globally would slow or break existing tests.

## 15. What jsdom cannot check

**Decision**: jsdom has no layout, so these are asserted in the browser journeys or the review, not in integration tests: the drawer covering the screen, the page not scrolling sideways, the timelines being scrolled to "now" (the integration test asserts only that the scroll position was set; the journey asserts the "NOW" marker is in view), tap accuracy on the wheel, and everything in User Story 5.

Pointer hover highlighting is tested in integration with `user.hover`, asserting a state attribute on the planet (`data-highlighted`) because CSS classes carry no meaning in jsdom.

## 16. Review capture for the chart pages

**Decision**: Add `tests/review/charts.capture.ts` next to `profile.capture.ts`, reusing `reviewSizes`. Per size and page it captures: full page; top of page; drawer open on a planet; drawer open on an aspect; drawer open on a timing event (Daily and Transits); Weekly Timings in Timeline view; a "could not load" state (Charts); the Synastry "second profile" message. It records page width against screen width in `widths.json` as the profile capture does. A second capture pass uses 20 profiles with long names for the settings selectors.

That is about 30 states per size, 150 images. The review subagent works through them per size, as in `002`.

**Rationale**: FR-027. The capture pattern exists and worked for the profile screen.

## 17. Code that is not touched

`src/pages/Time.tsx`, `src/components/ViewSelector.tsx`, `CurrentTimings.tsx`, `DailyTimings.tsx`, `src/components/timeline/*` and the commented-out files in `chart-views/timings/` are not reachable from the navigation and are out of scope. They share chips and previews with the live pages, so they must still compile after the changes in item 5; `npm run build` checks that. `src/pages/Friends.tsx` stays in the repo; only its link is removed.

## 18. Edge cases the spec left open

| Edge case | Outcome |
|-----------|---------|
| Profile with unknown birth time | The page requests and shows the chart the backend returns, like any other profile. One test with the "Sam" fixture confirms nothing breaks; no special display. |
| Link to Moment or Transits with an invalid date or time | The values are placed in the fields as the browser accepts them; an empty or invalid field means no request (B13 rule), and the previous chart, if any, stays. Test: an invalid date in the link results in no chart request with that value. |
| Same item opened twice in a row | The trail gets the item twice; back steps through both. Left as is; one test pins it. |
| Drawer open on a phone when the window widens past 768px | Pure CSS switch between the two layouts (item 9); checked in the review, not automated. |

## 19. Decisions taken during implementation

- **Lint baseline.** `npm run lint` already failed before this work (25 errors and 10 warnings, all in existing app code). The plan had assumed a clean baseline. The bar used instead: no file may have more lint problems than it had at the start. The work ends at 23 errors and 6 warnings.
- **Requests set up before rendering.** `renderWithApp` installs the scenario in front of whatever a test registered earlier, which would silently undo a `capture`, `reject` or `hold` made before rendering. The harness now remembers those and puts them back in front after installing the scenario, so they work either side of the render.
- **`capture` no longer answers.** It records the request and lets the scenario's handler answer, so it needs no knowledge of each endpoint's default response.
- **Chart requested twice on load.** The pages ask for the chart, then ask again when the saved settings arrive (the aspect settings are part of what the backend uses). That is existing behaviour and is left alone; with stale responses now ignored, the first answer is simply dropped. Tests assert on the last request, not on the count.
- **Daily and Transits on wide screens.** The wheel's card was stretched to the height of the much taller column beside it, leaving a large empty area under the wheel. The two pages now use two independent columns from 1280px (wheel and matrix on the left). On narrower screens the order is unchanged.
- **Two-chart matrix labels.** The label that was rotated down the left edge took 44px of width that the matrix needs on a phone. Both labels now sit on one line above the matrix at every size.
- **Timelines scroll to "now" once.** They used to re-scroll on every render (the scroll position was tied to the current time), which also undid the user's own scrolling each minute on Daily. They now scroll once, when they first appear.
- **Review capture files.** The profile and chart captures run in parallel, so each writes its own `<prefix>-widths.json` and removes only its own images.
