import { expect, test } from "vitest";
import { dailyTimingsFor, emptyDailyTimings } from "../mocks";
import { drawer, findWidget, renderChartPage } from "./charts";
import { capture, hold, reject } from "./requests";

// The Ascendant timeline, on the Daily page. The clock is frozen at 07:00.

const MARKERS = ["Sun conjuncts ASC at 7:15 AM", "Venus conjuncts ASC at 9:42 AM"];

const timeline = async () => {
  const region = await findWidget("Ascendant Today");
  await region.findByText("NOW");
  return region;
};

test("shows the current Ascendant, the signs it passes through today, and the current time", async () => {
  await renderChartPage("daily");
  const region = await timeline();

  // The chart has the Ascendant at 10° of Capricorn.
  expect(region.getByText("10° 0′")).toBeInTheDocument();
  expect(region.getByLabelText("Current ascendant: Capricorn")).toBeInTheDocument();
  // The day starts in Libra, and each change of sign starts a new block at its time.
  for (const [sign, time] of [
    ["Libra", "12:00 AM"],
    ["Scorpio", "12:30 AM"],
    ["Capricorn", "5:40 AM"],
    ["Aquarius", "7:30 AM"],
    ["Virgo", "8:20 PM"],
  ]) {
    expect(region.getByTitle(`${sign} from ${time}`)).toBeInTheDocument();
  }
  expect(region.getAllByTitle(/ from /)).toHaveLength(13);
});

test("marks each planet that meets the Ascendant today, with its time, and nothing else", async () => {
  await renderChartPage("daily");
  const region = await timeline();

  // The response also has a square to the Ascendant and a conjunction of two planets;
  // neither belongs on this timeline.
  expect(region.getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual(
    MARKERS,
  );
});

test("starts scrolled to the current time", async () => {
  await renderChartPage("daily");
  const region = await timeline();

  const scroller = region.getByText("NOW").closest(".overflow-y-auto")!;

  // jsdom has no layout, so this only shows the position was set; the browser journey
  // checks that the marker is really in view.
  expect(scroller.scrollTop).toBeGreaterThan(0);
});

test("selecting a marker opens the drawer for that event", async () => {
  const { user } = await renderChartPage("daily");
  const region = await timeline();

  await user.click(region.getByRole("button", { name: MARKERS[0] }));

  expect(drawer.title()).toMatch(/Sun.*Ascendant/);
});

test("says so when no planet meets the Ascendant today", async () => {
  await renderChartPage("daily", { handlers: dailyTimingsFor(emptyDailyTimings) });
  const region = await timeline();

  expect(region.getByText("No exact ASC conjunctions today")).toBeInTheDocument();
  expect(region.queryByRole("button")).not.toBeInTheDocument();
});

test("shows a loading indication until the timings arrive", async () => {
  const held = hold("post", "/timing/daily");
  await renderChartPage("daily");
  const region = await findWidget("Ascendant Today");

  expect(region.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  held.release();

  expect(await region.findByText("NOW")).toBeInTheDocument();
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});

test("says so when the timings cannot be loaded, instead of claiming there are none", async () => {
  reject("post", "/timing/daily");
  await renderChartPage("daily");
  const region = await findWidget("Ascendant Today");

  expect(await region.findByRole("alert")).toHaveTextContent("Could not load today's timings.");
  expect(region.queryByText("No exact ASC conjunctions today")).not.toBeInTheDocument();
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});

test("asks for today's timings", async () => {
  const sent = capture("post", "/timing/daily");
  await renderChartPage("daily");
  await timeline();

  expect(sent[sent.length - 1].body).toEqual({ date: "2026-01-15" });
});

test("on Transits, asks for today's timings for the chosen profile", async () => {
  const sent = capture("post", "/timing/daily-transit");
  await renderChartPage("transits");
  await timeline();

  expect(sent[sent.length - 1].body).toEqual({ date: "2026-01-15", birthProfileId: 1 });
});
