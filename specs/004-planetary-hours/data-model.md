# Data Model: Planetary Hours on Daily

Nothing is stored. This describes the data the feature reads, the values it derives, and the states it can be in. The wire format is in [contracts/planetary-hours-api.md](./contracts/planetary-hours-api.md).

## Types (`src/types/planetaryHours.ts`)

### ClassicalPlanet

`"SUN" | "MOON" | "MARS" | "MERCURY" | "JUPITER" | "VENUS" | "SATURN"`: a subset of the existing `PlanetName`, so `PlanetsData[ruler]` gives the symbol, name and colour.

### PlanetaryHour (as received)

| Field | Type | Notes |
|-------|------|-------|
| `hour` | number | 1 to 24 within its own planetary day |
| `ruler` | ClassicalPlanet | Ruler of this hour |
| `dayRuler` | ClassicalPlanet | Ruler of the planetary day this hour belongs to |
| `period` | `"DAY"` \| `"NIGHT"` | 1 to 12 are DAY, 13 to 24 are NIGHT |
| `dateTime` | string | Start, local time without offset |

### PlanetaryHoursType (as received)

| Field | Type | Notes |
|-------|------|-------|
| `date` | string | The requested date |
| `dayRuler` | ClassicalPlanet | Ruler of the planetary day starting at this date's sunrise. Not used for display: the current hour's own `dayRuler` is (FR-003) |
| `sunrise`, `sunset` | string | Shown in the widget |
| `dayEnd` | string | Next sunrise; the end of the last hour |
| `hours` | PlanetaryHour[] | Chronological and contiguous. First the previous planetary day's night hours from the one in progress at local midnight, then all 24 of this date's planetary day |

## Derived values (`src/utils/planetaryHours.ts`)

### CurrentPlanetaryHour

Result of `currentPlanetaryHour(data, now)`.

| Field | From |
|-------|------|
| `hour` | The last entry of `hours` with start ≤ `now` |
| `end` | The next entry's start, or `dayEnd` for the last entry |
| `next` | The next entry, if any |

Rules:

- Nothing is returned when `now` is before the first hour's start, or at or after `dayEnd`.
- An hour starting exactly at `now` is the current one.

### PlanetaryHourBlock

Result of `planetaryHourBlocks(data, dayStart, dayEnd)`; one per hour overlapping the displayed day.

| Field | From |
|-------|------|
| `hour` | The entry |
| `start`, `end` | The hour's true start and end (for its label) |
| `top`, `bottom` | `start` and `end` limited to the displayed day (for its position) |

Rules:

- Hours with no overlap with the displayed day are dropped.
- Blocks cover the displayed day with no gap and no overlap (FR-014): the first block's `top` is local midnight and the last block's `bottom` is the next local midnight.

## Provider state (`src/contexts/PlanetaryHoursContext.tsx`)

| Field | Type | Notes |
|-------|------|-------|
| `status` | `"loading"` \| `"ready"` \| `"unavailable"` \| `"error"` | |
| `data` | PlanetaryHoursType \| null | Set only when `ready` |
| `now` | Date | Updated every 60 seconds |

Transitions:

```text
            request sent
(mount) ──────────────────▶ loading
loading ── 200 ───────────▶ ready
loading ── 422 PlanetaryHoursUnavailable ─▶ unavailable
loading ── any other failure ─▶ error
any ── local date changes, or user changes ─▶ loading (new request; a late answer to the old one is ignored)
```

No request is sent while there is no signed-in user.

## What each consumer shows

| Status | Widget | Timeline |
|--------|--------|----------|
| `loading` | Heading and loading indication | As today, three columns |
| `ready`, current hour found | Day tile, hour tile, next hour, sunrise and sunset | Four columns, one block per hour |
| `ready`, no current hour | "Could not load planetary hours." | Four columns (blocks are still valid) |
| `unavailable` | "Planetary hours are not available for this location today." | As today, three columns |
| `error` | "Could not load planetary hours." | As today, three columns |

## Test fixture (`tests/mocks/timings.ts`)

`planetaryHours`, for the frozen day (15 January 2026, New York), built from four times:

| | Time |
|---|---|
| Previous sunset | 14 January 17:00 |
| Sunrise | 15 January 07:12 |
| Sunset | 15 January 17:00 |
| Next sunrise (`dayEnd`) | 16 January 07:12 |

Day hours last 49 minutes, night hours 71. Entries: Wednesday's hours 18 to 24 (day ruler Mercury), then Thursday's 1 to 24 (day ruler Jupiter): 31 in all. Moments used by tests:

| Moment | Hour | Ruler | Day ruler | Span | Next |
|--------|------|-------|-----------|------|------|
| 07:00 (frozen clock) | 24, night | Saturn | Mercury | 6:01 AM to 7:12 AM | Jupiter |
| 07:12 | 1, day | Jupiter | Jupiter | 7:12 AM to 8:01 AM | Mars |
| 12:00 | 6, day | Moon | Jupiter | 11:17 AM to 12:06 PM | Saturn |
| 20:00 | 15, night | Jupiter | Jupiter | 7:22 PM to 8:33 PM | Mars |

Timeline blocks on 15 January: 25 (Wednesday's hours 18 to 24, Thursday's 1 to 18; hour 18 starts 10:55 PM and is cut off at midnight). The first block, Wednesday's hour 18, is labelled with its true span (10:55 PM to 12:06 AM) and drawn from midnight.
