# Feature Specification: Profile Page Tests and Responsive Layout

**Feature Branch**: `002-profile-page-tests`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to create integration tests for all the profile page stuff, and then playwright test for happy path as usual 1 for phone size and 1 for desktop. and then i would like to make sure everything visibile from this profile screen is properly responsive for various screen sizes including nav, date pickers and all that stuff okay?"

## Clarifications

### Session 2026-10-03

- Q: When the new tests show the profile screen doing the wrong thing (a behaviour bug, not a layout problem), should fixing that bug be part of this work? → A: Yes, fix everything found. Every behaviour bug the tests expose on the profile screen is fixed before this feature is done.
- Q: On a phone, where should the five chart links (Charts, Moment, Daily, Transits, Synastry) go, given they do not fit in the top bar? → A: Everything in the menu. On a phone the bar shows only the Astro logo and the menu button; all eight destinations are in the slide-out menu.
- Q: How should the three extra screen sizes (320 small phone, 768 tablet, 1920 large monitor) be checked for layout problems? → A: By a browser-based review from a Claude review subagent at all five sizes, looking for any responsive layout problems. No automated layout test is added: the browser tests stay as the single happy-path journey at phone and desktop. The subagent review is a standing rule for every spec in this repo.
- Q: Should deleting a custom profile ask the user to confirm first? → A: Yes. Tapping Delete asks the user to confirm and only deletes on confirm; cancelling leaves the profile untouched.
- Q: If the user types something new in a place field but saves without picking one of the suggestions, what should happen? → A: Block the save. Nothing is sent, and the user is told to pick a place from the suggestions.

## User Scenarios & Testing *(mandatory)*

This feature has two audiences. The developers of the application get automated tests that protect every behaviour of the profile screen, built on the testing pattern proven in the pilot (`001-test-setup-pilot`). The people who use the application get a profile screen, and the navigation around it, that is fully usable on any common screen size.

The profile screen has four sections: Account Info, My Birth Info, Custom Profiles, and Chart Default Settings. The top navigation is shown above it.

### User Story 1 - Every profile screen behaviour is protected by fast tests (Priority: P1)

A developer changes something on the profile screen and runs the fast test command. Within seconds they learn whether any behaviour of the four sections has broken: what each section shows on load, what is sent when the user saves, and what the user is told when saving succeeds or fails. No backend, account, or internet connection is needed.

**Why this priority**: The profile screen is where users enter the birth data every chart depends on. This is the bulk of the requested work, and it is where error and edge cases are covered, since the browser tests are kept to the happy path only.

**Independent Test**: With the backend stopped, run the fast test command and confirm the profile tests pass; then deliberately break one behaviour (for example, stop sending the birth place when saving) and confirm a test fails and names that behaviour.

**Acceptance Scenarios**:

*Account Info*

1. **Given** a signed-in user with a username, email, and location, **When** the profile screen loads, **Then** the username and location are shown and editable, and the email is shown but cannot be edited.
2. **Given** the user changes their username and picks a new location from the place search results, **When** they save, **Then** the details sent to the backend match what was entered and a success message is shown.
3. **Given** the backend rejects the save, **When** the user saves, **Then** an error message is shown and the entered values remain on screen.

*My Birth Info*

4. **Given** a user with a main birth profile, **When** the screen loads, **Then** the birth date, birth time, unknown-time choice, and birth place are pre-filled, and no name field is shown.
5. **Given** the user edits the birth date, time, and place, **When** they save, **Then** the main profile is updated with exactly those values and a success message is shown.
6. **Given** the user marks the birth time as unknown, **When** they do so, **Then** the time is cleared and the time field cannot be edited; **When** they save, **Then** the profile is saved as having an unknown birth time.
7. **Given** the backend rejects the save, **When** the user saves, **Then** an error message is shown and the entered values remain on screen.

*Custom Profiles*

8. **Given** a user with several custom profiles, **When** the screen loads, **Then** each custom profile is listed by name, collapsed, and the main profile is not in the list.
9. **Given** the list is shown, **When** the user opens one profile, **Then** its details are shown pre-filled; **When** they open another, **Then** the first collapses.
10. **Given** the user chooses to add a new profile, **When** they fill in a name, birth date, time, and place and submit, **Then** a new profile is created with those values, the new-profile form closes, the profile appears in the list, and a success message is shown.
11. **Given** the new-profile form is open, **When** the user cancels, **Then** the form closes and nothing is sent to the backend.
12. **Given** an existing custom profile is open, **When** the user edits and saves it, **Then** that profile is updated with the new values and a success message is shown.
13. **Given** an existing custom profile is open, **When** the user chooses to delete it, **Then** they are asked to confirm; **When** they confirm, **Then** it is removed from the list and a success message is shown; **When** they cancel instead, **Then** nothing is sent to the backend and the profile is unchanged.
14. **Given** the backend rejects a create, update, or delete, **When** the user performs it, **Then** an error message is shown and the list is unchanged.
15. **Given** a user with no custom profiles, **When** the screen loads, **Then** the section shows only its heading and the add control.

