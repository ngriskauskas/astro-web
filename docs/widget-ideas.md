# Astrology Widget Ideas

Last reviewed against the widget library in `src/components/widgets/index.tsx`.

Status labels:

- **Built** — a widget exists in the library and can be placed on any page.
- **Partial** — the data or a piece of the idea exists (often in a drawer or inside another widget) but there is no standalone widget.
- **Proposal** — a new presentation or calculation that needs design and implementation.

Rules every widget follows:

- Real data only. Use the profile, chart and timing responses from the API. Never show sample placements, and never imply an event exists when the API returned none; hide the widget or show an honest empty state instead.
- Widgets are standalone. They use the shared `Widget` shell, supply their own chart scope (`ChartScope`), and open the same description drawer, so a page is only a layout.
- Widgets follow the chart scope they sit in. Timing widgets are generic sky timings on Daily and personalised on Transits.
- Descriptive text is deterministic or grounded in returned data. No compatibility scores or predictions.

## Library inventory

| Widget | Scope it accepts | Notes |
| --- | --- | --- |
| `AtAGlanceWidget` | time | Sun, Moon, Rising, Midheaven, day ruler |
| `PlanetaryHourWidget` | any | Current hour and day ruler, progress, sunrise and sunset |
| `HoursTodayWidget` | any | All hours today, current one marked |
| `UpcomingHoursWidget` | any | Coming-up list |
| `MoonTimingsWidget` | time | Orbit, Timeline and Phases views |
| `AscendantTodayWidget` | time, transit | Narrow vertical timeline, Dark and Light looks |
| `WeeklyTimingsWidget` | time, transit | By day or Timeline |
| `NatalSnapshotWidget` | natal | Rising, Sun and Moon cards |
| `ChartSummaryWidget` | any single chart | Element and modality balance, tightest aspects |
| `HousesWidget` | any single chart | Twelve houses with rulers |
| `ZodiacWheelWidget` | any single chart | Interactive wheel |
| `AspectMatrixWidget`, `AspectKeyWidget` | any single chart | Matrix and its legend |
| `PlacementsWidget` | any single chart | Full table, or a key-placements summary with a disclosure |
| `KeyAspectsWidget` | any single chart | Tightest aspects, configurable limit |
| `PlanetInChartWidget` | any single chart | One planet's sign, house and dignity |
| `PlanetReturnsWidget` | none (planet prop) | Previous and next return of a planet |
| `ChartRulerWidget` | any single chart | The Ascendant's sign, its ruler and that planet's card |
| `DignitiesWidget` | any single chart | Core planets as sign or house dignities, with a By sign / By house toggle |
| `AspectPatternsWidget` | any chart | Grand trines, T-squares, yods and stelliums, per side on two-chart views |
| `HemispheresWidget` | any single chart | One circle of four named quarters (Personal, Private, Relational, Collective), shaded by planet count, each opening its own description |
| `TwoChartWheelWidget`, `TwoChartMatrixWidget`, `TwoChartPlacementsWidget` | transit, synastry | Two-chart views |
| `ChartSettingsWidget` | any | Profile, date and time controls |
| `QuickLinksWidget` | none | Home navigation |

## Natal

### Built

