import { fireEvent, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { drawer, renderChartPage, widget, wheel } from "./charts";
import { capture } from "./requests";

// The Moment page: the chart for a date and time, taken from the link or set to now.
// The clock is frozen at 07:00 on 15 January 2026.

const lastBody = (sent: { body: unknown }[]) => sent[sent.length - 1].body;
const date = () => widget("Chart Settings").getByLabelText("Date");
const time = () => widget("Chart Settings").getByLabelText("Time");

test("shows its four widgets, with date and time settings and no profile choice", async () => {
  await renderChartPage("moment");

  for (const name of ["Moment Chart", "Chart Settings", "Aspect Matrix", "Placements"]) {
    expect(screen.getByRole("region", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("region")).toHaveLength(4);
  expect(widget("Chart Settings").queryByLabelText("Profile")).not.toBeInTheDocument();
});

test("opened without a date, shows the chart for the current date and time", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment");

  expect(date()).toHaveValue("2026-01-15");
  expect(time()).toHaveValue("07:00:00");
  expect(lastBody(sent)).toEqual({ datetime: "2026-01-15T07:00:00" });
});

test("opened from a link with a date and time, shows the chart for that moment", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment", { search: "?date=2026-03-01&time=14:30" });

  expect(date()).toHaveValue("2026-03-01");
  expect(time()).toHaveValue("14:30");
  expect(lastBody(sent)).toEqual({ datetime: "2026-03-01T14:30" });
});

test("a link with a date and no time uses the end of that day", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment", { search: "?date=2026-03-01" });

  expect(date()).toHaveValue("2026-03-01");
  expect(lastBody(sent)).toEqual({ datetime: "2026-03-01T23:59:00" });
});

test("changing the date or the time requests the chart for the new moment", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment");

  fireEvent.change(date(), { target: { value: "2026-02-20" } });
  await wheel();
  expect(lastBody(sent)).toEqual({ datetime: "2026-02-20T07:00:00" });

  fireEvent.change(time(), { target: { value: "21:45" } });
  await wheel();
  expect(lastBody(sent)).toEqual({ datetime: "2026-02-20T21:45" });
});

test("clearing the date makes no request and leaves the chart on screen", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment");
  const before = sent.length;

  fireEvent.change(date(), { target: { value: "" } });
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(sent).toHaveLength(before);
  expect((await wheel()).getByRole("button", { name: "Sun" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("a link with a date that is not a date makes no request for it", async () => {
  const sent = capture("post", "/charts/generic");
  await renderChartPage("moment", { search: "?date=not-a-date", wait: false });
  await screen.findByRole("region", { name: "Chart Settings" });
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(sent).toHaveLength(0);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("changing the date or the time closes the drawer", async () => {
  const { user } = await renderChartPage("moment");

  await user.click((await wheel()).getByRole("button", { name: "Sun" }));
  expect(drawer.isOpen()).toBe(true);
  fireEvent.change(date(), { target: { value: "2026-02-20" } });
  expect(drawer.isOpen()).toBe(false);

  await user.click((await wheel()).getByRole("button", { name: "Sun" }));
  fireEvent.change(time(), { target: { value: "21:45" } });
  expect(drawer.isOpen()).toBe(false);
});
