# Feature Specification: Main Chart Page Tests and Responsive Layout

**Feature Branch**: `003-main-page-tests`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "now we want to test each main page, they are all basically smiliar, we'll probably want a playright test setup like for each main widget. and then integration tests going to make sure the particular behavior all works properly. we'll break things down into each page, have a look through all the pieces to test, including description drawer stuff, and also responsiveness for mobile / other sizes - go through and ask me questions about what kind of behavior is intended and so on if you need clarity. we want to have good coverage, ensure responsiveness, add key playwright tests without overdoing those"

## Clarifications

### Session 2026-10-03

- Q: The description drawer is a fixed panel wider than a phone screen. How should it appear on a phone? → A: As a full-screen panel with its back and close buttons at the top. On tablet and wider screens it stays a right-hand side panel.
- Q: Synastry stops working for a user who has only their own birth profile. What should happen instead? → A: The Synastry page opens and shows a short message that a second profile is needed, with a link to the profile screen to add one.
- Q: How many browser tests, given that more widgets will keep being added and the run must not slow down? → A: One happy-path journey per page (five in total), each run at phone and desktop. The number of browser tests follows the number of pages, not the number of widgets: a new widget becomes one more step in its page's journey, and its detailed behaviour goes in the fast tests.
- Q: When a chart, timing list, or description fails to load, what is the intended behaviour? → A: The affected widget shows a short "could not load" message and the rest of the page keeps working. This is fixed as part of this work.
- Q: When the description drawer is open and the user changes the chart behind it (a different profile, date or time), what should the drawer do? → A: The drawer closes. The automatic one-minute refresh on Daily is not a user change and leaves the drawer open.
- Q: Besides its close and back buttons, what else should close the description drawer? → A: Nothing. Only the close and back buttons close it (apart from the automatic closing on a settings change or on leaving the page). The Escape key, tapping outside, and the device's back gesture do not.
- Q: The Friends link in the navigation leads to a blank page because that page is switched off; should this work do anything about it? → A: Yes. Hide the Friends link in the navigation bar and the phone menu until the Friends page is switched back on.
- Q: On a phone, the aspect matrix is about twice as wide as the screen; how should it be shown? → A: It shrinks so the whole matrix fits the screen width, with smaller cells and symbols. It does not scroll sideways.
- Q: When a widget shows its "could not load" message, should it also give the user a way to try again? → A: No. The message is shown alone; the user reloads the page or changes a setting to try again.

## User Scenarios & Testing *(mandatory)*

This feature has two audiences. The developers of the application get automated tests that protect the behaviour of the five main chart pages and the description drawer they share, built on the testing pattern already used for the profile screen (`002-profile-page-tests`). The people who use the application get chart pages and a description drawer that are fully usable on any common screen size.

The five main pages, and the widgets on each:

| Page | Widgets |
|------|---------|
| Charts (natal) | Chart wheel, Chart Settings (profile), Aspect Matrix, Placements |
| Moment | Chart wheel, Chart Settings (date and time), Aspect Matrix, Placements |
| Daily | Chart wheel (the sky now), Ascendant timeline, Moon Timings, Weekly Timings, Aspect Matrix, Placements |
| Transits | Two-ring chart wheel, Chart Settings (profile, date and time), Ascendant timeline, Weekly Timings, Aspect Matrix (two charts), Placements (two groups) |
| Synastry | Two-ring chart wheel, Chart Settings (profile and other profile), Synastry Aspects matrix, Placements (two groups) |

Every page also has the **description drawer**: a panel that opens when the user selects something on the page (a planet, sign, house, key angle, aspect, moon phase, or timing event) and explains it.

Most widgets appear on more than one page. Each shared widget is tested thoroughly once; each page is then tested only for what is particular to it.

### User Story 1 - The description drawer is protected by fast tests (Priority: P1)

A developer changes the description drawer, or anything that opens it, and runs the fast test command. Within seconds they learn whether the drawer still opens with the right content from every place it can be opened, whether moving between items inside it still works, and whether closing it still works. No backend, account, or internet connection is needed.

