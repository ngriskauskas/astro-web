# Data Model: Test Setup Pilot

The feature stores nothing. Its "data" is the mock data the tests run against and the configuration that drives them. Shapes mirror the app's existing types; fixtures are typed against them so drift is caught by the compiler.

## Fixture data (`tests/mocks/data.ts`)

| Fixture | App type | Purpose |
|---------|----------|---------|
| `user` | `User` (`src/contexts/AuthContext.tsx`) | The signed-in user returned by `GET /me`. Has a default location (New York City). |
| `mainBirthProfile` | `BirthProfile` (`src/contexts/BirthProfilesContext.tsx`) | A complete main profile (`isMain: true`). |
| `places` | Nominatim result (`place_id`, `display_name`, `lat`, `lon`) | Fixed results for the birth place search. |
| `settings` | Partial `AstrologySettings` | Returned by `GET /settings`; an empty object is valid because the app merges it over defaults. |

Rules:

- Fixtures are plain, immutable objects. Tests that need a variation spread a fixture and override fields; they never mutate it.
- IDs, dates, and coordinates are fixed literals. Nothing is generated from the current time or at random (FR-012).

## Scenario (`tests/mocks/scenarios.ts`)

A scenario is a named situation the backend is in. It resolves to a list of MSW handlers.

| Scenario | `GET /me` | `GET /birth-profiles` | Notes |
|----------|-----------|-----------------------|-------|
| `newAccount` | `user` | `[]` | No main profile, so the new-account modal is shown. `POST /birth-profiles` echoes the submitted body with `id: 1`. |
| `withProfile` | `user` | `[mainBirthProfile]` | Modal is not shown. |

Both scenarios also include `GET /settings`, `PUT /me` (echoes merged user), and the place search handler.

State within a test: `newAccount` → (successful `POST /birth-profiles`) → the app holds a main profile and the modal closes. The mock backend itself is stateless; that transition lives in the app's own state.

## Handler override

A one-off handler supplied by a single test (different data, an error status, or a delay). It takes precedence over the scenario's handlers and is discarded when the test ends (FR-004).

## Captured request

A record of what the app sent, used to assert on outgoing data (FR-017).

| Field | Meaning |
|-------|---------|
| `method` | HTTP method |
| `url` | Full request URL |
| `body` | Parsed JSON body, if any |

## Unmocked request

A request to anything other than the app's own origin that matched no handler. Recorded as `method` + `url`; a non-empty list fails the test (FR-005).

## Device size profile (`tests/e2e/devices.ts`)

| Field | Meaning |
|-------|---------|
| `name` | `phone` or `desktop`; also the Playwright project name |
| `viewport` | Width and height in CSS pixels |
| `isMobile`, `hasTouch`, `deviceScaleFactor` | Emulation flags |

See [research.md](./research.md#8-device-sizes-fr-007-fr-008-fr-009) for the values.

## Known issue (`tests/KNOWN_ISSUES.md`)

| Field | Meaning |
|-------|---------|
| `id` | `KI-001`, `KI-002`, ... referenced from the test's `test.fail` reason |
| Screen | Where the problem appears |
| Device size | Which profile(s) are affected |
| Description | What is wrong |
| Test | The test that exposes it |
