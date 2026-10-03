# Known issues

Problems in the app that a test exposes and that have deliberately not been fixed yet.
A test affected by one is marked with `test.fail(<condition>, "KI-00N: ...")`, so it is
reported as an expected failure instead of an unexpected one, and Playwright flags it
if it starts passing (at which point remove the marker and the row below).

Do not use `test.skip` or `test.fixme` for this: the check would stop running.

| Id | Screen | Device size | What is wrong | Exposed by |
|----|--------|-------------|---------------|------------|
| KI-001 | Every signed-in page (top navigation) | phone (390 x 844) | The navbar's five links do not wrap or collapse, so it is 503px wide in a 390px viewport. The whole page becomes wider than the screen. In the new-account modal this puts "Get Started" partly off-screen (x 348 to 464), so the form cannot be submitted without panning sideways. | `tests/e2e/new-account-modal.spec.ts` |