**Why this priority**: The drawer is on all five pages and is the main way users get meaning out of a chart. A fault in it affects every page at once, so it is the most valuable single thing to protect, and the other stories rely on it.

**Independent Test**: With the backend stopped, run the fast test command and confirm the drawer tests pass; then deliberately break one behaviour (for example, make the back button close the drawer instead of going back) and confirm a test fails and names that behaviour.

**Acceptance Scenarios**:

*Opening*

1. **Given** a chart page with the drawer closed, **When** the user selects a planet, a sign, a house, or a key angle, **Then** the drawer opens showing that item's name, its general description, and the details that apply to this chart.
2. **Given** a chart page, **When** the user selects an aspect, **Then** the drawer shows the aspect's name and general description, the two points involved with their signs, and the orb when there is one.
3. **Given** a page with timing widgets, **When** the user selects a moon phase, an Ascendant conjunction, or a weekly timing event (aspect, sign change, retrograde, or station), **Then** the drawer opens with the matching explanation for that event, including its date and time.
4. **Given** the drawer opens for an item that has a written description for this chart, **When** that description is still loading, **Then** a loading indication is shown in its place, and the general information is readable straight away; **When** it arrives, **Then** it replaces the loading indication.

*Moving between items*

5. **Given** the drawer is open on one item, **When** the user selects a related item inside the drawer (for example a sign from a planet, or a planet from a sign), **Then** the drawer shows the new item.
6. **Given** the user has moved through several items, **When** they press back, **Then** the previous item is shown again, one step at a time, in reverse order.
7. **Given** the drawer shows the first item opened, **When** the user presses back, **Then** the drawer closes.
8. **Given** the drawer is open, **When** the user selects a different item on the page behind it, **Then** the drawer shows the new item and back returns to the earlier one.

*Closing*

9. **Given** the drawer is open, **When** the user presses close, **Then** the drawer disappears and the page behind it is fully usable.
10. **Given** the user moved through several items and then closed the drawer, **When** they open it again on a new item and press back, **Then** the drawer closes; it does not return to items from before it was closed.
11. **Given** the drawer is open, **When** the user goes to another page through the navigation, **Then** the drawer is closed on the new page.
12. **Given** the drawer is open, **When** the user changes the profile, the other profile, the date, or the time in Chart Settings, **Then** the drawer closes, and opening it again starts a new trail.

*Two-chart pages*

13. **Given** Transits or Synastry, **When** the user selects a planet or house belonging to one of the two charts, **Then** the drawer shows the details for that chart's planet or house, not the other chart's.
14. **Given** Transits or Synastry, **When** the user opens a sign or a house, **Then** the planets in it are listed in two groups, one per chart, each labelled with whose chart it is.
15. **Given** Transits or Synastry, **When** the user opens an aspect, **Then** each of the two points is labelled with whose chart it belongs to.

*Failure*

16. **Given** the written description cannot be loaded, **When** the drawer opens, **Then** a short "could not load" message is shown where the description would be, the general information is still shown, and back and close still work.

---

### User Story 2 - Every widget's behaviour is protected by fast tests (Priority: P1)

A developer changes a widget and runs the fast test command. Within seconds they learn whether that widget still shows the right content for the chart data it is given, still responds to the user correctly, and still copes with loading, empty, and failed states.

**Why this priority**: This is the bulk of the requested coverage, and it is where error and edge cases live, because browser tests are kept to the happy path. Testing each shared widget once here is what keeps five similar pages from needing five copies of the same tests.

**Independent Test**: With the backend stopped, run the fast test command and confirm the widget tests pass; then break one behaviour (for example, show a planet the user has turned off) and confirm a test fails and names it.

**Acceptance Scenarios**:

*Chart wheel (one chart)*

