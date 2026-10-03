import type { Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { http, HttpResponse } from "msw";
import { API_URL, getBirthProfiles, mainBirthProfile, manyBirthProfiles } from "../mocks";
import { expect, test } from "../e2e/fixtures";
import { reviewSizes, TOUCH_BELOW, type ReviewSize } from "./sizes";

// Captures the five chart pages and the description drawer in each state at each
// review size, for a reviewer to look at. It checks nothing about layout: the expects
// below only wait for a state to be on screen before it is captured.
const OUTPUT = path.resolve("test-results/layout-review");

type Capture = (state: string, options?: { fullPage?: boolean }) => Promise<void>;

const wheel = (page: Page) => page.getByRole("group", { name: "Chart wheel" });
const region = (page: Page, name: string) => page.getByRole("region", { name, exact: true });
const drawer = (page: Page) => page.getByRole("complementary", { name: "Description" });

// Opens the drawer from `item`, waits for its written description, captures it, closes.
const captureDrawer = async (page: Page, capture: Capture, item: ReturnType<Page["getByRole"]>, state: string) => {
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await expect(drawer(page)).toBeVisible();
  await expect(drawer(page).getByRole("status", { name: "Loading" })).toHaveCount(0);
  await capture(state, { fullPage: false });
  await drawer(page).getByRole("button", { name: "Close" }).click();
  await expect(drawer(page)).toBeHidden();
};

for (const [name, viewport] of Object.entries(reviewSizes)) {
  test.describe(name, () => {
    const touch = viewport.width < TOUCH_BELOW;
    test.use({ viewport, isMobile: touch, hasTouch: touch, scenario: "withCustomProfiles" });

    const dir = path.join(OUTPUT, name as ReviewSize);
    const widthsFile = path.join(dir, "charts-widths.json");

    // Page width next to screen width per state: a page wider than the screen scrolls
    // sideways, which a full-page screenshot alone does not make obvious.
    const capturer =
      (page: Page): Capture =>
      async (state, { fullPage = true } = {}) => {
        fs.mkdirSync(dir, { recursive: true });
        const widths = fs.existsSync(widthsFile)
          ? JSON.parse(fs.readFileSync(widthsFile, "utf8"))
          : {};
        widths[state] = await page.evaluate(() => ({
          screen: window.innerWidth,
          page: document.documentElement.scrollWidth,
        }));
        fs.writeFileSync(widthsFile, JSON.stringify(widths, null, 2));
        await page.screenshot({ path: path.join(dir, `${state}.png`), fullPage });
      };

    test(`charts at ${viewport.width}px`, async ({ page }) => {
      const capture = capturer(page);
      await page.goto("/natal");
      await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();
      await capture("charts-01-top", { fullPage: false });
      await capture("charts-02-full");
      await captureDrawer(page, capture, wheel(page).getByRole("button", { name: "Sun" }), "charts-03-drawer-planet");
      await captureDrawer(
        page,
        capture,
        region(page, "Aspect Matrix").getByRole("button", { name: "Saturn Trine Sun" }),
        "charts-04-drawer-aspect",
      );
      await captureDrawer(page, capture, wheel(page).getByRole("button", { name: "Capricorn" }), "charts-05-drawer-sign");
      await captureDrawer(page, capture, wheel(page).getByRole("button", { name: "2nd House" }), "charts-06-drawer-house");
      await region(page, "Aspect Matrix").scrollIntoViewIfNeeded();
      await capture("charts-07-matrix-in-view", { fullPage: false });
    });

    test(`charts, could not load, at ${viewport.width}px`, async ({ page, network }) => {
      network.use(
        http.post(`${API_URL}/charts/natal`, () =>
          HttpResponse.json({ error: "Request failed" }, { status: 422 }),
        ),
      );
      await page.goto("/natal");
      await expect(region(page, "Natal Chart").getByRole("alert")).toBeVisible();
      await capturer(page)("charts-08-could-not-load");
    });

    test(`charts, many profiles, at ${viewport.width}px`, async ({ page, network }) => {
      network.use(getBirthProfiles([mainBirthProfile, ...manyBirthProfiles]));
      const capture = capturer(page);
      await page.goto("/natal");
      await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();
      await region(page, "Chart Settings")
        .getByLabel("Profile")
        .selectOption({ label: manyBirthProfiles[3].name });
      await expect(wheel(page).getByRole("button", { name: "Mercury", exact: true })).toBeVisible();
      await capture("charts-09-long-profile-name", { fullPage: false });

      await page.goto("/synastry");
      await expect(wheel(page).getByRole("button", { name: /^Sun, My Profile/ })).toBeVisible();
      await region(page, "Chart Settings")
        .getByLabel("Other Profile")
        .selectOption({ label: manyBirthProfiles[9].name });
      await expect(region(page, "Synastry Aspects").getByText(/Maximilian/)).toBeVisible();
      await capture("synastry-06-long-profile-name");
    });

    test(`moment at ${viewport.width}px`, async ({ page }) => {
      const capture = capturer(page);
      await page.goto("/moment");
      await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();
      await capture("moment-01-top", { fullPage: false });
      await capture("moment-02-full");
      await captureDrawer(page, capture, wheel(page).getByRole("button", { name: "Ascendant" }), "moment-03-drawer-angle");
    });

    test(`daily at ${viewport.width}px`, async ({ page }) => {
      const capture = capturer(page);
      await page.goto("/daily");
      await expect(wheel(page).getByRole("button", { name: "Sun" })).toBeVisible();
      await expect(region(page, "Ascendant Today").getByText("NOW")).toBeVisible();
      await expect(region(page, "Weekly Timings").getByText("Jupiter day")).toBeVisible();
      await expect(
        region(page, "Moon Timings").getByRole("button", { name: "View New Moon details" }),
      ).toBeVisible();
      await capture("daily-01-top", { fullPage: false });
      await capture("daily-02-full");
      await captureDrawer(page, capture, wheel(page).getByRole("button", { name: "Moon" }), "daily-03-drawer-planet");
      await captureDrawer(
        page,
        capture,
        region(page, "Ascendant Today").getByRole("button", { name: "Sun conjuncts ASC at 7:15 AM" }),
        "daily-04-drawer-ascendant-conjunction",
      );
      await captureDrawer(
        page,
        capture,
        region(page, "Moon Timings").getByRole("button", { name: "View New Moon details" }),
        "daily-05-drawer-moon-phase",
      );
      const weekly = region(page, "Weekly Timings");
      await captureDrawer(
        page,
        capture,
        weekly.getByRole("button", { name: "Mercury Trine Jupiter starts" }),
        "daily-06-drawer-weekly-aspect",
      );
      await captureDrawer(
        page,
        capture,
        weekly.getByRole("button", { name: "Mars enters Aquarius" }),
        "daily-07-drawer-sign-change",
      );
      await captureDrawer(
        page,
        capture,
        weekly.getByRole("button", { name: "Mercury starts retrograde" }),
        "daily-08-drawer-retrograde",
      );
      await region(page, "Ascendant Today").scrollIntoViewIfNeeded();
      await capture("daily-09-ascendant-in-view", { fullPage: false });
      await region(page, "Moon Timings").scrollIntoViewIfNeeded();
      await capture("daily-10-moon-in-view", { fullPage: false });
      await weekly.scrollIntoViewIfNeeded();
      await capture("daily-11-weekly-by-day", { fullPage: false });
      await weekly.getByRole("button", { name: "Timeline" }).click();
      await expect(weekly.getByText("NOW")).toBeVisible();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300); // the toggle's colour transition
      await weekly.scrollIntoViewIfNeeded();
      await capture("daily-12-weekly-timeline", { fullPage: false });
    });

    test(`transits at ${viewport.width}px`, async ({ page }) => {
      const capture = capturer(page);
      await page.goto("/transit");
      await expect(wheel(page).getByRole("button", { name: "Sun, My Profile" })).toBeVisible();
      await expect(region(page, "Ascendant Today").getByText("NOW")).toBeVisible();
      await expect(region(page, "Weekly Timings").getByText("Jupiter day")).toBeVisible();
      await capture("transits-01-top", { fullPage: false });
      await capture("transits-02-full");
      await captureDrawer(
        page,
        capture,
        wheel(page).getByRole("button", { name: "Sun, Transit" }),
        "transits-03-drawer-planet",
      );
      await captureDrawer(
        page,
        capture,
        region(page, "Aspect Matrix").getByRole("button", { name: "Transit Moon Trine My Profile Sun" }),
        "transits-04-drawer-aspect",
      );
      await region(page, "Aspect Matrix").scrollIntoViewIfNeeded();
      await capture("transits-05-matrix-in-view", { fullPage: false });
      await region(page, "Placements").scrollIntoViewIfNeeded();
      await capture("transits-06-placements-in-view", { fullPage: false });
    });

    test(`synastry at ${viewport.width}px`, async ({ page }) => {
      const capture = capturer(page);
      await page.goto("/synastry");
      await expect(wheel(page).getByRole("button", { name: "Sun, My Profile" })).toBeVisible();
      await capture("synastry-01-top", { fullPage: false });
      await capture("synastry-02-full");
      await captureDrawer(
        page,
        capture,
        wheel(page).getByRole("button", { name: "Scorpio" }),
        "synastry-03-drawer-sign-two-charts",
      );
      await captureDrawer(
        page,
        capture,
        region(page, "Synastry Aspects").getByRole("button", { name: "Mum Moon Trine My Profile Sun" }),
        "synastry-04-drawer-aspect",
      );
    });

    test.describe("one profile", () => {
      test.use({ scenario: "withProfile" });

      test(`synastry, second profile needed, at ${viewport.width}px`, async ({ page }) => {
        await page.goto("/synastry");
        await expect(page.getByRole("link", { name: "Go to Profile" })).toBeVisible();
        await capturer(page)("synastry-05-second-profile-message", { fullPage: false });
      });
    });
  });
}
