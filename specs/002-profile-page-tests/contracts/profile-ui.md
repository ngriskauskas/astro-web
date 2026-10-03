# Contract: Profile Screen and Navigation UI

What the user-facing behaviour is after this work, where it differs from today. The tests are written against this. Reasons are in [research.md](../research.md) items 7 and 8.

## Navigation (`Navbar`)

| Width | Bar shows | Menu |
|-------|-----------|------|
| Below 768px | Astro logo, menu button | Slide-out menu with Charts, Moment, Daily, Transits, Synastry, Friends, Profile, Logout |
| 768px and above | Astro logo and all eight destinations | None |

- The menu button has the accessible name "Menu" and reports whether the menu is open (`aria-expanded`).
- The menu has the role `menu` and its eight entries the role `menuitem`.
- The menu closes when a destination is chosen or the area outside it is tapped.
- While closed, the menu's links cannot be reached by keyboard or assistive technology.

## Birth profile forms (`BirthInfoForm`: My Birth Info, each custom profile, new profile)

| Rule | Behaviour |
|------|-----------|
| Required details | Name (custom profiles only), birth date, birth time unless "Unknown time?" is ticked, and a picked birth place. With any missing, saving sends nothing and the user is shown which is missing. |
| Unpicked place | If the place text was typed but not picked from the suggestions, saving sends nothing and shows "Pick a place from the suggestions". |
| Delete | Delete shows "Delete this profile?" with Cancel and Confirm in place of the buttons. Confirm deletes; Cancel restores the buttons and sends nothing. |
| Cancel (new profile) | Closes the form and sends nothing. |

Messages are unchanged: "Profile updated" on create or update, "Profile deleted" on delete, "Failed to update Profile <reason>" and "Error deleting Profile" on failure.

## Account Info (`AccountInfoForm`)

- The unpicked-place rule applies to Location as it does to birth place.
- Messages are unchanged: "Profile Updated" on success; the backend's message on failure.

## Custom Profiles (`CustomProfileList`)

- At most one thing is open: either one existing profile or the new-profile form. Opening one closes the other.

## Place search (`BirthPlacePicker`)

- Fewer than three characters: no search, no suggestions.
- A failed search or no results: no suggestions, no error, the field stays usable.

## Chart Default Settings (`AstrologySettingsForm`)

- An orb typed outside 0 to 15 is clamped to that range; a cleared orb becomes 0.
- Messages are unchanged: "Astrology settings updated", "Settings reset to defaults", and the backend's message or "Failed to save settings" / "Failed to reset settings" on failure.

## Accessibility hooks added (no visual change)

- Each card on the profile page is a labelled region: "Account Info", "My Birth Info", "Custom Profiles", "Chart Default Settings".
- Every field label is associated with its input, so fields can be found by label.
- Each aspect's orb input is named "<aspect> max orb".
- Each custom profile row reports whether it is expanded; its +/− mark is decorative.

## Layout, at 320, 390, 768, 1280 and 1920 wide

- No sideways scrolling; nothing clipped or overlapping.
- Every control visible and tappable, in every state: menu open, place suggestions open, a custom profile open, delete confirmation showing, new-profile form open, sidereal mode, a toast showing.
- At 1920 the content stays at its current maximum reading width, centred.
- No change to colours, wording or section order beyond what is listed above.