1. **Given** chart data, **When** the wheel is shown, **Then** it shows the twelve signs, the twelve houses, the key angles, each planet, and a line for each aspect.
2. **Given** a planet is retrograde, **When** the wheel is shown, **Then** that planet carries the retrograde mark.
3. **Given** the user's default settings turn off an optional object (Chiron or Black Moon Lilith), **When** the wheel is shown, **Then** that object and every aspect line to it are absent.
4. **Given** the user's default settings turn degree labels or tick marks on or off, **When** the wheel is shown, **Then** it follows those settings.
5. **Given** the chart is still loading, **When** the wheel area is shown, **Then** a loading indication is shown; **Given** the chart cannot be loaded, **Then** a "could not load" message is shown instead and the loading indication is gone.
6. **Given** the wheel, **When** the user selects a planet, sign, house, or key angle, **Then** the drawer opens for that item.
7. **Given** a pointer device, **When** the user points at a planet, **Then** that planet, its aspect lines, and the planets it aspects are highlighted; **When** the pointer leaves, **Then** the highlight is removed.

*Chart wheel (two charts)*

8. **Given** two charts, **When** the wheel is shown, **Then** each chart's planets and houses are shown in their own ring, and aspect lines join points from one chart to the other.
9. **Given** the two-ring wheel, **When** the user selects a planet or house in either ring, **Then** the drawer opens for that chart's planet or house.

*Chart Settings*

10. **Given** a page that offers a profile choice, **When** the settings are shown, **Then** the user's own profile is listed first and selected, followed by their other profiles.
11. **Given** the user picks a different profile, date, or time, **When** they do so, **Then** a new chart is requested for exactly that choice and the wheel, matrix, and placements all update to it.
12. **Given** Synastry, **When** the settings are shown, **Then** the profile chosen on one side is not offered on the other side, so the same profile can never be compared with itself.

*Aspect Matrix (one chart)*

13. **Given** chart data, **When** the matrix is shown, **Then** every planet plus the Ascendant and Midheaven appear once along the top and once down the side in the standard planet order, and each pair that forms an aspect shows that aspect's symbol in its cell.
14. **Given** the matrix, **When** the user selects a cell with an aspect, **Then** the drawer opens for that aspect; selecting an empty cell does nothing.
15. **Given** an optional object or an aspect type is turned off in the user's default settings, **When** the matrix is shown, **Then** it is absent from the matrix.

*Aspect Matrix (two charts)*

16. **Given** two charts, **When** the matrix is shown, **Then** one chart's points run along the top and the other's down the side, each side labelled with whose chart it is, and every cell is a pairing between the two charts.

*Placements*

17. **Given** chart data, **When** placements are shown, **Then** each planet is listed with its sign, house, and degree; on two-chart pages there are two groups, each labelled with whose chart it is.
18. **Given** placements, **When** the user selects a planet, sign, or house in a row, **Then** the drawer opens for that item (for that chart, on two-chart pages).

*Ascendant timeline (Daily and Transits)*

19. **Given** today's timing data, **When** the timeline is shown, **Then** it shows the current Ascendant sign and degree, the day divided into the signs the Ascendant passes through with the time each begins, a marker for the current time, and a marker with its time for each planet that meets the Ascendant today.
20. **Given** the timeline, **When** it first appears, **Then** it is scrolled so the current time is in view.
21. **Given** the timeline, **When** the user selects a planet marker, **Then** the drawer opens for that event.
22. **Given** no planet meets the Ascendant today, **When** the timeline is shown, **Then** it says so.
23. **Given** the timing data is loading, **Then** a loading indication is shown; **Given** it cannot be loaded, **Then** a "could not load" message is shown instead.

*Moon Timings (Daily)*

24. **Given** moon timing data, **When** the widget is shown, **Then** it shows the Moon's current sign and degree and the eight moon phases in date order, each with its date, time, and sign, with the current phase marked.
25. **Given** the widget, **When** the user selects a phase, **Then** the drawer opens for that phase.
26. **Given** a phase has no timing, **Then** that phase says its timing is unavailable; **Given** moon timings cannot be loaded at all, **Then** the widget says they are unavailable.

*Weekly Timings (Daily and Transits)*

27. **Given** this week's timing data, **When** the widget is shown, **Then** the "By day" view is selected and lists the seven days of the current week, each with its ruling planet and the events that fall on it; a day with no events says so.
28. **Given** the widget, **When** the user switches to "Timeline", **Then** the same events are shown positioned by time along the week with a marker for the current time, scrolled so the current time is in view; switching back returns to the "By day" view.
29. **Given** either view, **When** the user selects an event, **Then** the drawer opens for that event.
30. **Given** a week with no events, **When** the Timeline view is shown, **Then** it says there are none.
31. **Given** the timing data is loading, **Then** a loading indication is shown; **Given** it cannot be loaded, **Then** a "could not load" message is shown instead.

