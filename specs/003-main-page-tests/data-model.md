# Data Model: Main Chart Page Tests and Responsive Layout

No stored data changes. This describes what the chart pages request and receive (which the tests assert on), the page state that changes with this work, and the fixtures to add. Decisions referenced here are in [research.md](./research.md).

## What each page requests

| Page | Wheel type | Chart request | Body | Other requests |
|------|-----------|---------------|------|----------------|
| Charts | `natal` | `POST /charts/natal` | `{ birthProfileId }` | none |
| Moment | `moment` | `POST /charts/generic` | `{ datetime: "YYYY-MM-DDTHH:mm[:ss]" }` | none |
| Daily | `time` | `POST /charts/generic` | `{ datetime }` (now), repeated every 60 seconds | `POST /timing/daily { date }`, `POST /timing/current-moon { date }`, `POST /timing/current { dateTime }` |
| Transits | `transit` | `POST /charts/transit` | `{ birthProfileId, datetime }` | `POST /timing/daily-transit { date, birthProfileId }`, `POST /timing/transit { dateTime, birthProfileId }` |
| Synastry | `synastry` | `POST /charts/synastry` | `{ mainBirthProfileId, otherBirthProfileId }` | none |

Every page also sends `POST /descriptions { context }` once per written description when the drawer shows an item (a planet sends up to four).

All chart and timing requests are repeated when the user's saved aspect settings change.

## Entities the pages work with

### Chart (`SingleChart`, `MultiChart`, `src/types/chart.ts`)

| Field | Notes |
|-------|-------|
| `planets` | Up to 14, keyed by name. Each: `position`, `sign`, `house`, `retrograde`, `stationary`, `speed` |
| `houses` | 12 cusps keyed 1 to 12. Each: `position`, `sign` |
| `keyAngles` | `ASC`, `MC`, `IC`, `DC`. Each: `position`, `sign` |
| `aspects` | `{ type, orb, motion, point1, point2, point1Owner? }`; a point is a planet or a key angle |

A `MultiChart` has `main` and `other` (each with planets, houses, key angles) and `aspects` between them. On Transits, `main` is the birth chart and `other` is the sky; on Synastry, `other` is the second profile.

### Page settings (`ZodiacWheelOptions`, not saved)

| Field | Charts | Moment | Daily | Transits | Synastry |
|-------|--------|--------|-------|----------|----------|
| `profileId` | main profile, changeable | not shown | not shown | main profile, changeable | main profile, changeable |
| `otherProfileId` | | | | | first non-main profile, changeable |
| `datetimeOptions` | | link values or now | | link values or now | |

Rules:

- `otherProfileId` is the first profile that is not the main one (was: the second item of the list; research B4). A user with no such profile gets the Synastry message and no provider is mounted.
- On Synastry each selector omits the profile chosen in the other.
- On Moment and Transits, a link `?date=YYYY-MM-DD&time=HH:mm` sets both; a date with no time uses `23:59:00`.
- No chart request is made while the date or the time is empty (research B13).

### Load status (new; research item 7)

| Source | States | Shown as |
|--------|--------|----------|
| Chart (wheel context) | `loading`, `ready`, `error` | Loading text; chart; "Could not load the chart" in wheel, matrix and placements |
| Weekly timings, daily timings | `loading`, `error`, data | Spinner; message; content |
| Moon timings | `loading`, `error`, data | Spinner; "Moon timings are unavailable right now."; content |
| Written description | `loading`, `failed[i]`, text | Spinner in Details; "Could not load this description"; text |

Transitions: `loading → ready` or `loading → error`. A new request (settings change, aspect settings change) returns to `loading`. A response for a request that has been superseded is ignored. On Daily, a failed refresh after a successful load stays `ready` with the last chart; a successful refresh after `error` moves to `ready`.

### Drawer (`DescContext`)

| State | Meaning |
|-------|---------|
| `active` | The item shown, or none (drawer closed). One of 12 kinds: planet, sign, house, angle, aspect, moon phase, Ascendant conjunction, key-angle timing, aspect timing, sign change, retrograde, station |
| `history` (the trail) | Items shown before the current one since the drawer was opened |

