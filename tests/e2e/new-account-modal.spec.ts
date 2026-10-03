import { places } from "../mocks";
import { expect, test } from "./fixtures";

test("new account completes the blocking modal", async ({ page, requests }, testInfo) => {
  test.fail(
    testInfo.project.name === "phone",
    "KI-001: navbar is wider than the phone viewport, pushing the modal's submit button off-screen",
  );

  await page.goto("/");

  const dialog = page.getByRole("dialog", { name: "Welcome! Let's set up your profile" });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[type="date"]').fill("1990-05-15");
  await dialog.locator('input[type="time"]').fill("08:30");
  await dialog.getByPlaceholder("City, Country").first().fill("Lond");
  await dialog.getByText(places[0].display_name).click();
  await dialog.getByRole("button", { name: "Get Started" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText("Welcome! Your profile is set up")).toBeVisible();

  const created = requests.to("POST", "/birth-profiles");
  expect(created).toHaveLength(1);
  expect(created[0].body).toEqual({
    name: "My Profile",
    isMain: true,
    birthDate: "1990-05-15",
    birthTime: "08:30",
    birthTimeUnknown: false,
    location: places[0].display_name,
    latitude: Number(places[0].lat),
    longitude: Number(places[0].lon),
  });
  // The current location was left at its default, so the user is not updated.
  expect(requests.to("PUT", "/me")).toHaveLength(0);

  // The app is now usable: reach Profile through the navigation as it is presented
  // at this size (a direct link on wide screens, behind the menu button on narrow ones).
  const nav = page.getByRole("navigation");
  const menuButton = nav.locator("> button");
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await nav.getByRole("link", { name: "Profile" }).last().click();
  } else {
    await nav.getByRole("link", { name: "Profile" }).first().click();
  }
  await expect(page).toHaveURL(/\/profile$/);
});