---

### User Story 3 - Each page's own behaviour is protected by fast tests (Priority: P2)

A developer changes one of the five pages and runs the fast test command. They learn whether that page still shows its widgets, asks for the right chart, and handles the situations particular to it.

**Why this priority**: With the shared widgets covered by Story 2, what remains per page is small but is where the pages genuinely differ: which chart is requested, what the user can change, and what happens when something the page needs is missing.

**Independent Test**: With the backend stopped, run the fast test command and confirm each page's tests pass; then break one page-specific behaviour (for example, make Moment ignore the date in its link) and confirm only that page's test fails.

**Acceptance Scenarios**:

*All five pages*

1. **Given** a signed-in user with no main birth profile, **When** they open any of the five pages, **Then** they are taken to the profile screen and told to create their birth profile first.
2. **Given** a user with a main birth profile, **When** a page loads, **Then** every widget listed for that page in the table above is shown under its heading.

*Charts (natal)*

3. **Given** a user with a main birth profile, **When** Charts opens, **Then** the natal chart for the user's own profile is requested and shown.
4. **Given** the user has other profiles, **When** they pick one in Chart Settings, **Then** that profile's natal chart is requested and shown.

*Moment*

5. **Given** Moment is opened without a date, **When** it loads, **Then** the date and time fields show the current date and time and the chart for that moment is shown.
6. **Given** Moment is opened from a link that carries a date and time, **When** it loads, **Then** the fields show that date and time and the chart for it is shown; a link with a date but no time uses the end of that day.
7. **Given** the user changes the date or the time, **When** they do so, **Then** the chart for the new moment is requested and shown.
8. **Given** a user who has not set their location, **When** they open Moment, **Then** they are taken to the profile screen and told to enter their location first.

*Daily*

9. **Given** Daily opens, **When** it loads, **Then** the chart for the current moment is shown, with no profile, date, or time controls.
10. **Given** Daily stays open, **When** a minute passes, **Then** the chart is refreshed for the new current time without the user doing anything, and an open drawer stays open.
11. **Given** a user who has not set their location, **When** they open Daily, **Then** they are taken to the profile screen and told to enter their location first.

*Transits*

12. **Given** Transits opens, **When** it loads, **Then** the user's own natal chart and the sky at the current date and time are shown together, and the timing widgets show timings for the user's own profile.
13. **Given** the user picks another profile, **When** they do so, **Then** the chart and the timing widgets are requested again for that profile.
14. **Given** the user changes the date or time, or opens Transits from a link carrying a date and time, **Then** the transit chart for that moment is shown.
15. **Given** a user who has not set their location, **When** they open Transits, **Then** they are taken to the profile screen and told to enter their location first.

*Synastry*

16. **Given** a user with at least one other profile, **When** Synastry opens, **Then** the user's own profile is compared with their first other profile.
17. **Given** the user changes either profile, **When** they do so, **Then** the comparison for the new pair is requested and shown, and the labels on the matrix, placements, and drawer use the new names.
18. **Given** a user with only their own profile, **When** they open Synastry, **Then** the page shows a message that a second profile is needed and a link to the profile screen, and nothing else on the page fails.

---

### User Story 4 - Each page's journey works in a real browser on phone and desktop (Priority: P2)

A developer runs the browser test command and a real browser walks one happy-path journey through each of the five pages, once at phone size and once at desktop size. Each journey reaches its page through the navigation, sees the chart, uses that page's settings, opens the drawer from each main widget on the page, moves to a related item inside the drawer, goes back, and closes it.

**Why this priority**: The fast tests cannot prove that a real browser at a real size can actually reach, see, and tap each widget, or that the drawer really covers and uncovers the page. These journeys are that proof. They are deliberately few, so the run stays quick as widgets are added.

**Independent Test**: With the backend stopped, run the browser test command and confirm five page journeys are each reported as passing separately for phone and for desktop.

