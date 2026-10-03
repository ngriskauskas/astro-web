import { within } from "@testing-library/react";
import { expect, test } from "vitest";
import { defaultSettings, emptyAspectsChart, getSettings, natalChartFor, savedSettings } from "../mocks";
import { drawer, findWidget, renderChartPage, widget } from "./charts";
import { capture, reject } from "./requests";

// The aspect matrix: one chart on the Charts page, two charts on Synastry.

// The standard planet order, then the Ascendant and Midheaven. Lilith is turned off
// by default.
const POINTS = [
  "Sun",
  "Moon",
  "Mercury",
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
  "Ascendant",
  "Midheaven",
];

// Each aspect in natalChart, named row point first. The one to Lilith is not shown.
const ASPECTS = [
  "Saturn Trine Sun",
  "Venus Sextile Moon",
  "Pluto Opposition Mercury",
  "Mars Conjunction Venus",
  "Chiron Conjunction Jupiter",
  "Ascendant Sextile Mars",
  "Neptune Conjunction Uranus",
];

const titles = (cells: HTMLElement[]) => cells.map((cell) => cell.title).filter(Boolean);
const names = (matrix: ReturnType<typeof within>) =>
  matrix.queryAllByRole("button").map((button: HTMLElement) => button.getAttribute("aria-label"));

test("lists every point once along the top and once down the side, in the standard order", async () => {
  await renderChartPage("charts");
  const matrix = widget("Aspect Matrix");

  expect(titles(matrix.getAllByRole("columnheader"))).toEqual(POINTS);
  expect(titles(matrix.getAllByRole("rowheader"))).toEqual(POINTS);
});

test("shows the aspect's symbol in the cell for each pair that forms one, and nothing elsewhere", async () => {
  await renderChartPage("charts");
  const matrix = widget("Aspect Matrix");

  expect(names(matrix).sort()).toEqual([...ASPECTS].sort());
  expect(matrix.getByRole("button", { name: "Saturn Trine Sun" })).toHaveTextContent("△");
});

test("selecting a cell with an aspect opens the drawer for that aspect", async () => {
  const { user } = await renderChartPage("charts");

  await user.click(widget("Aspect Matrix").getByRole("button", { name: "Mars Conjunction Venus" }));

  expect(drawer.title()).toMatch(/Venus.*Mars/);
  expect(drawer.get().getByText("Conjunction")).toBeInTheDocument();
});

test("an optional object turned on in the settings is included", async () => {
  await renderChartPage("charts", { handlers: [getSettings(savedSettings)] });
  const matrix = widget("Aspect Matrix");

  expect(await matrix.findByRole("button", { name: "Lilith Trine Moon" })).toBeInTheDocument();
  expect(titles(matrix.getAllByRole("columnheader"))).toContain("Lilith");
});

test("an optional object turned off in the settings is left out, with its aspects", async () => {
  await renderChartPage("charts", {
    handlers: [
      getSettings({
        ...defaultSettings,
        objectOptions: { showChiron: false, showLilith: false },
      }),
    ],
  });
  const matrix = widget("Aspect Matrix");

  await matrix.findByRole("button", { name: "Saturn Trine Sun" });
  expect(titles(matrix.getAllByRole("columnheader"))).toEqual(
    POINTS.filter((point) => point !== "Chiron"),
  );
  expect(names(matrix).sort()).toEqual(
    ASPECTS.filter((aspect) => !aspect.includes("Chiron")).sort(),
  );
});

test("the chart is requested again when the saved aspect settings arrive", async () => {
  // Which aspect types and orbs apply is decided by the backend from the saved
  // settings, so the page only has to ask again once it knows them.
  const sent = capture("post", "/charts/natal");
  await renderChartPage("charts", { handlers: [getSettings(savedSettings)] });

  await widget("Aspect Matrix").findByRole("button", { name: "Lilith Trine Moon" });

  expect(sent.length).toBeGreaterThanOrEqual(1);
  expect(sent[sent.length - 1].body).toEqual({ birthProfileId: 1 });
});

test("a chart with no aspects shows the points and no aspect cells", async () => {
  await renderChartPage("charts", { handlers: [natalChartFor(emptyAspectsChart)] });
  const matrix = widget("Aspect Matrix");

  expect(titles(matrix.getAllByRole("columnheader"))).toEqual(POINTS);
  expect(names(matrix)).toEqual([]);
});

test("says so when the chart cannot be loaded", async () => {
  reject("post", "/charts/natal");
  await renderChartPage("charts", { wait: false });
  const matrix = await findWidget("Aspect Matrix");

  expect(await matrix.findByRole("alert")).toHaveTextContent("Could not load the chart.");
  expect(matrix.queryByRole("table")).not.toBeInTheDocument();
});

test("with two charts, one runs along the top and the other down the side, each labelled", async () => {
  await renderChartPage("synastry");
  const matrix = widget("Synastry Aspects");

  expect(matrix.getByText("My Profile Chart Points")).toBeInTheDocument();
  expect(matrix.getByText("Mum Chart Points")).toBeInTheDocument();
  expect(titles(matrix.getAllByRole("columnheader"))).toEqual(POINTS);
  expect(titles(matrix.getAllByRole("rowheader"))).toEqual(POINTS);
});

test("with two charts, every cell pairs a point of one chart with a point of the other", async () => {
  await renderChartPage("synastry");
  const matrix = widget("Synastry Aspects");

  // Each aspect in synastryChart, named with whose point is whose. The one to Lilith
  // is not shown.
  expect(names(matrix).sort()).toEqual(
    [
      "Mum Moon Trine My Profile Sun",
      "Mum Venus Square My Profile Mars",
      "Mum Sun Conjunction My Profile Moon",
      "Mum Jupiter Sextile My Profile Chiron",
      "Mum Mercury Trine My Profile Ascendant",
    ].sort(),
  );
});
