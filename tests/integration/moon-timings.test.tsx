import { expect, test } from "vitest";
import { drawer, findWidget, renderChartPage } from "./charts";
import { capture, hold, reject } from "./requests";

// Moon Timings, on the Daily page.

const moon = async () => {
  const region = await findWidget("Moon Timings");
  await region.findByRole("button", { name: "View New Moon details" });
  return region;
};

test("shows the Moon's current sign and degree", async () => {
  await renderChartPage("daily");
  const region = await moon();

  expect(region.getByLabelText("Current Moon placement: Sagittarius 10° 0′")).toBeInTheDocument();
});

test("lists the eight phases in date order, each with its date, time and sign", async () => {
  await renderChartPage("daily");
  const region = await moon();

  const phases = region.getAllByRole("button");

  // The phase whose time cannot be read comes last.
  expect(phases.map((phase) => phase.getAttribute("aria-label"))).toEqual(
    [
      "Waning Crescent",
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Last Quarter",
      "Waning Gibbous",
    ].map((name) => `View ${name} details`),
  );
  expect(phases[1]).toHaveTextContent("Jan 18, 2:52 PM");
  expect(phases[1]).toHaveTextContent("Capricorn");
});

test("marks the current phase", async () => {
  await renderChartPage("daily");
  const region = await moon();

  const current = region
    .getAllByRole("button")
    .filter((phase) => phase.getAttribute("aria-current") === "true");

  expect(current.map((phase) => phase.getAttribute("aria-label"))).toEqual([
    "View Waning Crescent details",
  ]);
});

test("a phase with no usable time says its timing is unavailable", async () => {
  await renderChartPage("daily");
  const region = await moon();

  expect(region.getByRole("button", { name: "View Waning Gibbous details" })).toHaveTextContent(
    "Timing unavailable",
  );
});

test("selecting a phase opens the drawer for it", async () => {
  const { user } = await renderChartPage("daily");
  const region = await moon();

  await user.click(region.getByRole("button", { name: "View Full Moon details" }));

  expect(drawer.title()).toBe("Full Moon");
});

test("shows a loading indication until the timings arrive", async () => {
  const held = hold("post", "/timing/current-moon");
  await renderChartPage("daily");
  const region = await findWidget("Moon Timings");

  expect(region.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  held.release();

  expect(await region.findByRole("button", { name: "View New Moon details" })).toBeInTheDocument();
});

test("says so when moon timings cannot be loaded", async () => {
  reject("post", "/timing/current-moon");
  await renderChartPage("daily");
  const region = await findWidget("Moon Timings");

  expect(await region.findByRole("alert")).toHaveTextContent(
    "Moon timings are unavailable right now.",
  );
  expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});

test("asks for the moon timings for today", async () => {
  const sent = capture("post", "/timing/current-moon");
  await renderChartPage("daily");
  await moon();

  expect(sent[sent.length - 1].body).toEqual({ date: "2026-01-15" });
});