*Chart Default Settings*

16. **Given** saved chart settings, **When** the screen loads, **Then** every setting shows its saved value; while settings are still loading, a loading indication is shown instead.
17. **Given** the user selects the sidereal zodiac, **When** they do so, **Then** an additional choice of ayanamsa appears with a default selected; **When** they switch back to tropical, **Then** it disappears and no ayanamsa is saved.
18. **Given** the user turns an aspect off, **When** they do so, **Then** its orb value cannot be edited; turning it back on makes it editable again.
19. **Given** the user changes any combination of systems, aspects, orbs, objects, and display options, **When** they save, **Then** the settings sent to the backend match what is on screen and a success message is shown.
20. **Given** changed settings, **When** the user resets to defaults, **Then** the settings return to the defaults and a confirmation message is shown.
21. **Given** the backend rejects a save or reset, **When** the user performs it, **Then** an error message is shown.

*Place search (used in Account Info, My Birth Info, and Custom Profiles)*

22. **Given** the user types fewer than three characters, **When** they pause, **Then** no search is made and no suggestions are shown.
23. **Given** the user types three or more characters, **When** they pause, **Then** suggestions are shown; **When** they pick one, **Then** the field shows the chosen place, the suggestions close, and the place's coordinates are used when saving.
24. **Given** the user has typed new text in a place field without picking a suggestion, **When** they save, **Then** nothing is sent to the backend and they are told to pick a place from the suggestions; this applies to the birth place on every birth profile and to the location in Account Info.

---

### User Story 2 - The profile journey works in a real browser on phone and desktop (Priority: P2)

A developer runs the browser test command and a real browser walks one happy-path journey through the profile screen, once at phone size and once at desktop size. The journey reaches the profile screen through the navigation, updates the account info, updates the main birth info, adds a custom profile, and changes and saves a chart setting.

**Why this priority**: The fast tests cannot prove that a real browser at a real screen size can actually reach, see, and tap every control. This journey is that proof, and it is the automated check that the layout work in User Story 3 holds on the two primary sizes.

**Independent Test**: With the backend stopped, run the browser test command and confirm the profile journey is reported as passing separately for phone and for desktop.

**Acceptance Scenarios**:

1. **Given** a signed-in user with a complete profile, **When** the journey runs at desktop size, **Then** the user reaches the profile screen from the navigation and completes every step, and each save shows its success message.
2. **Given** the same user, **When** the journey runs at phone size, **Then** the user reaches the profile screen through the phone navigation menu and completes every step without scrolling sideways.
3. **Given** the journey runs at either size, **When** it completes, **Then** the details sent to the backend at each save match what was entered.
4. **Given** the journey makes a request that has no mock defined, **When** the test runs, **Then** the test fails and names the request.

---

### User Story 3 - The profile screen and navigation fit every common screen size (Priority: P3)

A person opens the profile screen on a small phone, a typical phone, a tablet, a laptop, or a large monitor. On each, the navigation and all four sections fit the width of the screen, every control can be reached and used, and nothing is cut off or overlapping. This includes the birth date and time pickers, the place search suggestions, the expanding custom profile list, the settings controls, and the confirmation messages.

**Why this priority**: It depends on being able to see and verify the screen (Stories 1 and 2), and it is the only story that changes what end users see. It also resolves the known issue recorded during the pilot, where the navigation is wider than a phone screen.

**Independent Test**: Have the review subagent open the profile screen in a browser at each listed screen size, walk through every section including opening the navigation menu, the date and time pickers, the place suggestions, and a custom profile, and confirm that nothing requires sideways scrolling and nothing is cut off or overlapping.

**Acceptance Scenarios**:

