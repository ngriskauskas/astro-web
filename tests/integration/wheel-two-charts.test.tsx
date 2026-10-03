import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { synastryChart } from "../mocks";
import { drawer, findWidget, renderChartPage, wheel } from "./charts";
import { reject } from "./requests";

// The two-ring wheel, on the Synastry page: "My Profile" compared with "Mum".

test("each chart's planets and houses are shown, named for the chart they belong to", async () => {
  await renderChartPage("synastry");
  const chart = await wheel();

  // 13 planets in each ring: Chiron is shown and Lilith is not.
  expect(chart.getAllByRole("button", { name: /^(?!.*House).*, My Profile$/ })).toHaveLength(13 + 4);
  expect(chart.getAllByRole("button", { name: /^(?!.*House).*, Mum$/ })).toHaveLength(13 + 4);
  expect(chart.getAllByRole("button", { name: /House, My Profile$/ })).toHaveLength(12);
  expect(chart.getAllByRole("button", { name: /House, Mum$/ })).toHaveLength(12);
  expect(chart.getByRole("button", { name: "Sun, My Profile" })).toBeInTheDocument();
  expect(chart.getByRole("button", { name: "Sun, Mum" })).toBeInTheDocument();
});

test("a line joins the two charts for each aspect between them", async () => {
  await renderChartPage("synastry");
  await wheel();

  const lines = screen
    .getByRole("group", { name: "Chart wheel" })
    .querySelectorAll("line[data-aspect]");
  // Every aspect except the one to Lilith, which is turned off.
  expect(lines).toHaveLength(synastryChart.aspects.length - 1);
});

test("selecting a house in either ring opens that chart's house", async () => {
  const { user } = await renderChartPage("synastry");
  const chart = await wheel();

  await user.click(chart.getByRole("button", { name: "1st House, Mum" }));
  expect(drawer.title()).toBe("1st House");
  // Mum's first house starts in Libra; My Profile's starts in Aries.
  expect(await drawer.get().findByRole("button", { name: "Libra" })).toBeInTheDocument();
  await drawer.close(user);

  await user.click(chart.getByRole("button", { name: "1st House, My Profile" }));
  expect(await drawer.get().findByRole("button", { name: "Aries" })).toBeInTheDocument();
});

test("says so when the chart cannot be loaded", async () => {
  reject("post", "/charts/synastry");
  await renderChartPage("synastry", { wait: false });
  const region = await findWidget("Synastry");

  expect(await region.findByRole("alert")).toHaveTextContent("Could not load the chart.");
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});
