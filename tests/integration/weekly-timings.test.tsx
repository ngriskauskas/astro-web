import { within } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { emptyWeeklyTimings, weeklyTimingsFor } from "../mocks";
import { drawer, findWidget, renderChartPage, widget } from "./charts";
import { capture, hold, reject } from "./requests";

// Weekly Timings, on the Daily page. The clock is frozen on Thursday 15 January 2026,
// in the week of Sunday 11 to Saturday 17 January.

const DAYS = [
  ["Sun", "Jan 11", "Sun day"],
  ["Mon", "Jan 12", "Moon day"],
  ["Tue", "Jan 13", "Mars day"],
  ["Wed", "Jan 14", "Mercury day"],
  ["Thu", "Jan 15", "Jupiter day"],
  ["Fri", "Jan 16", "Venus day"],
  ["Sat", "Jan 17", "Saturn day"],
];

// What the fixture puts on each day, as named in the "By day" view. The aspect that
// involves the Descendant is not shown.
const EVENTS_BY_DAY: Record<string, string[]> = {
  "Jan 11": [],
  "Jan 12": ["Mercury Trine Jupiter starts"],
  "Jan 13": ["Mercury Trine Jupiter exact"],
  "Jan 14": ["Mercury starts retrograde", "Mercury Trine Jupiter exact"],
  "Jan 15": ["Sun Square Mars exact", "Mars enters Aquarius"],
  "Jan 16": ["Saturn stations direct", "Mercury Trine Jupiter ends"],
  "Jan 17": [],
};

const weekly = async () => {
  const region = await findWidget("Weekly Timings");
  await region.findByText("Jupiter day");
  return region;
};

const dayRow = (region: ReturnType<typeof within>, date: string) =>
  within(region.getByText(date).closest(".grid") as HTMLElement);

const eventNames = (scope: ReturnType<typeof within>) =>
  scope.queryAllByRole("button").map((button: HTMLElement) => button.getAttribute("aria-label"));

test("starts on the By day view, listing the seven days of this week with their rulers", async () => {
  await renderChartPage("daily");
  const region = await weekly();

  expect(region.getByRole("button", { name: "By day" })).toHaveAttribute("aria-pressed", "true");
  expect(region.getByRole("button", { name: "Timeline" })).toHaveAttribute("aria-pressed", "false");
  for (const [weekday, date, ruler] of DAYS) {
    const row = dayRow(region, date);
    expect(row.getByText(weekday)).toBeInTheDocument();
    expect(row.getByText(ruler)).toBeInTheDocument();
  }
});

test("lists each event under its day, and says so for a day with none", async () => {
  await renderChartPage("daily");
  const region = await weekly();

  for (const [date, events] of Object.entries(EVENTS_BY_DAY)) {
    const row = dayRow(region, date);
    expect(eventNames(row)).toEqual(events);
    if (events.length === 0) expect(row.getByText("No timing events")).toBeInTheDocument();
  }
});

test("the Timeline view shows the same events by time, with a marker for now", async () => {
  const { user } = await renderChartPage("daily");
  const region = await weekly();

  await user.click(region.getByRole("button", { name: "Timeline" }));

  expect(region.getByRole("button", { name: "Timeline" })).toHaveAttribute("aria-pressed", "true");
  expect(region.getByLabelText("Current time")).toBeInTheDocument();
  // The two view buttons have no label of their own; the rest are events.
  expect(eventNames(region).filter(Boolean)).toEqual([
    "Mercury Trine Jupiter starts at 10:00 AM",
    "Mercury Trine Jupiter exact at 3:15 PM",
    "Mercury starts retrograde at 6:00 AM",
    "Mercury Trine Jupiter exact at 8:30 AM",
    "Sun Square Mars exact at 3:15 PM",
    "Mars enters Aquarius at 3:15 PM",
    "Saturn stations direct",
    "Mercury Trine Jupiter ends at 6:00 PM",
  ]);
  const scroller = region.getByLabelText("Current time").closest(".overflow-y-auto")!;
  expect(scroller.scrollTop).toBeGreaterThan(0);
});

