import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test } from "vitest";
import { dignitiesOf } from "../../src/utils/natalSummary";
import { API_URL, natalChart, transitChart } from "../mocks";
import { drawer, findWidget, renderChartPage } from "./charts";
import { capture } from "./requests";

test("the natal summary names the dominant element and modality", async () => {
  await renderChartPage("charts");

  const summary = await findWidget("Summary");

  expect(summary.getAllByText(/^Mostly /)).toHaveLength(2);
  expect(summary.getByRole("heading", { name: "Tightest aspects" })).toBeInTheDocument();
});

test("the houses table lists all twelve houses, each with a ruler", async () => {
  await renderChartPage("charts");

  const houses = await findWidget("Houses");

  // One header row and twelve house rows.
  expect(houses.getAllByRole("row")).toHaveLength(13);
  expect(houses.getByRole("rowheader", { name: "1st House" })).toBeInTheDocument();
});

test("a planet's returns come from the server and show in its drawer", async () => {
  const returns = http.post(`${API_URL}/timing/returns`, () =>
    HttpResponse.json({
      previous: "2026-05-15T05:04:00",
      next: "2027-05-15T10:39:00",
      returns: ["2026-05-15T05:04:00", "2027-05-15T10:39:00"],
    }),
  );
  const { user } = await renderChartPage("charts", { handlers: [returns] });

  const placements = await findWidget("Placements");
  await user.click(placements.getByRole("button", { name: "Sun" }));
  await user.click(drawer.get().getByRole("button", { name: "Returns" }));

  const last = await drawer.get().findByText("Last");
  expect(last.nextElementSibling).toHaveTextContent(/May 15, 2026/);
  const next = drawer.get().getByText("Next");
  expect(next.nextElementSibling).toHaveTextContent(/May 15, 2027/);
});

test("a planet's retrograde cycles come from the server and show in its drawer", async () => {
  const cycles = http.post(`${API_URL}/timing/cycles`, () =>
    HttpResponse.json({
      retrogradeNow: false,
      previous: { stationRetrograde: "2026-04-10T08:00:00", stationDirect: "2026-05-03T12:00:00" },
      next: { stationRetrograde: "2026-08-12T09:00:00", stationDirect: "2026-09-05T10:00:00" },
      periods: [
        { stationRetrograde: "2026-04-10T08:00:00", stationDirect: "2026-05-03T12:00:00" },
        { stationRetrograde: "2026-08-12T09:00:00", stationDirect: "2026-09-05T10:00:00" },
      ],
    }),
  );
  const { user } = await renderChartPage("charts", { handlers: [cycles] });

  const placements = await findWidget("Placements");
  await user.click(placements.getByRole("button", { name: "Mercury" }));
  await user.click(drawer.get().getByRole("button", { name: "Cycles" }));

  expect(await drawer.get().findByText("Mercury is direct now.")).toBeInTheDocument();
  const last = drawer.get().getByText("Last retrograde");
  expect(last.nextElementSibling).toHaveTextContent(/Apr 10, 2026/);
  const next = drawer.get().getByText("Next retrograde");
  expect(next.nextElementSibling).toHaveTextContent(/Aug 12, 2026/);
});

test("the planet drawer shows where the planet sits in this chart", async () => {
  const { user } = await renderChartPage("charts");

  const placements = await findWidget("Placements");
  await user.click(placements.getByRole("button", { name: "Sun" }));

  expect(drawer.get().getByRole("heading", { name: "In this chart" })).toBeInTheDocument();
  expect(drawer.get().getByText(/Aspects to the angles/)).toBeInTheDocument();
});

test("the placements summary shows six key planets until asked for all of them", async () => {
  const { user } = await renderChartPage("daily");

  const placements = await findWidget("Placements");
  const keyRows = placements.getAllByRole("row").length;
  expect(keyRows).toBe(7);

  await user.click(placements.getByRole("button", { name: "Show all placements" }));

  expect(placements.getAllByRole("row").length).toBeGreaterThan(keyRows);
  expect(screen.getByRole("button", { name: "Show key placements" })).toBeInTheDocument();
});

test.each([
  ["MOON", "CANCER", ["ruling"]],
  ["SUN", "ARIES", ["exalted"]],
  ["SUN", "LIBRA", ["fall"]],
  ["VENUS", "ARIES", ["detriment"]],
  ["MARS", "TAURUS", ["detriment"]],
  ["MARS", "ARIES", ["ruling"]],
] as const)("%s in %s has the dignities %j", (planet, sign, expected) => {
  expect(dignitiesOf(planet, sign)).toEqual(expected);
});

test("the chart ruler names the Ascendant's sign and the planet that rules it", async () => {
  await renderChartPage("charts");

  const ruler = await findWidget("Chart ruler");

  // The natal Ascendant is at 12° Aries, so Mars rules the chart.
  expect(ruler.getByText("The Ascendant is in")).toBeInTheDocument();
  expect(ruler.getByRole("button", { name: "Mars" })).toBeInTheDocument();
});

