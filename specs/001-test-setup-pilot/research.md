# Research: Test Setup Pilot

Versions quoted are the latest on npm on 2026-10-03.

## 1. Integration test runner

- **Decision**: Vitest 5 with React Testing Library 16, `@testing-library/user-event`, `@testing-library/jest-dom`, running in jsdom.
- **Rationale**: The app is built with Vite 7, and Vitest reuses the same transform pipeline (SWC React plugin, Tailwind, `import.meta.env`), so no second build configuration is needed. React Testing Library renders real providers and components and queries them the way a user would, which is what an "integration" layer needs here.
- **Alternatives considered**:
  - Jest: needs separate ESM/TypeScript/`import.meta.env` handling that Vitest gets for free.
  - Playwright component testing: still experimental, and it would make both layers browser-based, losing the fast no-browser feedback loop the spec asks for (SC-003).
  - Vitest browser mode: same objection; worth revisiting later if jsdom fidelity becomes a problem.

## 2. Backend mocking shared by both layers (FR-003, FR-004)

- **Decision**: MSW 3 request handlers are the single source of mocks. Vitest uses them through `msw/node` (`setupServer`). Playwright uses the same handlers through `@msw/playwright` 0.7 (`defineNetworkFixture`), which applies them via `page.route()`.
- **Rationale**: One set of handlers and fixture data serves both layers. Per-test overrides are the same call in both (`server.use(...)` / `network.use(...)`), and they reset after each test. `@msw/playwright` needs no service worker and no change to the app's entry point, which keeps FR-015 (no change to delivered behaviour) trivially true.
- **Alternatives considered**:
  - MSW browser service worker started from `main.tsx` under a test flag: requires editing the app entry and shipping `mockServiceWorker.js` in `public/`; overrides from the test process need `page.evaluate` plumbing.
  - Hand-written `page.route()` in Playwright plus MSW in Vitest: two mock implementations to keep in sync, which is exactly what FR-003 rules out.
  - `playwright-msw` (community): superseded by the official `@msw/playwright`.
