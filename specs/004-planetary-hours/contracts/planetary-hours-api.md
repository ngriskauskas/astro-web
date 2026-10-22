# Contract: Planetary Hours Endpoint

The backend endpoint this feature consumes, as supplied with the feature request. The backend is a separate project; nothing here is changed by this feature. The mock in `tests/mocks/handlers.ts` must answer in this shape.

## Request

`POST /api/timing/planetary-hours`: JWT required, as for the other `/api/timing/*` routes. In the app this is `apiFetch("/timing/planetary-hours", …)`.

```json
{ "date": "2026-07-12" }
```

`date` is the user's local date (`getLocalISODate()`).

## Response 200

Times are illustrative and the list is abridged.

```json
{
  "date": "2026-07-12",
  "dayRuler": "SUN",
  "sunrise": "2026-07-12T05:58:10",
  "sunset": "2026-07-12T20:32:05",
  "dayEnd": "2026-07-13T05:58:52",
  "hours": [
    { "hour": 19, "ruler": "VENUS",   "dayRuler": "SATURN", "period": "NIGHT", "dateTime": "2026-07-11T23:35:20" },
    { "hour": 20, "ruler": "MERCURY", "dayRuler": "SATURN", "period": "NIGHT", "dateTime": "2026-07-12T00:22:30" },
    { "hour": 24, "ruler": "MARS",    "dayRuler": "SATURN", "period": "NIGHT", "dateTime": "2026-07-12T05:11:00" },
    { "hour": 1,  "ruler": "SUN",     "dayRuler": "SUN",    "period": "DAY",   "dateTime": "2026-07-12T05:58:10" },
    { "hour": 13, "ruler": "JUPITER", "dayRuler": "SUN",    "period": "NIGHT", "dateTime": "2026-07-12T20:32:05" },
    { "hour": 24, "ruler": "MERCURY", "dayRuler": "SUN",    "period": "NIGHT", "dateTime": "2026-07-13T05:11:40" }
  ]
}
```

- `hours` is chronological. First come the previous planetary day's night hours that run past local midnight, then all 24 hours of the requested day.
- `hour` is 1 to 24 within its own planetary day (1 to 12 are DAY, 13 to 24 are NIGHT).
- `dateTime` is when the hour starts, in local time at the user's saved location, with no offset.
- `dayEnd` is the next sunrise, which is when hour 24 ends.

What the frontend relies on:

- The first entry starts at or before local midnight of `date`, so the whole calendar day is covered.
- Each hour ends where the next begins; the last ends at `dayEnd`.
- `ruler` and `dayRuler` are always one of `SUN`, `MOON`, `MARS`, `MERCURY`, `JUPITER`, `VENUS`, `SATURN`.

## Errors

Standard `{ error, message, status }` body.

| Status | `error` | When | Frontend shows |
|--------|---------|------|----------------|
| 400 | `ValidationFailed` | Bad date | "Could not load planetary hours." |
| 401 | `Unauthorized` | No or invalid token | "Could not load planetary hours." |
| 422 | `PlanetaryHoursUnavailable` | No sunrise or sunset at that location and date | "Planetary hours are not available for this location today." |

`apiFetch` throws `Error(body.error)`, so the 422 is recognised by the message `PlanetaryHoursUnavailable`.