- **Natal chart wheel**, **Placements** (full or key summary), **Aspect matrix**, **Chart settings**.
- **Natal snapshot** — Rising, Sun and Moon at a glance. This delivers the earlier "Big Three" proposal.
- **Summary** — dominant element and modality, plus the tightest aspects. This delivers "Element and modality balance" and the core of "Personal chart highlights". Its figures open the distribution drawer.
- **Houses** — the twelve houses and their rulers.
- **Key aspects**, **Planet in this chart**, **Planet returns**.
- **Chart ruler** — the Ascendant's sign and ruler, with the ruler's sign, house, dignity and aspects to the angles. On Natal, Moment and Daily (Daily has it in the Shape tab).
- **Dignities** — the core planets as one chip each ("Saturn in Capricorn"), grouped as At home, Exalted, Detriment and Fall. A By house toggle groups them as Angular, Succedent or Cadent, with an "in joy" marker for planets in their house of joy. On Natal, Moment and Daily.
- **Hemispheres and quadrants** — the ten planets as one circle: four quarters named Personal, Private, Relational and Collective, each shaded by its planet count and clickable to open its description with an AI reading. Planet glyphs open their drawers, the centre shows the total, and the quarters grow in with a count-up on entry (motion is off for reduced-motion users). A sentence under the circle names the quarter with most planets. On Natal, Moment and Daily.
- **Aspect patterns** — grand trines, T-squares, yods, kites, grand crosses, mystic rectangles, grand sextiles, stelliums and conjunction clusters. A shape's corners are conjunction clusters, so a shape can hold more planets than its usual count. A shape that sits inside a larger one (a grand trine inside a kite, or a T-square inside a grand cross) is not listed on its own. Two shapes that share corners but are not nested are two shapes. Stelliums are three or more personal planets (Sun to Mars) in one sign. Conjunction clusters are three or more planets joined by conjunctions, of any kind. Shapes use the chart's aspect orbs; yod quincunxes are measured from positions with a fixed 2° orb. Each shape opens a drawer with a generated reading. On Natal, Moment, Daily (Shape tab), Transits and Synastry, where each side is shown under its name.
- **Planet drawer sections** — Overview, Details, In this chart, Returns, Cycles (retrograde and station history for the planets that retrograde, with the last and next period) and Aspects.
- **Element and modality drawers** — the Summary tiles open a drawer with the general description, the placements in that element or modality, and an AI reading of the emphasis.

### Proposals

- **Your chart through the houses** — a guided modal walkthrough that follows the twelve houses as one continuous loop, tailored to this chart's placements. See the detailed proposal below.
- **Planet strip** — a compact row of all planets with sign glyph and degree, a denser alternative to the table.
- **Retrograde at birth** — which natal planets were retrograde.
- **Angles and points** — ASC, MC, nodes, Lilith and Chiron grouped with short descriptions.

### Proposal in detail: Your chart through the houses

**What it is.** A modal slideshow, opened from a button on the Natal page (and from the Natal snapshot and Houses widgets). It walks through the chart house by house, starting at the 1st and ending by returning to the 1st, so the twelve houses read as one organic cycle rather than twelve separate entries: self, resources, communication, home, creativity, work and health, partnership, shared resources, meaning, public life, community, and the unseen inner life that feeds back into self.

**Why.** The Houses table lists facts, but it doesn't show how the areas of a life connect. The walkthrough tells that story in the order a life actually unfolds, using this person's own placements.

**Flow.**

1. **Opening slide** — the whole wheel with the loop drawn as a path through the houses, a one-line premise, and the chart's high-level shape (see the guides aspiration below).
2. **Twelve house slides** — each slide shows:
   - the house name and its life theme, with the wheel highlighted on that house and the path moving from the previous house;
   - the sign on the cusp and what that sign brings to this area;
   - the house ruler, where it sits and what that links this area to ("the story of your home continues in your 10th house");
   - any planets in the house and the aspects they make;
   - an empty house is said to be empty, and its tone is carried by its ruler instead;
   - a short bridge sentence that hands over to the next house.
3. **Closing slide** — the loop completes: the strongest recurring threads across houses (the most-emphasised element, repeated rulers, tight aspects that connect houses), with links to the full chart.

**Interaction and motion.**

- Next and back buttons, arrow keys, and a 12-step progress ring that doubles as navigation.
- The wheel rotates so the current house sits at a fixed position, and a glowing path draws from house to house to show the loop. The text slides and fades between slides.
- Reduced-motion users get plain cross-fades and no rotation.
- Focus is trapped in the modal and returns to the opener on close. It is closable with Escape, and the reading position persists if reopened in the same session.
- Planet, sign and ruler names in each slide open the usual description drawer, so any detail can be explored without losing the thread.

