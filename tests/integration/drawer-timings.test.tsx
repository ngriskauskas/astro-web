import { act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { expect, test, vi } from "vitest";
import { API_URL, momentChart, refreshedMomentChart } from "../mocks";
import { drawer, findWidget, renderChartPage, wheel } from "./charts";
import { FIXED_NOW } from "./setup";

// The drawer opened from timing widgets, on the Daily page.

test("an Ascendant conjunction opens with the planet, the Ascendant and its times", async () => {
  const { user } = await renderChartPage("daily");
  const timeline = await findWidget("Ascendant Today");

  await user.click(
    await timeline.findByRole("button", { name: "Venus conjuncts ASC at 9:42 AM" }),
  );

  const panel = drawer.get();
  expect(drawer.title()).toMatch(/Ascendant.*Venus/);
  expect(panel.getByText("Conjunction")).toBeInTheDocument();
  expect(panel.getByText("9:42 AM")).toBeInTheDocument();
  await panel.findByText(/^Description for DAILY aspect/);
});

test("a moon phase opens with its date and the Moon's sign", async () => {
  const { user } = await renderChartPage("daily");
  const moon = await findWidget("Moon Timings");

  await user.click(await moon.findByRole("button", { name: "View New Moon details" }));

  const panel = drawer.get();
  expect(drawer.title()).toBe("New Moon");
  expect(panel.getByText(/Jan 18/)).toBeInTheDocument();
  expect(panel.getByRole("button", { name: "Capricorn" })).toBeInTheDocument();
  await panel.findByText("Description for DAILY moonPhase NEW_MOON");
});

test("each kind of weekly event opens its own explanation", async () => {
  const { user } = await renderChartPage("daily");
  const weekly = await findWidget("Weekly Timings");

  await user.click(await weekly.findByRole("button", { name: "Mercury Trine Jupiter starts" }));
  expect(drawer.title()).toMatch(/Mercury.*Jupiter/);
  expect(drawer.get().getByText(/Jan 12/)).toBeInTheDocument();
  await drawer.get().findByText(/^Description for LONG_TERM aspect MERCURY/);
  await drawer.close(user);

  await user.click(weekly.getByRole("button", { name: "Mars enters Aquarius" }));
  expect(drawer.title()).toMatch(/Mars.*Aquarius/);
  expect(drawer.get().getByText(/Jan 15/)).toBeInTheDocument();
  await drawer.get().findByText("Description for LONG_TERM ingress MARS CAPRICORN to AQUARIUS");
  await drawer.close(user);

  await user.click(weekly.getByRole("button", { name: "Mercury starts retrograde" }));
  expect(drawer.title()).toMatch(/Mercury.*retrograde/);
  expect(drawer.get().getByText(/Jan 14/)).toBeInTheDocument();
  await drawer.get().findByText("Description for LONG_TERM retrograde MERCURY");
  await drawer.close(user);

  await user.click(weekly.getByRole("button", { name: "Saturn stations direct" }));
  expect(drawer.title()).toMatch(/Saturn turns direct/);
  expect(drawer.get().getByText(/Jan 16/)).toBeInTheDocument();
  await drawer.get().findByText("Description for LONG_TERM station SATURN direct");
});

test("one click on a weekly event opens that event only", async () => {
  const { user } = await renderChartPage("daily");
  const weekly = await findWidget("Weekly Timings");

  await user.click(await weekly.findByRole("button", { name: "Mercury Trine Jupiter starts" }));
  await drawer.back(user);

  expect(drawer.isOpen()).toBe(false);
});

test("the drawer stays open through the minute refresh and follows the new chart", async () => {
  vi.useRealTimers();
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
  vi.setSystemTime(FIXED_NOW);
  // The chart for 07:00, then a different one for any later minute.
  const chartByMinute = http.post(`${API_URL}/charts/generic`, async ({ request }) => {
    const { datetime } = (await request.json()) as { datetime: string };
    return HttpResponse.json(datetime.includes("T07:00") ? momentChart : refreshedMomentChart);
  });
  const { user } = await renderChartPage("daily", { handlers: [chartByMinute] });

  await user.click((await wheel()).getByRole("button", { name: "Moon" }));
  expect(drawer.get().getByText("10° 0′")).toBeInTheDocument();

  await act(async () => {
    vi.advanceTimersByTime(60 * 1000);
  });

  expect(await drawer.get().findByText("11° 36′")).toBeInTheDocument();
  expect(drawer.title()).toBe("Moon");
});
