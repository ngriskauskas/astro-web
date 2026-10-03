# Quickstart: Validating the Test Setup Pilot

How to prove the pilot works end to end. Helper and command details are in [contracts/test-harness.md](./contracts/test-harness.md); mock data is described in [data-model.md](./data-model.md).

## Prerequisites

- Node 24 (`nvm use`; the repo's `.nvmrc` selects it, and `nvm install` fetches it if missing). Node 20 and 25 do not satisfy the test tools' engine ranges.
- `npm install`
- `npx playwright install chromium` (one-time browser download)
- No backend, and no `.env` values, are needed.

## 1. Integration tests pass with no backend (US3, SC-001, SC-003)

```sh
npm test
```

Expected: 2 tests pass in under 10 seconds.

- The new-account modal is not rendered for a user who has a main profile.
- With `POST /birth-profiles` overridden to return an error, submitting the modal shows an error and the modal stays open.

## 2. Browser tests pass at every device size (US1, US2, SC-001, SC-002)

Stop any backend first, then:

```sh
npm run test:e2e
```

Expected: 1 test x 2 projects (`phone`, `desktop`) = 2 results, in under 1 minute, with no unexpected failures.

- `new-account-modal`: the modal blocks the app, the form is filled in, a birth place is picked from mocked search results, the submitted profile matches what was entered, the modal closes, and the Profile page is reachable through the navigation at that size.
- If `tests/KNOWN_ISSUES.md` lists a size at which the journey cannot be completed, that size is reported as an expected failure, not a pass and not an unexpected failure.

Run `npx playwright show-report` and confirm results are grouped by device size.

## 3. One size, one test (FR-009)

```sh
npm run test:e2e -- --project=phone
npm run test:e2e -- new-account-modal --project=desktop
```

Expected: only the named project (and file) runs.

## 4. An unmocked request fails the test (FR-005)

Temporarily remove the `GET /settings` handler from `tests/mocks/`, then run both commands.

Expected: tests fail with a message naming `GET http://api.astro.test/settings`. Restore the handler.

## 5. A responsive break is caught at the right size (SC-005)

Temporarily hide the menu button in `src/components/Navbar.tsx` (for example add the `hidden` class) and run `npm run test:e2e`.

Expected: `new-account-modal` fails on `phone` only, with a screenshot attached in the report. Revert the change.

## 6. Results are repeatable (SC-004)

```sh
for i in $(seq 10); do npm test || break; done
npm run test:e2e -- --repeat-each=10
```

Expected: identical results every run.

## 7. The app is unchanged (FR-015)

```sh
git diff --stat main -- src index.html
npm run build
```

Expected: no changes under `src/` or to `index.html` from this feature, and the build succeeds.

## 8. Someone else can extend it (US4, SC-006)

Following only `tests/README.md`, add one new test for a screen the pilot does not cover (for example the Profile page with the `withProfile` scenario), including any new handler it needs. Expected: done in under 30 minutes without editing the shared setup files.
