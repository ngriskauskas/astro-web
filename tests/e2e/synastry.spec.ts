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

test("two birth charts are compared widget by widget", async ({ page, requests }) => {
  await openFromNav(page, "Synastry");
  await expect(page).toHaveURL(/\/synastry/);
  for (const name of ["Synastry", "Chart Settings", "Synastry Aspects", "Placements"]) {
    await expect(widget(page, name)).toBeVisible();
  }

  // A planet in each ring: each opens the details for the chart it belongs to.
  await wheel(page).getByRole("button", { name: "Sun, My Profile" }).click();
  await expect(drawer(page).title).toHaveText("Sun");
  await expectDrawerCoversScreenOnPhone(page);
  await expect(drawer(page).panel.getByRole("button", { name: "Taurus" }).first()).toBeVisible();
  await drawer(page).close.click();
  await wheel(page).getByRole("button", { name: "Sun, Mum" }).click();
  await expect(drawer(page).panel.getByRole("button", { name: "Scorpio" }).first()).toBeVisible();
  await drawer(page).close.click();
  await expect(drawer(page).panel).toBeHidden();

  await opensAndCloses(
    page,
    widget(page, "Synastry Aspects").getByRole("button", {
      name: "Mum Moon Trine My Profile Sun",
    }),
    /Sun.*Moon/,
  );
  await opensAndCloses(
    page,
    widget(page, "Placements")
      .getByRole("group", { name: "Mum" })
      .getByRole("button", { name: "Venus" }),
    "Venus",
  );

  // Settings: the comparison is requested for another pair.
  await widget(page, "Chart Settings").getByLabel("Other Profile").selectOption({ label: "Sam" });
  await expect(wheel(page).getByRole("button", { name: "Sun, Sam" })).toBeVisible();
  expect(requests.to("POST", "/charts/synastry").at(-1)?.body).toEqual({
    mainBirthProfileId: 1,
    otherBirthProfileId: 3,
  });

  await expectNoSidewaysScroll(page);
});