1. **Given** any listed screen size, **When** the profile screen is shown, **Then** the page is no wider than the screen and cannot be scrolled sideways.
2. **Given** a phone-sized screen, **When** the navigation is shown, **Then** the bar shows only the Astro logo and a menu button and fits within the screen width; **When** the menu is opened, **Then** it lists all eight destinations (Charts, Moment, Daily, Transits, Synastry, Friends, Profile, Logout).
3. **Given** a phone-sized screen with the navigation menu open, **When** the user picks a destination or taps outside the menu, **Then** the menu closes.
4. **Given** any listed screen size, **When** the user opens the birth date or birth time picker, **Then** the field and its picker are fully visible and usable, and the unknown-time choice remains on screen next to the time field.
5. **Given** any listed screen size, **When** place suggestions are shown, **Then** the list stays within the screen width, long place names remain readable, and any suggestion can be selected.
6. **Given** a small phone, **When** the Chart Default Settings section is shown, **Then** every label is fully readable and every control can be operated without overlapping its neighbour.
7. **Given** any listed screen size, **When** a custom profile is opened or the new-profile form is shown, **Then** its fields and its action buttons are all visible and usable.
8. **Given** any listed screen size, **When** a success or error message appears, **Then** it is fully visible and does not hide the control the user just used.
9. **Given** a large monitor, **When** the profile screen is shown, **Then** the content stays at a comfortable reading width and is centred rather than stretched.
10. **Given** the pilot's known issue about the navigation being wider than a phone screen, **When** this work is complete, **Then** the issue is resolved, its expected-failure marker is removed, and the pilot journey passes at phone size.

---

### Edge Cases

- A birth place name long enough to wrap onto several lines, both in the field and in the suggestion list.
- A custom profile with a very long name in the collapsed list.
- Many custom profiles (for example 20): the list remains usable and the page does not break.
- Place search returns no results, or the search service fails: the form stays usable and no suggestions are shown.
- The user types in the place field, does not pick a suggestion, then restores the original text by hand and saves.
- The user submits a new custom profile, or saves an existing profile, with required details missing: nothing is sent to the backend and the user is told what is missing.
- A user whose main birth profile is missing reaches the profile screen.
- The user opens one custom profile while the new-profile form is open, and the reverse.
- An orb value typed outside the allowed range, or cleared entirely.
- The phone navigation menu is open when the screen is rotated or widened past the point where the full navigation is shown.
- A phone in landscape orientation (wide but very short).

## Requirements *(mandatory)*

### Functional Requirements

**Fast (integration) tests**

- **FR-001**: The fast tests MUST cover every acceptance scenario in User Story 1, across all four sections of the profile screen and the place search.
- **FR-002**: For every action that saves, creates, or deletes, the tests MUST check both what the user sees afterwards and the details sent to the backend.
- **FR-003**: Every action that can be rejected by the backend MUST have a test for the rejected case.
- **FR-004**: The tests MUST cover the edge cases listed above that concern behaviour rather than layout.
- **FR-005**: The tests MUST run with no backend, no real account, and no internet connection, using the shared mock data, and any request with no mock MUST fail the test.
- **FR-006**: Mock data MUST be extended to describe the situations the tests need, at minimum: a user with several custom profiles, a user with none, and saved chart settings that differ from the defaults.
- **FR-007**: Where a test shows the profile screen behaving differently from the expected behaviour described here, the behaviour MUST be fixed as part of this work so that the test passes; the test MUST NOT be weakened or removed to make it pass. Only a problem that cannot be fixed within this application (for example, one that needs a backend change) may instead be recorded in the known-issues list with the test marked as an expected failure.

**Browser tests**

- **FR-008**: There MUST be exactly one profile browser journey, covering the happy path only, run once at phone size and once at desktop size and reported separately for each.
- **FR-009**: The journey MUST reach the profile screen through the navigation as a user would at that size, and MUST cover updating account info, updating main birth info, adding a custom profile, and saving a chart setting.
- **FR-010**: Error cases and edge cases MUST NOT be added as browser tests; they belong in the fast tests. The journey MUST NOT be run at sizes other than phone and desktop, and no other automated browser test is added for layout; layout at all five sizes is checked by the completion review (FR-019).

**Responsive layout**

