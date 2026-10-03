# Research: Profile Page Tests and Responsive Layout

Decisions taken before design. Each was checked against the current code (`src/pages/Profile.tsx`, `src/components/profile/*`, `src/components/Navbar.tsx`, `tests/`).

## 1. How the integration tests are organised

**Decision**: One test file per profile section, each rendering the real `<Profile />` page through `renderWithApp`, plus one file for the navigation:

- `tests/integration/profile-account-info.test.tsx`
- `tests/integration/profile-birth-info.test.tsx`
- `tests/integration/profile-custom-profiles.test.tsx`
- `tests/integration/profile-chart-settings.test.tsx`
- `tests/integration/profile-place-search.test.tsx`
- `tests/integration/navbar.test.tsx`

**Rationale**: Rendering the whole page keeps the tests on what the user sees and catches wiring between sections (all three place fields share one picker; the custom list and the main form share one form component). Splitting by section keeps each file readable and lets `npm test -- profile-custom` run one area.

**Alternatives considered**: One large `profile.test.tsx` (about 40 tests in one file, hard to navigate). Rendering each form component alone (misses page wiring, and `BirthInfoForm` behaves differently depending on which parent renders it).

## 2. `renderWithApp` needs the chart settings provider

**Decision**: Add `ChartSettingsProvider` to `tests/integration/render.tsx`, inside `BirthProfilesProvider`, matching the order in `src/main.tsx`.

**Rationale**: `AstrologySettingsForm` throws outside that provider. The pilot README already says a missing provider should be added in `render.tsx`. The provider only issues `GET /settings`, which every scenario already mocks, so existing tests are unaffected.

**Alternatives considered**: A separate render helper for profile tests (two helpers to keep in sync for no gain).

## 3. Mocks that have to be added

**Decision**: Extend `tests/mocks/`:

| Addition | Detail |
|----------|--------|
| `PUT /birth-profiles/:id` | Returns the request body plus the id from the URL |
| `DELETE /birth-profiles/:id` | 204, no body |
| `PUT /settings` | Returns the request body |
| `POST /settings/reset` | Returns the default settings fixture |
| `POST /birth-profiles` | Change the returned id from `1` to `100` |
| `customBirthProfiles` fixture | Three named custom profiles, ids 2 to 4, one with a very long name and place |
| `savedSettings` fixture | Sidereal zodiac, non-default house system, one aspect off, one orb changed, Lilith on |
| `defaultSettings` fixture | Mirrors the app's defaults, for the reset response |
| `withCustomProfiles` scenario | Main profile plus `customBirthProfiles` |
| `getSettings(data)` | Takes the settings to return, default `{}` |

**Rationale**: These are the four endpoints the profile screen calls that the pilot did not need. The create handler currently returns `id: 1`, which is also the main profile's id; once a test creates a custom profile while a main profile exists, two list items share an id and React key. The pilot test asserts the request body, not the returned id, so changing it is safe.

**Alternatives considered**: A stateful in-memory fake backend (more faithful, but the app updates its own state from each response, so stateless handlers are enough and stay easy to override per test).

## 4. The profile browser journey

**Decision**: One file, `tests/e2e/profile.spec.ts`, scenario `withProfile`, one test: start at `/`, open Profile through the navigation (menu button on phone, direct link on desktop), save a new username and location, save a new birth date and place, add a custom profile, switch one chart setting and save. After each save, assert the success toast and the request body through the `requests` fixture.

**Rationale**: Matches FR-008 and FR-009 and the pilot's shape. Branching on whether the menu button is visible, not on the project name, is the convention in `tests/README.md`.

**Alternatives considered**: One test per section (four journeys times two sizes; the spec asks for exactly one journey).

## 5. The five review sizes

**Decision**: No automated layout test. The browser tests remain the happy-path journeys at `phone` and `desktop`, and `playwright.config.ts` and `tests/e2e/devices.ts` are unchanged. The five sizes below are defined once in `tests/review/sizes.ts` and used only by the review capture (item 6).

