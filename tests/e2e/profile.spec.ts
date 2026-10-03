import { mainBirthProfile, places } from "../mocks";
import { expect, test } from "./fixtures";

test.use({ scenario: "withProfile" });

test("profile is updated section by section", async ({ page, requests }) => {
  await page.goto("/");

  // Reach Profile through the navigation as it is presented at this size.
  const nav = page.getByRole("navigation");
  const menuButton = nav.getByRole("button", { name: "Menu" });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await nav.getByRole("menuitem", { name: "Profile" }).click();
  } else {
    await nav.getByRole("link", { name: "Profile" }).click();
  }
  await expect(page).toHaveURL(/\/profile$/);

  const account = page.getByRole("region", { name: "Account Info" });
  await expect(account.getByLabel("Location")).not.toHaveValue("");
  await account.getByLabel("Username").fill("stargazer");
  await account.getByLabel("Location").fill("Lond");
  await account.getByText(places[1].display_name).click();
  await account.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Profile Updated")).toBeVisible();

  const updatedUser = requests.to("PUT", "/me");
  expect(updatedUser).toHaveLength(1);
  expect(updatedUser[0].body).toMatchObject({
    username: "stargazer",
    location: {
      address: places[1].display_name,
      latitude: Number(places[1].lat),
      longitude: Number(places[1].lon),
    },
  });

  const birth = page.getByRole("region", { name: "My Birth Info" });
  await birth.getByLabel("Birth Date").fill("1991-06-16");
  await birth.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Profile updated", { exact: true })).toBeVisible();

  const updatedProfile = requests.to("PUT", `/birth-profiles/${mainBirthProfile.id}`);
  expect(updatedProfile).toHaveLength(1);
  expect(updatedProfile[0].body).toMatchObject({
    birthDate: "1991-06-16",
    birthTime: mainBirthProfile.birthTime,
    location: mainBirthProfile.location,
    isMain: true,
  });

  const custom = page.getByRole("region", { name: "Custom Profiles" });
  await custom.getByRole("button", { name: "Add New" }).click();
  await custom.getByLabel("Name").fill("Alex");
  await custom.getByLabel("Birth Date").fill("2001-09-09");
  await custom.getByLabel("Birth Time").fill("06:15");
  await custom.getByLabel("Birth Place").fill("Lond");
  await custom.getByText(places[0].display_name).click();
  await custom.getByRole("button", { name: "Submit" }).click();
  await expect(custom.getByRole("button", { name: "Alex" })).toBeVisible();

  const created = requests.to("POST", "/birth-profiles");
  expect(created).toHaveLength(1);
  expect(created[0].body).toEqual({
    name: "Alex",
    isMain: false,
    birthDate: "2001-09-09",
    birthTime: "06:15",
    birthTimeUnknown: false,
    location: places[0].display_name,
    latitude: Number(places[0].lat),
    longitude: Number(places[0].lon),
  });

  const settings = page.getByRole("region", { name: "Chart Default Settings" });
  await settings.getByLabel("Show Black Moon Lilith").check();
  await settings.getByRole("button", { name: "Save Chart Settings" }).click();
  await expect(page.getByText("Astrology settings updated")).toBeVisible();

  const savedSettings = requests.to("PUT", "/settings");
  expect(savedSettings).toHaveLength(1);
  expect(savedSettings[0].body).toMatchObject({ objectOptions: { showLilith: true } });
});
