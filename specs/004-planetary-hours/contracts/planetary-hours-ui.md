# Contract: Planetary Hours UI

What the user sees and what tests can hold on to after this work. Roles and names are the interface the tests use; there are no test ids. Example values are those of the test fixture at the frozen time (07:00 on 15 January 2026; see [data-model.md](../data-model.md)).

## Planetary Hour widget (Daily only)

| Thing | Role and name | Content |
|-------|---------------|---------|
| Widget | `region` "Planetary Hour" | First of the side widgets, above "Ascendant Today" |
| Day tile | `group` "Day ruler: Mercury" | Label "Day", symbol ☿, "Mercury", "Until sunrise", "7:12 AM" (when this planetary day ends: today's sunrise before it has risen, otherwise the next one) |
| Hour tile | `group` "Hour ruler: Saturn" | Label "Hour", symbol ♄, "Saturn", "Hour 24 · Night", "6:01 AM – 7:12 AM" |
| Next hour | text | "Next: ♃ Jupiter at 7:12 AM" |
| Sun times | text | "Sunrise 7:12 AM · Sunset 5:00 PM" |
| Loading | `status` "Loading" (shared `Spinner`) | Under the heading |
| Not available | `alert` (shared `LoadError`) | "Planetary hours are not available for this location today." |
| Could not load | `alert` (shared `LoadError`) | "Could not load planetary hours." |

- Symbols are decorative (`aria-hidden`); the names carry the meaning.
- "Day" or "Night" is written out in the hour tile.
- Nothing in the widget is a button; nothing opens the description drawer.
- The widget's content fits without scrolling inside it. The two tiles stay side by side at every width; below 640 wide each tile stacks its symbol above its text so no line wraps; the next-hour and sun-times line may wrap to two lines.

## Planetary hour column (the "Ascendant Today" timeline, on Daily and Transits)

| Thing | Role and name | Content |
|-------|---------------|---------|
| Column | `list` "Planetary hours" | Between the rising-sign column and the conjunction markers |
| Block | `listitem`, `aria-label` and `title` "Saturn hour, 24 of 24, night, 6:01 AM to 7:12 AM" | The planet's symbol, centred |
| Current block | the same, with `aria-current="time"` | The block the NOW line crosses |
| Start line and time | `time`, for example "7:12 AM" | A line across the top of each block with the time the hour starts just under it. An hour that began before midnight has the line but no time |
| Sunrise, sunset | text "Sunrise" / "Sunset" | Under the start time of the first day hour and the first night hour |

- A block's label always gives the hour's true start and end, even when the block is cut off at midnight.
- Block names never contain " from " (sign blocks are found by that word).
- Blocks are not buttons and are not in the tab order.
- Day hours and night hours have different backgrounds; the "Sunrise" and "Sunset" captions and the word "day" or "night" in each name mean colour is not the only signal.
- The column is present only when planetary hours have loaded. While loading, when unavailable, and when the request fails, the timeline has its three existing columns and no message about planetary hours.

## Unchanged in the timeline

The heading "Ascendant Today", the current Ascendant line, the time labels, the sign blocks and their titles ("Capricorn from 5:40 AM"), the conjunction marker buttons and what they open, "No exact ASC conjunctions today", the loading and failure states for the day's timings, and scrolling to the current time when first shown.

One thing changes underneath: the NOW line's position comes from the planetary hours provider's clock, which moves every minute on both pages.

## Layout rules

| Width | Timeline columns (time, sign, hour, markers) |
|-------|-----------------------------------------------|
| Below 640 | 3rem, 4.5rem, 2.25rem, rest |
| 640 and up | 3.5rem, 6.5rem, 3rem, rest |

- No sideways scrolling at 320, 390, 768, 1280 or 1920 wide, on Daily or Transits.
- Conjunction marker buttons stay 44px and their time labels are not clipped.
- The shortest hour in the fixture (49 minutes) and a 20-minute hour both show their symbol without overlapping a neighbour.
