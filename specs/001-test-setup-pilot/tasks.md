---

description: "Task list for the Test Setup Pilot"
---

# Tasks: Test Setup Pilot

**Input**: Design documents from `/specs/001-test-setup-pilot/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-harness.md, quickstart.md

**Tests**: The feature itself is a testing setup, so the three pilot tests are deliverables and appear as implementation tasks. No additional tests-of-the-tests are written.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1 to US4)

## Conventions for every task

- All paths are relative to the repository root `/Users/noahg/Dev/Astro/astro-web`.
- Run every `node`/`npm`/`npx` command under Node 24: prefix with `source ~/.nvm/nvm.sh && nvm use` (the nvm default is still Node 20).
- Do not modify anything under `src/` or `index.html` (FR-015). If a test cannot be written without an app change, stop and report it.
- Helper names and signatures follow [contracts/test-harness.md](./contracts/test-harness.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Runtime, dependencies, and project configuration for both test layers

- [X] T001 Create `.nvmrc` containing `24` and confirm `nvm use` selects Node 24.x in the repo root
- [X] T002 Install dev dependencies in `package.json` with `npm install -D @playwright/test vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw @msw/playwright @types/node`, then run `npx playwright install chromium`
- [X] T003 Add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:e2e": "playwright test"`
- [X] T004 [P] Append `playwright-report`, `test-results`, and `blob-report` to `.gitignore`
- [X] T005 [P] Create `tsconfig.test.json` (same compiler options as `tsconfig.app.json`, plus `"types": ["node"]`, with `"include": ["tests", "src", "playwright.config.ts", "vitest.config.ts"]` and its own `tsBuildInfoFile`), and add `{ "path": "./tsconfig.test.json" }` to the references in `tsconfig.json`
- [X] T006 [P] Update `eslint.config.js`: add `playwright-report` and `test-results` to `globalIgnores`, and add a config block for `tests/e2e/**/*.ts` that turns off `react-hooks/rules-of-hooks` (Playwright fixtures call a parameter named `use`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared mock source that both test layers import (FR-003)

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create `tests/mocks/auth.ts` exporting `API_URL = "http://api.astro.test"`, `GOOGLE_CLIENT_ID = "test-client-id"`, and `fakeToken()`, which returns an unsigned JWT-shaped string (`base64url(header).base64url(payload).sig`) whose payload is `{ exp: 4070908800, user_id: "user-1" }` so `jwtDecode` in `src/utils/api.ts` reads it as unexpired
- [X] T008 [P] Create `tests/mocks/data.ts` exporting immutable fixtures typed against the app's own types: `user` (`User` from `src/contexts/AuthContext.tsx`, with a New York City location and timezone `America/New_York`), `mainBirthProfile` (`BirthProfile` from `src/contexts/BirthProfilesContext.tsx`, `isMain: true`, `id: 1`), `places` (two Nominatim results with `place_id`, `display_name`, `lat`, `lon` as strings), and `settings = {}`. All ids, dates, and coordinates are fixed literals; nothing is derived from the current time or generated at random
- [X] T009 Create `tests/mocks/handlers.ts` exporting MSW `http` handler factories for each row of the "Mocked endpoints" table in `contracts/test-harness.md`: `GET {API_URL}/me`, `PUT {API_URL}/me` (returns `user` merged with the request body), `GET {API_URL}/birth-profiles` (takes the list to return), `POST {API_URL}/birth-profiles` (returns the request body plus `id: 1`), `GET {API_URL}/settings`, and `GET https://nominatim.openstreetmap.org/search` (returns `places`) (depends on T007, T008)
- [X] T010 Create `tests/mocks/scenarios.ts` exporting `type ScenarioName = "newAccount" | "withProfile"` and `scenario(name)` returning the handler list: `newAccount` serves `GET /birth-profiles` as `[]`, `withProfile` serves `[mainBirthProfile]`; both include every other handler from T009. Add `tests/mocks/index.ts` re-exporting the public surface (depends on T009)

**Checkpoint**: `npx tsc -p tsconfig.test.json --noEmit` passes

---

## Phase 3: User Story 1 - Run a browser test against the app with no real backend (Priority: P1) MVP

**Goal**: One command runs the new-account modal journey in a real browser with every backend and outside-service request mocked.

**Independent Test**: With no backend running, `npm run test:e2e` passes the journey, and removing a handler makes it fail naming the request.

- [X] T011 [US1] Create `playwright.config.ts`: `testDir: "tests/e2e"`, `retries: 0`, `reporter: [["list"], ["html", { open: "never" }]]`, `use: { baseURL: "http://localhost:5174", timezoneId: "America/New_York", locale: "en-US" }`, a single Chromium project named `desktop` with viewport 1280 x 800, and `webServer: { command: "npx vite --port 5174 --strictPort", url: "http://localhost:5174", reuseExistingServer: false, env: { VITE_API_URL, VITE_GOOGLE_CLIENT_ID } }` taking both values from `tests/mocks/auth.ts`
- [X] T012 [US1] Create `tests/e2e/fixtures.ts` exporting `test` and `expect`. Extend Playwright's `test` with: option `scenario` (default `"newAccount"`); option `signedIn` (default `true`), which uses `context.addInitScript` to set `localStorage` keys `token` (from `fakeToken()`) and `refresh`; auto fixture `network` built with `defineNetworkFixture({ context, handlers: scenario(name) })` from `@msw/playwright`, enabled before and disabled after each test; and an auto fixture that calls `page.clock.setFixedTime(new Date("2026-01-15T12:00:00Z"))` before the test body (depends on T010, T011)
- [X] T013 [US1] In `tests/e2e/fixtures.ts`, add the unmocked-request guard (FR-005): any request whose origin is not the app's `baseURL` and that no handler matched is aborted and recorded as `METHOD url`, and the `network` fixture's teardown fails the test listing them. First try a final catch-all MSW handler that returns `passthrough()` for same-origin requests; if `@msw/playwright` does not honour that, implement the guard with `context.route()` registered before the network fixture. Record which approach was used in a comment in the file and in `research.md` item 2
- [X] T014 [US1] In `tests/e2e/fixtures.ts`, add the `requests` fixture (FR-017): it records method, URL, and parsed JSON body of every request to `API_URL`, and exposes `requests.to(method, path)` returning the matching captured requests
- [X] T015 [US1] Create `tests/e2e/new-account-modal.spec.ts` with one test, "new account completes the blocking modal": go to `/`; expect the dialog named "Welcome! Let's set up your profile" to be visible; fill Birth Date with `1990-05-15` and Birth Time with `08:30` using `fill()`; type `Lond` into the first "City, Country" input and click the first mocked place result; click "Get Started"; expect the dialog to be hidden and the "Welcome! Your profile is set up" toast to appear; assert `requests.to("POST", "/birth-profiles")` has exactly one entry whose body equals `{ name: "My Profile", isMain: true, birthDate: "1990-05-15", birthTime: "08:30", birthTimeUnknown: false, location: places[0].display_name, latitude: Number(places[0].lat), longitude: Number(places[0].lon) }`; assert no `PUT /me` was sent (depends on T012, T013, T014)
- [X] T016 [US1] Run `npm run test:e2e` with no backend running and confirm the journey passes; then temporarily remove the `GET /settings` handler from `tests/mocks/scenarios.ts`, confirm the test fails naming `GET http://api.astro.test/settings`, and restore it

**Checkpoint**: User Story 1 works on its own at desktop size

---

## Phase 4: User Story 2 - Verify the same journey across standard device sizes (Priority: P2)

**Goal**: The browser test runs at phone and desktop size with per-size results.

**Independent Test**: `npm run test:e2e` reports the journey twice, once per size; `--project=phone` runs only the phone size.

- [X] T017 [P] [US2] Create `tests/e2e/devices.ts` exporting the device size table: `phone` (viewport 390 x 844, `isMobile: true`, `hasTouch: true`, `deviceScaleFactor: 3`) and `desktop` (1280 x 800). Both use Chromium
- [X] T018 [US2] Update `playwright.config.ts` to generate `projects` from the table in `tests/e2e/devices.ts` (replacing the single `desktop` project), and add `screenshot: "only-on-failure"` and `trace: "retain-on-failure"` to `use` (FR-011) (depends on T017)
- [X] T019 [US2] Extend the test in `tests/e2e/new-account-modal.spec.ts`: after the modal closes, reach the Profile page through the navigation and expect the URL to end with `/profile`. In `src/components/Navbar.tsx` the Profile link is visible at `md` and above and behind the menu button below it, so open the menu first when the link is not visible (depends on T018)
- [X] T020 [US2] Run `npm run test:e2e`. If the journey cannot be completed at a size because of an existing app problem, add `test.fail(testInfo.project.name === "<size>", "KI-00N: <what is wrong>")` at the top of the test and list it in `tests/KNOWN_ISSUES.md` (id, screen, device size, description, exposing test). Do not change app code. If nothing fails, create `tests/KNOWN_ISSUES.md` stating there are no known issues and describing the marking convention (FR-016)
- [X] T021 [US2] Verify: `npm run test:e2e` shows 1 test x 2 projects with no unexpected failures; `npm run test:e2e -- --project=phone` runs only phone; `npx playwright show-report` groups results by project

**Checkpoint**: User Stories 1 and 2 work; results are reported per size

---

## Phase 5: User Story 3 - Run a fast integration test without a browser (Priority: P3)

**Goal**: A second command runs integration tests in seconds, using the same scenarios as the browser tests.

**Independent Test**: `npm test` passes both integration tests in under 10 seconds with no browser and no backend.

- [X] T022 [US3] Create `vitest.config.ts`: plugins `react()` from `@vitejs/plugin-react-swc`; `test: { environment: "jsdom", include: ["tests/integration/**/*.test.tsx"], setupFiles: ["tests/integration/setup.ts"], env: { VITE_API_URL, VITE_GOOGLE_CLIENT_ID, TZ: "America/New_York" }, css: false }` taking the two `VITE_` values from `tests/mocks/auth.ts`
- [X] T023 [US3] Create `tests/integration/setup.ts`: import `@testing-library/jest-dom/vitest`; export `server = setupServer()` from `msw/node`; `beforeAll` starts it with an `onUnhandledRequest` callback that records `METHOD url`; `beforeEach` calls `vi.useFakeTimers({ toFake: ["Date"] })` and `vi.setSystemTime(new Date("2026-01-15T12:00:00Z"))`; `afterEach` calls `cleanup()`, `server.resetHandlers()`, `localStorage.clear()`, `vi.useRealTimers()`, then fails the test if any unhandled request was recorded and clears the list; `afterAll` closes the server (depends on T010, T022)
- [X] T024 [US3] Create `tests/integration/render.tsx` exporting `renderWithApp(ui, { scenario = "newAccount", signedIn = true, route = "/" })`: calls `server.use(...scenario(name))`, seeds `localStorage` `token` and `refresh` when `signedIn`, renders `ui` inside `AuthProvider` > `MemoryRouter` > `BirthProfilesProvider` together with `<Toaster />` from `react-hot-toast`, and returns the Testing Library result plus `user: userEvent.setup()` (depends on T023)
- [X] T025 [US3] Create `tests/integration/new-account-modal.test.tsx` with two tests. (1) "is not shown when the user has a main profile": render `<NewAccountModal />` with scenario `withProfile`, wait until `GET /birth-profiles` has resolved, and expect no dialog. (2) "keeps the modal open and shows the error when saving fails": render with `newAccount`, call `server.use(http.post(`${API_URL}/birth-profiles`, () => HttpResponse.json({ error: "Birth date is invalid" }, { status: 422 })))`, fill the form and pick the first mocked place, submit, then expect a toast containing "Failed to save profile" and "Birth date is invalid" and the dialog still present (depends on T024)
- [X] T026 [US3] Run `npm test` and confirm both tests pass in under 10 seconds; temporarily remove the `GET /birth-profiles` handler from the scenario, confirm the run fails naming the request, and restore it

**Checkpoint**: Both layers run from the same mocks; all three pilot tests exist

---

## Phase 6: User Story 4 - Add a new test by following the pattern (Priority: P4)

**Goal**: A developer can add a test using only the guide and the pilot tests.

**Independent Test**: Following `tests/README.md` alone, add a passing test for a screen the pilot does not cover.

- [X] T027 [US4] Write `tests/README.md` (FR-014) covering: prerequisites (Node 24 via `nvm use`, `npx playwright install chromium`); the commands table from `contracts/test-harness.md`; the folder layout; how to add a browser test (import from `tests/e2e/fixtures.ts`, choose a scenario); how to add an integration test (`renderWithApp`); how to add a fixture, handler, and scenario; how to override a response in one test; how to assert on what the app sent; what an "unmocked request" failure means and how to fix it; how to mark and record a known issue; how to open the report and trace for a failure
- [X] T028 [US4] Validate the guide by following only `tests/README.md` to add a throwaway browser test for the Profile page with the `withProfile` scenario; note any step that needed knowledge not in the guide, fix the guide, then delete the throwaway test so the pilot stays at three tests (SC-007)

**Checkpoint**: The pattern is documented and has been followed once from the guide

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Whole-feature validation from quickstart.md

- [X] T029 Repeatability (SC-004): run `npm test` 10 times in a loop and `npm run test:e2e -- --repeat-each=10`; results must be identical every run. Fix the test setup, not the app, if anything is intermittent
- [X] T030 Timing (SC-003): confirm `npm test` finishes in under 10 seconds and `npm run test:e2e` in under 1 minute; record the measured times in `tests/README.md`
- [ ] T031 NOT RUN (the phone run is already an expected failure under KI-001, so a deliberate phone-only break cannot be told apart from it; KI-001 itself is the real-world instance of SC-005). Responsive break attribution (SC-005): temporarily add the `hidden` class to the menu button in `src/components/Navbar.tsx`, confirm `new-account-modal.spec.ts` fails on `phone` only with a screenshot, and revert
- [X] T032 App unchanged (FR-015): `git diff --stat main -- src index.html` shows no changes from this feature (the pre-existing uncommitted edit to `src/contexts/AuthContext.tsx` is not part of it), and `npm run build` and `npm run lint` succeed
- [X] T033 Update `specs/001-test-setup-pilot/research.md` and `specs/001-test-setup-pilot/contracts/test-harness.md` wherever the implementation ended up differing from the design

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies. T001 → T002 → T003; T004, T005, T006 in parallel after T002.
- **Foundational (Phase 2)**: depends on Setup. Blocks all user stories.
- **US1 (Phase 3)**: depends on Foundational.
- **US2 (Phase 4)**: depends on US1 (it multiplies and extends the US1 browser test and config).
- **US3 (Phase 5)**: depends on Foundational only; independent of US1 and US2.
- **US4 (Phase 6)**: depends on US1, US2, and US3 (the guide documents all of them).
- **Polish (Phase 7)**: depends on all stories.

### Story completion order

```text
Setup → Foundational → US1 → US2 ─┐
                     └→ US3 ──────┴→ US4 → Polish
```

### Parallel opportunities

- T004, T005, T006 (different config files)
- T008 alongside T007 (different files)
- All of Phase 5 (US3) alongside Phases 3 and 4, since it touches only `vitest.config.ts` and `tests/integration/`

Tasks T012 to T014 all edit `tests/e2e/fixtures.ts` and must run in sequence.

## Parallel Example

```text
# After Phase 2, two streams can run side by side:
Stream A (browser): T011 → T012 → T013 → T014 → T015 → T016 → T017 → T021
Stream B (integration): T022 → T023 → T024 → T025 → T026
```

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 and Phase 2.
2. Phase 3. T013 is the riskiest task: it settles whether `@msw/playwright` can carry the unmocked-request guard or the fallback is needed.
3. Stop and confirm the journey passes at desktop size with no backend.

### Incremental delivery

1. US1: one browser journey against mocks.
2. US2: the same test at phone and desktop size.
3. US3: the integration layer on the same mocks.
4. US4: the guide, validated by using it.
5. Polish: repeatability, timing, and the app-unchanged check.

## Notes

- The pilot ends with exactly three tests: one happy-path journey in `tests/e2e/` (run at phone and desktop), two in `tests/integration/`.
- Commit only when asked; the work is currently on `main` with no feature branch.
