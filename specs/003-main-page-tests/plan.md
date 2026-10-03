# Implementation Plan: Main Chart Page Tests and Responsive Layout

**Branch**: `003-main-page-tests` | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-main-page-tests/spec.md`

## Summary

Cover the five chart pages (Charts, Moment, Daily, Transits, Synastry) and the description drawer they share with integration tests, add one happy-path browser journey per page at phone and desktop, and make the pages and the drawer fit five screen sizes. The tests reuse the existing harness (Vitest, Playwright, shared MSW mocks), extended with ten mocked endpoints, chart and timing fixtures, and one scenario. Each shared widget is tested once on one host page; page tests cover only what differs.

To make the pages testable and usable, every selectable item (wheel planets, signs, houses, chips, matrix cells, event previews) gets a role and an accessible name. Tests are written to the expected behaviour first; the fourteen behaviour problems they expose are then fixed, the main ones being explicit load-failure messages, Synastry with one profile, the drawer's trail and closing rules, and the drawer filling the screen on phones. The aspect matrix is reworked to scale to its space. Layout at all five sizes is checked by a Claude review subagent from captured screenshots; that review gates completion.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 24 via `.nvmrc`

**Primary Dependencies**: Vite 7, react-router-dom 7, Tailwind 4, react-hot-toast, react-icons. Test tools already installed: `vitest` 5, `@testing-library/react` 16, `@testing-library/user-event` 14, `@playwright/test` 1.63, `msw` 3, `@msw/playwright` 0.7. No new dependencies.

**Storage**: N/A (session in `localStorage`, seeded by tests; page settings are in memory and the URL query)

**Testing**: Vitest with React Testing Library in jsdom (integration), Playwright on Chromium (browser), MSW (mocks shared by both)

**Target Platform**: Web browsers from 320px to 1920px wide. Tests run on developer machines, Chromium only.

**Project Type**: Single-page web application (frontend only; the backend is a separate project)

**Performance Goals**: Full integration run under 20 seconds (SC-002; about 4 seconds today); full browser run under 60 seconds (SC-003; about 10 seconds today); a later widget adds under 2 seconds to the browser run (SC-004)

**Constraints**: No backend and no internet during tests; exactly five new journeys, at phone and desktop only; no automated layout tests; layout changes must not change behaviour; no visual redesign; no new dependencies; the aspect matrix must fit without sideways scrolling

**Scale/Scope**: About 110 integration tests in 17 files; 5 browser journeys (10 runs); about 35 source files touched (5 pages, 2 wheel contexts, the drawer context and 13 panels, 2 wheels and 4 layers, 9 chart-view widgets, 6 chip/utility components, 4 hooks, the navbar); 10 new mocked endpoints; 1 new scenario; 5 screen sizes

**Unknowns**: None blocking. Two things are open by design: the number of layout fixes depends on what the review finds, and whether aspect matrix symbols are legible at 320 wide (about 16px cells) is a judgement for the review; the fallback is in [research.md](./research.md) item 10.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template: it contains placeholders and no ratified principles, so there are no gates to evaluate.

- Before Phase 0: PASS (no gates defined)
- After Phase 1: PASS (no gates defined)

The repo's standing acceptance criterion (responsive layout review by a Claude review subagent at 320, 390, 768, 1280 and 1920 wide) is not a constitution gate, but this plan satisfies it through FR-027 and FR-028: see [research.md](./research.md) item 16 and [quickstart.md](./quickstart.md) step 7.

## Project Structure

### Documentation (this feature)

```text
specs/003-main-page-tests/
├── plan.md              # This file
├── research.md          # Phase 0: decisions, bug list (B1 to B14), edge-case outcomes
├── data-model.md        # Phase 1: requests per page, load states, drawer states, fixtures
├── quickstart.md        # Phase 1: validation steps
├── contracts/
│   ├── test-harness.md  # Phase 1: harness additions tests rely on
│   └── chart-pages-ui.md # Phase 1: roles, names, messages and layout rules after this work
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.css                               # CHANGE: lock page scroll behind the full-screen drawer
├── pages/
│   ├── Charts.tsx, Moment.tsx              # CHANGE: named regions, phone padding
│   ├── Daily.tsx                           # CHANGE: named regions, remove fixed wheel height (B12)
│   ├── Transits.tsx                        # CHANGE: named regions, phone padding
│   └── Synastry.tsx                        # CHANGE: "second profile" message (B4)
├── contexts/
│   ├── SingleWheelContext.tsx              # CHANGE: status, error, ignore stale responses (B1, B8)
│   ├── MultiWheelContext.tsx               # CHANGE: same, first non-main profile, empty date/time (B1, B4, B8, B13)
│   └── DescContext.tsx                     # CHANGE: close clears trail; close on settings change (B5, B6)
├── hooks/
│   ├── timings/useTimings.tsx, useDailyTimings.tsx, useMoonTimings.tsx   # CHANGE: error state (B2, B8)
│   ├── descriptions/useGeneratedDescriptions.tsx (and the 9 use*Desc hooks) # CHANGE: failed flag (B3)
│   └── chart/useChartData.tsx, singleWheelData.ts, multiWheelData.ts      # CHANGE: follow the chart (B11); filter hidden objects (B9)
├── components/
│   ├── Navbar.tsx                          # CHANGE: remove Friends link (B7)
│   ├── descriptions/
│   │   ├── DescriptionSidePanel.tsx        # CHANGE: named region; full screen below 768px (B10)
│   │   ├── Helpers.tsx                     # CHANGE: named Back and Close, 44px
│   │   └── *Panel.tsx (12)                 # CHANGE: description failure message; previews as buttons (B3, B14)
│   ├── wheel/
│   │   ├── ZodiacWheel.tsx, MultiZodiacWheel.tsx   # CHANGE: label, loading and error states
│   │   ├── ZodiacWheelSettings.tsx         # CHANGE: labels tied to controls; long names
│   │   └── layers/Planets.tsx, Signs.tsx, Houses.tsx  # CHANGE: roles, names, keyboard, larger hit area
│   ├── chart-views/
│   │   ├── AspectMatrix.tsx, MultiAspectMatrix.tsx  # CHANGE: scale to fit; cell buttons; hidden objects (B9)
│   │   ├── PlacementsTable.tsx, TransitPlacements.tsx # CHANGE: phone layout, error state
│   │   ├── DailyAscendantTimeline.tsx      # CHANGE: heading, error state
│   │   ├── MoonTimings.tsx                 # CHANGE: error state
│   │   └── WeeklyTimingWidget.tsx, WeeklyPlanetaryTimings.tsx, WeeklyPlanetaryTimeline.tsx # CHANGE: error state, phone layout
│   └── utils/
│       ├── PlanetChip.tsx, SignChip.tsx, HouseChip.tsx, KeyAngleChip.tsx, AspectChip.tsx # CHANGE: buttons
│       ├── Section.tsx                     # CHANGE: disclosure buttons
│       └── LoadError.tsx                   # NEW: shared "could not load" message

