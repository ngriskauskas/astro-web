# Quickstart: Validating Profile Page Tests and Responsive Layout

How to prove the feature works end to end. Commands and helpers are in [contracts/test-harness.md](./contracts/test-harness.md); expected UI behaviour is in [contracts/profile-ui.md](./contracts/profile-ui.md); fixtures and sizes are in [data-model.md](./data-model.md).

## Prerequisites

- Node 24 (`nvm use`), `npm install`, `npx playwright install chromium`
- No backend and no `.env` values are needed. Stop any backend first.

## 1. Integration tests cover the profile screen (US1, SC-001, SC-002, SC-008)

```sh
npm test
```

Expected: every test passes in under 10 seconds, with files for account info, birth info, custom profiles, chart settings, place search and the navigation.

Check coverage against the spec: each of the 24 acceptance scenarios in User Story 1 maps to at least one test. Any test marked as an expected failure has a matching row in `tests/KNOWN_ISSUES.md` and a reason it cannot be fixed in this repo.

## 2. A broken behaviour is caught (SC-004)

Temporarily make one change in `src/components/profile/`, for example stop sending the birth place when saving, and run `npm test`.

Expected: at least one test fails, and its name identifies the behaviour. Revert the change.

## 3. Browser journey passes at phone and desktop (US2, SC-003)

```sh
npm run test:e2e
```

Expected, in under 60 seconds, with no expected failures:

| Test | phone | desktop |
|------|-------|---------|
| `new-account-modal` | pass (was an expected failure) | pass |
| `profile` | pass | pass |

On phone, the profile journey opens the menu to reach Profile.

## 4. The pilot's known issue is closed (SC-007)

- `tests/KNOWN_ISSUES.md` has no KI-001 row.
- `tests/e2e/new-account-modal.spec.ts` has no `test.fail` marker.
- No test is marked as an expected failure for a layout reason.

## 5. Review subagent finds no layout problems (FR-019, FR-020, SC-005, SC-010)

This is the only check of layout at 320, 768 and 1920 wide; there is no automated layout test.

```sh
npm run review:layout
```

Expected: `test-results/layout-review/` contains one folder per size, each with one screenshot per state.

Then have a Claude review subagent read every screenshot and report, per size and state, any sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls, or unreadable text. Fix what it reports, re-run the capture, and repeat until it reports none.

## 6. Behaviour changes work by hand (FR-018a, FR-018b)

With `npm run dev` and a real account, on the profile screen:

- Open a custom profile, choose Delete, then Cancel: the profile is still there. Delete then Confirm: it is removed.
- Change the birth place text without picking a suggestion and save: nothing is saved and you are told to pick a place.
- On a narrow window, the bar shows only the logo and the menu button, and the menu lists all eight destinations.

## 7. Nothing else regressed (FR-017, FR-018)

```sh
npm run lint
npm run build
```

Expected: both succeed. Open one other signed-in screen (for example Charts) at phone and desktop width and confirm the navigation works and the page is no wider than the screen because of the bar.

## Layout review record

2026-10-03, by a Claude review subagent reading every screenshot from `npm run review:layout` at 320, 390, 768, 1280 and 1920 wide.

- Round 1 (47 images): no sideways scrolling and no blockers. One major problem at every size (place suggestions stayed open after leaving the field and covered the Save button) and several minor ones (uneven aspect rows at 320, small tap targets, no close control in the menu, toast position). All fixed.
- Round 2 (52 images): fixes confirmed; 768, 1280 and 1920 clean. One side effect at 320 ("Unknown time?" dropping to its own line in My Birth Info) was fixed afterwards and checked directly in a fresh capture, not by a third subagent round.
- Accepted, not fixed: at 320 and 390 an open suggestion list extends past the bottom of its card while the field has focus; at 320 a toast shown with the page at the top briefly overlaps the last letter of the "Account Info" heading. Both are transient overlays that cover no control.
