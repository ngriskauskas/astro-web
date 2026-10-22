# Research: Planetary Hours on Daily

Decisions taken before design. Each was checked against the current code (`src/pages/Daily.tsx`, `src/pages/Transits.tsx`, `src/components/chart-views/DailyAscendantTimeline.tsx`, `src/components/chart-views/MoonTimings.tsx`, `src/hooks/timings/*`, `src/utils/api.ts`, `tests/`).

## 1. One request shared by the widget and the timeline

**Decision**: A `PlanetaryHoursProvider` (`src/contexts/PlanetaryHoursContext.tsx`) fetches once and is read by both the widget and the timeline through `usePlanetaryHours()`. It wraps the content of `Daily` and `Transits`, the two pages that render the timeline.

**Rationale**: The widget and the timeline column need the same data. A plain hook called from both (the `useDailyTimings` pattern) would send the request twice and give each its own clock, so the two could disagree at an hour boundary (FR-019).

**Alternatives considered**: A hook with a module-level cache (hidden shared state, awkward to reset between tests). Fetching in the page and passing props (the timeline is rendered by two pages with no props today). Putting the data in the wheel context (planetary hours do not depend on the chart).

## 2. One clock for "now"

**Decision**: The provider holds `now` in state and updates it every 60 seconds with its own interval. The widget takes the current hour from it, and the timeline uses it for the NOW line in place of its own `new Date()`.

**Rationale**: FR-007 needs the widget to move on within a minute; FR-019 needs the widget and the NOW line to agree, which they do by construction when both read one value. Today the timeline only re-renders when the wheel context changes: every minute on Daily, never on Transits. Reading the provider's clock also keeps the NOW line moving on Transits.

**Alternatives considered**: Relying on the Daily wheel's one-minute refresh to re-render (does not exist on Transits; stops if the chart request fails). A timeout aimed at the next hour boundary (more precise, but more code and harder to test than the fake interval the Daily tests already use).

## 3. Refetch when the date changes

**Decision**: The provider derives the local date from `now` (`getLocalISODate`) and refetches when it changes or when the user changes.

**Rationale**: Edge case "the date changes while the page is open". The date string only changes at local midnight, so this costs one request a day.

**Note**: The timeline's rising-sign data (`useDailyTimings`) does not refetch at midnight today. That is existing behaviour and is not changed here; after midnight the hour column is correct and the sign column is stale until the page is reloaded. Raised as a risk in the plan.

## 4. Telling "not available" from "could not load"

**Decision**: The provider's `status` is one of `loading`, `ready`, `unavailable`, `error`. `unavailable` is set when the thrown error's message is `PlanetaryHoursUnavailable`; any other failure is `error`. `apiFetch` is not changed.

**Rationale**: `apiFetch` throws `Error(data.error)` for a `{ error, message, status }` body, so the 422's error code already arrives as the message. FR-009 and FR-010 need two different texts.