tests/
├── mocks/
│   ├── charts.ts                           # NEW: chart fixtures and builders
│   ├── timings.ts                          # NEW: daily, weekly, moon fixtures
│   ├── data.ts                             # CHANGE: userWithoutLocation, manyBirthProfiles
│   ├── handlers.ts                         # CHANGE: 10 new handlers; getMe(data)
│   ├── scenarios.ts                        # CHANGE: noLocation; new handlers in common()
│   └── index.ts                            # CHANGE: export the additions
├── integration/
│   ├── render.tsx                          # CHANGE: add ChartProvider
│   ├── requests.tsx                        # NEW: capture, reject, hold (moved from profile.tsx)
│   ├── charts.tsx                          # NEW: renderChartPage, widget, drawer
│   ├── profile.tsx                         # CHANGE: re-export from requests.tsx
│   ├── drawer.test.tsx, drawer-two-charts.test.tsx, drawer-timings.test.tsx   # NEW (US1)
│   ├── wheel.test.tsx, wheel-two-charts.test.tsx, chart-settings.test.tsx,
│   │   aspect-matrix.test.tsx, placements.test.tsx, ascendant-timeline.test.tsx,
│   │   moon-timings.test.tsx, weekly-timings.test.tsx                         # NEW (US2)
│   ├── page-charts.test.tsx, page-moment.test.tsx, page-daily.test.tsx,
│   │   page-transits.test.tsx, page-synastry.test.tsx, chart-guards.test.tsx  # NEW (US3)
│   └── navbar.test.tsx                     # CHANGE: seven destinations
├── e2e/
│   ├── chart-page.ts                       # NEW: shared journey steps
│   └── charts.spec.ts, moment.spec.ts, daily.spec.ts, transits.spec.ts, synastry.spec.ts # NEW (US4)
├── review/
│   ├── charts.capture.ts                   # NEW: chart pages and drawer per size and state
│   └── profile.capture.ts                  # CHANGE: file-name prefix, clears only its own images
└── README.md                               # CHANGE: new mocks and helpers, the one-journey-per-page rule
```

**Structure Decision**: Keep the existing layout. Tests stay under `tests/` in the `mocks`, `integration`, `e2e` and `review` folders; chart fixtures get their own two files because they are large. App changes stay inside the files that already own each behaviour; the only new source file is the shared `LoadError` message. Unreachable code (`Time`, `ViewSelector`, the old timeline) is not changed beyond what it needs to keep compiling.

## Implementation Order

Each stage leaves the test suite green or with known, intended failures.

1. **Harness**: chart and timing fixtures, ten handlers, `noLocation`, `ChartProvider` in `renderWithApp`, `requests.tsx`, `charts.tsx`. Existing tests still pass.
2. **Roles and names** (research item 5): wheel layers, chips, matrix cells, previews, section headers, drawer region and buttons, widget regions, settings labels. No behaviour change; this is what the tests in the next stages hold on to. Existing tests and the build still pass.
3. **Integration tests for behaviour that is already correct**: drawer opening, moving and back; wheel content and settings; matrix; placements; timelines; moon; weekly views; page requests; redirects. These pass against the code after stage 2.
4. **Integration tests for the behaviour changes** (B1 to B9, B11, B13, B14). These fail until stage 5.
5. **Behaviour fixes**: load status and messages; stale responses; Synastry message and profile choice; drawer trail and closing; matrix filtering; Friends link (with the navbar test update). All integration tests pass.
6. **Layout**: drawer full screen on phones (B10), matrix scaling, Daily wheel box (B12), paddings, placements and timing widgets, tap sizes.
7. **Browser journeys**: `chart-page.ts` and the five spec files, at phone and desktop. All browser tests pass with no expected failures, inside 60 seconds.
8. **Review capture and subagent review**: `charts.capture.ts`, review at five sizes, fix findings, re-capture, repeat until clean. Record the rounds in `quickstart.md`.
9. **Docs and checks**: update `tests/README.md` (including the FR-013 rule and new timings), run lint and build, re-time both test commands against SC-002 and SC-003.

Stages 3 to 5 can proceed widget by widget (test, then fix) instead of all tests first, as long as each widget's tests are written before its fix.

## Risks

| Risk | Mitigation |
|------|------------|
| Matrix symbols too small to read at 320 | Judged explicitly in the review (quickstart step 7); fallback in research item 10 is raised with the user, not decided silently |
| Turning chips and previews into buttons changes their look or nests buttons | Buttons keep the same classes; chips inside previews become display-only (B14); the review compares against today's appearance |
| The integration run grows past 20 seconds | Shared widgets tested once (FR-002); `renderChartPage` waits on the wheel only; timing re-measured in stage 9 |
| Browser run grows past 60 seconds | One file per page so workers run them in parallel; no waits on animations; timing re-measured in stage 9 |
| Changing shared chips breaks the unreachable `Time` page | `npm run build` in stage 2 and stage 9 |

## Complexity Tracking

No constitution violations to justify.
