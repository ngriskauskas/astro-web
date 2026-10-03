import type { Locator, Page } from "@playwright/test";
import { expect } from "./fixtures";

// Steps the chart-page journeys share. One journey per page: when a page gains a
// widget, add a step to that page's journey rather than another browser test.

type Destination = "Charts" | "Moment" | "Daily" | "Transits" | "Synastry";

const menuButton = (page: Page) =>
  page.getByRole("navigation").getByRole("button", { name: "Menu" });

// Reaches a page through the navigation as it is presented at this size: the menu on
// a phone, the bar on a wider screen.
export const openFromNav = async (page: Page, name: Destination) => {
  await page.goto("/");
  const nav = page.getByRole("navigation");
  if (await menuButton(page).isVisible()) {
    await menuButton(page).click();
    await nav.getByRole("menuitem", { name }).click();
  } else {
    await nav.getByRole("link", { name }).click();
  }
};

export const widget = (page: Page, name: string) => page.getByRole("region", { name, exact: true });

export const wheel = (page: Page) => page.getByRole("group", { name: "Chart wheel" });

export const drawer = (page: Page) => {
  const panel = page.getByRole("complementary", { name: "Description" });
  return {
    panel,
    title: panel.getByRole("heading", { level: 2 }),
    back: panel.getByRole("button", { name: "Back" }),
    close: panel.getByRole("button", { name: "Close" }),
  };
};

// Selects an item, sees the drawer open on it, and closes the drawer again.
export const opensAndCloses = async (page: Page, item: Locator, title: RegExp | string) => {
  await item.scrollIntoViewIfNeeded();
  await item.click();
  await expect(drawer(page).title).toHaveText(title);
  await drawer(page).close.click();
  await expect(drawer(page).panel).toBeHidden();
};

// On a phone the open drawer fills the screen; on wider screens it is a side panel,
// which this leaves alone.
export const expectDrawerCoversScreenOnPhone = async (page: Page) => {
  if (!(await menuButton(page).isVisible())) return;
  const viewport = page.viewportSize()!;
  const box = (await drawer(page).panel.boundingBox())!;
  expect(box).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });
};

export const expectNoSidewaysScroll = async (page: Page) => {
  const { pageWidth, screenWidth } = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    screenWidth: window.innerWidth,
  }));
  expect(pageWidth).toBeLessThanOrEqual(screenWidth);
};
