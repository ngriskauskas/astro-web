import { within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { currentPlanetaryHour, planetaryHourBlocks } from "../../src/utils/planetaryHours";
import { planetaryHours, planetaryHoursFor, planetaryHoursUnavailable } from "../mocks";
import { aMinutePasses, drawer, fakeTheMinuteTimer, findWidget, renderChartPage } from "./charts";
import { capture, hold, reject } from "./requests";

// Planetary hours for Thursday 15 January 2026: sunrise at 07:12, sunset at 17:00. Times
// without a zone are read in the test time zone (New York), as the app reads them.

const at = (time: string) => new Date(`2026-01-15T${time}`);

describe("the current planetary hour", () => {
  test("before sunrise it is still the last hour of the previous planetary day", () => {
    const current = currentPlanetaryHour(planetaryHours, at("07:00:00"))!;

    expect(current.hour).toMatchObject({
      hour: 24,
      ruler: "SATURN",
      dayRuler: "MERCURY",
      period: "NIGHT",
    });
    expect(current.end).toEqual(at("07:12:00"));
    expect(current.next).toMatchObject({ hour: 1, ruler: "JUPITER" });
  });

  test("by day it is one of the twelve hours between sunrise and sunset", () => {
    const current = currentPlanetaryHour(planetaryHours, at("12:00:00"))!;

    expect(current.hour).toMatchObject({
      hour: 6,
      ruler: "MOON",
      dayRuler: "JUPITER",
      period: "DAY",
    });
    expect(current.end).toEqual(at("12:06:00"));
    expect(current.next).toMatchObject({ hour: 7, ruler: "SATURN" });
  });

  test("after sunset it is a night hour of the same planetary day", () => {
    const current = currentPlanetaryHour(planetaryHours, at("20:00:00"))!;

    expect(current.hour).toMatchObject({
      hour: 15,
      ruler: "JUPITER",
      dayRuler: "JUPITER",
      period: "NIGHT",
    });
    expect(current.next).toMatchObject({ hour: 16, ruler: "MARS" });
  });

  test("an hour starts at its own start time, not a moment later", () => {
    expect(currentPlanetaryHour(planetaryHours, at("07:11:59"))!.hour.hour).toBe(24);
    expect(currentPlanetaryHour(planetaryHours, at("07:12:00"))!.hour).toMatchObject({
      hour: 1,
      ruler: "JUPITER",
      dayRuler: "JUPITER",
    });
  });

  test("the last hour ends at the next sunrise and has no hour after it", () => {
    const current = currentPlanetaryHour(planetaryHours, new Date("2026-01-16T07:00:00"))!;

    expect(current.hour).toMatchObject({
      hour: 24,
      ruler: "SUN",
      dayRuler: "JUPITER",
    });
    expect(current.end).toEqual(new Date("2026-01-16T07:12:00"));
    expect(current.next).toBeUndefined();
  });

  test("there is none outside the hours that were returned", () => {
    expect(currentPlanetaryHour(planetaryHours, new Date("2026-01-14T22:54:59"))).toBeUndefined();
    expect(currentPlanetaryHour(planetaryHours, new Date("2026-01-16T07:12:00"))).toBeUndefined();
  });
});

describe("the planetary hour blocks of a day", () => {
  const dayStart = new Date("2026-01-15T00:00:00").getTime();
  const dayEnd = new Date("2026-01-16T00:00:00").getTime();
  const blocks = planetaryHourBlocks(planetaryHours, dayStart, dayEnd);

  test("cover the day from midnight to midnight with no gap and no overlap", () => {
    expect(blocks).toHaveLength(25);
    expect(blocks[0].top).toBe(dayStart);
    expect(blocks.at(-1)!.bottom).toBe(dayEnd);
    blocks.slice(1).forEach((block, index) => expect(block.top).toBe(blocks[index].bottom));
  });

  test("the first and last are cut off at midnight but keep their own start and end", () => {
    expect(blocks[0].hour).toMatchObject({
      hour: 18,
      ruler: "JUPITER",
      dayRuler: "MERCURY",
    });
    expect(blocks[0].start).toBe(new Date("2026-01-14T22:55:00").getTime());
    expect(blocks[0].end).toBe(new Date("2026-01-15T00:06:00").getTime());

    expect(blocks.at(-1)!.hour).toMatchObject({
      hour: 18,
      ruler: "VENUS",
      dayRuler: "JUPITER",
    });
    expect(blocks.at(-1)!.start).toBe(new Date("2026-01-15T22:55:00").getTime());
    expect(blocks.at(-1)!.end).toBe(new Date("2026-01-16T00:06:00").getTime());
  });

  test("hours outside the day are left out", () => {
    const nextDay = planetaryHourBlocks(planetaryHours, dayEnd, dayEnd + 24 * 60 * 60 * 1000);

    // Thursday's hours 18 to 24, up to the next sunrise; nothing is known after that.
    expect(nextDay.map((block) => block.hour.hour)).toEqual([18, 19, 20, 21, 22, 23, 24]);
  });
});

// The Planetary Hour widget, on the Daily page. The clock is frozen at 07:00, twelve
// minutes before sunrise.
describe("the Planetary Hour widget", () => {
  const ENDPOINT = "/timing/planetary-hours";

  // The widget, once it shows an hour.
  const planetaryHour = async () => {
    const region = await findWidget("Planetary Hour");
    await region.findByRole("group", { name: /^Hour ruler/ });
    return region;
  };

  test("before sunrise, shows the previous planetary day's ruler and its last night hour", async () => {
    await renderChartPage("daily");
    const region = await planetaryHour();

    const day = region.getByRole("group", { name: "Day ruler: Mercury" });
    expect(day).toHaveTextContent("Mercury");
    // Mercury's day ends at this morning's sunrise.
    expect(day).toHaveTextContent("Until sunrise7:12 AM");
    const hour = region.getByRole("group", { name: "Hour ruler: Saturn" });
    expect(hour).toHaveTextContent("Saturn");
    expect(hour).toHaveTextContent("Hour 24 · Night");
    expect(hour).toHaveTextContent("6:01 AM – 7:12 AM");
  });

  test("shows the next hour's ruler and start, and today's sunrise and sunset", async () => {
    await renderChartPage("daily");
    const region = await planetaryHour();

    expect(region.getByText(/^Next:/)).toHaveTextContent("Jupiter at 7:12 AM");
    expect(region.getByText(/^Sunrise/)).toHaveTextContent("Sunrise 7:12 AM · Sunset 5:00 PM");
  });

  test("selecting the current hour opens its specific description", async () => {
    const { user } = await renderChartPage("daily");
    const region = await planetaryHour();
    const hour = region.getByRole("group", { name: "Hour ruler: Saturn" });

    await user.click(within(hour).getByRole("button", { name: "Hour ruler: Saturn" }));

    expect(drawer.title()).toBe("Saturn Hour");
    expect(drawer.get().getByText("24 of 24 · Night")).toBeInTheDocument();
    expect(drawer.get().getByText("6:01 AM")).toBeInTheDocument();
    expect(drawer.get().getByText("7:12 AM")).toBeInTheDocument();
  });

  test("selecting the next hour opens its description", async () => {
    const { user } = await renderChartPage("daily");
    const region = await planetaryHour();

    await user.click(region.getByRole("button", { name: "View Jupiter hour 1 details" }));

    expect(drawer.title()).toBe("Jupiter Hour");
    expect(drawer.get().getByText("1 of 24 · Day")).toBeInTheDocument();
    expect(drawer.get().getByText("7:12 AM")).toBeInTheDocument();
    expect(drawer.get().getByText("8:01 AM")).toBeInTheDocument();
  });

  test("by day, shows the day's own ruler and the current day hour", async () => {
    vi.setSystemTime(new Date("2026-01-15T17:00:00Z"));
    await renderChartPage("daily");
    const region = await planetaryHour();

    // Jupiter's day ends at tomorrow's sunrise.
    expect(region.getByRole("group", { name: "Day ruler: Jupiter" })).toHaveTextContent(
      "Until sunrise7:12 AM",
    );
    const hour = region.getByRole("group", { name: "Hour ruler: Moon" });
    expect(hour).toHaveTextContent("Hour 6 · Day");
    expect(hour).toHaveTextContent("11:17 AM – 12:06 PM");
    expect(region.getByText(/^Next:/)).toHaveTextContent("Saturn at 12:06 PM");
  });

  test("after sunset, shows the current night hour of the same planetary day", async () => {
    vi.setSystemTime(new Date("2026-01-16T01:00:00Z"));
    await renderChartPage("daily");
    const region = await planetaryHour();

    expect(region.getByRole("group", { name: "Day ruler: Jupiter" })).toBeInTheDocument();
    expect(region.getByRole("group", { name: "Hour ruler: Jupiter" })).toHaveTextContent(
      "Hour 15 · Night",
    );
  });

  test("moves on to the next hour within a minute of it starting, without asking again", async () => {
    // 07:11:30, half a minute before sunrise.
    fakeTheMinuteTimer(new Date("2026-01-15T12:11:30Z"));
    const sent = capture("post", ENDPOINT);
    await renderChartPage("daily");
    const region = await planetaryHour();
    expect(region.getByRole("group", { name: "Hour ruler: Saturn" })).toBeInTheDocument();

    await aMinutePasses();

    const hour = region.getByRole("group", { name: "Hour ruler: Jupiter" });
    expect(hour).toHaveTextContent("Hour 1 · Day");
    expect(region.getByRole("group", { name: "Day ruler: Jupiter" })).toBeInTheDocument();
    expect(sent).toHaveLength(1);
  });

  test("asks for the new day's hours when midnight passes", async () => {
    // 23:59:30 on 15 January.
    fakeTheMinuteTimer(new Date("2026-01-16T04:59:30Z"));
    const sent = capture("post", ENDPOINT);
    await renderChartPage("daily");
    await planetaryHour();
    expect(sent.map(({ body }) => body)).toEqual([{ date: "2026-01-15" }]);

    await aMinutePasses();

    await vi.waitFor(() =>
      expect(sent.map(({ body }) => body)).toEqual([
        { date: "2026-01-15" },
        { date: "2026-01-16" },
      ]),
    );
  });

  test("asks once for today's planetary hours", async () => {
    const sent = capture("post", ENDPOINT);
    await renderChartPage("daily");
    await planetaryHour();

    expect(sent.map(({ body }) => body)).toEqual([{ date: "2026-01-15" }]);
  });

  test("shows a loading indication until the hours arrive", async () => {
    const held = hold("post", ENDPOINT);
    await renderChartPage("daily");
    const region = await findWidget("Planetary Hour");

    expect(region.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    held.release();

    expect(await region.findByRole("group", { name: "Hour ruler: Saturn" })).toBeInTheDocument();
    expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  });

  test("says planetary hours are not available where the sun does not rise or set", async () => {
    await renderChartPage("daily", { handlers: [planetaryHoursUnavailable()] });
    const region = await findWidget("Planetary Hour");

    expect(await region.findByRole("alert")).toHaveTextContent(
      /^Planetary hours are not available for this location today\.$/,
    );
    expect(region.queryByRole("group")).not.toBeInTheDocument();
  });

  test("says so when the hours cannot be loaded, and the rest of the page keeps working", async () => {
    reject("post", ENDPOINT);
    await renderChartPage("daily");
    const region = await findWidget("Planetary Hour");

    expect(await region.findByRole("alert")).toHaveTextContent(
      /^Could not load planetary hours\.$/,
    );
    expect(region.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
    const moon = await findWidget("Moon Timings");
    expect(await moon.findByRole("button", { name: "View New Moon details" })).toBeInTheDocument();
  });

  test("shows the could-not-load message instead of a wrong hour when no returned hour covers now", async () => {
    // Only the hours from sunrise on: nothing covers 07:00.
    const fromSunrise = {
      ...planetaryHours,
      hours: planetaryHours.hours.slice(7),
    };
    await renderChartPage("daily", {
      handlers: [planetaryHoursFor(fromSunrise)],
    });
    const region = await findWidget("Planetary Hour");

    expect(await region.findByRole("alert")).toHaveTextContent("Could not load planetary hours.");
    expect(region.queryByRole("group")).not.toBeInTheDocument();
  });

  test("the day ruler opens its planetary description", async () => {
    const { user } = await renderChartPage("daily");
    const region = await planetaryHour();
    const day = region.getByRole("group", { name: "Day ruler: Mercury" });

    await user.click(within(day).getByRole("button", { name: "Day ruler: Mercury" }));

    expect(drawer.title()).toBe("Mercury");
  });
});
