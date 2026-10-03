# Feature Specification: Test Setup Pilot

**Feature Branch**: `001-test-setup-pilot`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to prove out a testing setup, with primarily integration and playright tests in place, mocking backend data, and ensuring things work in a responsive way across various standard device sizes. for this i want a minimal implementation with just a couple tests to prove out the pattern before we go detail out all the real tests"

## Clarifications

### Session 2026-10-03

- Q: If the pilot tests reveal that the app's layout is already broken at phone or tablet size, should fixing the app be part of this work? → A: No. Keep the failing test, record it as a known issue, and do not fix the app layout in the pilot. The pilot stays a minimal set of tests to prove the pattern; comprehensive coverage comes later once the pattern is accepted.
- Q: Which single user journey should the pilot browser test walk through? → A: A signed-in user with no birth info sees the blocking new-account modal, fills it in, and reaches the app.
- Q: The new-account modal looks up the birth place by calling a public map search service directly from the browser; how should the tests handle that call? → A: Mock it like the backend. The place search returns fixed fake results, and any unmocked outside call fails the test.
- Q: How many browser tests and device sizes should the pilot have? → A: As few as possible: one happy-path browser journey, run at one desktop size and one phone size. No tablet size and no separate layout-check test in the pilot; error cases are covered by the integration tests. A known issue is recorded only if the journey itself cannot be completed at a size.

## User Scenarios & Testing *(mandatory)*

The "users" of this feature are the developers of the application. The feature delivers a working, minimal testing pattern they can evaluate and then extend into full coverage. It deliberately does not deliver broad test coverage.

### User Story 1 - Run a browser test against the app with no real backend (Priority: P1)

A developer runs a single command and a real browser exercises one meaningful journey through the application: a signed-in user who has no birth info is shown the blocking new-account modal, fills it in, and reaches the app. Every piece of backend data the app asks for during that journey is supplied by predefined mock data, so the test passes on a machine with no backend running and no real account.

**Why this priority**: This is the core of the pattern. If the app cannot be driven end to end with mocked backend data, nothing else in the setup is worth building on.

**Independent Test**: With the backend stopped and no network access to it, run the browser test command and confirm the journey passes and the page shows the values from the mock data.

**Acceptance Scenarios**:

1. **Given** the backend is not running, **When** the developer runs the browser test command, **Then** the test completes and the journey passes.
2. **Given** a test that starts as a signed-in user, **When** the app loads, **Then** the user reaches the signed-in experience without going through a real sign-in provider.
3. **Given** mock data describing a signed-in user with no birth info, **When** the app loads, **Then** the new-account modal is shown and the rest of the app cannot be used until it is completed.
4. **Given** the modal is shown, **When** the user fills in their birth info, picks a birth place from the mocked search results, and submits, **Then** the details sent to the backend match what was entered, the modal closes, and the app becomes usable.
5. **Given** the app makes a backend request that has no mock defined, **When** the test runs, **Then** the test fails with a message identifying the unmocked request rather than silently reaching a real server.

---

### User Story 2 - Verify the same journey across standard device sizes (Priority: P2)

A developer runs the browser tests and the journey is executed at two standard device sizes (one phone, one desktop). The results show, per device size, whether the journey could be completed, so a responsive regression at one size is visible as a failure attributed to that size.

**Why this priority**: Responsive behaviour is an explicit goal of the setup, but it builds on Story 1: there has to be a working browser test before it can be repeated across sizes.

**Independent Test**: Run the browser tests and confirm the report lists a separate result for each device size; deliberately make the journey impossible at phone width (for example hide the menu button) and confirm only the phone result fails.

**Acceptance Scenarios**:

1. **Given** the pilot browser tests, **When** the developer runs them, **Then** each test is executed once per defined device size and reported separately.
2. **Given** a control the journey needs is hidden or unreachable at phone width, **When** the tests run, **Then** the phone-size run fails and the desktop run passes.
3. **Given** a navigation element that is presented differently on small and large screens, **When** the tests run, **Then** the test confirms the user can reach the same destination at every size.
4. **Given** a developer investigating one size, **When** they ask to run only that size, **Then** only that size is executed.

---

### User Story 3 - Run a fast integration test without a browser (Priority: P3)

A developer runs a second command that exercises a slice of the application (a screen together with its surrounding state and data loading) without launching a browser. It uses the same mock data definitions as the browser tests and finishes in seconds, giving quick feedback while working.

**Why this priority**: Integration tests are the intended bulk of future coverage, but the pilot only needs to show the layer works and shares mock data with the browser layer.

**Independent Test**: Run the integration test command alone and confirm it passes in seconds with no browser and no backend.

**Acceptance Scenarios**:

1. **Given** the backend is not running, **When** the developer runs the integration test command, **Then** the pilot integration test passes.
2. **Given** a mock data definition used by a browser test, **When** an integration test needs the same data, **Then** it uses that same definition rather than a second copy.
3. **Given** a test that needs a different backend response (for example an error or an empty result), **When** the developer overrides the response for that one test, **Then** other tests are unaffected.

---

### User Story 4 - Add a new test by following the pattern (Priority: P4)

A developer who was not involved in the pilot reads a short guide, copies one of the pilot tests, and writes a new test for a different screen, including any new mock data it needs.

**Why this priority**: The pilot exists to be extended. This story validates that the pattern is understandable, but it depends on the earlier stories existing.

**Independent Test**: Hand the guide to a developer and have them add one new passing test for a screen not covered by the pilot.

