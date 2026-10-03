# Contract: Test Harness Additions

Changes to the harness defined in [the pilot contract](../../001-test-setup-pilot/contracts/test-harness.md). Everything not listed here is unchanged.

## Commands

| Command | Does | Requirement |
|---------|------|-------------|
| `npm test` | Now also runs the profile and navigation integration tests | FR-001 |
| `npm run test:e2e` | Now also runs the profile journey, at `phone` and `desktop` as before | FR-008 |
| `npm run review:layout` | Captures screenshots of the profile screen in every state at all five sizes into `test-results/layout-review/`, for the review subagent. Not a test: it asserts nothing about layout. | FR-019 |

## Shared mocks (`tests/mocks/`)

```ts
// New fixtures.
export const customBirthProfiles: BirthProfile[];
export const savedSettings: AstrologySettings;
export const defaultSettings: AstrologySettings;

// New scenario name.
export type ScenarioName = "newAccount" | "withProfile" | "withCustomProfiles";

// Handlers are exported so a test can override one response.
export function getSettings(data?: Partial<AstrologySettings>): RequestHandler;
export const PLACE_SEARCH_URL: string;
```

## Mocked endpoints

| Method | URL | Default response | Status |
|--------|-----|------------------|--------|
| POST | `{API_URL}/birth-profiles` | Request body plus `id: 100`, 201 | Changed (was `id: 1`) |
| PUT | `{API_URL}/birth-profiles/:id` | Request body plus the id from the URL | New |
| DELETE | `{API_URL}/birth-profiles/:id` | 204, no body | New |
| GET | `{API_URL}/settings` | `{}` unless given data | Changed (takes data) |
| PUT | `{API_URL}/settings` | Request body | New |
| POST | `{API_URL}/settings/reset` | `defaultSettings` | New |

All are part of every scenario.

## Integration test helper (`tests/integration/render.tsx`)

`renderWithApp` now also wraps `ui` in the real `ChartSettingsProvider`, in the same order as `src/main.tsx`, and takes one more option:

```ts
// Responses that replace the scenario's from the first request on. Needed for anything
// the providers fetch on mount, where a later server.use() would race with the request.
handlers?: RequestHandler[];
```

After each test the setup file also clears react-hot-toast's toasts, which live in a module-level store.

## Profile test helpers (`tests/integration/profile.tsx`)

```ts
// Renders <Profile /> and waits until the user, birth profiles and settings have loaded.
export function renderProfile(scenario?: ScenarioName, handlers?: RequestHandler[]): Promise<RenderResult & { user: UserEvent }>;

// Queries scoped to one card of the page.
export function section(name: "Account Info" | "My Birth Info" | "Custom Profiles" | "Chart Default Settings"): BoundFunctions;

// Records what the app sends to one endpoint, answering as the default mocks do.
export function capture(method: "put" | "post" | "delete", path: string): { body: unknown; id?: string }[];

// Makes one endpoint answer 422 with { error }.
export function reject(method: "put" | "post" | "delete", path: string, error: string): void;
```

## Browser tests

`playwright.config.ts` and `tests/e2e/devices.ts` are unchanged: two projects, `phone` (390 x 844) and `desktop` (1280 x 800). There is no automated layout test.

## Review capture (`tests/review/`)

- Own Playwright config, so `npm run test:e2e` never runs it.
- Uses the same fixtures and mocks as the browser tests.
- The five review sizes are defined in `tests/review/sizes.ts`.
- Output: `test-results/layout-review/<size>/<state>.png`, overwritten on each run, plus `widths.json` per size recording the page width and screen width in each state (a page wider than the screen scrolls sideways). The capture records these; it does not assert on them.
- States are listed in [research.md](../research.md) item 6.

## Known issues

- KI-001 is removed from `tests/KNOWN_ISSUES.md`, and its `test.fail` marker is removed from `tests/e2e/new-account-modal.spec.ts` (FR-016, SC-007).
- Integration tests mark an unfixable problem with Vitest's `test.fails`, with the same `KI-00N` id recorded in `tests/KNOWN_ISSUES.md`.
