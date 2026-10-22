import { screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Home } from "../../src/pages/Home";
import { drawer } from "./charts";
import { renderWithApp } from "./render";
import { getBirthProfiles, mainBirthProfile } from "../mocks";

test("shows the personal-sky links before the sky and natal widgets", async () => {
  renderWithApp(<Home />, { scenario: "withCustomProfiles" });

  expect(
    await screen.findByText("A personal sky, updated throughout the day"),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Start with what you're curious about." })).toBeInTheDocument();
  const destinations = screen.getByRole("navigation", { name: "Choose a destination" });
  for (const label of ["Today", "My chart", "A moment", "Transits", "Synastry", "Profiles"]) {
    expect(within(destinations).getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
  }
  expect(within(destinations).getByRole("link", { name: /Today/ })).toHaveClass("cursor-pointer");
  expect(screen.queryByRole("heading", { name: "Your sky" })).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Home layout")).not.toBeInTheDocument();
  expect(screen.queryByRole("navigation", { name: "Explore Astro" })).not.toBeInTheDocument();
  expect(await screen.findByRole("region", { name: "At a glance" })).toBeInTheDocument();
  expect(await screen.findByRole("region", { name: "Planetary Hour" })).toBeInTheDocument();
  expect(await screen.findByRole("region", { name: "Moon Timings" })).toBeInTheDocument();
  expect(await screen.findByRole("region", { name: "Ascendant Today" })).toBeInTheDocument();
  expect(await screen.findByRole("region", { name: "Weekly Timings" })).toBeInTheDocument();
  expect(
    within(screen.getByRole("region", { name: "Weekly Timings" }))
      .getByRole("button", { name: "Timeline" }),
  ).toHaveClass("cursor-pointer");
  expect(screen.getByRole("heading", { name: "Your natal snapshot" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "View Mercury day ruler details" }),
  ).toBeInTheDocument();

  const sun = screen.getByRole("button", { name: "View natal Sun details" });
  expect(within(sun).getByText("Sun")).toBeInTheDocument();
  expect(within(sun).getByText("Taurus")).toBeInTheDocument();
  expect(within(sun).getByText("2nd House")).toBeInTheDocument();
  expect(within(sun).queryByText("24° 30′")).not.toBeInTheDocument();
  expect(within(screen.getByRole("button", { name: "View natal Moon details" })).getByText("10th House"))
    .toBeInTheDocument();
  const cards = screen.getAllByRole("button", { name: /View natal/ });
  expect(cards.map((card) => card.getAttribute("aria-label"))).toEqual([
    "View natal Rising details",
    "View natal Sun details",
    "View natal Moon details",
  ]);
  expect(within(cards[0]).getByText("ASC")).toHaveClass("text-[10px]");
  expect(within(cards[0]).getByText("Rising")).toBeInTheDocument();
  expect(within(cards[0]).getByText("ASC")).toHaveStyle({ color: "var(--color-gray-800)" });
});

test("omits natal houses and the Ascendant when birth time is unknown", async () => {
  renderWithApp(<Home />, {
    scenario: "withCustomProfiles",
    handlers: [
      getBirthProfiles([{ ...mainBirthProfile, birthTime: null, birthTimeUnknown: true }]),
    ],
  });

  const sun = await screen.findByRole("button", { name: "View natal Sun details" });
  expect(within(sun).getByText("Taurus")).toBeInTheDocument();
  expect(within(sun).queryByText(/House$/)).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: "View natal Rising details" })).not.toBeInTheDocument();
});

test("the natal snapshot opens details for its own chart", async () => {
  const { user } = renderWithApp(<Home />, { scenario: "withCustomProfiles" });
  await screen.findByRole("button", { name: "View natal Sun details" });

  await user.click(screen.getByRole("button", { name: "View natal Sun details" }));

  expect(drawer.title()).toBe("Sun");
  expect(drawer.get().getByText("24° 30′")).toBeInTheDocument();
});

test("asks for a birth profile before showing chart widgets", async () => {
  renderWithApp(<Home />, { scenario: "newAccount" });

  expect(await screen.findByRole("heading", { name: "Start with your birth chart" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Add birth details" })).toHaveAttribute("href", "/profile");
});

test("asks for a location before loading local sky widgets", async () => {
  renderWithApp(<Home />, { scenario: "noLocation" });

  expect(await screen.findByRole("heading", { name: "Add your location to see today's sky" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Add your location" })).toHaveAttribute("href", "/profile");
});