**Acceptance Scenarios**:

1. **Given** a signed-in user with a main profile, other profiles, and a location, **When** a page's journey runs at desktop size, **Then** the page is reached from the navigation bar, every main widget of that page is seen, and the drawer is opened from each one and closed again.
2. **Given** the same user, **When** the journey runs at phone size, **Then** the page is reached through the phone navigation menu, every step completes without scrolling the page sideways, and the drawer fills the screen while open and reveals the page again when closed.
3. **Given** a page with settings, **When** its journey changes a setting (profile, other profile, date, or time), **Then** the chart requested from the backend matches the choice.
4. **Given** Daily or Transits, **When** the journey switches Weekly Timings to "Timeline" and selects an event, **Then** the drawer opens for it.
5. **Given** a journey makes a request that has no mock defined, **When** the test runs, **Then** the test fails and names the request.

---

### User Story 5 - The chart pages and the drawer fit every common screen size (Priority: P3)

A person opens any of the five pages on a small phone, a typical phone, a tablet, a laptop, or a large monitor. On each, the page fits the width of the screen, every widget can be reached and used, the chart wheel is as large as the screen allows without being cut off, and the description drawer is readable and can always be closed.

**Why this priority**: It depends on being able to see and verify the pages (Stories 1 to 4), and it is the story that changes what end users see. The drawer is currently wider than a phone screen, which makes the pages' main feature hard to use on a phone.

**Independent Test**: Have the review subagent open each of the five pages in a browser at each listed screen size, look at every widget, open the drawer from the wheel and from a timing widget, and confirm that nothing requires scrolling the page sideways and nothing is cut off or overlapping.

**Acceptance Scenarios**:

1. **Given** any listed screen size, **When** any of the five pages is shown, **Then** the page is no wider than the screen and cannot be scrolled sideways.
2. **Given** a phone-sized screen, **When** a page is shown, **Then** the widgets are stacked in a single column in a sensible reading order with the chart wheel first; **Given** a laptop or larger, **Then** the wheel and the side widgets sit next to each other.
3. **Given** any listed screen size, **When** the chart wheel is shown, **Then** the whole wheel is visible, is as wide as its space allows, keeps its round shape, and leaves no large empty gap beneath it.
4. **Given** a phone-sized screen, **When** the user taps a planet, sign, house, or key angle on the wheel, **Then** the intended item opens; neighbouring items are not opened by mistake.
5. **Given** a phone-sized screen, **When** the drawer opens, **Then** it fills the screen, its back and close buttons are visible at the top and comfortably tappable, and its content scrolls up and down inside it without the page behind moving.
6. **Given** a tablet or wider screen, **When** the drawer opens, **Then** it appears as a panel on the right-hand side, no wider than the screen, and the part of the page beside it can still be used.
7. **Given** any listed screen size, **When** the aspect matrix is shown (one chart or two), **Then** the whole matrix fits within the width of its space with no sideways scrolling, its cells and symbols scaled down as needed; every symbol remains legible, the labels saying whose chart each side belongs to remain readable, and tapping a cell opens that cell's aspect, not a neighbour's.
7a. **Given** any listed screen size, **When** a placements table is wider than its space, **Then** it scrolls sideways inside its own area, with a visible sign that there is more, and the page itself does not scroll sideways.
8. **Given** a phone-sized screen, **When** the Ascendant timeline, Moon Timings, or Weekly Timings are shown, **Then** all times, labels, and event markers are readable and tappable, and no text is cut off in a way that hides its meaning.
9. **Given** a phone-sized screen, **When** the user scrolls the page with a finger over a widget that scrolls on its own (a timeline or a table), **Then** they can still scroll past it to the rest of the page.
10. **Given** any listed screen size, **When** Chart Settings is shown, **Then** each selector and date or time field is fully visible and usable, including with long profile names.
11. **Given** a large monitor, **When** a page is shown, **Then** the content stays within a comfortable maximum width and is centred rather than stretched.
12. **Given** the Synastry message for a user with one profile, or a "could not load" message in any widget, **When** it is shown at any listed size, **Then** it is fully visible and readable.