**Acceptance Scenarios**:

1. **Given** the guide and the pilot tests, **When** a developer adds a test for a new screen, **Then** they can do so without changing the shared setup.
2. **Given** a failing browser test, **When** the developer opens the results, **Then** they can see what the page looked like at the point of failure and at which device size.

---

### Edge Cases

- The app requests a backend endpoint or outside service that has no mock: the test must fail loudly and name the request.
- The app depends on outside services other than its own backend: the birth place search is mocked with fixed results, and the sign-in provider is never contacted.
- Content depends on the current date, time, or time zone (daily and transit views): the pilot tests must produce the same result whenever and wherever they are run.
- A backend response is slow or returns an error: the pattern must allow a single test to simulate this.
- The app is already running locally when tests start, or is not running at all: the test command must work in both cases.
- A test passes at desktop size but the element it interacts with is hidden or relocated at phone size.
- A pilot test exposes a layout problem that already exists in the app: the test is kept, marked as a known issue, and the app is not changed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Developers MUST be able to run all browser tests with a single command and all integration tests with a single command.
- **FR-002**: Tests MUST run with no backend running and no internet access; all data from the backend and from outside services the app calls (such as the birth place search) MUST come from mock data definitions.
- **FR-003**: Mock data definitions MUST be shared between the browser and integration layers from a single source.
- **FR-004**: An individual test MUST be able to override a mocked response (different data, error, delay) without affecting other tests.
- **FR-005**: A request to the backend or to any outside service with no matching mock MUST cause the test to fail with a message identifying the request.
- **FR-006**: Tests MUST be able to start in a signed-in state without contacting a real sign-in provider.
- **FR-017**: Tests MUST be able to check what the app sent to the backend (for example the birth info submitted from the new-account modal), not only what the backend returned.
- **FR-007**: Browser tests MUST run at each of a defined set of standard device sizes, which for the pilot is one phone size and one desktop size, with results reported per size.
- **FR-008**: The set of device sizes MUST be defined in one place so sizes can be added or changed without editing individual tests.
- **FR-009**: Developers MUST be able to run a single test, and a single device size, on its own.
- **FR-010**: At each device size, the pilot browser test MUST complete the journey using the controls and navigation as they are presented at that size. Dedicated layout checks (such as horizontal overflow) are out of scope for the pilot.
- **FR-011**: When a browser test fails, the results MUST include a visual record of the page at the point of failure and the device size it failed at.
- **FR-012**: Test results MUST be deterministic: the same code MUST give the same result regardless of the date, time, or time zone of the machine running it.
- **FR-013**: The pilot MUST include a small number of tests only: one happy-path browser journey and one to two integration tests. Error and edge cases are exercised at the integration layer, not in the browser.
- **FR-014**: A short written guide MUST explain how to run the tests, how to add a test, and how to add or override mock data.
- **FR-015**: Adding the testing setup MUST NOT change the behaviour of the application as delivered to end users. This includes not fixing layout problems the pilot tests uncover.
- **FR-016**: A test that fails because of an existing problem in the app MUST be kept and marked as a known issue, so that it is reported separately from unexpected failures and does not hide them. Each known issue MUST be recorded in a follow-up list naming the screen, the device size, and what is wrong.

### Key Entities

- **Mock data set**: A named, reusable description of what the backend would return for a given situation (for example "signed-in user with no birth info"). Used by both test layers.
- **Device size profile**: A named screen size (phone, desktop) that browser tests are run against.
- **Browser test**: A user journey carried out in a real browser against the running app with mocked backend data, repeated per device size profile.
- **Integration test**: A check of a slice of the app (a screen with its state and data loading) run without a browser, using the mock data sets.
- **Test result report**: The outcome per test and per device size, with failure evidence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a machine with the project set up and no backend available, both test commands complete on the first attempt with no unexpected failures; the only failures are those marked as known issues.
- **SC-002**: The pilot browser test reports a separate result for each of 2 device sizes (phone, desktop).
- **SC-003**: The integration tests complete in under 10 seconds; the full browser run across both device sizes completes in under 1 minute.
- **SC-004**: Running each test command 10 times in a row produces 10 identical results, including the same known-issue failures (no intermittent results).
- **SC-005**: A change that makes the journey impossible at phone width is caught by the pilot browser test and attributed to the phone size.
- **SC-006**: A developer unfamiliar with the setup can add one new passing test for an uncovered screen in under 30 minutes using only the guide and the pilot tests.
- **SC-007**: The pilot contains no more than 3 tests in total (1 browser, 2 integration).

## Assumptions

- The pilot browser journey is the new-account modal flow for a signed-in user with no birth info. The pilot integration test covers one screen that loads backend data; which screen is decided during planning.
- "Standard device sizes" means one representative phone size and one desktop size for the pilot; a tablet size can be added later in the one place sizes are defined. Testing across multiple browser engines is out of scope for the pilot.
- Responsive checks in the pilot are behavioural: the journey is completed at each size. Overflow checks and pixel-level screenshot comparison are out of scope.
- The user named Playwright as the browser testing tool; that choice is treated as a given for planning. The integration test tool and mocking approach are left to planning.
- Tests are run locally by developers. Running them automatically on every change (CI) is out of scope for the pilot, but nothing in the setup should prevent adding it later.
- Unit tests of isolated functions, accessibility audits, performance testing, and tests against a real backend are out of scope.
- Full coverage of the application's screens, and fixing the layout problems recorded as known issues, are follow-up efforts to be specified separately once this pattern is accepted.
