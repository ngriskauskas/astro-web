# Implementation Plan: Test Setup Pilot

**Branch**: `001-test-setup-pilot` (spec directory; no git branch created yet, work is currently on `main`) | **Date**: 2026-10-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-test-setup-pilot/spec.md`

## Summary

Stand up a two-layer test setup for the astro-web frontend and prove it with three tests. The single browser test uses Playwright and runs at phone and desktop sizes; integration tests use Vitest with React Testing Library. Both layers get their backend from one set of MSW handlers and fixture data, so the app runs with no backend and no internet. The pilot journey is the blocking new-account modal, happy path only. If the journey cannot be completed at a size because of an existing app problem, that is recorded as a known issue and not fixed. No file under `src/` changes.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Node 24 locally via `.nvmrc` (minimum 22.22; see research item 3)

**Primary Dependencies**: Existing: Vite 7, react-router-dom 7, Tailwind 4. New, all dev-only: `@playwright/test` 1.63, `vitest` 5, `jsdom` 30, `@testing-library/react` 16, `@testing-library/user-event` 14, `@testing-library/jest-dom` 7, `msw` 3, `@msw/playwright` 0.7

**Storage**: N/A (the app's session lives in `localStorage`, which tests seed)

**Testing**: Vitest (integration), Playwright (browser), MSW (mocks shared by both)

**Target Platform**: Developer machines (macOS), Chromium only. CI is out of scope but nothing here prevents it.

**Project Type**: Single-page web application (frontend only; the backend is a separate project)

**Performance Goals**: Integration run under 10 seconds; full browser run across two sizes under 1 minute (SC-003)

**Constraints**: No backend and no internet during tests; no changes to delivered app behaviour or to `src/`; deterministic results; at most 3 tests

**Scale/Scope**: 3 tests, 2 scenarios, 2 device sizes, 6 mocked endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template: it contains placeholders and no ratified principles, so there are no gates to evaluate.

- Before Phase 0: PASS (no gates defined)
- After Phase 1: PASS (no gates defined)

If a constitution is written later (`/speckit-constitution`), re-check this plan against it before implementing.

## Project Structure

### Documentation (this feature)

```text
specs/001-test-setup-pilot/
├── plan.md              # This file
├── research.md          # Phase 0: decisions and alternatives
├── data-model.md        # Phase 1: fixtures, scenarios, device profiles
├── quickstart.md        # Phase 1: validation steps
├── contracts/
│   └── test-harness.md  # Phase 1: commands and helper API tests rely on
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit-tasks
```

### Source Code (repository root)

```text
tests/
├── mocks/                         # Shared by both layers
│   ├── data.ts                    # Fixture objects typed against src/ types
│   ├── handlers.ts                # MSW handlers per endpoint
│   ├── scenarios.ts               # newAccount, withProfile
│   └── auth.ts                    # fakeToken(), API_URL
├── integration/
│   ├── setup.ts                   # MSW server, unmocked guard, clock, cleanup
│   ├── render.tsx                 # renderWithApp()
│   └── new-account-modal.test.tsx # 2 tests
├── e2e/
│   ├── devices.ts                 # phone / desktop table
│   ├── fixtures.ts                # test/expect with network, scenario, signedIn, requests
│   └── new-account-modal.spec.ts  # 1 test
├── KNOWN_ISSUES.md
└── README.md                      # The guide (FR-014)

playwright.config.ts               # New
vitest.config.ts                   # New
tsconfig.test.json                 # New
.nvmrc                             # New: 24

package.json                       # Edited: devDependencies, test scripts
tsconfig.json                      # Edited: reference tsconfig.test.json
eslint.config.js                   # Edited: ignore reports, relax react-hooks in tests/e2e
.gitignore                         # Edited: playwright-report, test-results

src/                               # Unchanged
```

**Structure Decision**: A top-level `tests/` directory beside `src/`, split into `mocks/` (shared), `integration/`, and `e2e/`. Keeping tests out of `src/` means `tsconfig.app.json` and the production build never see them, which makes "no change to the delivered app" easy to verify. `mocks/` sits above both layers because it is the single source both must import from.

## The three pilot tests

| # | Layer | Test | Scenario | Demonstrates |
|---|-------|------|----------|--------------|
| 1 | Browser | New-account modal journey: modal blocks the app, form is filled, birth place picked from mocked search, submitted profile matches, modal closes, Profile reachable via the navigation | `newAccount` | FR-002, FR-006, FR-007, FR-010, FR-011, FR-017, outside-service mock, navigation at each size |
| 2 | Integration | Modal is not shown for a user with a main profile | `withProfile` | FR-003 (same mock source as test 1), FR-006 |
| 3 | Integration | Submitting when the backend returns an error shows the error and keeps the modal open | `newAccount` + override | FR-004 |

FR-005 (unmocked requests fail) and FR-012 (determinism) are built into the shared setup of both layers and are verified by quickstart steps 4 and 6 instead of by a dedicated test, to keep the pilot minimal. FR-016 (known issues) applies only if the journey cannot be completed at a size.

## Key decisions

Full reasoning and alternatives are in [research.md](./research.md).

1. **One mock source**: MSW handlers, consumed by Vitest via `msw/node` and by Playwright via `@msw/playwright`. No service worker and no app entry changes.
2. **Node 24**: the current test tool versions need Node 22.22 or newer. `.nvmrc` pins 24, and Node 24.21.0 is installed under nvm. The deploy workflow stays on Node 22, which only builds and is unaffected.
3. **Unmocked requests**: recorded and asserted in teardown, because the app swallows some fetch errors.
4. **Test API base**: `http://api.astro.test`, injected by each runner's config; independent of the developer's `.env`.
5. **Dedicated port 5174** for the browser tests' dev server, so a running dev server neither blocks nor contaminates the run.
6. **Signed-in state**: seed `localStorage` with a far-future unsigned token and mock `GET /me`.
7. **Device sizes**: two Chromium projects (phone, desktop) generated from one table; adding tablet later is one row.
8. **Known issues**: `test.fail` scoped to the affected size plus an entry in `tests/KNOWN_ISSUES.md`; never `skip`.
9. **Determinism**: fixed clock, time zone, and locale; zero retries.
10. **Integration scope**: real providers around `NewAccountModal`; the inline route tree in `src/main.tsx` is left alone.

## Risks

| Risk | Mitigation |
|------|------------|
| `@msw/playwright` is pre-1.0 and its catch-all/passthrough behaviour is unverified | First implementation task is a spike confirming handlers, overrides, and passthrough work; fallback is a plain `context.route()` guard (research item 2) |
| Vitest 5 / jsdom 30 are recent majors | Versions are pinned in `package.json`; nothing in the pilot depends on new-major features |
| `<input type="date">` and `<input type="time">` behave differently under touch emulation | Use Playwright's `fill()` with ISO values, which bypasses the native picker |

## Complexity Tracking

No constitution violations to justify.
