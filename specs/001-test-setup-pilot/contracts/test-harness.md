# Contract: Test Harness

What a developer writing tests can rely on. This is the surface the full test suite will be built against, so it should stay stable once the pilot is accepted.

## Commands

| Command | Does | Requirement |
|---------|------|-------------|
| `npm test` | Runs all integration tests once | FR-001 |
| `npm run test:watch` | Integration tests in watch mode | |
| `npm run test:e2e` | Starts the app on port 5174 and runs all browser tests at each device size (phone, desktop) | FR-001, FR-007 |
| `npm run test:e2e -- --project=phone` | One device size only | FR-009 |
| `npm run test:e2e -- new-account-modal` | One browser test file only | FR-009 |
| `npm test -- new-account-modal` | One integration test file only | FR-009 |
| `npx playwright show-report` | Opens the last browser test report | FR-011 |

Exit code is non-zero if any test fails unexpectedly, if a known-issue test unexpectedly passes, or if any request went unmocked.

## Shared mocks (`tests/mocks/`)

```ts
// The API base both runners inject as VITE_API_URL.
export const API_URL: string;

// Fixture data, typed against the app's own types.
export const user: User;
export const mainBirthProfile: BirthProfile;
export const places: NominatimPlace[];

// Named backend situations.
export type ScenarioName = "newAccount" | "withProfile";
export function scenario(name: ScenarioName): RequestHandler[];

// A token the app accepts as a live session.
export function fakeToken(): string;
```

Guarantees:

- The same `scenario()` output is used by both layers (FR-003).
- A handler passed to `server.use()` / `network.use()` overrides the scenario for that test only (FR-004).

## Mocked endpoints

| Method | URL | Default response |
|--------|-----|------------------|
| GET | `{API_URL}/me` | `user` |
| PUT | `{API_URL}/me` | `user` merged with the request body |
| GET | `{API_URL}/birth-profiles` | `[]` or `[mainBirthProfile]`, by scenario |
| POST | `{API_URL}/birth-profiles` | Request body plus `id: 1` |
| GET | `{API_URL}/settings` | `{}` |
| GET | `https://nominatim.openstreetmap.org/search` | `places` |
| GET | `https://accounts.google.com/gsi/client` | Empty script |

Any other request that leaves the app's own origin fails the test and is named in the failure message (FR-005).

## Browser test fixtures (`tests/e2e/fixtures.ts`)

Tests import `test` and `expect` from this file, not from `@playwright/test`.

| Fixture | Type | Behaviour |
|---------|------|-----------|
| `scenario` | option, default `"newAccount"` | Chooses the scenario. Set per file with `test.use({ scenario: "withProfile" })`. |
| `signedIn` | option, default `true` | Seeds a session token before the app loads (FR-006). |
| `network` | auto | The MSW network fixture; `network.use(...)` adds overrides. Fails the test in teardown if any request was unmocked. |
| `requests` | helper | `requests.to(method, path)` returns the captured requests for that endpoint (FR-017). |

Every test also gets a fixed clock, time zone, and locale (FR-012), and runs once per device size profile.

## Integration test helpers (`tests/integration/`)

```ts
// Renders ui inside the real Auth and BirthProfiles providers with a memory router.
// Seeds a session unless signedIn is false. Returns Testing Library's result plus a user-event instance.
export function renderWithApp(
  ui: ReactElement,
  options?: { scenario?: ScenarioName; signedIn?: boolean; route?: string },
): RenderResult & { user: UserEvent };

// The MSW server, for per-test overrides: server.use(http.post(...)).
export const server: SetupServer;
```

The setup file starts the server, resets handlers and storage after each test, fixes the clock, and fails any test that made an unmocked request.

## Known issues

A test that fails because of an existing app problem is marked:

```ts
test.fail(testInfo.project.name === "phone", "KI-001: menu button does not open the navigation");
```

and the same id is added to `tests/KNOWN_ISSUES.md` (FR-016). Do not use `skip` or `fixme` for this.