**Alternatives considered**: Making `apiFetch` throw a typed error carrying the HTTP status (cleaner, but touches every caller's error path for one consumer).

## 5. Working out the current hour and the timeline blocks

**Decision**: Two pure functions in `src/utils/planetaryHours.ts`:

- `currentPlanetaryHour(data, now)` returns the last hour whose start is at or before `now`, with its end (the next hour's start, or `dayEnd` for the last) and the next hour; it returns nothing when `now` is before the first hour or at or after `dayEnd`.
- `planetaryHourBlocks(data, dayStart, dayEnd)` returns every hour clipped to the displayed day, dropping those with no overlap.

The widget shows the `error` message when `currentPlanetaryHour` returns nothing.

**Rationale**: Both are the parts most likely to be wrong (before sunrise, the last hour, clipping) and are trivially testable without rendering. The day ruler comes from the current hour's own `dayRuler` field, which is what makes the before-sunrise case right (FR-003). The response's hours are chronological and contiguous, so "end = next start" needs no arithmetic on sunrise and sunset.

**Alternatives considered**: Computing the hours in the frontend from sunrise and sunset (duplicates the backend and needs the previous day's sunset).

## 6. Widget content and look

**Decision**: A `section` with the heading "Planetary Hour", in the style of `MoonTimings` (top border, `text-lg` heading). Content:

- two tiles side by side, at every width: **Day** (planet symbol, planet name) and **Hour** (planet symbol, planet name, "Hour 24 · Night", "6:01 AM – 7:12 AM"). The hour tile has the emphasised border used for the current moon phase. Each symbol sits on a tint of the planet's own colour (`${color}24`, as the sign blocks do) with the symbol itself in dark grey, because several planet colours (the Sun's yellow) are unreadable as text on white.
- one line below: "Next: ♃ Jupiter at 7:12 AM" on the left, "Sunrise 7:12 AM · Sunset 5:00 PM" on the right, wrapping to two lines on narrow screens.

No progress bar, no list of the day's hours (the timeline is the list), nothing opens the drawer.

**Rationale**: "Simple, good looking", FR-011 (compact, matches the neighbours), SC-001 (readable in 5 seconds). Two tiles at 320 wide are about 140px each, enough for a symbol and the longest name ("Mercury").

**Alternatives considered**: A single line of text (too easy to miss, and the day/hour distinction gets lost). A row of all 24 hours (repeats the timeline).

## 7. Where the widget goes

**Decision**: First in the Daily page's side-widget stack, above the timeline. Not added to Transits.

**Rationale**: Spec assumption. It is the shortest widget and the one read at a glance.

## 8. The timeline column

**Decision**: A fourth grid column between the sign column and the conjunction markers: `grid-cols-[3rem_4.5rem_2.25rem_minmax(0,1fr)]`, `sm:grid-cols-[3.5rem_6.5rem_3rem_minmax(0,1fr)]`. It is rendered only when the provider's status is `ready`; otherwise the grid keeps today's three columns.

Each block is positioned with the same `top`/`height` percentages as the sign blocks and shows the planet symbol centred. Day hours have a light warm background and night hours a slate one. The first day hour and the first night hour carry a small "Sunrise" / "Sunset" caption at their top edge, so the change is marked by text as well as colour (FR-016).

**Rationale**: At 320 wide the timeline has about 296px (280 on Transits): 48 + 72 + 36 leaves 124 to 140 for the markers, which need 12 (offset) + 8 (tick) + 44 (button) + 8 + about 50 (time) = 122. The track is 2160px for 24 hours, so even a 20-minute hour is 30px high, enough for an 18px symbol.

**Alternatives considered**: Colouring blocks by planet (seven colours next to twelve sign colours is noisy, and day/night is the more useful distinction). Sunrise and sunset labels in the time column (they collide with sign-change times). Reserving the column while loading (the timeline would then not look "as before" when hours are unavailable, FR-017; the two requests start together, so the shift is brief).

## 9. Names for assistive technology and tests

**Decision**:

- Widget: `region` named "Planetary Hour". The two tiles are groups labelled "Day ruler: Mercury" and "Hour ruler: Saturn". Loading uses the shared `Spinner` (`status`, "Loading"); failures use the shared `LoadError` (`alert`).
- Timeline column: a `list` labelled "Planetary hours", each block a `listitem` with `aria-label` and `title` of the form `Saturn hour, 24 of 24, night, 6:01 AM to 7:12 AM`. The block containing `now` has `aria-current="time"`.

Blocks are not buttons and not in the tab order.

**Rationale**: The repo's tests find things by role and name, never by test id. Block titles avoid the word "from": the existing timeline tests count sign blocks with `getAllByTitle(/ from /)`, and their button list must stay exactly the two conjunction markers.

**Deviation from the spec**: Story 2, scenario 6 says "hovers over it or focuses it". Blocks do nothing when activated, so they are not made keyboard-focusable; the details reach keyboard and screen-reader users through the list item names instead.

## 10. Time format and time zone

**Decision**: Reuse the timeline's `formatTime` (`toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })`), moved to `src/utils/funcs.ts` so the widget shares it. Response times are parsed with `new Date(dateTime)`, which reads them as device-local time, as every other timing in the app is.

**Rationale**: FR-020; spec assumption on time zones.

## 11. Test layout

**Decision**:

| File | Covers |
|------|--------|
| `tests/integration/planetary-hours.test.tsx` (new) | The pure functions, and the widget on Daily: content at the frozen time (before sunrise), a daytime moment, a night moment, the change at an hour boundary and at midnight (fake interval), loading, unavailable, could not load, request body, one request per page load |
| `tests/integration/ascendant-timeline.test.tsx` (changed) | The column: every block's name, clipping at both ends, the current block, absent when unavailable or failed with the rest unchanged, present on Transits |
| `tests/integration/page-daily.test.tsx` (changed) | Seven regions instead of six |
| `tests/e2e/daily.spec.ts` (changed) | One step: the widget is visible with the current hour; the timeline's current hour block is in view |
| `tests/review/charts.capture.ts` (changed) | Adds a Daily state with planetary hours unavailable |

Other moments are reached with `vi.setSystemTime` before rendering; the hour-boundary test reuses the fake-interval approach of `fakeTheMinuteTimer()` in `page-daily.test.tsx`, moved to `charts.tsx` so both files share it.

**Rationale**: The repo's rules: timing widgets are tested once, on Daily; one browser journey per page; failure states only in integration tests. The handler must be in `common()` before anything else, because an unmocked request fails every Daily and Transits test.

## 12. Fixture

**Decision**: `planetaryHours` in `tests/mocks/timings.ts`, built by a small helper from four times so the hours stay consistent: previous sunset 14 January 17:00, sunrise 15 January 07:12, sunset 17:00, next sunrise 16 January 07:12. Day hours are 49 minutes, night hours 71 minutes. The list is hours 18 to 24 of Wednesday (Mercury's day; hour 18 starts 22:55 and is in progress at midnight), then hours 1 to 24 of Thursday (Jupiter's day). Rulers follow the Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon).

At the frozen time, 07:00, the current hour is Wednesday's hour 24: ruler Saturn, day ruler Mercury, 6:01 AM to 7:12 AM, next Jupiter. The default fixture therefore exercises the before-sunrise case.

Also `planetaryHoursUnavailable()`, a handler answering 422 `{ error: "PlanetaryHoursUnavailable", message, status: 422 }`.

**Rationale**: A generated fixture cannot drift out of step with itself, and round hour lengths make expected times easy to state in tests.