- **To verify during implementation**: that `passthrough()` from a catch-all handler lets same-origin requests (the Vite dev server's own assets) continue. If it does not, the unmocked-request guard (item 4) is implemented with a plain `context.route()` registered before the MSW fixture instead.

## 3. Node version

- **Decision**: Use Node 24 locally (add `.nvmrc` containing `24`); the minimum that works is 22.22.2. Node 24.21.0 was installed under nvm on 2026-10-03. The nvm default alias is left at 20, so run `nvm use` in this repo.
- **Rationale**: Vitest 5 needs `^22.12 || ^24 || >=26`, jsdom 30 needs `^22.22.2 || ^24.15 || >=26`, and MSW 3 needs `>=22.12`. The machine currently has Node 20.19.5 under nvm (the active one) and Node 25.2.1 under Homebrew; neither satisfies those ranges. Node 24 is the newest release line all three accept. The deploy workflow builds on Node 22 and does not run tests, so it is left as is. Node 20 reached end of life in April 2026.
- **Alternatives considered**: Pinning older majors (Vitest 3, MSW 2, jsdom 26, an older `@msw/playwright`) to stay on Node 20. Rejected: it starts the suite on already-superseded versions to preserve an end-of-life runtime.

## 4. Unmocked requests fail the test (FR-005)

- **Decision**: Any request that is not to the app's own origin and has no matching handler is blocked, recorded, and causes the test to fail in teardown with the method and URL.
  - Vitest: `server.listen({ onUnhandledRequest })` with a callback that records the request; an `afterEach` asserts the list is empty.
  - Playwright: a final catch-all handler records and aborts any non-app-origin request; the auto fixture asserts the list is empty after the test.
- **Rationale**: MSW's built-in `onUnhandledRequest: "error"` rejects the `fetch`, but the app catches several of those rejections (for example `fetchProfiles` logs and continues), so the test could still pass. Recording and asserting in teardown cannot be swallowed by app code.
- **Alternatives considered**: Relying on `"error"` alone (can be swallowed); blocking network at the OS level (heavier, not portable).

## 5. Known API base URL in tests

- **Decision**: Both runners set `VITE_API_URL=http://api.astro.test` and `VITE_GOOGLE_CLIENT_ID=test-client-id` themselves: Playwright through `webServer.env`, Vitest through `test.env`. Handlers build URLs from the same constant.
- **Rationale**: `.gitignore` excludes `.env.*`, so a committed `.env.test` is not available without changing ignore rules. Setting the values in the runner configs keeps them in version control and independent of a developer's own `.env`. The host never resolves, so a leak past the mocks cannot reach a real server.
- **Alternatives considered**: `.env.test` plus a `.gitignore` exception (more moving parts); reusing the developer's `.env` (tests would depend on local configuration).

## 6. Dev server for browser tests

- **Decision**: Playwright's `webServer` starts `vite` on a dedicated port (5174) with `reuseExistingServer: false`.
- **Rationale**: A developer's normal dev server on 5173 is built with their real API URL, so reusing it would bypass the test API base. A dedicated port means the test command works whether or not the dev server is already running (spec edge case).
- **Alternatives considered**: Testing the production build via `vite preview` (slower loop, and the production base path `/astro-web/` adds noise for a pilot).

## 7. Starting signed in (FR-006)

- **Decision**: A helper builds an unsigned JWT-shaped token with `exp` in 2099 and seeds `localStorage` (`token`, `refresh`) before the app loads: `context.addInitScript` in Playwright, direct `localStorage.setItem` in Vitest. `GET /me` is mocked.
- **Rationale**: `apiFetch` only decodes the token to read `exp`; it never verifies a signature. Seeding storage is how the app itself restores a session, so no app code changes and no sign-in provider is contacted.
- **Alternatives considered**: Driving the email login form in every test (slow, and couples every test to the login screen); Playwright `storageState` files (an extra generated artifact for the same result).

## 8. Device sizes (FR-007, FR-008, FR-009)

- **Decision**: Two Playwright projects generated from one table in `tests/e2e/devices.ts`, all on Chromium:

  | Name | Viewport | Notes |
  |------|----------|-------|
  | `phone` | 390 x 844 | mobile + touch, device scale factor 3 |
  | `desktop` | 1280 x 800 | |

  A single size is run with `--project=phone`.
- **Rationale**: Playwright projects give per-size results in the report for free, and the table is the one place sizes are defined. The two sizes sit on either side of the app's Tailwind `md` breakpoint (768), which the navbar switches on. A tablet size is deliberately left out of the pilot and can be added as one row.
- **Alternatives considered**: Playwright's built-in device descriptors (`iPhone 13`, `iPad Mini`) default to WebKit, which adds a second browser engine the spec puts out of scope; looping over viewports inside each test loses per-size reporting and `--project` filtering.

## 9. Known issues (FR-016)

- **Decision**: The pilot has no dedicated layout test. If the journey cannot be completed at a size because of an existing app problem, the test is marked with `test.fail(condition, "KI-00N: ...")` scoped to the affected project, and listed in `tests/KNOWN_ISSUES.md` with screen, device size, and description.
- **Rationale**: Playwright reports such a test as an expected failure, separately from unexpected ones, and flags it if it starts passing, so the marker cannot go stale silently. The app is not changed. The marker is only added for failures that are observed during implementation.
- **Alternatives considered**: `test.skip`/`test.fixme` (the check stops running, so a fix or a worsening goes unnoticed); leaving the test red (unexpected failures become hard to spot, violating FR-016).

## 10. Failure evidence (FR-011)

- **Decision**: `screenshot: "only-on-failure"`, `trace: "retain-on-failure"`, HTML reporter plus the list reporter. Output goes to `playwright-report/` and `test-results/`, both git-ignored.
- **Rationale**: The HTML report groups results by project (device size) and attaches the screenshot and trace to each failure.

## 11. Determinism (FR-012)

- **Decision**: Fixed time zone (`America/New_York`), locale (`en-US`), and clock (`2026-01-15T12:00:00Z`) in both layers. Playwright: `timezoneId`, `locale`, and `page.clock.setFixedTime`. Vitest: `TZ` set in config and `vi.useFakeTimers({ toFake: ["Date"] })` with `vi.setSystemTime`.
- **Rationale**: Only `Date` is frozen; real timers keep running, so the place picker's 300 ms debounce and React Testing Library's async utilities behave normally. Retries are set to 0 so flakiness is visible rather than masked (SC-004).

## 12. Integration test scope

- **Decision**: The integration tests render `NewAccountModal` inside the real `AuthProvider` and `BirthProfilesProvider` with a memory router and the toast container.
- **Rationale**: The route tree is declared inline in `src/main.tsx` and is not importable. Extracting it would be an app refactor, which the pilot avoids. Composing the real providers around one component still exercises real data loading against the mocks. Exporting the route tree so integration tests can render whole pages is noted as a follow-up for the full suite.

## 13. Lint and type-check

- **Decision**: Add `tsconfig.test.json` (covering `tests/`, `playwright.config.ts`, `vitest.config.ts`) to the root project references. In `eslint.config.js`, ignore `playwright-report` and `test-results`, and turn off the `react-hooks` rules for `tests/e2e/**`.
- **Rationale**: Playwright fixtures call a parameter named `use`, which `eslint-plugin-react-hooks` mistakes for the React hook.

## Constitution

`.specify/memory/constitution.md` is still the unfilled template, so it defines no principles or gates to evaluate.

## Implementation findings (2026-10-03)

Where the build differed from the decisions above:

- **Item 2 and 4 (unmocked guard in Playwright)**: `@msw/playwright` calls `route.fallback()` for any request no handler matched, so the guard is a plain `context.route("**/*")` registered before the MSW fixture. It lets same-origin requests continue and records and aborts everything else. A catch-all MSW handler was not needed. The guard stops recording just before MSW is disabled, because requests still in flight at teardown fall through to it and were producing false failures.
- **Item 4 (Vitest)**: MSW 3 renamed the option to `onUnhandledFrame({ frame, defaults })`; `onUnhandledRequest` is silently ignored.
- **Item 3**: Node 24.21.0. MSW 3 also requires TypeScript 5.9 or newer, so `typescript` was bumped from `~5.8.3` to `~5.9`. The app builds unchanged.
- **Type isolation**: installing `@types/node` made `setTimeout` return `NodeJS.Timeout` inside app code and broke `tsc -b` in `src/contexts/SingleWheelContext.tsx`. `tsconfig.app.json` now sets `"types": []` so the app's type-check does not pick up Node types. No file under `src/` was changed.
- **CORS**: mocked responses come from `http://api.astro.test` without CORS headers, so Chromium is launched with `--disable-web-security`. This keeps per-test overrides identical in both layers (plain `HttpResponse.json`).
- **Google sign-in script**: `GoogleOAuthProvider` loads `https://accounts.google.com/gsi/client` on every page; the guard caught it. It is mocked with an empty script in every scenario.
- **jsdom**: `window.matchMedia` is stubbed in `tests/integration/setup.ts` (react-hot-toast needs it). Toasts cannot be asserted with `toBeVisible()` because jsdom applies no layout; `toBeInTheDocument()` is used.
- **Item 9 (known issue found)**: KI-001. At 390px the navbar is 503px wide, the page becomes wider than the screen, and the modal's submit button is partly off-screen. The phone run of the journey is marked `test.fail`. `actionTimeout` is set to 5 seconds so the expected failure takes about 6 seconds, not 30.
- **Measured**: integration run about 1 second; browser run about 7 seconds; 10 consecutive runs of each were identical.
