# Contract: Chart Pages UI After This Work

What the five chart pages and the description drawer expose to a user and to the tests. Tests and journeys find things only by the roles and names below. Reasons are in [research.md](../research.md) (item 5 for naming, item 6 for behaviour fixes).

## Regions

Each widget is a region named by its heading.

| Page | Regions, in reading order |
|------|---------------------------|
| Charts | "Natal Chart", "Chart Settings", "Aspect Matrix", "Placements" |
| Moment | "Moment Chart", "Chart Settings", "Aspect Matrix", "Placements" |
| Daily | "Zodiac Wheel", "Ascendant Today", "Moon Timings", "Weekly Timings", "Aspect Matrix", "Placements" |
| Transits | "Transit Chart", "Chart Settings", "Ascendant Today", "Weekly Timings", "Aspect Matrix", "Placements" |
| Synastry | "Synastry", "Chart Settings", "Synastry Aspects", "Placements" |

"Ascendant Today" is a new visible heading on the Ascendant timeline, which has none today.

## Selectable items

All are buttons (real `<button>` elements, or `role="button"` with keyboard support inside the wheel SVG).

| Item | Accessible name | Opens drawer on |
|------|-----------------|-----------------|
| Wheel planet | "Sun"; with retrograde "Mercury, retrograde"; two-chart: "Sun, My Profile", "Sun, Mum", "Sun, Transit" | that planet (for that chart) |
| Wheel sign | "Aries" | that sign |
| Wheel house | "1st House"; two-chart: "1st House, Mum" | that house (for that chart) |
| Wheel key angle | "Ascendant"; two-chart: "Ascendant, Mum" | that angle |
| Matrix cell with an aspect | "Sun Trine Moon" (row point, aspect, column point; two-chart: "Mum Sun Trine My Profile Moon") | that aspect |
| Planet, sign, house, key-angle chip | "Sun", "Aries", "1st House", "Ascendant" | that item |
| Aspect chip | "Sun Trine Moon" | that aspect |
| Ascendant conjunction marker | "Venus conjuncts ASC at 9:42 AM" (unchanged) | that event |
| Moon phase tile | "View Full Moon details" (unchanged) | that phase |
| Weekly event, By day view | "Sun Trine Moon exact", "Mars enters Aquarius", "Mercury starts retrograde", "Saturn stations direct" | that event |
| Weekly event, Timeline view | The same names with " at 3:15 PM" appended (a station has no time in its name) | that event |

Wheel planets expose `data-highlighted="true"` while highlighted because the pointer is on a planet they aspect. Each aspect line carries `data-aspect` with its type. Aspect lines are not selectable.

Chips shown inside a weekly event preview are display-only; the preview is the one button (research B14).

## Chart Settings

| Control | Label | Pages |
|---------|-------|-------|
| Profile selector | "Profile" | Charts, Transits, Synastry |
| Other profile selector | "Other Profile" | Synastry |
| Date field | "Date" | Moment, Transits |
| Time field | "Time" | Moment, Transits |

Labels are tied to their controls (they are not today). The main profile is the first option.

## Weekly Timings

A group named "Weekly timing view" with two toggle buttons, "By day" and "Timeline" (`aria-pressed`), unchanged.

## Description drawer

- A complementary region named "Description". Absent from the page when closed.
- Header: a button named "Back", the item's title as a heading, a button named "Close".
- Body sections are disclosure buttons ("Overview", "Details", "Aspects", "Times", "Planets in this Sign", and so on, as today) with `aria-expanded`.
- While a written description is loading, the Details section shows a status element named "Loading".
- Below 768px wide it covers the whole screen and the page behind does not scroll. From 768px it is a 400px panel on the right.
- Closes on: Close; Back with an empty trail; a change of profile, other profile, date or time; leaving the page. Does not close on Escape, on a click outside, or on the device's back action.

## Messages

All "could not load" messages are `role="alert"`.

| Situation | Text | Where |
|-----------|------|-------|
| Chart request failed | "Could not load the chart." | The wheel region; the matrix and placements regions show the same text |
| Daily timings failed | "Could not load today's timings." | Ascendant Today |
| Weekly timings failed | "Could not load this week's timings." | Weekly Timings |
| Moon timings failed | "Moon timings are unavailable right now." (unchanged) | Moon Timings |
| Written description failed | "Could not load this description." | Drawer, Details section |
| Synastry with one profile | "Synastry compares two birth profiles. Add a second profile to use it." with a link "Go to Profile" | In place of the Synastry page content |
| No Ascendant conjunctions | "No exact ASC conjunctions today" (unchanged) | Ascendant Today |
| Day with no events | "No timing events" (unchanged) | Weekly Timings, By day |
| Week with no events | "No timing events this week" (unchanged) | Weekly Timings, Timeline |
| Chart still loading | A status element named "Loading" | Wheel region |

None of the messages has a "try again" control.

## Redirects (unchanged, now tested)

| Situation | Result |
|-----------|--------|
| No main birth profile, any of the five pages | Sent to `/profile`; toast "Please create your birth profile first" |
| No location, on Moment, Daily or Transits | Sent to `/profile`; toast "Please enter your location first" |

## Navigation

The bar (from 768px) and the phone menu list: Charts, Moment, Daily, Transits, Synastry, Profile, Logout. No Friends entry.

## Layout rules

| Rule | Detail |
|------|--------|
| Page | Never wider than the screen at 320, 390, 768, 1280, 1920 |
| Wheel | Whole, round, as wide as its column, up to its current maximum |
| Aspect matrix | Always fits its region; never scrolls sideways; cells square; smallest cell about 16px at 320 |
| Placements | May scroll sideways inside its own region, with a soft shadow at the edge showing there is more |
| Daily and Transits, 1280px and up | Two independent columns: wheel and matrix on the left, the other widgets and placements on the right. Below that, one column in the order wheel, side widgets, matrix, placements |
| Inner scroll areas | Timelines and long tables scroll inside themselves; the page can still be scrolled past them |
| Tap size | 44px for buttons, chips' rows, selectors and drawer controls; matrix cells and wheel planets are exempt but must open the item tapped |
