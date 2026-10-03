import { within } from "@testing-library/react";
import { expect, test } from "vitest";
import { natalChart } from "../mocks";
import { drawer, findWidget, renderChartPage, widget } from "./charts";
import { reject } from "./requests";

// Placements: one table on the Charts page, two groups on Synastry.

const rowFor = (placements: ReturnType<typeof within>, planet: string) =>
  within(placements.getByRole("button", { name: planet }).closest("tr")!);

test("lists each planet with its sign, house and degree", async () => {
  await renderChartPage("charts");
  const placements = widget("Placements");

  // A header row and one row for each planet in the chart.
  expect(placements.getAllByRole("row")).toHaveLength(1 + Object.keys(natalChart.planets).length);
  const sun = rowFor(placements, "Sun");
  expect(sun.getByRole("button", { name: "Taurus" })).toBeInTheDocument();
  expect(sun.getByRole("button", { name: "2nd House" })).toBeInTheDocument();
  expect(sun.getByText("24° 30′")).toBeInTheDocument();
});

test("selecting the planet, sign or house in a row opens the drawer for it", async () => {
  const { user } = await renderChartPage("charts");
  const moon = rowFor(widget("Placements"), "Moon");

  await user.click(moon.getByRole("button", { name: "Moon" }));
  expect(drawer.title()).toBe("Moon");
  await drawer.close(user);

  await user.click(moon.getByRole("button", { name: "Aquarius" }));
  expect(drawer.title()).toBe("Aquarius");
  await drawer.close(user);

  await user.click(moon.getByRole("button", { name: "10th House" }));
  expect(drawer.title()).toBe("10th House");
});

test("says so when the chart cannot be loaded", async () => {
  reject("post", "/charts/natal");
  await renderChartPage("charts", { wait: false });
  const placements = await findWidget("Placements");

  expect(await placements.findByRole("alert")).toHaveTextContent("Could not load the chart.");
  expect(placements.queryByRole("table")).not.toBeInTheDocument();
});

test("with two charts, there is a group for each, labelled with whose chart it is", async () => {
  await renderChartPage("synastry");
  const placements = widget("Placements");

  const mine = within(placements.getByRole("group", { name: "My Profile" }));
  const mums = within(placements.getByRole("group", { name: "Mum" }));

  expect(rowFor(mine, "Sun").getByRole("button", { name: "Taurus" })).toBeInTheDocument();
  expect(rowFor(mums, "Sun").getByRole("button", { name: "Scorpio" })).toBeInTheDocument();
});

test("with two charts, selecting a planet opens the drawer for that chart's planet", async () => {
  const { user } = await renderChartPage("synastry");
  const mums = within(widget("Placements").getByRole("group", { name: "Mum" }));

  await user.click(mums.getByRole("button", { name: "Sun" }));

  expect(drawer.title()).toBe("Sun");
  expect(drawer.get().getAllByRole("button", { name: "Scorpio" }).length).toBeGreaterThan(0);
});