test("the dignities board pairs each planet with its sign, grouped by how strong it is there", async () => {
  await renderChartPage("charts");

  const board = await findWidget("Dignities");

  expect(board.getByRole("button", { name: "Saturn in Capricorn" })).toBeInTheDocument();
  expect(board.getByRole("button", { name: "Pluto in Scorpio" })).toBeInTheDocument();
  expect(board.getByRole("button", { name: "Venus in Pisces" })).toBeInTheDocument();
  expect(board.getByRole("button", { name: "Jupiter in Cancer" })).toBeInTheDocument();
  expect(board.getByText("It rules the sign it is in.")).toBeInTheDocument();
  expect(board.getByRole("heading", { name: "Detriment" }).nextElementSibling?.nextElementSibling).toHaveTextContent(
    "None in this chart",
  );
  expect(board.getByText("6 of 10 planets have no special strength in their sign.")).toBeInTheDocument();
});

test("the dignities board switches to house strength, with joy marked", async () => {
  const { user } = await renderChartPage("charts");

  const board = await findWidget("Dignities");
  await user.click(board.getByRole("button", { name: "By house" }));

  // Mercury sits in the 1st house, angular and its house of joy.
  expect(board.getByRole("button", { name: /^Mercury in 1st House/ })).toBeInTheDocument();
  expect(board.getByRole("button", { name: "Saturn in 10th House" })).toBeInTheDocument();
  expect(board.getByRole("button", { name: "Mars in 12th House" })).toBeInTheDocument();
  expect(board.getByText("1 of 10 planets are in their house of joy.")).toBeInTheDocument();
});

test("the hemispheres widget is one circle, with the emphasis in a sentence under it", async () => {
  await renderChartPage("charts");

  const hemispheres = await findWidget("Hemispheres and quadrants");

  expect(hemispheres.getByRole("img", { name: "Placements by quarter of the chart" })).toBeInTheDocument();
  expect(
    hemispheres.getByText(
      "Most of your planets sit in the Collective quarter, where public purpose and reputation take centre stage.",
    ),
  ).toBeInTheDocument();
  expect(hemispheres.queryByRole("button", { name: /Above|Below|East|West/ })).not.toBeInTheDocument();
  expect(hemispheres.queryByText("Ascendant")).not.toBeInTheDocument();
});

test("each quarter of the circle names its planets and their count", async () => {
  await renderChartPage("charts");

  const hemispheres = await findWidget("Hemispheres and quadrants");

  // Seven of the ten planets are above the horizon and eight are east of the meridian.
  expect(hemispheres.getByRole("button", { name: "Personal, Houses 1 to 3: 3 of 10 placements" })).toBeInTheDocument();
  expect(hemispheres.getByRole("button", { name: "Private, Houses 4 to 6: 0 of 10 placements" })).toBeInTheDocument();
  expect(hemispheres.getByRole("button", { name: "Relational, Houses 7 to 9: 2 of 10 placements" })).toBeInTheDocument();
  expect(hemispheres.getByRole("button", { name: "Collective, Houses 10 to 12: 5 of 10 placements" })).toBeInTheDocument();
  expect(hemispheres.getByRole("button", { name: "Mars in house 12" })).toBeInTheDocument();
});

test("a quarter opens its own description, which asks the server about that quarter", async () => {
  const sent = capture("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  const hemispheres = await findWidget("Hemispheres and quadrants");
  await user.click(hemispheres.getByRole("button", { name: "Collective, Houses 10 to 12: 5 of 10 placements" }));

  expect(drawer.title()).toBe("Collective");
  const request = sent.find(
    ({ body }) => (body as { context?: { kind?: string } } | null)?.context?.kind === "QUADRANT",
  );
  expect(request!.body).toMatchObject({
    context: { type: "distribution", kind: "QUADRANT", value: "COLLECTIVE", count: 5, total: 10 },
  });
});

test("a chart's shapes come from the server and show in the aspect patterns widget", async () => {
  const withPatterns = http.post(`${API_URL}/charts/natal`, () =>
    HttpResponse.json({
      ...natalChart,
      patterns: [{ type: "GRAND_TRINE", planets: ["SUN", "JUPITER", "MOON"], focus: null, sign: null }],
    }),
  );
  await renderChartPage("charts", { handlers: [withPatterns] });

  const patterns = await findWidget("Aspect patterns");

  expect(patterns.getByRole("heading", { name: "Grand trine" })).toBeInTheDocument();
  expect(patterns.getByRole("button", { name: "Jupiter" })).toBeInTheDocument();
});

test("a chart with no shapes says so in the aspect patterns widget", async () => {
  await renderChartPage("charts");

  const patterns = await findWidget("Aspect patterns");

  expect(patterns.getByText("No aspect patterns on this chart.")).toBeInTheDocument();
});

test("a two-chart view shows each side's shapes under that side", async () => {
  const sides = http.post(`${API_URL}/charts/transit`, () =>
    HttpResponse.json({
      ...transitChart,
      main: { ...transitChart.main, patterns: [{ type: "T_SQUARE", planets: ["MARS", "SATURN", "MOON"], focus: "MOON", sign: null }] },
    }),
  );
  await renderChartPage("transits", { handlers: [sides] });

  const patterns = await findWidget("Aspect patterns");

  expect(patterns.getByRole("heading", { name: "T-square" })).toBeInTheDocument();
  expect(
    patterns.getByText((_, element) => element?.tagName === "P" && element.textContent === "Points to Moon"),
  ).toBeInTheDocument();
  expect(patterns.getAllByText("No aspect patterns on this side.")).toHaveLength(1);
});
