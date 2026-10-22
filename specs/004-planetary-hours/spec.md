# Feature Specification: Planetary Hours on Daily

**Feature Branch**: `004-planetary-hours`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to make a simple good looking widget on daily for planetary hour / day. and i want to add that timeline to the daily timing widget - so that it slots in next to the sign as the planetary hour, well styled. tests. here's the endopint:" (followed by the contract of the planetary hours service: for a given date it returns the day's ruling planet, sunrise, sunset, the next sunrise, and a chronological list of planetary hours, each with its number, ruling planet, the ruler of the planetary day it belongs to, whether it is a day or night hour, and its start time)

## User Scenarios & Testing *(mandatory)*

In traditional astrology each day, counted from sunrise to the next sunrise, is ruled by one of the seven classical planets, and is divided into 24 planetary hours: 12 of equal length between sunrise and sunset, and 12 of equal length between sunset and the next sunrise. Each hour has its own ruling planet. People use the current day and hour ruler to choose when to do things.

This feature shows that information in two places:

- a new **Planetary Hour widget** on the Daily page, which answers "what planetary day and hour is it right now?" at a glance;
- a new **planetary hour column** in the existing day timeline (the "Ascendant Today" widget), placed beside the rising-sign column, so the user can see which planetary hour and which rising sign apply at any time of the day.

### User Story 1 - See the current planetary day and hour at a glance (Priority: P1)

A user opens the Daily page and, without selecting anything, sees which planet rules today and which planet rules the current hour, together with when the current hour ends and which planet rules the next one.

**Why this priority**: This is the core of the request and is useful by itself. It also establishes the planetary hours data that the timeline column in Story 2 relies on.

**Independent Test**: Open the Daily page as a signed-in user and confirm the widget names the correct day ruler and hour ruler for the current time, compared against the planetary hours service's answer for today.

**Acceptance Scenarios**:

1. **Given** a signed-in user on the Daily page during the daytime, **When** the planetary hours have loaded, **Then** the widget shows the planet ruling the current planetary day and the planet ruling the current planetary hour, each with its symbol and name.
2. **Given** the widget is showing the current hour, **Then** it also shows the hour's number within its planetary day (1 to 24), whether it is a day hour or a night hour, the time it started and the time it ends.
3. **Given** the widget is showing the current hour, **Then** it shows which planet rules the next hour and when that hour starts.
4. **Given** the current time is after local midnight and before today's sunrise, **When** the widget is shown, **Then** the day ruler shown is the ruler of the planetary day that began at the previous sunrise (not the ruler of the calendar date), and the hour shown is the matching night hour.
5. **Given** the widget is shown, **Then** today's sunrise and sunset times are shown.
6. **Given** the page stays open while one planetary hour ends and the next begins, **Then** the widget changes to the new hour within one minute, without the user reloading the page.
7. **Given** the planetary hours are still loading, **Then** the widget shows a loading indication under its heading and the rest of the page is usable.

---

### User Story 2 - See planetary hours alongside the rising sign in the day timeline (Priority: P2)

A user looking at the day timeline sees a column of planetary hours next to the column of rising signs. Each planetary hour is a block running from its start time to its end time, marked with its ruling planet, so the user can read across at any time of day and see both the rising sign and the planetary hour.

**Why this priority**: It adds planning value (seeing the whole day, not only the present) but depends on the same data as Story 1 and changes an existing widget, so it comes second.

**Independent Test**: Open the day timeline and confirm that the planetary hour blocks cover the whole day without gaps, that each block's ruler and start time match the planetary hours service's answer, and that the block crossed by the "now" line is the same hour the Planetary Hour widget shows.

**Acceptance Scenarios**:

1. **Given** the day timeline has loaded, **Then** a planetary hour column is shown directly beside the rising-sign column, and every moment from the start to the end of the day falls inside exactly one planetary hour block.
2. **Given** a planetary hour block, **Then** it shows the symbol of its ruling planet, and its position and height correspond to its start and end times on the same scale as the rising-sign column.
3. **Given** the planetary hour column, **Then** day hours and night hours are visually distinguishable, and sunrise and sunset are identifiable as the points where one changes to the other.
4. **Given** the first block of the day belongs to the previous planetary day's night, **Then** it starts at the top of the timeline (local midnight) and is not drawn above it; **Given** the last block of the day runs past the next local midnight, **Then** it ends at the bottom of the timeline.
5. **Given** the "now" line on the timeline, **Then** the planetary hour block it crosses is the current planetary hour, and it is the same hour shown in the Planetary Hour widget.
6. **Given** a planetary hour block, **When** the user hovers over it or focuses it, **Then** the ruling planet's name, the hour number and the hour's start and end times are available.
7. **Given** the day timeline appears on a page other than Daily (the Transits page), **Then** the planetary hour column is shown there too, with the same behaviour.
8. **Given** a phone-width screen, **Then** the time labels, the rising-sign column, the planetary hour column and the Ascendant conjunction markers are all visible without sideways scrolling, and the conjunction buttons stay easy to tap.

