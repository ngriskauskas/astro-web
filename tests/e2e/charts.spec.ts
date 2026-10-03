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

test("a natal chart is read widget by widget", async ({ page, requests }) => {
  await openFromNav(page, "Charts");
  await expect(page).toHaveURL(/\/natal/);
  for (const name of ["Natal Chart", "Chart Settings", "Aspect Matrix", "Placements"]) {
    await expect(widget(page, name)).toBeVisible();
  }
  await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();

  // The wheel: open a planet, go to its sign inside the drawer, and come back.
  await wheel(page).getByRole("button", { name: "Sun" }).click();
  await expect(drawer(page).title).toHaveText("Sun");
  await expectDrawerCoversScreenOnPhone(page);
  await drawer(page).panel.getByRole("button", { name: "Taurus" }).first().click();
  await expect(drawer(page).title).toHaveText("Taurus");
  await drawer(page).back.click();
  await expect(drawer(page).title).toHaveText("Sun");
  await drawer(page).close.click();
  await expect(drawer(page).panel).toBeHidden();

  await opensAndCloses(
    page,
    widget(page, "Aspect Matrix").getByRole("button", { name: "Saturn Trine Sun" }),
    /Sun.*Saturn/,
  );
  await opensAndCloses(
    page,
    widget(page, "Placements").getByRole("button", { name: "Moon" }),
    "Moon",
  );

  // Settings: another profile's chart replaces this one.
  await widget(page, "Chart Settings").getByLabel("Profile").selectOption({ label: "Mum" });
  await expect(wheel(page).getByRole("button", { name: "Mercury", exact: true })).toBeVisible();
  expect(requests.to("POST", "/charts/natal").at(-1)?.body).toEqual({ birthProfileId: 2 });

  await expectNoSidewaysScroll(page);
});
