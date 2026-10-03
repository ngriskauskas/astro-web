import { expectNoSidewaysScroll, openFromNav, opensAndCloses, wheel, widget } from "./chart-page";
import { expect, test } from "./fixtures";

test.use({ scenario: "withCustomProfiles" });

test("transits to a birth chart are read widget by widget", async ({ page, requests }) => {
  await openFromNav(page, "Transits");
  await expect(page).toHaveURL(/\/transit/);
  for (const name of [
    "Transit Chart",
    "Chart Settings",
    "Ascendant Today",
    "Weekly Timings",
    "Aspect Matrix",
    "Placements",
  ]) {
    await expect(widget(page, name)).toBeVisible();
  }

  // A planet in each ring: the birth chart's and the sky's.
  await opensAndCloses(page, wheel(page).getByRole("button", { name: "Sun, My Profile" }), "Sun");
  await opensAndCloses(page, wheel(page).getByRole("button", { name: "Sun, Transit" }), "Sun");

  await opensAndCloses(
    page,
    widget(page, "Weekly Timings").getByRole("button", { name: "Mercury Trine Jupiter starts" }),
    /Mercury.*Jupiter/,
  );
  await opensAndCloses(
    page,
    widget(page, "Aspect Matrix").getByRole("button", {
      name: "Transit Moon Trine My Profile Sun",
    }),
    /Sun.*Moon/,
  );
  await opensAndCloses(
    page,
    widget(page, "Placements")
      .getByRole("group", { name: "Transit" })
      .getByRole("button", { name: "Venus" }),
    "Venus",
  );

  // Settings: the transits are requested for another profile.
  await widget(page, "Chart Settings").getByLabel("Profile").selectOption({ label: "Mum" });
  await expect(widget(page, "Placements").getByRole("group", { name: "Mum" })).toBeVisible();
  expect(requests.to("POST", "/charts/transit").at(-1)?.body).toMatchObject({ birthProfileId: 2 });

  await expectNoSidewaysScroll(page);
});
