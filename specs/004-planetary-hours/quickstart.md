# Quickstart: Validating Planetary Hours on Daily

How to confirm the feature works once implemented. The endpoint is in [contracts/planetary-hours-api.md](./contracts/planetary-hours-api.md); expected UI behaviour is in [contracts/planetary-hours-ui.md](./contracts/planetary-hours-ui.md); the fixture and its expected values are in [data-model.md](./data-model.md).

## Prerequisites

- Node 24 (`nvm use`), `npm install`, `npx playwright install chromium`
- Steps 1 to 4 need no backend. Step 5 needs the backend running with the planetary hours endpoint, and an account with a saved location.

## 1. Integration tests (US1 to US3, SC-002, SC-003, SC-005, SC-006)

```sh
npm test
```

Expected: every test passes, including those from before. `planetary-hours.test.tsx` is new; `ascendant-timeline.test.tsx` has new column tests; `page-daily.test.tsx` expects seven widgets. The run takes no more than a few seconds longer than before (about 8 seconds on 2026-10-03).

Check coverage against the spec: each acceptance scenario of User Stories 1 and 2 that does not depend on layout, and each edge case, maps to at least one test.

## 2. A broken behaviour is caught (US3 independent test)

Temporarily take the widget's day ruler from the response's top-level `dayRuler` instead of the current hour's, and run `npm test -- planetary-hours`.

Expected: the before-sunrise test fails and its name says so. Revert the change.

## 3. The Daily journey passes at phone and desktop (FR-022)

```sh
npm run test:e2e -- daily
```

Expected: `daily` passes at `phone` and `desktop`, including the new step (the Planetary Hour widget shows the Saturn hour; the timeline's current hour block is in view). The number of browser tests is unchanged.

Then run everything once: `npm run test:e2e`.

## 4. Layout review (standing acceptance criterion, SC-007)

```sh
npm run review:layout
```

A Claude review subagent reads the Daily and Transits captures at 320, 390, 768, 1280 and 1920 wide, including the Daily state with planetary hours unavailable. It looks for sideways scrolling, clipped or overlapping content in the widget and the four-column timeline, conjunction markers that are hard to tap, and unreadable symbols or captions. Fix what it finds, capture again, and repeat until a round finds nothing. Record the rounds here.

Rounds on 2026-10-03 (9 Daily and Transits images at each of the five sizes; no page wider than its screen in `charts-widths.json` at any size):

| Round | Findings | Action |
|-------|----------|--------|
| 1 | Hour tile text wrapped at 320 and 390 ("Night" and "AM" on their own lines); Day tile mostly empty at every size; SUNRISE caption faint; Moon and Mars symbols fainter than the others in the hour column; marker tick looked grey | Tiles stack symbol above text below 640 wide and detail lines no longer wrap; Day tile shows "Until sunrise" and its time; caption darkened |
| 2 | Wrapping and empty tile resolved at all sizes; tick finding withdrawn (no difference from the three-column timeline); no new problems; Moon and Mars symbols still fainter | Hour column symbols made bolder and darker. The thin strokes are the font's own glyphs for ☽ and ♂; not re-reviewed |

Not seen by the review: the SUNSET caption, because the captures show the timeline around 07:00 only.

## 5. Against the real backend (SC-001, SC-004)

```sh
npm run dev
```

Sign in and open Daily.

- The Planetary Hour widget names a day ruler and an hour ruler. Compare with the endpoint's answer for today: the hour is the last one that started before now, and the day ruler is that hour's `dayRuler`.
- In "Ascendant Today", the NOW line crosses the block of the same planet as the widget's hour.
- If it is before sunrise, the day ruler is yesterday's.
- Leave the page open across an hour boundary: the widget changes within a minute.
- Open Transits: the timeline has the planetary hour column.

## 6. Checks

```sh
npm run lint
npm run build
```

Expected: both pass.