---

### Edge Cases

- A user with exactly one other profile on Synastry: each selector has only one choice.
- A user with many profiles (for example 20), and profiles with very long names: selectors, matrix labels, placement group headings, and drawer labels remain readable.
- The user changes a setting twice in quick succession: the page ends up showing the chart for the last choice, never an earlier one that arrived late.
- The user clears the date or time field on Moment or Transits: the last chart stays on screen and no request is made until both are filled in again.
- A link to Moment or Transits carries a date or time that is not valid.
- A chart with several planets at nearly the same position: every planet is still shown and can still be selected.
- A chart with no aspects at all: the matrix is shown empty and the wheel shows no lines.
- A birth profile with an unknown birth time.
- The backend rejects one request but not the others: only the widget that needed it shows the "could not load" message.
- The drawer is open when the minute refresh on Daily replaces the chart behind it: the drawer stays open and keeps working.
- The drawer is open on a phone and the screen is rotated, or the window is widened past the point where it becomes a side panel.
- The user opens the same item twice in a row, and moves through a long chain of items before pressing back repeatedly.
- The current time is near midnight, or the week has just begun or is about to end: the "now" markers and "today" are still correct.
- Several timing events fall at the same time on the weekly timeline: all remain visible and selectable.
- A touch screen has no pointer to hover with: nothing on any page is reachable only by hovering.
- A phone in landscape orientation (wide but very short).

## Requirements *(mandatory)*

### Functional Requirements

**Fast (integration) tests**

- **FR-001**: The fast tests MUST cover every acceptance scenario in User Stories 1, 2, and 3.
- **FR-002**: Each widget that appears on more than one page MUST be tested thoroughly once, in its one-chart and (where it has one) two-chart form. Page tests MUST cover only what is particular to that page, and MUST NOT repeat the shared widget tests page by page.
- **FR-003**: For every user action that requests a chart or timings, the tests MUST check both what the user sees afterwards and the details sent to the backend.
- **FR-004**: Every request that can be rejected by the backend MUST have a test for the rejected case.
- **FR-005**: The tests MUST cover the edge cases listed above that concern behaviour rather than layout.
- **FR-006**: The tests MUST run with no backend, no real account, and no internet connection, using the shared mock data, and any request with no mock MUST fail the test.
- **FR-007**: Mock data MUST be extended to describe what the chart pages need, at minimum: a chart for one profile, a chart for a moment in time, a transit chart, a synastry chart, daily timings, weekly timings, moon timings, and written descriptions; and the situations of a user with no other profiles, a user with no location, a chart with a retrograde planet, and a week with no events.
- **FR-008**: The tests MUST give the same result whenever and wherever they are run: the current date, time, time zone, and language are fixed, so that "now", "today", and "this week" never change between runs.
- **FR-009**: Where a test shows a page behaving differently from the behaviour described here, the behaviour MUST be fixed as part of this work so that the test passes; the test MUST NOT be weakened or removed to make it pass. Only a problem that cannot be fixed within this application (for example, one that needs a backend change) may instead be recorded in the known-issues list with the test marked as an expected failure.

**Browser tests**

- **FR-010**: There MUST be exactly one browser journey per main page (five in total), covering the happy path only, each run once at phone size and once at desktop size and reported separately for each.
- **FR-011**: Each journey MUST reach its page through the navigation as a user would at that size, use that page's settings where it has any, and open the description drawer from each main widget on the page.
- **FR-012**: Error cases, edge cases, and variations MUST NOT be added as browser tests; they belong in the fast tests. Journeys MUST NOT be run at sizes other than phone and desktop, and no automated browser test is added for layout.
- **FR-013**: When a widget is added to a page in future, it MUST be covered by adding a step to that page's existing journey and by fast tests, not by adding a browser test. The testing guide MUST state this rule.

**Behaviour changes made by this work**