**Data and text.** All text is composed deterministically from returned data: house cusps, signs, rulers, placements, aspects and dignities (`natalSummary.ts` and the Houses data). No scores, predictions or invented events. Each house theme and each sign-in-house phrasing comes from a vetted description table, combined by templates, so the output is consistent and testable. It can also use the generated-description path the drawer already uses, as long as every sentence is grounded in a named placement.

**Scope.** Natal chart only at first. The same slide engine could later serve a Moment chart or a transit "through your houses" view.

**Open questions.** How long each slide should be (target: a short paragraph, under about 80 words). Whether unknown birth times should disable the walkthrough, since the houses depend on the birth time. Whether to offer an auto-play mode.

## Daily

### Built

- **Planetary hour now**, **Hours today**, **Coming up**.
- **Ascendant today** — sign bands, planetary hours and exact planet-to-Ascendant conjunctions. Dark and Light looks.
- **Moon timings** — Orbit, Timeline and Phases.
- **Weekly timings** — by day or timeline.
- **At a glance**, **Summary**, **Wheel**, **Placements** and **Aspect matrix** for the current sky.
- **Daylight progress** — sunrise-to-sunset progress is shown inside the Planetary hour widget.
- **Moon timings** show the next four phases, with a More phases disclosure for the full list.
- **Weekly timings** show today and the next two days, with a disclosure for the whole week.
- **Explore tabs** — Today, This week, Chart, Shape (chart ruler, dignities and hemispheres) and Aspects.

### Proposals

- **Today's briefing** — a short summary built only from today's Moon phase, Ascendant changes and returned timing events.
- **Next notable moment** — the next event with a countdown. Hidden when nothing is upcoming in range.
- **Void-of-course Moon** — periods when the Moon makes no more major aspects before changing sign, only if the API can supply them.
- **Sunrise and sunset ribbon** — a thin day bar with planetary hour boundaries and the current time.
- **Day ruler card** — the day's planet, its hours today, and what it rules, linking to its drawer.
- **Retrograde tracker** — which planets are retrograde now, their station dates and shadow periods.
- **Ingress countdown** — the next sign change for each planet, soonest first.
- **Lunar age and illumination** — percent lit, age of the Moon, and next new and full Moon dates.

## Current (Moment)

### Built

- **Moment chart wheel**, **Chart settings** (compact date and time), **Summary**, **Placements**, **Aspect matrix**.
- **Chart ruler**, **Dignities**, **Aspect patterns** and **Hemispheres and quadrants**, placed beside the Summary and Placements.

### Proposals

- **Time scrubber** — step or drag the moment and refresh the chart, with a clear selected-time label and a "Now" reset.
- **What's active now** — current exact aspects, kept visibly separate from natal placements.
- **Compare two moments** — what changed between two chosen times, without replacing the saved natal chart.
- **Moment over natal** — the moment's planets laid over the birth chart.
- **Saved moments** — bookmark a date and time, such as an event or decision, to reopen later.
- **Election helper** — scan a date range for times when chosen conditions hold. Needs backend support.

## Transit

### Built

- **Transit wheel**, **Transit placements**, **Aspect matrix**, **Ascendant today**, **Weekly timings**, **Chart settings**, **Aspect patterns** for the natal chart and the transiting sky.

### Proposals

- **Transits to natal planets** — upcoming exact aspects to natal placements, in time order, linked to descriptions.
- **Transit spotlight** — one current or next transit, with its exactness window and source data.
- **Transit calendar** — week or month view of returned ingresses, stations and major aspects.
- **Houses being transited** — which natal house each slow planet is passing through.
- **Outer-planet watch** — Saturn, Uranus, Neptune and Pluto and the natal points they are approaching.
- **Applying versus separating** — each transit aspect marked as building or fading, with its orb.
- **Returns countdown** — time to the next Saturn, Jupiter and nodal returns, built on the Planet returns data.

## Synastry

### Built

