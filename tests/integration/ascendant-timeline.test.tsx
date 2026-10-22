import { within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { dailyTimings, dailyTimingsFor, emptyDailyTimings, planetaryHoursUnavailable } from "../mocks";
import { drawer, findWidget, renderChartPage, widget } from "./charts";
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
  expect(
    region
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"))
      .filter((label) => MARKERS.includes(label ?? "")),
  ).toEqual(MARKERS);
});

test("spaces close Ascendant conjunction markers so they remain individually visible", async () => {
  const original = dailyTimings.aspects[0];
  const closeTimings = {
    ...dailyTimings,
    aspects: [
      {
        ...original,
        exactDateRanges: ["2026-01-15T07:15:00", "2026-01-15T07:18:00", "2026-01-15T07:21:00"].map(
          (dateTime) => ({ ...original.exactDateRanges[0], dateTime }),
        ),
      },
    ],
  };
  await renderChartPage("daily", { handlers: dailyTimingsFor(closeTimings) });
  const region = await timeline();

  const markers = region
    .getAllByRole("button", { name: /conjuncts ASC at/ })
    .map((button) => button.closest<HTMLElement>("[data-conjunction-marker]")!);
  expect(markers).toHaveLength(3);
  const positions = markers.map((marker) => Number.parseFloat(marker.style.top));
  expect(positions[1] - positions[0]).toBeGreaterThanOrEqual(2.5);
  expect(positions[2] - positions[1]).toBeGreaterThanOrEqual(2.5);
  expect(region.getAllByRole("button", { name: /conjuncts ASC at/ })).toHaveLength(3);
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
  expect(region.queryByRole("button", { name: /conjuncts ASC/ })).not.toBeInTheDocument();
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

// The planetary hour column, beside the signs. Sunrise is at 07:12 and sunset at 17:00,
// so at the frozen 07:00 it is still the last night hour of the day before.

const HOURS_ENDPOINT = "/timing/planetary-hours";
const CURRENT_HOUR = "Saturn hour, 24 of 24, night, 6:01 AM to 7:12 AM";

const hourColumn = async () => {
  const region = await timeline();
  return within(await region.findByRole("list", { name: "Planetary hours" }));
};

const hourNames = (column: Awaited<ReturnType<typeof hourColumn>>) =>
  column.getAllByRole("listitem").map((item) => item.getAttribute("aria-label"));

// What the timeline showed before it had planetary hours.
const expectTheTimelineAsBefore = (region: Awaited<ReturnType<typeof timeline>>) => {
  expect(region.getAllByTitle(/ from /)).toHaveLength(13);
  expect(
    region
      .getAllByRole("button")
      .map((button) => button.getAttribute("aria-label"))
      .filter((label) => MARKERS.includes(label ?? "")),
  ).toEqual(MARKERS);
  expect(region.getByText("NOW")).toBeInTheDocument();
};

test("shows every planetary hour of the day beside the signs, each with its ruler and times", async () => {
  await renderChartPage("daily");
  const column = await hourColumn();
  const names = hourNames(column);

  expect(names).toHaveLength(25);
  // The first and last hours cross midnight; they keep their own start and end.
  expect(names[0]).toBe("Jupiter hour, 18 of 24, night, 10:55 PM to 12:06 AM");
  expect(names[6]).toBe(CURRENT_HOUR);
  expect(names[7]).toBe("Jupiter hour, 1 of 24, day, 7:12 AM to 8:01 AM");
  expect(names[19]).toBe("Moon hour, 13 of 24, night, 5:00 PM to 6:11 PM");
  expect(names[24]).toBe("Venus hour, 18 of 24, night, 10:55 PM to 12:06 AM");
  for (const item of column.getAllByRole("listitem")) {
    expect(item).toHaveAttribute("title", item.getAttribute("aria-label"));
  }
});

test("each planetary hour is marked with the time it starts, except one that began before midnight", async () => {
  await renderChartPage("daily");
  const column = await hourColumn();
  const [beforeMidnight, ...rest] = column.getAllByRole("listitem");

  expect(within(beforeMidnight).queryByText(/[AP]M/)).not.toBeInTheDocument();
  expect(within(rest[0]).getByText("12:06 AM")).toBeInTheDocument();
  expect(within(rest[5]).getByText("6:01 AM")).toBeInTheDocument();
  expect(within(rest[6]).getByText("7:12 AM")).toBeInTheDocument();
  expect(within(rest[23]).getByText("10:55 PM")).toBeInTheDocument();
  expect(column.getAllByText(/[AP]M/)).toHaveLength(24);
});

test("marks sunrise and sunset in the planetary hour column", async () => {
  await renderChartPage("daily");
  const column = await hourColumn();

  expect(column.getByText("Sunrise").closest("[role=listitem]")).toHaveAttribute(
    "aria-label",
    "Jupiter hour, 1 of 24, day, 7:12 AM to 8:01 AM",
  );
  expect(column.getByText("Sunset").closest("[role=listitem]")).toHaveAttribute(
    "aria-label",
    "Moon hour, 13 of 24, night, 5:00 PM to 6:11 PM",
  );
});

test("the current planetary hour is the one the Planetary Hour widget shows", async () => {
  await renderChartPage("daily");
  const column = await hourColumn();

  const current = column
    .getAllByRole("listitem")
    .filter((item) => item.hasAttribute("aria-current"));
  expect(current).toHaveLength(1);
  expect(current[0]).toHaveAttribute("aria-current", "time");
  expect(current[0]).toHaveAttribute("aria-label", CURRENT_HOUR);
  expect(
    widget("Planetary Hour").getByRole("group", { name: "Hour ruler: Saturn" }),
  ).toBeInTheDocument();
});

test("at midday the current planetary hour is a day hour", async () => {
  vi.setSystemTime(new Date("2026-01-15T17:00:00Z"));
  await renderChartPage("daily");
  const column = await hourColumn();

  const current = column
    .getAllByRole("listitem")
    .filter((item) => item.hasAttribute("aria-current"));
  expect(current.map((item) => item.getAttribute("aria-label"))).toEqual([
    "Moon hour, 6 of 24, day, 11:17 AM to 12:06 PM",
  ]);
  expect(
    widget("Planetary Hour").getByRole("group", { name: "Hour ruler: Moon" }),
  ).toBeInTheDocument();
});

test("selecting a planetary hour opens its specific description", async () => {
  const { user } = await renderChartPage("daily");
  const column = await hourColumn();

  const button = column.getByRole("button", {
    name: `View ${CURRENT_HOUR} details`,
  });
  await user.click(button);

  expect(drawer.title()).toBe("Saturn Hour");
  expect(drawer.get().getByText("24 of 24 · Night")).toBeInTheDocument();
});

test("selecting a sign segment opens its description", async () => {
  const { user } = await renderChartPage("daily");
  const region = await timeline();

  await user.click(region.getByRole("button", { name: "View Scorpio sign details" }));

  expect(drawer.title()).toBe("Scorpio");
});

test("without a sunrise or sunset, the timeline is shown as before, with no planetary hours", async () => {
  await renderChartPage("daily", { handlers: [planetaryHoursUnavailable()] });
  await widget("Planetary Hour").findByRole("alert");
  const region = await timeline();

  expect(region.queryByRole("list", { name: "Planetary hours" })).not.toBeInTheDocument();
  expect(region.queryByRole("alert")).not.toBeInTheDocument();
  expectTheTimelineAsBefore(region);
});

test("when planetary hours cannot be loaded, the timeline is shown as before", async () => {
  reject("post", HOURS_ENDPOINT);
  await renderChartPage("daily");
  await widget("Planetary Hour").findByRole("alert");
  const region = await timeline();

  expect(region.queryByRole("list", { name: "Planetary hours" })).not.toBeInTheDocument();
  expect(region.queryByRole("alert")).not.toBeInTheDocument();
  expectTheTimelineAsBefore(region);
});

test("the timeline does not wait for planetary hours; they join it when they arrive", async () => {
  const held = hold("post", HOURS_ENDPOINT);
  await renderChartPage("daily");
  const region = await timeline();

  expect(region.queryByRole("list", { name: "Planetary hours" })).not.toBeInTheDocument();
  expectTheTimelineAsBefore(region);
  held.release();

  expect(await region.findByRole("list", { name: "Planetary hours" })).toBeInTheDocument();
  expectTheTimelineAsBefore(region);
});

test("on Transits, the timeline has the planetary hours too, asked for once", async () => {
  const sent = capture("post", HOURS_ENDPOINT);
  await renderChartPage("transits");
  const column = await hourColumn();

  expect(hourNames(column)).toHaveLength(25);
  expect(column.getByRole("listitem", { current: "time" })).toHaveAttribute(
    "aria-label",
    CURRENT_HOUR,
  );
  expect(sent.map(({ body }) => body)).toEqual([{ date: "2026-01-15" }]);
});
