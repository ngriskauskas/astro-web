# Contract: Test Harness Additions

Changes to the harness defined in the [pilot contract](../../001-test-setup-pilot/contracts/test-harness.md) and extended by [`002`](../../002-profile-page-tests/contracts/test-harness.md). Everything not listed here is unchanged.

## Commands

| Command | Does | Requirement |
|---------|------|-------------|
| `npm test` | Now also runs the drawer, widget and chart-page integration tests | FR-001 |
| `npm run test:e2e` | Now also runs five page journeys, at `phone` and `desktop` | FR-010 |
| `npm run review:layout` | Now also captures the five chart pages and the drawer at all five sizes | FR-027 |

No new commands and no new dependencies.

## Shared mocks (`tests/mocks/`)

```ts
// charts.ts
export const natalChart: SingleChart;
export const otherNatalChart: SingleChart;
export const momentChart: SingleChart;
export const emptyAspectsChart: SingleChart;
export const transitChart: MultiChart;
export const synastryChart: MultiChart;

// timings.ts
export const dailyTimings: DailyTimingsType;
export const emptyDailyTimings: DailyTimingsType;
export const weeklyTimings: CurrentTimingsType;
export const emptyWeeklyTimings: CurrentTimingsType;
export const moonTimings: MoonTimingsType;

// data.ts
export const userWithoutLocation: User;
export const manyBirthProfiles: BirthProfile[]; // 20, some with long names

// scenarios.ts
export type ScenarioName = "newAccount" | "withProfile" | "withCustomProfiles" | "noLocation";

// handlers.ts: each takes the data to return, defaulting to the fixture above,
// so a test can override one response.
export function getMe(data?: User): RequestHandler;
export function natalChartFor(data?: SingleChart): RequestHandler;
export function genericChart(data?: SingleChart): RequestHandler;
export function transitChartFor(data?: MultiChart): RequestHandler;
export function synastryChartFor(data?: MultiChart): RequestHandler;
export function dailyTimingsFor(data?: DailyTimingsType): RequestHandler;       // both daily endpoints
export function weeklyTimingsFor(data?: CurrentTimingsType): RequestHandler;    // both weekly endpoints
export function moonTimingsFor(data?: MoonTimingsType): RequestHandler;
export function descriptions(): RequestHandler;
export const describeContext: (context: unknown) => string; // the text the mock returns for a context
```

## Mocked endpoints

All new, all part of every scenario.

| Method | URL | Default response |
|--------|-----|------------------|
| POST | `{API_URL}/charts/natal` | `natalChart` when `birthProfileId` is 1, else `otherNatalChart` |
| POST | `{API_URL}/charts/generic` | `momentChart` |
| POST | `{API_URL}/charts/transit` | `transitChart` |
| POST | `{API_URL}/charts/synastry` | `synastryChart` |
| POST | `{API_URL}/timing/daily` | `dailyTimings` |
| POST | `{API_URL}/timing/daily-transit` | `dailyTimings` |
| POST | `{API_URL}/timing/current` | `weeklyTimings` |
| POST | `{API_URL}/timing/transit` | `{ aspects: weeklyTimings.aspects }` |
| POST | `{API_URL}/timing/current-moon` | `moonTimings` |
| POST | `{API_URL}/descriptions` | `{ description: describeContext(context), cached: false, contextType: context.type }` |

`GET {API_URL}/me` is unchanged by default; the `noLocation` scenario returns `userWithoutLocation`.

## Integration helpers

`tests/integration/render.tsx`: `renderWithApp` now also wraps `ui` in the real `ChartProvider`, in the same order as `src/main.tsx`.

`tests/integration/requests.tsx` (moved out of `profile.tsx`, which re-exports them):

```ts
// Records what the app sends to one endpoint; the scenario's handler still answers.
export function capture(method: "put" | "post" | "delete", path: string): { body: unknown; id?: string }[];
// Makes one endpoint answer 422 with { error }.
export function reject(method: "put" | "post" | "delete", path: string, error?: string): void;
// Holds one endpoint's response until release() is called, to test loading states
// and out-of-order responses.
export function hold(method: "post", path: string, options?: { once?: boolean }): { release: () => void };
```

All three work whether they are called before or after the page is rendered.

`tests/integration/charts.tsx`:

```ts
type ChartPage = "charts" | "moment" | "daily" | "transits" | "synastry";

// Renders the page inside the same route guards as src/main.tsx, with a stub profile
// route, and waits until the wheel has drawn. `wait: false` returns straight away,
// for loading, failure and redirect tests.
export function renderChartPage(
  page: ChartPage,
  options?: { scenario?: ScenarioName; handlers?: RequestHandler[]; search?: string; wait?: boolean },
): Promise<RenderResult & { user: UserEvent }>;

// Queries scoped to one widget region, by its heading.
export function widget(name: string): BoundFunctions;

// The drawer, or null when closed; and the usual actions on it.
export const drawer: {
  get(): BoundFunctions;           // throws when closed
  isOpen(): boolean;
  title(): string;
  back(user: UserEvent): Promise<void>;
  close(user: UserEvent): Promise<void>;
};
```

Default scenario for `renderChartPage` is `withCustomProfiles`.

## Browser tests

`playwright.config.ts` and `tests/e2e/devices.ts` are unchanged. New files:

| File | Content |
|------|---------|
| `tests/e2e/chart-page.ts` | Shared steps: `openFromNav(page, name)`, `drawer(page)` (locators for the region, title, Back, Close), `expectNoSidewaysScroll(page)`, `expectDrawerCoversScreen(page)` |
| `tests/e2e/charts.spec.ts`, `moment.spec.ts`, `daily.spec.ts`, `transits.spec.ts`, `synastry.spec.ts` | One test each |

Rule recorded in `tests/README.md` (FR-013): one journey per page. A new widget adds a step to its page's journey and integration tests; it does not add a browser test.

## Review capture (`tests/review/`)

`charts.capture.ts` is added next to `profile.capture.ts`, using the same config, fixtures and `reviewSizes`. Output goes to `test-results/layout-review/<size>/<page>-<state>.png` and `charts-widths.json`. The profile capture's file names gain a `profile-` prefix (and its widths go to `profile-widths.json`) so the two do not collide.

States are listed in [research.md](../research.md) item 16.

## Existing tests that change

| File | Change |
|------|--------|
| `tests/integration/navbar.test.tsx` | Destination list loses "Friends" (seven entries) |
| `tests/integration/profile.tsx` | `capture` and `reject` re-exported from `requests.tsx` |
| `tests/review/profile.capture.ts` | File-name prefix; clears only its own images |

## Known issues

No new known issues are expected: every behaviour problem in [research.md](../research.md) item 6 is fixable in this application. If one turns out to need a backend change, it is recorded in `tests/KNOWN_ISSUES.md` with `test.fails` (integration) or `test.fail` (browser), as before.
