import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderChartPage, wheel, type ChartPage } from "./charts";

// What happens when something a chart page needs is missing.

const ALL: ChartPage[] = ["charts", "moment", "daily", "transits", "synastry"];

test.each(ALL)("without a birth profile, %s sends the user to their profile", async (page) => {
  await renderChartPage(page, { scenario: "newAccount", wait: false });

  expect(await screen.findByText("profile screen")).toBeInTheDocument();
  expect(await screen.findByText("Please create your birth profile first")).toBeInTheDocument();
});

test.each<ChartPage>(["moment", "daily", "transits"])(
  "without a location, %s sends the user to their profile",
  async (page) => {
    await renderChartPage(page, { scenario: "noLocation", wait: false });

    expect(await screen.findByText("profile screen")).toBeInTheDocument();
    expect(await screen.findByText("Please enter your location first")).toBeInTheDocument();
  },
);

test("Charts does not need a location", async () => {
  await renderChartPage("charts", { scenario: "noLocation" });

  expect((await wheel()).getByRole("button", { name: "Sun" })).toBeInTheDocument();
  expect(screen.queryByText("profile screen")).not.toBeInTheDocument();
});

test.each<ChartPage>(["charts", "moment", "daily", "transits"])(
  "%s works for a user who has only their own birth profile",
  async (page) => {
    await renderChartPage(page, { scenario: "withProfile" });

    expect((await wheel()).getAllByRole("button").length).toBeGreaterThan(0);
  },
);
