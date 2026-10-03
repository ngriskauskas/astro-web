import { act, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test, vi } from "vitest";
import { API_URL, momentChart, refreshedMomentChart } from "../mocks";
import { findWidget, renderChartPage, wheel } from "./charts";
import { capture } from "./requests";
import { FIXED_NOW } from "./setup";

// The Daily page: the sky now, refreshed every minute. The clock is frozen at 07:00
// on 15 January 2026.

const REGIONS = [
  "Zodiac Wheel",
  "Ascendant Today",
  "Moon Timings",
  "Weekly Timings",
  "Aspect Matrix",
  "Placements",
];

// Lets a test run the page's one-minute refresh by hand.
const fakeTheMinuteTimer = () => {
  vi.useRealTimers();
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(FIXED_NOW);
};

const aMinutePasses = () =>
  act(async () => {
    vi.advanceTimersByTime(60 * 1000);
  });

// The Moon's row in the placements table.
const moonRow = async () => {
  const moon = await (await findWidget("Placements")).findByRole("button", { name: "Moon" });
  return within(moon.closest("tr")!);
};

test("shows its six widgets and no settings", async () => {
  await renderChartPage("daily");

  for (const name of REGIONS) {
    expect(await screen.findByRole("region", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("region")).toHaveLength(REGIONS.length);
  expect(screen.queryByLabelText("Profile")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Date")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("Time")).not.toBeInTheDocument();
});

test("requests the chart for the current moment", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("daily");

  expect(sent.length).toBeGreaterThan(0);
  for (const { body } of sent) expect(body).toEqual({ datetime: "2026-01-15T07:00:00" });
});

test("after a minute, the chart is refreshed for the new time without the user doing anything", async () => {
  fakeTheMinuteTimer();
  const chartByMinute = http.post(`${API_URL}/charts/generic`, async ({ request }) => {
    const { datetime } = (await request.json()) as { datetime: string };
    return HttpResponse.json(datetime.includes("T07:00") ? momentChart : refreshedMomentChart);
  });
  await renderChartPage("daily", { handlers: [chartByMinute] });
  const sent = capture("post", "/charts/generic");
  // The Moon is at 10° 0′ of Sagittarius, and at 11° 36′ in the refreshed chart.
  expect((await moonRow()).getByText("10° 0′")).toBeInTheDocument();

  await aMinutePasses();

  expect(await (await moonRow()).findByText("11° 36′")).toBeInTheDocument();
  expect(sent.map(({ body }) => body)).toEqual([{ datetime: "2026-01-15T07:01:00" }]);
});

test("a refresh that fails leaves the chart on screen, without an error", async () => {
  fakeTheMinuteTimer();
  let requests = 0;
  const failsLater = http.post(`${API_URL}/charts/generic`, async ({ request }) => {
    const { datetime } = (await request.json()) as { datetime: string };
    requests += 1;
    return datetime.includes("T07:00")
      ? HttpResponse.json(momentChart)
      : HttpResponse.json({ error: "Request failed" }, { status: 422 });
  });
  await renderChartPage("daily", { handlers: [failsLater] });
  const before = requests;

  await aMinutePasses();
  await vi.waitFor(() => expect(requests).toBe(before + 1));

  expect((await wheel()).getByRole("button", { name: "Sun" })).toBeInTheDocument();
  expect(screen.queryByText("Could not load the chart.")).not.toBeInTheDocument();
});