- **Two-chart wheel**, **Synastry aspects**, **Comparative placements**, **Profile selectors** (in Chart settings), **Aspect patterns** for each person's chart.

### Proposals

- **Relationship highlights** — the strongest inter-chart aspects, labelled by whose planets are involved.
- **House overlays** — where each person's planets land in the other's houses.
- **Element and modality comparison** — two charts' distributions side by side, with no scoring.
- **Shared chart snapshot** — a concise comparison with both names and the chart settings used.
- **Composite chart** — a chart built from the midpoints of the two charts.
- **Big three pair** — the Natal snapshot for both people side by side.
- **Aspects by planet** — pick a planet and see every aspect it makes to the other chart.

## Home

### Built

- **Quick links**, **At a glance**, **Planetary hour**, **Natal snapshot**, **Moon timings**, **Ascendant today**, **Weekly timings**.

### Proposals

- **Next up** — the single next thing worth knowing (an ingress, station or exact aspect) with a countdown.
- **Profile switcher** — change whose sky Home reflects without leaving the page.
- **This month** — new and full Moons, ingresses and stations as a short list.
- **Recently opened** — shortcuts back to the last chart, moment or synastry pair viewed.

## Cross-page ideas

These work on any page because they follow the page's chart scope.

- **Pin a planet** — keep one planet's sign, house, dignity and returns as a persistent mini card.
- **Glossary hover** — short definitions for signs, houses and aspects from the same sources as the drawer.
- **Print or share view** — a clean one-page export of whichever widgets are on screen.
- **Saved layouts** — let people choose and keep widget arrangements, as Daily already does with its four layouts.
- **Widget gallery** — a development-only page that renders every library widget in each scope it accepts, for visual checks.

## Suggested next picks

1. **Transits to natal planets** — the highest-value Transit widget, a natural use of the weekly timing data.
2. **Next notable moment** — useful on Home and Daily and cheap if timing data is already loaded.
3. **Retrograde tracker** — popular, and now derivable from the Cycles endpoint (`POST /timing/cycles`).
4. **Time scrubber** — makes the Moment page much more useful.

## Aspiration: guides that explain each page from the top down

The goal is for every page to open with a **guide**: a plain-language synthesis of what is really going on in that chart, at a high level. It could be a section, a widget, a banner or a slideshow; the form matters less than the job. A guide gives the reader the whole picture first, then lets them break it down gradually, from the overall story into areas of life and then into individual placements, aspects and timings.

**The experience we want.**

1. **Synthesis first.** The top of each page says in a few sentences what the chart is about: for a natal chart, its dominant element and modality, the main emphasis by house, and the tightest aspects tying it together. For Daily, the Moon phase and today's rhythm. For Transits, the main current pressures on the natal chart. For Synastry, the main points of connection between the two people.
2. **Then areas of life.** From the synthesis, the reader moves into themes (identity, relationships, work, home, and so on), each with a short explanation tied to specific placements.
3. **Then the specifics.** Each theme links down into the existing widgets and drawers: a planet, a sign, a house, an aspect, a timing.
4. **Always a way back up.** Every detailed view says which theme it belongs to and links back to the overview, so the reader never loses the big picture.

**Design principles.**

- Text is grounded in the returned data: every claim names the placement or event behind it. No scores, predictions, or filler that would read the same for any chart.
- Detail increases step by step, and each step is skippable. Experienced users can ignore a guide; beginners can follow it end to end.
- Guides reuse the widget library: a guide is a layout and a text source, and its links open the same drawer.
- A guide can be a slideshow, such as "Your chart through the houses", or a static summary card. Both come from one shared text-composition layer, so wording stays consistent between them.

**First steps toward it.**

- The **Summary** widget already states the dominant element and modality and the tightest aspects. It can be extended into the opening synthesis of the Natal page.
- "Your chart through the houses" is the first full guide and the template for the others.
- Next candidates: a Daily briefing, a Transit spotlight and a Synastry highlights guide, each following the same synthesis, then themes, then specifics structure.
