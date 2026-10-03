import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import {
  defaultSettings,
  emptyAspectsChart,
  getSettings,
  natalChart,
  natalChartFor,
  savedSettings,
} from "../mocks";
import { drawer, findWidget, renderChartPage, wheel } from "./charts";
import { hold, reject } from "./requests";

// The one-chart wheel, on the Charts page (natalChart).

const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];
const ANGLES = ["Ascendant", "Descendant", "Midheaven", "Imum Coeli"];
// With the default settings Chiron is shown and Lilith is not.
const PLANETS = [
  "Sun",
  "Moon",
  "Mercury, retrograde",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
  "North Node",
  "South Node",
];

const svg = () => screen.getByRole("group", { name: "Chart wheel" });
const aspectLines = () => svg().querySelectorAll("line[data-aspect]");
const withObjects = (objectOptions: { showChiron: boolean; showLilith: boolean }) =>
  getSettings({ ...defaultSettings, objectOptions });

test("shows every sign, house, key angle and planet, and a line for each aspect", async () => {
  await renderChartPage("charts");
  const chart = await wheel();

  for (const name of [...SIGNS, ...ANGLES, ...PLANETS]) {
    expect(chart.getByRole("button", { name })).toBeInTheDocument();
  }
  expect(chart.getAllByRole("button", { name: /House$/ })).toHaveLength(12);
  expect(chart.getAllByRole("button")).toHaveLength(12 + 12 + 4 + PLANETS.length);
  // Every aspect in the chart except the one to Lilith, which is turned off.
  expect(aspectLines()).toHaveLength(natalChart.aspects.length - 1);
});

test("a retrograde planet carries the retrograde mark", async () => {
  await renderChartPage("charts");
  const chart = await wheel();

  expect(chart.getByRole("button", { name: "Mercury, retrograde" })).toBeInTheDocument();
  expect(chart.getAllByText("℞")).toHaveLength(1);
});

test("an optional object turned on in the settings is shown, with its aspect lines", async () => {
  await renderChartPage("charts", { handlers: [getSettings(savedSettings)] });
  const chart = await wheel();

  expect(await chart.findByRole("button", { name: "Lilith" })).toBeInTheDocument();
  expect(aspectLines()).toHaveLength(natalChart.aspects.length);
});

test("an optional object turned off in the settings is absent, with its aspect lines", async () => {
  await renderChartPage("charts", {
    handlers: [withObjects({ showChiron: false, showLilith: false })],
  });
  const chart = await wheel();

  expect(chart.getByRole("button", { name: "Jupiter" })).toBeInTheDocument();
  expect(chart.queryByRole("button", { name: "Chiron" })).not.toBeInTheDocument();
  expect(chart.queryByRole("button", { name: "Lilith" })).not.toBeInTheDocument();
  expect(aspectLines()).toHaveLength(natalChart.aspects.length - 2);
});

test("degree labels and tick marks follow the display settings", async () => {
  const first = await renderChartPage("charts");
  await wheel();
  // The Sun is at 24° 30′ of Taurus.
  expect(svg()).toHaveTextContent("24° 30′");
  const linesWithTicks = svg().querySelectorAll("line").length;
  first.unmount();

  await renderChartPage("charts", {
    handlers: [
      getSettings({ ...defaultSettings, displayOptions: { tickMarks: false, angleLabels: false } }),
    ],
  });
  await wheel();

  expect(svg()).not.toHaveTextContent("24° 30′");
  // 29 tick marks in each of the 12 signs.
  expect(svg().querySelectorAll("line")).toHaveLength(linesWithTicks - 12 * 29);
});

test("shows a loading indication until the chart arrives", async () => {
  const held = hold("post", "/charts/natal");
  await renderChartPage("charts", { wait: false });
  const region = await findWidget("Natal Chart");

  expect(region.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  held.release();

  expect(await region.findByRole("button", { name: "Sun" })).toBeInTheDocument();
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});

test("says so when the chart cannot be loaded, without loading for ever", async () => {
  reject("post", "/charts/natal");
  await renderChartPage("charts", { wait: false });
  const region = await findWidget("Natal Chart");

  expect(await region.findByRole("alert")).toHaveTextContent("Could not load the chart.");
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  expect(screen.queryByRole("group", { name: "Chart wheel" })).not.toBeInTheDocument();
  // The rest of the page is still there and usable.
  expect(screen.getByRole("region", { name: "Chart Settings" })).toBeInTheDocument();
});

test.each([
  ["a planet", "Jupiter", "Jupiter"],
  ["a sign", "Leo", "Leo"],
  ["a house", "7th House", "7th House"],
  ["a key angle", "Midheaven", "MC"],
])("selecting %s opens the drawer for it", async (_kind, name, title) => {
  const { user } = await renderChartPage("charts");

  await user.click((await wheel()).getByRole("button", { name }));

  expect(drawer.title()).toBe(title);
});

test("pointing at a planet highlights the planets it aspects, until the pointer leaves", async () => {
  const { user } = await renderChartPage("charts");
  const chart = await wheel();
  const sun = chart.getByRole("button", { name: "Sun" });
  const saturn = chart.getByRole("button", { name: "Saturn" });
  const moon = chart.getByRole("button", { name: "Moon" });

  await user.hover(sun);
  // The Sun's only aspect in this chart is to Saturn.
  expect(saturn).toHaveAttribute("data-highlighted", "true");
  expect(moon).not.toHaveAttribute("data-highlighted");

  await user.unhover(sun);
  expect(saturn).not.toHaveAttribute("data-highlighted");
});

test("planets that are close together are both shown and each opens its own details", async () => {
  const { user } = await renderChartPage("charts");
  const chart = await wheel();

  await user.click(chart.getByRole("button", { name: "Venus" }));
  expect(drawer.title()).toBe("Venus");
  await drawer.close(user);

  await user.click(chart.getByRole("button", { name: "Mars" }));
  expect(drawer.title()).toBe("Mars");
});

test("a chart with no aspects draws no aspect lines", async () => {
  await renderChartPage("charts", { handlers: [natalChartFor(emptyAspectsChart)] });
  await wheel();

  expect(aspectLines()).toHaveLength(0);
});
