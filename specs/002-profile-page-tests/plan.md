# Implementation Plan: Profile Page Tests and Responsive Layout

**Branch**: `002-profile-page-tests` (spec directory; no git branch created yet, work is currently on `main`) | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-profile-page-tests/spec.md`

## Summary

Cover every behaviour of the profile screen with integration tests, add one happy-path browser journey at phone and desktop, and make the profile screen and the navigation fit five screen sizes. The tests reuse the pilot harness (Vitest, Playwright, shared MSW mocks), extended with four more mocked endpoints, one scenario and three fixtures. Tests are written to the expected behaviour first; the behaviour bugs they expose are then fixed in `src/components/profile/`, including a delete confirmation and blocking saves with an unpicked place. The navigation collapses to a logo and a menu below 768px, which closes KI-001. Layout at all five sizes is checked by a Claude review subagent, working from screenshots a capture script produces; that review gates completion. No automated layout test is added.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19, Node 24 via `.nvmrc`

**Primary Dependencies**: Vite 7, react-router-dom 7, Tailwind 4, react-hot-toast. Test tools already installed by the pilot: `vitest` 5, `@testing-library/react` 16, `@testing-library/user-event` 14, `@playwright/test` 1.63, `msw` 3, `@msw/playwright` 0.7. No new dependencies.

**Storage**: N/A (session in `localStorage`, seeded by tests)

**Testing**: Vitest with React Testing Library in jsdom (integration), Playwright on Chromium (browser), MSW (mocks shared by both)

**Target Platform**: Web browsers from 320px to 1920px wide. Tests run on developer machines, Chromium only.

**Project Type**: Single-page web application (frontend only; the backend is a separate project)

**Performance Goals**: Integration run under 10 seconds (SC-002); full browser run under 60 seconds (SC-003)

**Constraints**: No backend and no internet during tests; exactly one profile journey, at phone and desktop only; no automated layout tests; layout changes must not change behaviour; no visual redesign; no new dependencies

**Scale/Scope**: About 45 integration tests in 6 files; 1 new browser journey (2 runs); 6 source components touched (`Navbar`, `Profile`, and the five files in `src/components/profile/`); 3 scenarios; 5 screen sizes

**Unknowns**: None remaining. The backend derives the account timezone from coordinates ([research.md](./research.md) item 10). The total number of behaviour fixes is open by design, since every bug the tests expose is in scope.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template: it contains placeholders and no ratified principles, so there are no gates to evaluate.

- Before Phase 0: PASS (no gates defined)
- After Phase 1: PASS (no gates defined)

The repo's standing acceptance criterion (responsive layout review by a Claude review subagent at 320, 390, 768, 1280 and 1920 wide, in `.specify/templates/spec-template.md`) is not a constitution gate, but this plan satisfies it through FR-019 and FR-020: see [research.md](./research.md) item 6 and [quickstart.md](./quickstart.md) step 5.

## Project Structure

### Documentation (this feature)

```text
specs/002-profile-page-tests/
├── plan.md              # This file
├── research.md          # Phase 0: decisions, bug list, edge-case outcomes
├── data-model.md        # Phase 1: entities, validation rules, fixtures, sizes
├── quickstart.md        # Phase 1: validation steps
├── contracts/
│   ├── test-harness.md  # Phase 1: harness additions tests rely on
│   └── profile-ui.md    # Phase 1: UI behaviour after this work
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Navbar.tsx                      # CHANGE: logo + menu below 768px, all eight links in the menu
│   └── profile/
│       ├── AccountInfoForm.tsx         # CHANGE: block save on unpicked place
│       ├── AstrologySettingsForm.tsx   # CHANGE: clamp orbs; small-screen grid and row layout
│       ├── BirthInfoForm.tsx           # CHANGE: required fields enforced, unpicked place, delete confirmation
│       ├── BirthPlacePicker.tsx        # CHANGE: report picked/unpicked, handle failed search
│       └── CustomProfileList.tsx       # CHANGE: only one of profile / new form open
├── pages/
│   └── Profile.tsx                     # CHANGE: padding on small screens
└── App.tsx                             # CHANGE (if the review requires): toast position

tests/
├── mocks/
│   ├── data.ts                         # CHANGE: customBirthProfiles, savedSettings, defaultSettings
│   ├── handlers.ts                     # CHANGE: 4 new handlers, create id 100, getSettings(data)
│   ├── scenarios.ts                    # CHANGE: withCustomProfiles
│   └── index.ts                        # CHANGE: export the additions
├── integration/
│   ├── render.tsx                      # CHANGE: add ChartSettingsProvider
│   ├── profile-account-info.test.tsx   # NEW
│   ├── profile-birth-info.test.tsx     # NEW
│   ├── profile-custom-profiles.test.tsx # NEW
│   ├── profile-chart-settings.test.tsx # NEW
│   ├── profile-place-search.test.tsx   # NEW
│   └── navbar.test.tsx                 # NEW
├── e2e/
│   ├── profile.spec.ts                 # NEW: the journey
│   └── new-account-modal.spec.ts       # CHANGE: remove KI-001 marker, find menu button by name
├── review/
│   ├── playwright.config.ts            # NEW
│   ├── sizes.ts                        # NEW: the five review sizes
│   └── profile.capture.ts              # NEW: screenshots per size and state
├── KNOWN_ISSUES.md                     # CHANGE: remove KI-001
└── README.md                           # CHANGE: new scenario, review command

package.json                            # CHANGE: review:layout script
```

**Structure Decision**: Keep the pilot's layout. Tests stay under `tests/` in the existing `mocks`, `integration` and `e2e` folders; the only new folder is `tests/review/` for the screenshot capture, kept apart so the browser test command never runs it. App changes are confined to the navigation and the profile components.

## Implementation Order

Each stage leaves the test suite green or with known, intended failures.

1. **Harness**: extend mocks, scenarios and `renderWithApp`. Existing pilot tests still pass.
2. **Integration tests for current, correct behaviour**: load, save, reject, place search, settings. These pass against today's code.
3. **Integration tests for the behaviour changes**: required fields, unpicked place, delete confirmation, one-open-at-a-time, orb clamping, failed place search, navigation menu. These fail until stage 4.
4. **Behaviour fixes** (research item 8, B1 to B7) and the navigation change (item 7). All integration tests pass.
5. **Browser journey** `profile.spec.ts` at phone and desktop; remove the KI-001 marker and row. All browser tests pass with no expected failures.
6. **Review capture and subagent review**: build `npm run review:layout`, run the review at five sizes, fix findings, re-capture, repeat until clean.
7. **Docs**: update `tests/README.md`; run lint and build.

## Complexity Tracking

No constitution violations to justify.