---

### User Story 3 - Planetary hours are protected by automated tests (Priority: P3)

A developer changes the Planetary Hour widget or the day timeline and runs the fast test command. Within seconds they learn whether the current hour is still worked out correctly, whether the timeline column still lines up, and whether the failure states still behave, with no backend, account or internet connection needed. The existing Daily browser journey confirms the widget and the column appear in the real application.

**Why this priority**: The tests protect Stories 1 and 2; they have nothing to protect until those exist.

**Independent Test**: With the backend stopped, run the fast test command and confirm the planetary hour tests pass; then deliberately break one behaviour (for example, take the day ruler from the calendar date instead of the current hour) and confirm a test fails and names that behaviour.

**Acceptance Scenarios**:

1. **Given** the fast tests, **Then** they cover every acceptance scenario of Stories 1 and 2 that does not need a real browser layout, and every edge case listed below, using fixed times and prepared planetary hours data.
2. **Given** the Daily browser journey, **Then** it gains one step confirming that the Planetary Hour widget and the timeline's planetary hour column are shown, at phone and desktop sizes. No separate browser test is added, and failure states are not tested in the browser.
3. **Given** the Transits browser journey, **Then** it is not extended for this feature; the column's behaviour there is covered by the fast tests.

---

### Edge Cases

- **Before sunrise**: between local midnight and sunrise the current hour belongs to the previous planetary day. The widget shows that day's ruler and that night hour (Story 1, scenario 4).
- **No sunrise or sunset** (polar day or night at the user's location): planetary hours cannot be worked out. The widget shows a short message that planetary hours are not available for this location today. The day timeline is shown as before, without the planetary hour column.
- **Planetary hours fail to load** for any other reason: the widget shows a short "could not load" message with no retry control, consistent with the other widgets. The day timeline is shown as before, without the planetary hour column. The rest of the page keeps working.
- **Day timeline's own data fails to load** while planetary hours load: the Planetary Hour widget is unaffected.
- **The date changes while the page is open** (the user keeps the page open past local midnight): the widget and timeline move to the new day's planetary hours within one minute.
- **Very short or very long hours**: near midsummer or midwinter at high latitudes, day and night hours differ greatly in length (for example about 20 minutes against about 100). Short blocks in the timeline column still show their planet symbol legibly and do not overlap their neighbours.
- **No saved location / not signed in**: the Daily page is only reachable by a signed-in user with a saved location; no separate state is defined for this.
- **The current time is outside every returned hour** (should not happen, since the returned hours cover the calendar day): the widget shows the "could not load" message instead of a wrong hour.

## Requirements *(mandatory)*

### Functional Requirements

**Planetary Hour widget**

- **FR-001**: The Daily page MUST show a Planetary Hour widget, with a heading, among its timing widgets.
- **FR-002**: The widget MUST show the ruling planet of the current planetary day and the ruling planet of the current planetary hour, each with the planet's symbol and name, and MUST make clear which is the day ruler and which is the hour ruler.
- **FR-003**: The day ruler shown MUST be that of the planetary day the current hour belongs to, so that before sunrise it is the previous planetary day's ruler.
- **FR-004**: The widget MUST show the current hour's number (1 to 24), whether it is a day or night hour, and its start and end times.
- **FR-005**: The widget MUST show the next hour's ruling planet and start time.
- **FR-006**: The widget MUST show today's sunrise and sunset times.
- **FR-007**: The widget MUST update to the new current hour within one minute of an hour boundary, and to the new day's hours within one minute of local midnight, without a page reload.
- **FR-008**: While loading, the widget MUST show its heading and a loading indication.
- **FR-009**: When there is no sunrise or sunset at the user's location on that date, the widget MUST show a short message saying planetary hours are not available for this location today.
- **FR-010**: When planetary hours fail to load for any other reason, the widget MUST show a short "could not load" message and the rest of the page MUST keep working.
- **FR-011**: The widget MUST match the visual style of the existing Daily timing widgets (heading, spacing, type sizes, planet symbols) and MUST be compact: its content is readable without scrolling inside the widget.

**Day timeline column**

- **FR-012**: The day timeline MUST show a planetary hour column directly beside the rising-sign column, on every page where the day timeline appears.
- **FR-013**: The column MUST show one block per planetary hour that overlaps the displayed day, positioned and sized by its start and end times on the same time scale as the rising-sign column, with the first and last blocks cut off at the start and end of the displayed day.
- **FR-014**: The blocks MUST cover the displayed day without gaps or overlaps.
- **FR-015**: Each block MUST show its ruling planet's symbol, and MUST make the planet's name, the hour number and the hour's start and end times available on hover and to assistive technology.
- **FR-016**: Day hours and night hours MUST be visually distinguishable, by more than colour alone or with enough contrast to be read by users with colour vision deficiency.
- **FR-017**: When planetary hours are unavailable or fail to load, the day timeline MUST be shown without the planetary hour column, with its existing content unchanged.
- **FR-018**: The existing behaviour of the day timeline MUST be preserved: time labels, rising-sign blocks, Ascendant conjunction markers and what they open, the "now" line, and scrolling to the current time when first shown.
- **FR-019**: The hour shown as current in the widget and the block crossed by the timeline's "now" line MUST always be the same hour.

**Times**

- **FR-020**: All times in the widget and the column MUST be shown in the same format as the existing day timeline's times.

**Tests**

- **FR-021**: Fast tests, needing no backend, MUST cover: the current hour and day ruler at a daytime moment, a night moment after sunset, and a moment between midnight and sunrise; the next hour; the change at an hour boundary; the timeline column's coverage, clipping at both ends of the day, and agreement with the "now" line; the "not available" state; the "could not load" state; and that the timeline is unchanged when planetary hours are missing.
- **FR-022**: The existing Daily browser journey MUST gain one step confirming the widget and the timeline column are shown, run at phone and desktop sizes. No other browser tests are added.
- **FR-023**: Existing tests for the Daily and Transits pages MUST continue to pass, updated only where the timeline's layout change requires it.

### Key Entities

- **Planetary day**: The period from one sunrise to the next, ruled by one of the seven classical planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn). Has a ruler, a sunrise, a sunset and an end (the next sunrise).
- **Planetary hour**: One of the 24 divisions of a planetary day. Has a number (1 to 24; 1 to 12 are day hours, 13 to 24 are night hours), a ruling planet, the ruler of the planetary day it belongs to, and a start time. Its end is the start of the next hour, or the next sunrise for hour 24.
- **Displayed day**: The calendar day the timeline shows, from local midnight to local midnight. It contains the tail of the previous planetary day's night hours, then the hours of the planetary day that begins at this date's sunrise up to midnight.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user opening the Daily page can name the current planetary day ruler and hour ruler within 5 seconds, without scrolling inside any widget or selecting anything.
- **SC-002**: At any moment of the day, including before sunrise, the day ruler and hour ruler shown match the planetary hours service's answer for that moment in 100% of checked cases.
- **SC-003**: In the day timeline, 100% of the displayed day is covered by planetary hour blocks, and each block boundary lines up with its time on the timeline's scale to within one minute.
- **SC-004**: After an hour boundary passes, the widget shows the new hour within 60 seconds with no user action.
- **SC-005**: When planetary hours are unavailable or fail to load, every other widget on the page still works and the day timeline looks as it did before this feature.
- **SC-006**: The fast tests for this feature run without a backend and add no more than a few seconds to the fast test run; the browser test count is unchanged (one more step in the Daily journey).
- **SC-007**: At every standard screen size, the widget and the widened timeline show no sideways scrolling, clipped or overlapping content.

