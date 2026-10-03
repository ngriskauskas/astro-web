# Known issues

Problems in the app that a test exposes and that have deliberately not been fixed yet.
A test affected by one is marked with `test.fail(<condition>, "KI-00N: ...")`, so it is
reported as an expected failure instead of an unexpected one, and Playwright flags it
if it starts passing (at which point remove the marker and the row below).

Do not use `test.skip` or `test.fixme` for this: the check would stop running.

| Id | Screen | Device size | What is wrong | Exposed by |
|----|--------|-------------|---------------|------------|

None at present.
