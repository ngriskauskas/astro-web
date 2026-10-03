import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { customBirthProfiles, places } from "../mocks";
import { expect, test } from "../e2e/fixtures";
import { reviewSizes, TOUCH_BELOW, type ReviewSize } from "./sizes";

// Captures the profile screen in each state at each review size, for a reviewer to
// look at. It checks nothing about layout: the expects below only wait for a state
// to be on screen before it is captured.
const OUTPUT = path.resolve("test-results/layout-review");

const longNamed = customBirthProfiles[2];

test.use({ scenario: "withCustomProfiles" });

for (const [name, viewport] of Object.entries(reviewSizes)) {
  test.describe(name, () => {
    const touch = viewport.width < TOUCH_BELOW;
    test.use({ viewport, isMobile: touch, hasTouch: touch });

    test(`profile screen at ${viewport.width}px`, async ({ page }) => {
      const dir = path.join(OUTPUT, name as ReviewSize);
      // Other capture files write to the same folder, so only this one's images go.
      fs.mkdirSync(dir, { recursive: true });
      for (const file of fs.readdirSync(dir)) {
        if (file.startsWith("profile-")) fs.rmSync(path.join(dir, file));
      }
      const widths: Record<string, { screen: number; page: number }> = {};

      const capture = async (state: string, { fullPage = true } = {}) => {
        widths[state] = await pageWidth(page);
        await page.screenshot({ path: path.join(dir, `profile-${state}.png`), fullPage });
      };

      await page.goto("/profile");
      const account = page.getByRole("region", { name: "Account Info" });
      const birth = page.getByRole("region", { name: "My Birth Info" });
      const custom = page.getByRole("region", { name: "Custom Profiles" });
      const settings = page.getByRole("region", { name: "Chart Default Settings" });
      await expect(account.getByLabel("Location")).not.toHaveValue("");
      await expect(birth.getByLabel("Birth Place")).not.toHaveValue("");
      await expect(settings.getByLabel("Zodiac System")).toBeVisible();

      await capture("01-top-of-page", { fullPage: false });
      await capture("02-full-page");

      const menuButton = page.getByRole("button", { name: "Menu" });
      if (await menuButton.isVisible()) {
        await menuButton.click();
        await expect(page.getByRole("menuitem", { name: "Logout" })).toBeVisible();
        await page.waitForTimeout(400); // slide-in transition
        await capture("03-menu-open", { fullPage: false });
        await page.getByRole("menuitem", { name: "Profile" }).click();
        await page.waitForTimeout(400);
      }

      await account.getByLabel("Location").fill("Lond");
      await expect(account.getByText(places[1].display_name)).toBeVisible();
      await capture("04-place-suggestions");
      await account.getByText(places[1].display_name).click();

      await account.getByRole("button", { name: "Save Changes" }).click();
      await expect(page.getByText("Profile Updated")).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300); // toast enter animation
      await capture("04b-toast-at-top-of-page", { fullPage: false });
      await expect(page.getByText("Profile Updated")).toBeHidden();

      await birth.getByLabel("Birth Place").fill("Paris");
      await birth.getByRole("button", { name: "Save Changes" }).click();
      await expect(birth.getByRole("alert")).toBeVisible();
      await capture("05-place-not-picked-message");

      await custom.getByRole("button", { name: longNamed.name }).click();
      await expect(custom.getByLabel("Name")).toHaveValue(longNamed.name);
      await capture("06-custom-profile-open");

      await custom.getByRole("button", { name: "Delete" }).click();
      await expect(custom.getByText("Delete this profile?")).toBeVisible();
      await capture("07-delete-confirmation");
      await custom.getByRole("button", { name: "Cancel" }).click();

      await custom.getByRole("button", { name: "Add New" }).click();
      await expect(custom.getByRole("button", { name: "Submit" })).toBeVisible();
      await capture("08-new-profile-form");
      await custom.getByRole("button", { name: "Cancel" }).click();

      await settings.getByLabel("Zodiac System").selectOption("SIDEREAL");
      await expect(settings.getByLabel("Ayanamsa")).toBeVisible();
      await capture("09-settings-sidereal");

      await settings.getByRole("button", { name: "Save Chart Settings" }).click();
      await expect(page.getByText("Astrology settings updated")).toBeVisible();
      await page.waitForTimeout(300); // toast enter animation
      await capture("10-toast-after-save", { fullPage: false });

      // Page width next to screen width per state: a page wider than the screen
      // scrolls sideways, which a full-page screenshot alone does not make obvious.
      fs.writeFileSync(path.join(dir, "profile-widths.json"), JSON.stringify(widths, null, 2));
    });
  });
}

const pageWidth = (page: Page) =>
  page.evaluate(() => ({
    screen: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }));