### Standing Acceptance Criteria *(all features in this repo)*

- **Responsive layout review**: Before the feature is considered complete, a Claude review subagent
  MUST review the running app in a browser at each standard screen size (320, 390, 768, 1280, and
  1920 wide), covering every screen and state the feature touches, looking for any responsive layout
  problem: sideways scrolling, clipped or overlapping content, unreachable or hard-to-tap controls,
  unreadable text. Every problem found MUST be fixed and the affected size reviewed again until the
  review finds none.

## Assumptions

- **"Daily timing widget"** means the day timeline headed "Ascendant Today", which shows the rising sign through the day. It is shared by the Daily and Transits pages, so the new column appears on both. The Planetary Hour widget itself is added to the Daily page only.
- **Widget position**: the Planetary Hour widget is placed first among the Daily page's side widgets, above the day timeline, because it is the quickest to read. On narrow screens it follows the chart wheel, as the other side widgets do.
- **Timeline heading**: the timeline keeps its current heading; renaming it now that it shows more than the Ascendant is left for planning to propose.
- **No description drawer entry**: selecting a planetary hour or the widget does not open the description drawer. Written explanations of planetary hours are out of scope for this feature.
- **Today only**: the widget and the column show today's planetary hours. Choosing another date is out of scope.
- **Classical planets only**: rulers are always one of the seven classical planets, all of which already have symbols and names in the application.
- **Time zone**: the planetary hours service gives times as local time at the user's saved location, and the day timeline uses the local time of the user's device. The feature assumes these are the same time zone, as the existing day timeline already does.
- **The planetary hours service already exists** in the backend, requires a signed-in user like the other timing services, and for a given date returns the tail of the previous planetary day's night hours followed by all 24 hours of that date's planetary day. No backend change is part of this feature.
- **Failure handling follows the existing convention** (from `003-main-page-tests`): a failing widget shows a short message with no retry control and the rest of the page keeps working.
- **Testing approach follows the existing convention**: browser tests cover only the happy path at phone and desktop sizes, one journey per page; everything else is covered by the fast tests.