- **FR-014**: When a chart, a timing list, or a written description cannot be loaded, the widget that needed it MUST show a short "could not load" message in place of its content, MUST NOT show a loading indication indefinitely, and MUST NOT stop the rest of the page from working. The message has no "try again" control; a later successful request (after a reload, a settings change, or the automatic refresh on Daily) replaces the message with the content.
- **FR-015**: Synastry MUST open for a user who has only their own profile, showing a message that a second profile is needed and a link to the profile screen.
- **FR-016**: Closing the description drawer MUST clear the trail of items the user moved through, so that back never returns to an item from before the drawer was closed.
- **FR-016a**: The description drawer MUST close when the user changes the profile, the other profile, the date, or the time in Chart Settings, so it never shows details from a chart that is no longer on screen. An automatic refresh of the chart MUST NOT close it.
- **FR-016b**: The navigation MUST NOT show the Friends link, in the bar or in the phone menu, while the Friends page is switched off. The navigation then has seven destinations (Charts, Moment, Daily, Transits, Synastry, Profile, Logout), and the existing navigation tests MUST be updated to match.
- **FR-017**: When the user changes a setting more than once before the first chart arrives, the page MUST end up showing the chart for the most recent choice.

**Responsive layout**

- **FR-018**: At every supported screen size, each of the five pages MUST fit within the screen width with no sideways scrolling of the page. A placements table that is wider than its space MUST scroll sideways inside its own area only.
- **FR-018a**: At every supported screen size, the aspect matrix (one chart and two charts) MUST fit within the width of its space without sideways scrolling, scaling its cells and symbols down as needed. Its symbols MUST remain legible and each cell MUST open its own aspect when tapped. Matrix cells are the one exception to the comfortable tap size in FR-023.
- **FR-019**: The supported screen sizes are: small phone (320 wide), phone (390 wide), tablet (768 wide), laptop (1280 wide), and large monitor (1920 wide).
- **FR-020**: On screens narrower than a tablet, the description drawer MUST fill the screen, with back and close always visible at the top. On tablet and wider screens it MUST be a right-hand side panel no wider than the screen.
- **FR-021**: At every supported size, the drawer's content MUST scroll inside the drawer, and the drawer MUST always be closable.
- **FR-022**: At every supported size, the chart wheel MUST be shown whole and round, sized to its available space.
- **FR-023**: At every supported size, every widget, selector, field, button, marker, and message on the five pages MUST be fully visible and operable, with no clipped or overlapping content. Controls MUST be comfortably tappable on touch screens, and text MUST remain readable without zooming.
- **FR-024**: Nothing on the five pages may be reachable only by hovering with a pointer.
- **FR-025**: Layout problems found on the five pages or the drawer MUST be fixed as part of this work.
- **FR-026**: Layout changes MUST NOT change what any control does or what is sent to the backend; the tests from User Stories 1 to 4 MUST still pass afterwards.

**Completion review**

- **FR-027**: Before this work is considered complete, a Claude review subagent MUST review the running app in a browser at each of the five supported screen sizes, covering each of the five pages, every widget on it, and the description drawer in at least one state per kind of content (chart item, aspect, and timing event), looking for any responsive layout problem (sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls, unreadable text).
- **FR-028**: Every problem the review finds MUST be fixed and the affected size reviewed again, until the review finds none.

### Key Entities

