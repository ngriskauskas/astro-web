import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Navbar } from "../../src/components/Navbar";
import { renderWithApp } from "./render";

// jsdom applies no CSS, so the wide-screen links and the small-screen menu are both in
// the document. These tests cover the menu; which of the two is visible at a given
// width is checked in the browser.
const DESTINATIONS = [
  "Charts",
  "Moment",
  "Daily",
  "Transits",
  "Synastry",
  "Friends",
  "Profile",
  "Logout",
];

const renderNavbar = () => renderWithApp(<Navbar />, { scenario: "withProfile" });
const menuButton = () => screen.getByRole("button", { name: "Menu" });

test("the menu is closed and unreachable until opened", () => {
  renderNavbar();

  expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("the open menu lists every destination", async () => {
  const { user } = renderNavbar();

  await user.click(menuButton());

  expect(menuButton()).toHaveAttribute("aria-expanded", "true");
  const items = within(screen.getByRole("menu")).getAllByRole("menuitem");
  expect(items.map((item) => item.textContent)).toEqual(DESTINATIONS);
});

test("choosing a destination closes the menu", async () => {
  const { user } = renderNavbar();

  await user.click(menuButton());
  await user.click(within(screen.getByRole("menu")).getByRole("menuitem", { name: "Profile" }));

  expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("the close button closes the menu", async () => {
  const { user } = renderNavbar();

  await user.click(menuButton());
  await user.click(screen.getByRole("button", { name: "Close menu" }));

  expect(menuButton()).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("logging out from the menu ends the session", async () => {
  const { user } = renderNavbar();

  await user.click(menuButton());
  await user.click(within(screen.getByRole("menu")).getByRole("menuitem", { name: "Logout" }));

  expect(localStorage.getItem("token")).toBeNull();
  expect(menuButton()).toHaveAttribute("aria-expanded", "false");
});
