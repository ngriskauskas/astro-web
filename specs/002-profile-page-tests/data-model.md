# Data Model: Profile Page Tests and Responsive Layout

No stored data changes. This describes the data the profile screen reads and sends (which the tests assert on), the validation rules after the fixes in [research.md](./research.md) item 8, and the test fixtures to add.

## Entities the screen works with

### Account (`User`, `src/contexts/AuthContext.tsx`)

| Field | Editable on this screen | Notes |
|-------|-------------------------|-------|
| `username` | Yes | |
| `email` | No | Shown disabled |
| `location.address` | Yes | Only by picking a place suggestion |
| `location.latitude`, `location.longitude` | Yes | Set together with `address` from the picked suggestion |
| `location.timezone` | No | Sent back unchanged; see research item 10 |

Saved with `PUT /me`, body `{ username, location }`.

### Birth profile (`BirthProfile` / `BirthProfileInput`, `src/contexts/BirthProfilesContext.tsx`)

| Field | Rule |
|-------|------|
| `name` | Required for custom profiles. Always `"My Profile"` for the main profile, which has no name field. |
| `birthDate` | Required, `YYYY-MM-DD` |
| `birthTime` | Required unless `birthTimeUnknown` is true; empty string when unknown |
| `birthTimeUnknown` | Ticking it clears and disables the time |
| `location`, `latitude`, `longitude` | Required; set together, only from a picked suggestion |
| `isMain` | True for exactly one profile per user; not editable here |

Created with `POST /birth-profiles`, updated with `PUT /birth-profiles/:id`, deleted with `DELETE /birth-profiles/:id`.

### Chart default settings (`AstrologySettings`, `src/types/astrologySettings.ts`)

| Field | Rule |
|-------|------|
| `zodiacType` | `TROPICAL` or `SIDEREAL` |
| `ayanamsa` | Present only when `zodiacType` is `SIDEREAL` (defaults to `LAHIRI` on switching); absent otherwise |
| `houseSystem` | One of the listed house systems |
| `aspectOptions[aspect].show` | Boolean per aspect (five aspects) |
| `aspectOptions[aspect].minOrb` | 0 to 15 in steps of 0.5; not editable while `show` is false; out-of-range input is clamped |
| `objectOptions.showChiron`, `showLilith` | Boolean |
| `displayOptions.tickMarks`, `angleLabels` | Boolean |

Saved with `PUT /settings` (the whole object), reset with `POST /settings/reset`.

### Place suggestion

`{ place_id, display_name, lat, lon }` from the place search. Picking one yields `{ address: display_name, latitude, longitude }`.

## State transitions

### Place field

```text
picked ──(user types)──▶ unpicked ──(user picks a suggestion)──▶ picked
                            │
                            └──(text edited back to the picked address)──▶ picked
```

- A new-profile form starts **unpicked** (no place yet).
- A form may be saved only while its place field is **picked**. Otherwise nothing is sent and the user is told to pick a place from the suggestions (FR-018b).

### Custom profile list

```text
all collapsed ──(open profile X)──▶ X open ──(open profile Y)──▶ Y open
      │                                │
      └──(Add New)──▶ new form open ◀──┘   (at most one of: an open profile, the new form)
```

- Submit or Cancel on the new form returns to all collapsed.

### Delete

```text
profile open ──(Delete)──▶ confirming ──(Confirm)──▶ DELETE sent ──▶ removed from list
                               │                          │
                               └──(Cancel)──▶ profile open └──(rejected)──▶ profile open, error shown
```

## Test fixtures to add (`tests/mocks/data.ts`)

All fixed literals, typed against the app's types, as in the pilot.

| Fixture | Content |
|---------|---------|
| `customBirthProfiles` | Three custom profiles, ids 2, 3, 4. One has `birthTimeUnknown: true`. One has a very long name and a very long place name, for layout. |
| `savedSettings` | Differs from the app defaults in every group: `SIDEREAL` with a non-default ayanamsa, a non-default house system, one aspect off, one orb changed, Lilith on, one display option off |
| `defaultSettings` | Equal to the app's default settings; returned by reset |

Existing fixtures (`user`, `mainBirthProfile`, `places`) are unchanged.

## Scenarios (`tests/mocks/scenarios.ts`)

| Scenario | Birth profiles | Status |
|----------|----------------|--------|
| `newAccount` | none | Existing |
| `withProfile` | main only | Existing; used for "no custom profiles" and for the browser journey |
| `withCustomProfiles` | main plus `customBirthProfiles` | New |

Saved settings are orthogonal to the scenario: a test that needs them overrides `GET /settings` with `savedSettings` for that test.

## Screen sizes

| Name | Size | Journey runs here | Subagent review |
|------|------|-------------------|-----------------|
| small phone | 320 x 568 | | Yes |
| phone | 390 x 844 | Yes | Yes |
| tablet | 768 x 1024 | | Yes |
| laptop | 1280 x 800 | Yes (`desktop`) | Yes |
| large monitor | 1920 x 1080 | | Yes |

The journey sizes stay in `tests/e2e/devices.ts`; the five review sizes live in `tests/review/sizes.ts`.
