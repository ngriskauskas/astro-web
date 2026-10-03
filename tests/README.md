# Tests

Two layers, one set of mocks. Nothing here needs a backend, an account, or internet.

| Layer       | Tool                                   | Lives in             | Use it for                                                                                                         |
| ----------- | -------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Integration | Vitest + React Testing Library (jsdom) | `tests/integration/` | Most tests: a component or screen with the real providers, including error and edge cases. Runs in about a second. |
| Browser     | Playwright (Chromium)                  | `tests/e2e/`         | One happy-path journey per page, run at each device size.                                                          |
| Mocks       | MSW                                    | `tests/mocks/`       | Backend and outside-service responses, shared by both layers.                                                      |

## Setup

```sh
nvm use                           # Node 24, from .nvmrc
npm install
npx playwright install chromium   # one-time browser download
```

## Commands

| Command                                 | Does                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `npm test`                              | All integration tests, once                                                                 |
| `npm run test:watch`                    | Integration tests in watch mode                                                             |
| `npm test -- new-account-modal`         | One integration test file                                                                   |
| `npm run test:e2e`                      | Starts the app on port 5174 and runs browser tests at every device size                     |
| `npm run test:e2e -- --project=phone`   | One device size                                                                             |
| `npm run test:e2e -- new-account-modal` | One browser test file                                                                       |
| `npx playwright show-report`            | Open the last browser report (screenshot and trace for each failure)                        |
| `npm run review:layout`                 | Capture screenshots for the layout review (see [Layout review](#layout-review)); not a test |

Measured on 2026-10-03: `npm test` about 8 seconds (195 tests), `npm run test:e2e` about
8 seconds (7 journeys at 2 sizes).

The browser tests start their own dev server on port 5174 with a fake API URL, so it does
not matter whether your normal dev server is running.

## Mocks

- `mocks/data.ts`: fixture objects, typed against the app's own types. Fixed values only.
- `mocks/charts.ts`: chart fixtures, built from zodiac longitudes so each chart's positions,
  signs and houses agree. Aspects are listed by hand, as the backend would return them.
- `mocks/timings.ts`: daily, weekly and moon timings for the frozen day and week.
- `mocks/handlers.ts`: one MSW handler per endpoint.
- `mocks/scenarios.ts`: named backend situations built from handlers.

| Scenario             | Meaning                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `newAccount`         | Signed-in user with no birth info (the new-account modal is shown) |
| `withProfile`        | Signed-in user with a complete main birth profile                  |
| `withCustomProfiles` | The same user with three profiles for other people as well         |
| `noLocation`         | A main birth profile, but no location entered                      |

Every scenario also answers the chart, timing and description endpoints. The description
mock returns `describeContext(context)`: a sentence naming what was asked for, so a test
can check that the right request reached the right place without a fixture per item.

To mock a new endpoint: add fixture data to `data.ts`, a handler to `handlers.ts`, and
include it in `common()` (or in one scenario) in `scenarios.ts`.

To add a scenario: add its name to `ScenarioName` and an entry to `scenarios`.

### "Requests with no mock"

Any request that leaves the app without a matching handler fails the test and is named
in the error. Fix it by adding a handler; never let a test reach a real server.

## Add an integration test

Create `tests/integration/<name>.test.tsx`:

```tsx
import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderWithApp } from "./render";

test("shows something", async () => {
  const { user } = renderWithApp(<MyComponent />, { scenario: "withProfile" });
  await user.click(await screen.findByRole("button", { name: "Save" }));
  expect(await screen.findByText("Saved")).toBeInTheDocument();
});
```

`renderWithApp` wraps the component in the real `AuthProvider`, `BirthProfilesProvider` and
`ChartSettingsProvider` with a memory router and the toast container, and starts signed in (`signedIn: false` to
start signed out). A component that needs another provider should have it added in
`render.tsx`.

Override a response for one test (it resets afterwards):

```tsx
import { http, HttpResponse } from "msw";
import { API_URL } from "../mocks";
import { server } from "./setup";

server.use(
  http.post(`${API_URL}/birth-profiles`, () =>
    HttpResponse.json({ error: "Birth date is invalid" }, { status: 422 }),
  ),
);
```

To replace a response the app asks for as soon as it loads (birth profiles, settings), pass
it to `renderWithApp` instead, so it is in place before the first request:

```tsx
renderWithApp(<Profile />, { scenario: "withProfile", handlers: [getSettings(savedSettings)] });
```

Profile page tests share helpers in `integration/profile.tsx`: `renderProfile()` renders the
page and waits for its data, and `section("Account Info")` scopes queries to one card.

`integration/requests.tsx` has three helpers that work before or after rendering:

| Helper                             | Does                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `capture("post", "/charts/natal")` | Records what the app sends; the usual mock still answers                                                                                 |
| `reject("post", "/charts/natal")`  | Makes the endpoint fail                                                                                                                  |
| `hold("post", "/descriptions")`    | Delays the answer until `release()`, for loading states; `{ once: true }` holds only the first request, so it arrives after the next one |

### Chart pages

`integration/charts.tsx` renders one of the five chart pages behind the app's own route
guards and waits for the wheel:

```tsx
const { user } = await renderChartPage("daily"); // scenario: withCustomProfiles
await user.click((await wheel()).getByRole("button", { name: "Moon" }));
expect(drawer.title()).toBe("Moon");
await drawer.close(user);
widget("Weekly Timings").getByRole("button", { name: "Timeline" });
```

`widget(name)` scopes queries to one widget by its heading, `wheel()` to the chart wheel,
and `drawer` to the description drawer. Pass `wait: false` for loading, failure and
redirect tests, `search: "?date=2026-03-01"` for a link, and `handlers: [...]` to replace a
response the page asks for on load.

Everything a user can select has a role and a name: wheel items are buttons named "Sun",
"Mercury, retrograde", "Aries", "1st House", "Ascendant" (on two-chart pages with the
chart's owner: "Sun, Mum"), matrix cells are "Saturn Trine Sun", and so on. Find things
that way; there are no test ids.

Each shared widget is tested once, on one page: one-chart widgets on Charts, two-chart
widgets on Synastry, timing widgets on Daily. The `page-*.test.tsx` files cover only what
is particular to a page. Keep it that way when adding tests.

The one-minute refresh on Daily needs a fake interval; see `fakeTheMinuteTimer()` in
`integration/page-daily.test.tsx`. Everything else keeps real timers.

## Add a browser test

Create `tests/e2e/<name>.spec.ts`. Import `test` and `expect` from `./fixtures`, not from
`@playwright/test`; that is what provides the mocks, the session, and the guards.

```ts
import { expect, test } from "./fixtures";

test.use({ scenario: "withProfile" });

test("opens the profile page", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Account Info" })).toBeVisible();
});
```

Fixtures available to every browser test:

| Fixture             | Use                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------- |
| `scenario` (option) | `test.use({ scenario: "withProfile" })`; default `newAccount`                          |
| `signedIn` (option) | `test.use({ signedIn: false })` to start signed out                                    |
| `network`           | `network.use(http.get(...))` overrides a response for this test                        |
| `requests`          | `requests.to("POST", "/birth-profiles")` returns what the app sent, with parsed bodies |

Keep browser tests to happy paths. Error handling and variations belong in integration tests.

**One journey per page.** The number of browser tests follows the number of pages, not the
number of widgets. When a page gains a widget, add a step to that page's journey (open it,
select one thing, see the drawer) and cover its behaviour with integration tests. Do not
add a browser test for it. The chart-page journeys share their steps in `e2e/chart-page.ts`.

## Device sizes

Defined once in `e2e/devices.ts` (`phone` 390 x 844, `desktop` 1280 x 800). Every browser
test runs at each size and is reported per size. Add a size by adding an entry there.

Where the UI differs by size, branch on what is on screen, not on the project name:

```ts
if (await menuButton.isVisible()) await menuButton.click();
```

## Layout review

Layout is not asserted by any test. Before a feature that changes what users see is
complete, a Claude review subagent looks at the screens it touches at five sizes, defined
in `review/sizes.ts`: 320, 390, 768, 1280 and 1920 wide.

```sh
npm run review:layout
```

runs the capture files in `tests/review/` (`*.capture.ts`) with the same mocks as the
browser tests and writes `test-results/layout-review/<size>/<page>-<state>.png`, plus
`profile-widths.json` and `charts-widths.json` per size giving the page width next to the
screen width for each state. The reviewer reads every image and reports problems; fix them,
capture again, and repeat until the review is clean. To cover another screen, add a capture
file next to `profile.capture.ts` and `charts.capture.ts`, with its own file-name prefix.

Native date and time picker popups are drawn by the browser and do not appear in
screenshots.

## Determinism

Both layers freeze `Date` at 2026-01-15T12:00:00Z and use the `America/New_York` time zone
and `en-US` locale. Timers still run. Retries are off, so a flaky test shows as a failure.

## Known issues

When a test fails because of an existing problem in the app that is not being fixed now,
mark it and record it in [KNOWN_ISSUES.md](./KNOWN_ISSUES.md):

```ts
// Browser test
test.fail(testInfo.project.name === "phone", "KI-002: save button is off-screen");
// Integration test
test.fails("KI-003: saves the timezone of the picked place", async () => { ... });
```

It is then reported as an expected failure, and flagged when it starts passing.
Do not use `skip` or `fixme`.

## Things that differ from a real browser session

- Chromium runs with web security disabled, because mocked responses come from a fake
  API host without CORS headers. The backend's CORS configuration is not tested here.
- Google's sign-in script is replaced by an empty script, so the Google button does not work.
- jsdom has no layout: integration tests cannot check sizes, overflow, or visibility that
  depends on CSS. Use `toBeInTheDocument()`, and a browser test for anything visual.