- **Chart**: The positions of the planets, houses, and key angles for one birth profile or one moment in time, and the aspects between them. A two-chart page combines two of these and the aspects from one to the other.
- **Chart point**: Something on a chart that can be selected: a planet, a sign, a house, or a key angle (such as the Ascendant or Midheaven).
- **Aspect**: A relationship between two chart points, with a type and an orb.
- **Chart settings (on a page)**: What the user has chosen for the page in front of them: which profile, which other profile, and which date and time. Not saved.
- **Chart default settings**: The user's saved preferences from the profile screen (which objects and aspects are shown, and display options). The chart pages follow them.
- **Timing event**: Something that happens at a date and time: a planet meeting the Ascendant, a moon phase, an aspect starting, becoming exact, or ending, a planet changing sign, a retrograde starting or ending, or a station.
- **Description**: The explanation shown in the drawer: general information about the item, plus a written description specific to this chart that is loaded when the drawer opens.
- **Drawer trail**: The sequence of items the user has moved through since the drawer was opened, which back steps through in reverse.
- **Known issue**: A recorded problem in the app that a test exposes and that has deliberately not been fixed yet.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the acceptance scenarios in User Stories 1, 2, and 3 are covered by a passing fast test. The only permitted exceptions are expected-failure tests for problems that cannot be fixed within this application, each linked to a recorded known issue.
- **SC-002**: The full fast test run, including the tests that already exist, completes in under 20 seconds on a developer machine.
- **SC-003**: All five page journeys pass at both phone and desktop size, and the full browser run, including the journeys that already exist, completes in under 60 seconds.
- **SC-004**: There are exactly five new browser journeys. Adding one more widget to a page later adds no browser test and adds under 2 seconds to the browser run.
- **SC-005**: Breaking any single behaviour described in User Stories 1 to 3 causes at least one test to fail with a message that identifies the behaviour.
- **SC-006**: At each of the five supported screen sizes, none of the five pages scrolls sideways, and no widget or drawer state shows clipped or overlapping content.
- **SC-007**: A person on a phone can open any of the five pages, tap a planet on the wheel, read its description, go to a related item, come back, and close the drawer, without scrolling sideways or zooming.
- **SC-008**: No widget on any of the five pages shows a loading indication for more than a few seconds after its request has failed; each shows its "could not load" message instead.
- **SC-009**: A user with only their own birth profile can open all five pages without any page failing.
- **SC-010**: The browser-based review by the review subagent at all five supported screen sizes ends with no open responsive layout problems.
- **SC-011**: All tests pass on a machine with no backend running and no internet connection.

### Standing Acceptance Criteria *(all features in this repo)*

- **Responsive layout review**: Before the feature is considered complete, a Claude review subagent
  MUST review the running app in a browser at each standard screen size (320, 390, 768, 1280, and
  1920 wide), covering every screen and state the feature touches, looking for any responsive layout
  problem: sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls,
  unreadable text. Every problem found MUST be fixed and the affected size reviewed again until the
  review finds none.

## Assumptions

- "Each main page" means the five chart pages reached from the navigation: Charts, Moment, Daily, Transits, and Synastry. The home page, the sign-in and registration pages, and the Friends page are out of scope, as is the older "Time" page, which is not reachable from the navigation.
- The Friends page itself stays switched off and is separate work; this work only hides its link (FR-016b), which replaces the eight-destination navigation described in `002-profile-page-tests`.
- As with the profile screen, behaviour problems and layout problems that the new tests and the review uncover on these pages are fixed in this work, not only recorded. The number of such fixes is not known in advance, so the size of this work depends on what is found.
- The six behaviour changes in FR-014 to FR-017 are the only intended changes to what the pages do. Everything else describes the pages as they are meant to work today.
- The user closes the drawer only with its close and back buttons (confirmed). Tapping outside it, the Escape key, and the device's back gesture do not close it; on wider screens the user selects other items on the page while it is open.
- A placements table scrolling sideways inside its own area is acceptable at narrow sizes. The aspect matrix does not scroll; it is scaled to fit (FR-018a), which means its cells on a small phone are smaller than a comfortable tap target, and that is accepted.
- The correctness of the astrology itself (planet positions, aspects, timings, and the wording of written descriptions) is the backend's responsibility and is not tested here. The tests check that what the backend returns is shown and used correctly.
- The wheel's exact drawing (precise positions, colours, and spacing of symbols) is checked by the layout review, not asserted by automated tests. The tests check what is present and what selecting it does.
- Pointer-hover highlighting is a desktop convenience and is tested in the fast tests only.
- The happy-path journeys stay limited to phone and desktop, as usual. The other three sizes are covered by the review subagent's browser review, not by additional browser tests.
- The testing pattern, shared mocks, device sizes, layout-review capture, and known-issues process from `001-test-setup-pilot` and `002-profile-page-tests` are reused as they are and extended only where the chart pages need it.
- The date and time pickers in Chart Settings are the device's own built-in pickers; the work is to make sure the fields and their surrounding layout behave well, not to replace them.
- No visual redesign is intended: colours, wording, and the choice of widgets on each page stay the same unless a change is needed to make the layout fit.
- Only one browser engine is covered, as before.
