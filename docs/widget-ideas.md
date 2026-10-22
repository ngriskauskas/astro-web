# Astrology Widget Ideas

Status labels:

- **Available** — already represented by a widget or chart on its page and can be reused.
- **Proposal** — a new presentation or calculation that would need design and implementation.

The home page should assemble real profile, chart, and timing responses from the app. It should not use sample placements or imply that a timing event exists when the API returns none.

## Natal

### Available

- **Natal chart wheel** — interactive chart wheel; open planets, signs, houses, and angles for descriptions.
- **Planetary placements** — planet, sign, house, and degree, with clickable planet/sign/house details.
- **Aspect matrix** — natal aspects in a scannable matrix with descriptions.
- **Chart settings** — profile selection and chart display options.

### Proposals

- **Big Three** — Sun, Moon, and Ascendant signs with links to their chart details.
- **Chart ruler** — Ascendant ruler, its placement, and a short explanation.
- **Element and modality balance** — counts and distribution of placements by element and modality.
- **Personal chart highlights** — a small, deterministic selection of notable placements/aspects, with the full chart as the source of truth.

## Daily

### Available

- **Planetary hour now** — current hour and day rulers, progress, and sunrise/sunset; open the current hour or a ruler's planet description.
- **Ascendant through the day** — sign changes and exact planet/Ascendant conjunctions on a scrollable timeline.
- **Moon timings** — current Moon placement and the phase cycle, including phase descriptions.
- **Planetary hours today** — the day's hours with the current hour marked.
- **Coming up** — the next planetary hours and time until they begin.
- **Weekly timings** — aspects, ingresses, retrogrades, and stations by day or timeline.
- **Daily chart wheel, placements, and aspect matrix** — current chart views with the existing detail interactions.

### Proposals

- **Today's briefing** — a short, data-grounded summary built only from today's actual Moon phase, Ascendant changes, and timing events.
- **Next notable moment** — the next available event with time remaining; hide the widget if there is no upcoming event in range.
- **Daylight progress** — sunrise-to-sunset progress and remaining daylight, using the location's returned solar times.

## Current

### Available

- **Moment chart wheel** — chart for the selected date and time.
- **Chart settings** — date, time, and chart display options.
- **Placements and aspect matrix** — placements and aspects for the selected moment.

### Proposals

- **Time scrubber** — change the moment and refresh chart data, with a clear selected-time label.
- **What's active now** — current placements and exact aspects, clearly separated from natal placements.
- **Compare two moments** — show changes between selected times without silently replacing the saved natal chart.

## Transit

### Available

- **Transit wheel** — current transiting planets in relation to the selected natal chart.
- **Transit placements** — transit and natal placements in a comparative list.
- **Aspect matrix** — aspects across the transit and natal charts.
- **Ascendant timeline** — today's local Ascendant changes and conjunctions.
- **Weekly timings** — timing events for the selected profile.
- **Chart settings** — profile and date/time settings.

### Proposals

- **Transits to natal planets** — upcoming exact aspects to natal placements, ordered by time and linked to their descriptions.
- **Transit spotlight** — one clearly explained current or next transit, with its exactness window and source data.
- **Transit calendar** — a compact week/month overview of returned ingresses, stations, and major aspects.

## Synastry

### Available

- **Two-chart wheel** — overlay for two selected birth profiles.
- **Synastry aspects** — inter-chart aspect matrix with clickable aspect descriptions.
- **Comparative placements** — each person's planetary placements and house context.
- **Profile selectors** — choose the two charts being compared.

### Proposals

- **Relationship highlights** — strongest inter-chart aspects, labeled by whose planets are involved and linked to full descriptions.
- **House overlays** — summarize where one person's planets fall in the other person's houses.
- **Element and modality comparison** — compare the two charts' distributions without treating them as compatibility scores.
- **Shared chart snapshot** — a concise, printable comparison with both profile names and the chart settings used.