| Action | Effect |
|--------|--------|
| Open an item while closed | `active` = item, trail empty |
| Open an item while open | Current item pushed on the trail, `active` = item |
| Back with a trail | Last trail item becomes `active` |
| Back with an empty trail | Drawer closes |
| Close | Drawer closes and the trail is cleared (changed; research B5) |
| User changes profile, other profile, date or time | Drawer closes and the trail is cleared (new; research B6) |
| Chart refreshes on its own (Daily) | No effect on the drawer; its details follow the new chart (research B11) |
| Leave the page | Drawer gone (each page has its own) |

### Timing events

| Source | Kinds | Drawer kind |
|--------|-------|-------------|
| `POST /timing/daily`, `/timing/daily-transit` | Ascendant sign changes (`angleTimings`), Ascendant conjunctions (`aspects`, filtered to conjunctions with the Ascendant) | `dailyAspectTiming` |
| `POST /timing/current` | Aspects (start, each exact time, end), sign changes, retrogrades (start, end), stations | `aspectTiming`, `ingressTiming`, `retrogradeTiming`, `stationTiming` |
| `POST /timing/transit` | Aspects only | `aspectTiming` |
| `POST /timing/current-moon` | `currentPhase`, `phaseLoop` (8 phases) | `moonphase` |

Weekly Timings drops aspects that involve the Descendant or the Imum Coeli. The week runs Sunday to Saturday in local time; each day has a ruling planet (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn).

### What the user's saved settings change on these pages

| Setting | Effect |
|---------|--------|
| `objectOptions.showChiron`, `showLilith` | Off: absent from the wheel, its aspect lines, and the aspect matrix (matrix is new; research B9). Placements still list them. |
| `displayOptions.angleLabels`, `tickMarks` | Degree labels and tick marks on the wheel |
| `aspectOptions` | Chart and timings are requested again; the backend decides which aspects come back |
| `houseSystem` | Used when the drawer lists the signs in a house |

## Navigation

Seven destinations after this work: Charts, Moment, Daily, Transits, Synastry, Profile, Logout. Friends is removed from the bar and the phone menu (FR-016b).

## Test fixtures to add

In `tests/mocks/charts.ts` and `tests/mocks/timings.ts`; contents in [research.md](./research.md) item 3.

| Fixture | Type | Used for |
|---------|------|----------|
| `natalChart`, `otherNatalChart` | `SingleChart` | Charts; profile switching |
| `momentChart` | `SingleChart` | Moment, Daily |
| `transitChart`, `synastryChart` | `MultiChart` | Two-chart pages |
| `emptyAspectsChart` | `SingleChart` | Edge case: no aspects |
| `dailyTimings`, `emptyDailyTimings` | `DailyTimingsType` | Ascendant timeline |
| `weeklyTimings`, `emptyWeeklyTimings` | `CurrentTimingsType` | Weekly Timings |
| `moonTimings` | `MoonTimingsType` | Moon Timings |
| `userWithoutLocation` | `User` | Location redirect |
| `manyBirthProfiles` | `BirthProfile[]` (20) | Long selector lists; review capture |

Scenarios:

| Scenario | User | Used for |
|----------|------|----------|
| `newAccount` (exists) | No birth profile | Redirect to profile |
| `withProfile` (exists) | Main profile only | Synastry message; pages with one profile |
| `withCustomProfiles` (exists) | Main plus three others | Default for chart pages and all five journeys |
| `noLocation` (new) | Main profile, no location | Redirect from Moment, Daily, Transits |

## Screen sizes

Unchanged: journeys at `phone` 390 x 844 and `desktop` 1280 x 800 (`tests/e2e/devices.ts`); review at 320, 390, 768, 1280, 1920 wide (`tests/review/sizes.ts`).

| Width | Page layout | Drawer |
|-------|-------------|--------|
| below 768 | One column, wheel first | Full screen |
| 768 to 1279 | One column | Right-hand panel, 400px |
| 1280 and up | Wheel and side widgets side by side (7 and 5 of 12 columns), max 1800px, centred | Right-hand panel, 400px |
