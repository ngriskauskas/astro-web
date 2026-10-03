import { fireEvent, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { renderChartPage, widget, wheel } from "./charts";
import { capture } from "./requests";

// The Transits page: the user's birth chart with the sky at a date and time around
// it. The clock is frozen at 07:00 on 15 January 2026.

const REGIONS = [
  "Transit Chart",
  "Chart Settings",
  "Ascendant Today",
  "Weekly Timings",
  "Aspect Matrix",
  "Placements",
];

const lastBody = (sent: { body: unknown }[]) => sent[sent.length - 1].body;
const settings = () => widget("Chart Settings");

test("shows its six widgets, with profile, date and time settings", async () => {
  await renderChartPage("transits");

  for (const name of REGIONS) {
    expect(await screen.findByRole("region", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("region")).toHaveLength(REGIONS.length);
  expect(settings().getByLabelText("Profile")).toHaveDisplayValue("My Profile");
  expect(settings().getByLabelText("Date")).toHaveValue("2026-01-15");
  expect(settings().getByLabelText("Time")).toHaveValue("07:00:00");
  expect(settings().queryByLabelText("Other Profile")).not.toBeInTheDocument();
});

test("requests the user's own chart against the sky now", async () => {
  const sent = capture("post", "/charts/transit");
  await renderChartPage("transits");

  expect(lastBody(sent)).toEqual({ birthProfileId: 1, datetime: "2026-01-15T07:00:00" });
});

test("the two charts are labelled as the profile and the transits", async () => {
  await renderChartPage("transits");

  const placements = widget("Placements");
  expect(placements.getByRole("group", { name: "My Profile" })).toBeInTheDocument();
  expect(placements.getByRole("group", { name: "Transit" })).toBeInTheDocument();
  expect((await wheel()).getByRole("button", { name: "Sun, Transit" })).toBeInTheDocument();
});

test("choosing another profile requests the chart and both timing lists for it", async () => {
  const chart = capture("post", "/charts/transit");
  const daily = capture("post", "/timing/daily-transit");
  const weekly = capture("post", "/timing/transit");
  const { user } = await renderChartPage("transits");

  await user.selectOptions(settings().getByLabelText("Profile"), "Mum");

  await vi.waitFor(() => {
    expect(lastBody(chart)).toMatchObject({ birthProfileId: 2 });
    expect(lastBody(daily)).toMatchObject({ birthProfileId: 2 });
    expect(lastBody(weekly)).toMatchObject({ birthProfileId: 2 });
  });
  expect(widget("Placements").getByRole("group", { name: "Mum" })).toBeInTheDocument();
});

test("changing the date or the time requests the transit chart for the new moment", async () => {
  const sent = capture("post", "/charts/transit");
  await renderChartPage("transits");

  fireEvent.change(settings().getByLabelText("Date"), { target: { value: "2026-02-20" } });
  await vi.waitFor(() =>
    expect(lastBody(sent)).toEqual({ birthProfileId: 1, datetime: "2026-02-20T07:00:00" }),
  );

  fireEvent.change(settings().getByLabelText("Time"), { target: { value: "21:45" } });
  await vi.waitFor(() =>
    expect(lastBody(sent)).toEqual({ birthProfileId: 1, datetime: "2026-02-20T21:45" }),
  );
});

test("opened from a link with a date and time, shows the transits for that moment", async () => {
  const sent = capture("post", "/charts/transit");
  await renderChartPage("transits", { search: "?date=2026-03-01&time=14:30" });

  expect(settings().getByLabelText("Date")).toHaveValue("2026-03-01");
  expect(lastBody(sent)).toEqual({ birthProfileId: 1, datetime: "2026-03-01T14:30" });
});

test("clearing the date makes no request and leaves the chart on screen", async () => {
  const sent = capture("post", "/charts/transit");
  await renderChartPage("transits");
  const before = sent.length;

  fireEvent.change(settings().getByLabelText("Date"), { target: { value: "" } });
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(sent).toHaveLength(before);
  expect((await wheel()).getByRole("button", { name: "Sun, My Profile" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
