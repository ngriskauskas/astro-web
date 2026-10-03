import { expectNoSidewaysScroll, openFromNav, opensAndCloses, wheel, widget } from "./chart-page";
import { expect, test } from "./fixtures";

test.use({ scenario: "withCustomProfiles" });

test("a chart is drawn for a chosen moment", async ({ page, requests }) => {
  await openFromNav(page, "Moment");
  await expect(page).toHaveURL(/\/moment/);
  for (const name of ["Moment Chart", "Chart Settings", "Aspect Matrix", "Placements"]) {
    await expect(widget(page, name)).toBeVisible();
  }
  await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();

  // Settings: the chart is requested for the date and time entered.
  const settings = widget(page, "Chart Settings");
  await settings.getByLabel("Date").fill("2026-03-01");
  await settings.getByLabel("Time").fill("14:30");
  await expect
    .poll(() => requests.to("POST", "/charts/generic").at(-1)?.body)
    .toEqual({ datetime: "2026-03-01T14:30" });

  await opensAndCloses(page, wheel(page).getByRole("button", { name: "Capricorn" }), "Capricorn");
  await opensAndCloses(
    page,
    widget(page, "Aspect Matrix").getByRole("button", { name: "Mars Conjunction Sun" }),
    /Sun.*Mars/,
  );
  await opensAndCloses(
    page,
    widget(page, "Placements").getByRole("button", { name: "Moon" }),
    "Moon",
  );

  await expectNoSidewaysScroll(page);
});
