# Implementation Plan: Planetary Hours on Daily

**Branch**: `004-planetary-hours` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-planetary-hours/spec.md`

## Summary

Add a Planetary Hour widget to the Daily page showing the current planetary day ruler and hour ruler, and add a planetary hour column to the "Ascendant Today" timeline beside the rising-sign column, on Daily and Transits.

One provider fetches the day's planetary hours once per page and keeps a one-minute clock; the widget and the timeline both read it, so they cannot disagree. Two pure functions work out the current hour and the timeline blocks. The day ruler shown is the current hour's own, which makes the before-sunrise case correct. A 422 from the endpoint ("no sunrise or sunset") gives a "not available" message; any other failure gives "could not load"; in both cases the timeline keeps its existing three columns.

Tests follow the repo's rules: integration tests for all behaviour and failure states, one added step in the existing Daily browser journey, and a layout review at five sizes.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 24 via `.nvmrc`

**Primary Dependencies**: Vite 7, react-router-dom 7, Tailwind 4. Test tools already installed: Vitest, React Testing Library, Playwright, MSW. No new dependencies.

**Storage**: N/A

**Testing**: Vitest with React Testing Library in jsdom (integration), Playwright on Chromium (browser), MSW mocks shared by both

**Target Platform**: Web browsers from 320px to 1920px wide

**Project Type**: Single-page web application (frontend only; the backend is a separate project and already has the endpoint)

**Performance Goals**: One planetary hours request per page load and one more at local midnight; the widget follows an hour boundary within 60 seconds (SC-004); integration run grows by no more than a few seconds (SC-006)

**Constraints**: No backend during tests; no new browser test, one new step in the Daily journey; existing timeline behaviour and tests preserved (FR-018, FR-023); no sideways scrolling at 320 wide with the extra column

**Scale/Scope**: 4 new source files, 4 changed; 1 new test file, 7 changed test files; 1 new mocked endpoint; about 20 new integration tests

**Unknowns**: None blocking. Whether the 2.25rem column leaves the conjunction markers enough room at 320 wide on Transits (about 124px for about 122px of content) is settled by the layout review; the fallback is to narrow the sign column on phones.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template: it contains placeholders and no ratified principles, so there are no gates to evaluate.

- Before Phase 0: PASS (no gates defined)
- After Phase 1: PASS (no gates defined)

The repo's standing acceptance criterion (responsive layout review by a Claude review subagent at 320, 390, 768, 1280 and 1920 wide) is covered by [quickstart.md](./quickstart.md) step 4.

## Project Structure

### Documentation (this feature)

```text
specs/004-planetary-hours/
├── plan.md              # This file
├── research.md          # Phase 0: decisions
├── data-model.md        # Phase 1: types, derived values, provider states, fixture
├── quickstart.md        # Phase 1: validation steps
├── contracts/
│   ├── planetary-hours-api.md   # The endpoint consumed
│   └── planetary-hours-ui.md    # Roles, names, messages and layout rules
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── types/
│   └── planetaryHours.ts                   # NEW: ClassicalPlanet, PlanetaryHour, PlanetaryHoursType
├── utils/
│   ├── planetaryHours.ts                   # NEW: currentPlanetaryHour, planetaryHourBlocks
│   └── funcs.ts                            # CHANGE: formatTime moved here from the timeline
├── contexts/
│   └── PlanetaryHoursContext.tsx           # NEW: provider (fetch, status, minute clock) and usePlanetaryHours
├── components/chart-views/
│   ├── PlanetaryHourWidget.tsx             # NEW: the widget
│   └── DailyAscendantTimeline.tsx          # CHANGE: fourth column; NOW from the provider's clock
└── pages/
    ├── Daily.tsx                           # CHANGE: provider; widget first in the side stack
    └── Transits.tsx                        # CHANGE: provider

tests/
├── mocks/
│   ├── timings.ts                          # CHANGE: planetaryHours fixture and its builder
│   ├── handlers.ts                         # CHANGE: planetaryHoursFor, planetaryHoursUnavailable
│   ├── scenarios.ts                        # CHANGE: planetaryHoursFor in common()
│   └── index.ts                            # CHANGE: export the additions
├── integration/
│   ├── charts.tsx                          # CHANGE: fakeTheMinuteTimer and aMinutePasses moved here
│   ├── planetary-hours.test.tsx            # NEW: pure functions and the widget
│   ├── ascendant-timeline.test.tsx         # CHANGE: column tests
│   └── page-daily.test.tsx                 # CHANGE: seven regions; imports the moved timer helpers
├── e2e/
│   └── daily.spec.ts                       # CHANGE: one step
├── review/
│   └── charts.capture.ts                   # CHANGE: Daily with planetary hours unavailable
└── README.md                               # CHANGE: the new mock; updated timings
```

**Structure Decision**: Keep the existing layout. The provider goes in `src/contexts/` beside the other page-level contexts, the widget beside the other Daily widgets in `chart-views/`, and the two pure functions in `utils/` so they can be tested without rendering. `apiFetch` is not changed.

## Implementation Order

Each stage leaves the test suite green or with known, intended failures.

1. **Mock first**: types, the fixture and its builder, `planetaryHoursFor` in `common()`, `planetaryHoursUnavailable`. Nothing calls the endpoint yet, so existing tests still pass. This must land before the provider, because an unmocked request fails every Daily and Transits test.
2. **Pure functions, test first**: tests for `currentPlanetaryHour` and `planetaryHourBlocks` (the four moments in [data-model.md](./data-model.md), exactly at a boundary, before the first hour, at `dayEnd`, clipping at both ends), then the functions.
3. **Provider and widget (US1)**: widget tests on Daily (content before sunrise, by day, by night; boundary and midnight with the fake interval; loading; unavailable; could not load; request body; one request). Then the provider, the widget, and both in `Daily.tsx`. Update `page-daily.test.tsx` to seven regions.
4. **Timeline column (US2)**: column tests in `ascendant-timeline.test.tsx` (block names, count, current block, absent when unavailable or failed with everything else unchanged, present on Transits). Then the column, the provider in `Transits.tsx`, and the NOW line reading the provider's clock. The existing timeline tests must pass unchanged.
5. **Browser journey (US3)**: add "Planetary Hour" to the widget list in `daily.spec.ts`, check the hour tile, and check the current block is in view. Run the full browser suite.
6. **Layout review**: add the unavailable state to `charts.capture.ts`, capture, review at five sizes on Daily and Transits, fix, repeat until clean. Record the rounds in `quickstart.md`.
7. **Docs and checks**: `tests/README.md`, lint, build, re-time `npm test`.

## Risks

| Risk | Mitigation |
|------|------------|
| The extra column squeezes the conjunction markers at 320 wide, worst on Transits | Checked in the layout review; fallback is a narrower sign column on phones |
| The timeline's NOW line now moves with the provider's clock, changing when it re-renders | Existing timeline tests run unchanged in stage 4; the browser journey still checks NOW is in view |
| The device's time zone differs from the saved location's, so hours are drawn at the wrong place | Spec assumption, shared with the existing timeline; not addressed here |
| After midnight the hour column is refreshed but the rising-sign column is not (existing behaviour of `useDailyTimings`) | Out of scope; noted in [research.md](./research.md) item 3 for a follow-up |
| The backend's first returned hour starts after local midnight, leaving a gap at the top | The contract says it does not; `planetaryHourBlocks` would simply leave the gap empty rather than fail |

## Complexity Tracking

No constitution violations to justify.
