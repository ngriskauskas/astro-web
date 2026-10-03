# Quickstart: Validating Main Chart Page Tests and Responsive Layout

How to prove the feature works end to end. Commands and helpers are in [contracts/test-harness.md](./contracts/test-harness.md); expected UI behaviour is in [contracts/chart-pages-ui.md](./contracts/chart-pages-ui.md); requests and fixtures are in [data-model.md](./data-model.md).

## Prerequisites

- Node 24 (`nvm use`), `npm install`, `npx playwright install chromium`
- No backend and no `.env` values are needed. Stop any backend first.

## 1. Integration tests cover the drawer, the widgets and the pages (US1 to US3, SC-001, SC-002, SC-011)

```sh
npm test
```

Expected: every test passes in under 20 seconds, including the profile and navigation tests from before. New files: three `drawer*`, eight widget files, five `page-*`, and `chart-guards`.

Check coverage against the spec: each acceptance scenario in User Stories 1 (16), 2 (31) and 3 (18) maps to at least one test. Any test marked as an expected failure has a matching row in `tests/KNOWN_ISSUES.md` and a reason it cannot be fixed in this repo; none is expected.

## 2. A broken behaviour is caught (SC-005)

Temporarily make one change, for example make `close()` in `src/contexts/DescContext.tsx` keep the history, and run `npm test`.

Expected: at least one test fails, and its name identifies the behaviour. Revert the change. Repeat once for a widget (for example, stop hiding Lilith in the matrix).

## 3. Five page journeys pass at phone and desktop (US4, SC-003, SC-004)

```sh
npm run test:e2e
```

Expected, in under 60 seconds, with no expected failures:

| Test                | phone | desktop |
| ------------------- | ----- | ------- |
| `new-account-modal` | pass  | pass    |
| `profile`           | pass  | pass    |
| `charts`            | pass  | pass    |
| `moment`            | pass  | pass    |
| `daily`             | pass  | pass    |
| `transits`          | pass  | pass    |
| `synastry`          | pass  | pass    |

On phone each journey reaches its page through the menu, the drawer covers the screen while open, and the page is no wider than the screen at the end.

Count the browser test files added by this work: exactly five.

## 4. Failure and missing-data behaviour by hand (FR-014, FR-015, SC-008, SC-009)

With `npm run dev` and a real account:

- Sign in as a user with only their own birth profile and open Synastry: the "second profile" message and the link to Profile are shown; the other four pages work.
- Stop the backend, then open Charts: the wheel, matrix and placements each say the chart could not be loaded, with no endless loading text. The navigation still works.
- With the backend running, open Daily, block `/descriptions` in the browser's network tools, and select a planet: the drawer opens, shows the general information, and says the description could not be loaded. Back and Close work.

## 5. Drawer behaviour by hand (FR-016, FR-016a, FR-020)

- On Charts, select a planet, then a sign inside the drawer, then Close. Select another planet and press Back: the drawer closes.
- With the drawer open on a wide window, change the profile in Chart Settings: the drawer closes.
- On Daily, leave the drawer open for over a minute: it stays open.
- Narrow the window below 768px with the drawer open: it fills the screen, and the page behind does not scroll.
- Escape and clicking outside do not close it.

## 6. Navigation (FR-016b)

The bar and the phone menu show Charts, Moment, Daily, Transits, Synastry, Profile and Logout, and no Friends entry.

## 7. Review subagent finds no layout problems (US5, FR-027, FR-028, SC-006, SC-010)

This is the only check of layout at the five supported widths: 320, 390, 768, 1280 and 1920.

```sh
npm run review:layout
```

Expected: `test-results/layout-review/` contains one folder per size, each with the profile images from before plus one image per chart-page state, `profile-widths.json`, and `charts-widths.json`. No captured state should have a page wider than its screen.

Then have a Claude review subagent read every chart-page screenshot and report, per size and state, any sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls, or unreadable text. Ask it to judge specifically:

- whether aspect matrix symbols are legible at 320 and 390 (cells are about 16 and 20px);
- whether the wheel is whole and round with no large gap beneath it;
- whether the drawer's Back and Close are visible at every size.

Fix what it reports, re-run the capture, and repeat until it reports none. Record the rounds below.

## 8. Nothing else regressed (FR-026)

```sh
npm run lint
npm run build
```

Expected: both succeed. The build also confirms the unreachable pages that share chips and previews (`Time`, `ViewSelector`) still compile.

## Layout review record

To be filled in during implementation: date, rounds, images reviewed, problems found and fixed, anything accepted and why.