- **FR-011**: At every supported screen size, the profile screen and the navigation MUST fit within the screen width with no sideways scrolling.
- **FR-012**: The supported screen sizes MUST be: small phone (320 wide), phone (390 wide), tablet (768 wide), laptop (1280 wide), and large monitor (1920 wide).
- **FR-013**: At every supported size, every navigation destination and logout MUST be reachable. On screens narrower than a tablet, the navigation bar MUST show only the Astro logo and a menu button, and all eight destinations (Charts, Moment, Daily, Transits, Synastry, Friends, Profile, Logout) MUST be in a slide-out menu that can be opened and closed. On tablet and wider screens, all destinations MUST be shown directly in the bar.
- **FR-014**: At every supported size, every field, picker, suggestion list, expandable item, button, and confirmation message on the profile screen MUST be fully visible and operable, with no clipped or overlapping content.
- **FR-015**: Controls MUST be comfortably tappable on touch screens, and text MUST remain readable without zooming.
- **FR-016**: Layout problems found on the profile screen or the navigation MUST be fixed as part of this work, including the navigation problem recorded during the pilot.
- **FR-017**: Layout changes MUST NOT change what any control does or what is sent to the backend; the tests from User Stories 1 and 2 MUST still pass afterwards.
- **FR-018**: Because the navigation is shared, changes to it MUST leave every other signed-in screen at least as usable as before.
- **FR-018a**: Deleting a custom profile MUST require the user to confirm before anything is deleted, and cancelling MUST leave the profile unchanged. The confirmation MUST be fully visible and usable at every supported screen size.
- **FR-018b**: A save MUST be blocked when a place field contains text that was typed but not picked from the suggestions; nothing is sent to the backend and the user is told to pick a place from the suggestions. The place shown on screen MUST always be the place that is saved.

**Completion review**

- **FR-019**: Before this work is considered complete, a Claude review subagent MUST review the running app in a browser at each of the five supported screen sizes, covering the navigation and every section and state of the profile screen, looking for any responsive layout problem (sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls, unreadable text).
- **FR-020**: Every problem the review finds MUST be fixed and the affected size reviewed again, until the review finds none.

### Key Entities

- **Account**: The signed-in person: username (editable), email (shown only), and current location (place name and coordinates).
- **Birth profile**: A set of birth details: date, time or "unknown time", and place with coordinates. Each user has one main profile ("My Birth Info") and any number of named custom profiles for other people.
- **Chart default settings**: The user's preferred calculation systems, which aspects are shown and their orbs, which optional objects are shown, and chart display options. Can be reset to defaults.
- **Place suggestion**: A result from the place search: a display name and coordinates.
- **Known issue**: A recorded problem in the app that a test exposes and that has deliberately not been fixed yet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the acceptance scenarios in User Story 1 are covered by a passing fast test. The only permitted exceptions are expected-failure tests for problems that cannot be fixed within this application, each linked to a recorded known issue.
- **SC-002**: The full fast test run still completes in under 10 seconds on a developer machine.
- **SC-003**: The profile browser journey passes at both phone and desktop size, and the full browser run completes in under 60 seconds.
- **SC-004**: Breaking any single behaviour of the profile screen causes at least one test to fail with a message that identifies the behaviour.
- **SC-005**: At each of the five supported screen sizes, the profile screen and navigation show no sideways scrolling and no clipped or overlapping content in any section or state.
- **SC-006**: A person on a phone can go from any signed-in screen to the profile screen, change their birth info, and save it without scrolling sideways or zooming.
- **SC-007**: The known issue recorded during the pilot is closed, and no test is marked as an expected failure because of a layout problem on the profile screen or navigation.
- **SC-010**: The browser-based review by the review subagent at all five supported screen sizes ends with no open responsive layout problems.
- **SC-008**: All tests pass on a machine with no backend running and no internet connection.

## Assumptions

- "Make sure everything is properly responsive" means layout problems are fixed in this work, not only recorded. This reverses the pilot's choice for the profile screen and navigation only.
- Behaviour problems that the new tests uncover on the profile screen are fixed in this work, like layout problems. The number of such fixes is not known in advance, so the size of this work depends on what the tests find.
- "Everything visible from the profile screen" means the top navigation (including its phone menu), the four profile sections in all their states, the date and time pickers, the place suggestions, and the confirmation messages. Other screens reached from the navigation are out of scope, apart from not being made worse by navigation changes.
- The happy-path journey stays limited to phone and desktop, as usual. The other sizes are covered by the review subagent's browser review, not by additional browser tests.
- The date and time pickers are the device's own built-in pickers; the work is to make sure the fields and their surrounding layout behave well, not to replace the pickers.
- The testing pattern, shared mocks, device sizes, and known-issues process from `001-test-setup-pilot` are reused as they are and extended only where the profile screen needs it.
- The place search continues to be mocked like the backend; no test reaches the real search service.
- No visual redesign is intended: colours, wording, and the order of sections stay the same unless a change is needed to make the layout fit.
- Only one browser engine is covered, as in the pilot.