| Name | Width x height |
|------|----------------|
| small phone | 320 x 568 |
| phone | 390 x 844 |
| tablet | 768 x 1024 |
| laptop | 1280 x 800 |
| large monitor | 1920 x 1080 |

**Rationale**: Clarification 3. Layout is judged by the review subagent, which sees clipping, overlap and cramped controls that a width assertion cannot. The trade-off is that a layout regression after this feature ships is caught only at phone and desktop, and only if it breaks the journey, until the next feature's review.

**Alternatives considered**: A single automated page-width check at all five sizes (rejected by the user: Playwright is for the happy path at two sizes only).

## 6. How the review subagent sees the app

**Decision**: Add a capture script, run with `npm run review:layout`, that uses Playwright with the shared mocks to load the profile screen at each of the five sizes, put it in each state worth looking at, and save a screenshot per size and state to `test-results/layout-review/` (already gitignored). The review subagent runs the command, reads every image, and reports problems by size and state. It lives in `tests/review/` with its own Playwright config so `npm run test:e2e` never runs it.

States captured at each size: page top with navigation; navigation menu open (sizes that have one); Account Info with place suggestions open; My Birth Info; Custom Profiles collapsed; one custom profile expanded; delete confirmation showing; new-profile form open; Chart Default Settings in sidereal mode; a success toast showing; full-page screenshot.

**Rationale**: The review has to be at exact widths, and a desktop Chrome window will not shrink to 320 or 390 wide, so driving the user's real browser cannot reach the two phone sizes. Playwright sets the viewport exactly, needs no backend or account, and produces the same states every time, so a re-review after a fix compares like with like.

