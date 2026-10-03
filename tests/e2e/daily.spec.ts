import {
  drawer,
  expectDrawerCoversScreenOnPhone,
  expectNoSidewaysScroll,
  openFromNav,
  opensAndCloses,
  wheel,
  widget,
} from "./chart-page";
import { expect, test } from "./fixtures";

test.use({ scenario: "withCustomProfiles" });

test("today's sky and timings are read widget by widget", async ({ page }) => {
  await openFromNav(page, "Daily");
  await expect(page).toHaveURL(/\/daily/);
  for (const name of [
    "Zodiac Wheel",
    "Ascendant Today",
    "Moon Timings",
    "Weekly Timings",
    "Aspect Matrix",
    "Placements",
  ]) {
    await expect(widget(page, name)).toBeVisible();
  }

  // The wheel: open a planet, go to its sign inside the drawer, and come back.
  await wheel(page).getByRole("button", { name: "Moon" }).click();
  await expect(drawer(page).title).toHaveText("Moon");
  await expectDrawerCoversScreenOnPhone(page);
  await drawer(page).panel.getByRole("button", { name: "Sagittarius" }).first().click();
  await expect(drawer(page).title).toHaveText("Sagittarius");
  await drawer(page).back.click();
  await expect(drawer(page).title).toHaveText("Moon");
  await drawer(page).close.click();
  await expect(drawer(page).panel).toBeHidden();

  // The Ascendant timeline opens scrolled to the current time.
  const ascendant = widget(page, "Ascendant Today");
  await ascendant.scrollIntoViewIfNeeded();
  await expect(ascendant.getByText("NOW")).toBeInViewport();
  await opensAndCloses(
    page,
    ascendant.getByRole("button", { name: "Sun conjuncts ASC at 7:15 AM" }),
    /Sun.*Ascendant/,
  );

  await opensAndCloses(
    page,
    widget(page, "Moon Timings").getByRole("button", { name: "View New Moon details" }),
    "New Moon",
  );

  // Weekly timings, in both views.
  const weekly = widget(page, "Weekly Timings");
  await opensAndCloses(
    page,
    weekly.getByRole("button", { name: "Mars enters Aquarius" }),
    /Mars.*Aquarius/,
  );
  await weekly.getByRole("button", { name: "Timeline" }).click();
  await expect(weekly.getByText("NOW")).toBeInViewport();
  await opensAndCloses(
    page,
    weekly.getByRole("button", { name: "Mercury starts retrograde at 6:00 AM" }),
    /Mercury.*retrograde/,
  );

  await opensAndCloses(
    page,
    widget(page, "Aspect Matrix").getByRole("button", { name: "Mars Conjunction Sun" }),
    /Sun.*Mars/,
  );
  await opensAndCloses(
    page,
    widget(page, "Placements").getByRole("button", { name: "Venus" }),
    "Venus",
  );

  await expectNoSidewaysScroll(page);
});