test("switching back returns to the By day view", async () => {
  const { user } = await renderChartPage("daily");
  const region = await weekly();

  await user.click(region.getByRole("button", { name: "Timeline" }));
  await user.click(region.getByRole("button", { name: "By day" }));

  expect(region.getByRole("button", { name: "By day" })).toHaveAttribute("aria-pressed", "true");
  expect(region.getByText("Jupiter day")).toBeInTheDocument();
  expect(region.queryByLabelText("Current time")).not.toBeInTheDocument();
});

test("selecting an event opens the drawer, in either view", async () => {
  const { user } = await renderChartPage("daily");
  const region = await weekly();

  await user.click(region.getByRole("button", { name: "Mars enters Aquarius" }));
  expect(drawer.title()).toMatch(/Mars.*Aquarius/);
  await drawer.close(user);

  await user.click(region.getByRole("button", { name: "Timeline" }));
  await user.click(region.getByRole("button", { name: "Mercury starts retrograde at 6:00 AM" }));
  expect(drawer.title()).toMatch(/Mercury.*retrograde/);
});

test("events at the same time are both shown and each opens its own details", async () => {
  const { user } = await renderChartPage("daily");
  const region = await weekly();
  await user.click(region.getByRole("button", { name: "Timeline" }));

  await user.click(region.getByRole("button", { name: "Sun Square Mars exact at 3:15 PM" }));
  expect(drawer.title()).toMatch(/Sun.*Mars/);
  await drawer.close(user);

  await user.click(region.getByRole("button", { name: "Mars enters Aquarius at 3:15 PM" }));
  expect(drawer.title()).toMatch(/Mars.*Aquarius/);
});

test("a week with no events says so in both views", async () => {
  const { user } = await renderChartPage("daily", {
    handlers: weeklyTimingsFor(emptyWeeklyTimings),
  });
  const region = await weekly();

  expect(region.getAllByText("No timing events")).toHaveLength(7);
  await user.click(region.getByRole("button", { name: "Timeline" }));

  expect(region.getByText("No timing events this week")).toBeInTheDocument();
});

test("shows a loading indication until the timings arrive", async () => {
  const held = hold("post", "/timing/current");
  await renderChartPage("daily");
  const region = await findWidget("Weekly Timings");

  expect(region.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  held.release();

  expect(await region.findByText("Jupiter day")).toBeInTheDocument();
});

test("says so when the timings cannot be loaded, instead of claiming there are none", async () => {
  reject("post", "/timing/current");
  const { user } = await renderChartPage("daily");
  const region = await findWidget("Weekly Timings");

  expect(await region.findByRole("alert")).toHaveTextContent("Could not load this week's timings.");
  expect(region.queryByText("No timing events")).not.toBeInTheDocument();

  await user.click(region.getByRole("button", { name: "Timeline" }));
  expect(region.getByRole("alert")).toHaveTextContent("Could not load this week's timings.");
  expect(region.queryByText("No timing events this week")).not.toBeInTheDocument();
});

test.each([
  ["just before the week ends", "2026-01-18T04:50:00Z"],
  ["just after the week begins", "2026-01-11T05:10:00Z"],
])("the week is still Sunday 11 to Saturday 17 January %s", async (_when, instant) => {
  vi.setSystemTime(new Date(instant));
  await renderChartPage("daily");
  const region = await weekly();

  expect(dayRow(region, "Jan 11").getByText("Sun day")).toBeInTheDocument();
  expect(dayRow(region, "Jan 17").getByText("Saturn day")).toBeInTheDocument();
  expect(region.queryByText("Jan 18")).not.toBeInTheDocument();
  expect(region.queryByText("Jan 10")).not.toBeInTheDocument();
});

test("asks for this week's timings from now", async () => {
  const sent = capture("post", "/timing/current");
  await renderChartPage("daily");
  await weekly();

  expect(sent[sent.length - 1].body).toEqual({ dateTime: "2026-01-15T07:00:00" });
});

test("on Transits, asks for the chosen profile's timings, and again when the profile changes", async () => {
  const sent = capture("post", "/timing/transit");
  const { user } = await renderChartPage("transits");
  await weekly();
  expect(sent[sent.length - 1].body).toEqual({
    dateTime: "2026-01-15T07:00:00",
    birthProfileId: 1,
  });

  await user.selectOptions(widget("Chart Settings").getByLabelText("Profile"), "Mum");

  await vi.waitFor(() =>
    expect(sent[sent.length - 1].body).toMatchObject({ birthProfileId: 2 }),
  );
});