**Limits**: The date and time picker popups are drawn by the browser itself, not the page, and do not appear in screenshots. The review covers the fields and their surrounding layout, which is what the app controls (see the spec's assumption on built-in pickers).

**Alternatives considered**: Claude in Chrome against `npm run dev` (cannot reach phone widths; needs a real backend and login). Automated layout assertions in Playwright, such as a page-width check at each size (rejected in clarification 3: browser tests stay as the happy-path journey at phone and desktop).

## 7. Navigation on small screens

**Decision**: In `Navbar.tsx`, below the `md` breakpoint (768px) show only the Astro logo and the menu button; the slide-out menu lists all eight destinations. At `md` and above, show everything in the bar and never show the menu. The menu button gets an accessible name and `aria-expanded`; the menu closes when a destination is chosen or the backdrop is tapped; while closed it is hidden from keyboard and assistive technology.

**Rationale**: Clarification 2. `md` is already the breakpoint where Friends, Profile and Logout switch, so one breakpoint governs the whole bar and 768 (tablet) gets the full bar. The accessible name also gives tests a stable way to find the button; today the pilot test finds it with `nav.locator("> button")`.

**Alternatives considered**: A lower breakpoint so more phones in landscape get the full bar (eight items need about 620px plus padding; a single existing breakpoint is simpler and safe).

## 8. Known and likely behaviour bugs, and their fixes

Clarification 1 says every behaviour bug the tests expose is fixed here. These are already visible from reading the code; the tests are written to the expected behaviour first and will fail until the fix lands.

| # | Where | Problem | Fix |
|---|-------|---------|-----|
| B1 | `BirthInfoForm` | Save, Submit, Delete and Cancel are plain buttons with click handlers that call `preventDefault`, so the browser's required-field check never runs. An empty custom profile can be submitted. | Make Save/Submit the form's submit button and mark Cancel and Delete as non-submit buttons, so `required` is enforced. |
| B2 | `BirthInfoForm` | Birth time is optional even when "Unknown time?" is unticked; the new-account modal requires it. | Require the time unless unknown is ticked, as the modal does. |
| B3 | All place fields | Text typed but not picked is ignored; the save goes through with the previous place (clarification 5). A new profile can be saved with no place at all (coordinates 0, 0). | The picker reports, through `onPendingChange`, whether its text differs from the last picked place; forms block the save and show "Pick a place from the suggestions" when it does. Birth profile forms also block when no place was ever picked. An account with no location and an empty field can still save its username. |
| B4 | `BirthPlacePicker` | A failed place search is an unhandled promise rejection. | Catch it and show no suggestions. |
| B5 | `BirthInfoForm` | Delete removes the profile immediately (clarification 4). | Inline confirmation: Delete swaps the button row for "Delete this profile?" with Cancel and Confirm. |
| B6 | `CustomProfileList` | Opening an existing profile while the new-profile form is open leaves both open; "Add New" only closes the other direction. | Opening one closes the other, both ways. |
| B7 | `AstrologySettingsForm` | A typed orb outside 0 to 15 is accepted and sent. | Clamp to the allowed range on change; a cleared field becomes 0 (already the case). |
| B8 | `BirthInfoForm` | A successful create or update always toasts "Profile updated"; failures toast "Failed to update Profile" even for a create. | Leave the wording alone (no redesign), tests assert the current messages. Listed so it is a conscious choice, not an oversight. |

**As implemented**: B1 to B7 were all fixed as described, and the tests exposed no further behaviour bugs. Two additions were needed to make the screen testable by what the user sees rather than by markup: labels are now associated with their inputs, and the cards are labelled regions (see `contracts/profile-ui.md`). The untyped `catch` clauses in the three form files were also tidied, since lint flagged them in files this feature touched.

**Inline confirmation rather than a dialog (B5)**: it needs no overlay, cannot overflow a small screen, and is trivially testable. A browser `confirm()` box would block the browser tests and cannot be styled.

**Bugs found later**: handled the same way, test first, then fix. Anything that cannot be fixed in this repo goes to `tests/KNOWN_ISSUES.md` with an expected-failure marker (FR-007). Vitest's equivalent of Playwright's `test.fail` is `test.fails`.

## 9. Edge cases the spec left without an expected outcome

| Edge case | Expected behaviour | Basis |
|-----------|--------------------|-------|
| No main birth profile | The blocking new-account modal covers the app, as on every signed-in screen. The profile test only asserts the modal is shown. | Existing app behaviour, covered by the pilot |
| Orb out of range or cleared | Clamped to 0 to 15; cleared becomes 0 | B7 |
| Place search fails or returns nothing | No suggestions, no error shown, form stays usable; saving is still blocked until a place is picked | B3, B4 |
| Typed place restored by hand to the picked text | Treated as picked; save allowed | B3 |

## 10. Timezone when the account location changes

`AccountInfoForm` sends `location.timezone` unchanged when the user picks a new location, so a user who moves from New York to London is saved with London's coordinates and New York's timezone. Whether that is a bug depends on the backend: if it derives the timezone from the coordinates, the stale value is harmless. That cannot be determined from this repo.

**Resolved (2026-10-03)**: the backend derives the timezone from the coordinates and does not need the app to send one, so the stale value is harmless and this is not a bug. The integration test asserts the address and coordinates sent and does not assert the timezone. The app still sends the old timezone; removing it from the request is an optional cleanup, not done here.

## 11. Layout fixes expected

The review decides the final list. Likely from reading the code:

- Navigation overflow below 768px (item 7; closes KI-001).
- Chart settings: the Objects and Wheel Display grids are two columns at every width, which squeezes "Show Black Moon Lilith" at 320. Make them one column on small screens, as the Systems grid already is.
- Chart settings: each aspect row puts the label and the orb input on one line; allow it to wrap at 320.
- Profile cards and page use 24px padding on all sides, leaving 224px of content width at 320. Reduce padding on small screens.
- Toasts are pinned top-right, over the menu button on a phone.

## 12. Keeping the tests fast

**Decision**: No new dependencies. Integration tests keep real timers (the place search debounce is 300ms) and only wait on it in tests that search.

**Rationale**: About 45 tests at well under 200ms each stays inside the 10 second budget (SC-002). The browser run grows from 2 tests to 4 (two journeys at two sizes), inside the 60 second budget (SC-003).
