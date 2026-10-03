import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderChartPage, widget } from "./charts";
import { capture } from "./requests";

test("shows its four widgets", async () => {
  await renderChartPage("charts");

  for (const name of ["Natal Chart", "Chart Settings", "Aspect Matrix", "Placements"]) {
    expect(screen.getByRole("region", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("region")).toHaveLength(4);
});

test("requests the natal chart for the user's own profile", async () => {
  const sent = capture("post", "/charts/natal");
  await renderChartPage("charts");

  expect(sent.length).toBeGreaterThan(0);
  for (const { body } of sent) expect(body).toEqual({ birthProfileId: 1 });
});

test("offers a profile choice and no date or time", async () => {
  await renderChartPage("charts");
  const settings = widget("Chart Settings");

  expect(settings.getByLabelText("Profile")).toBeInTheDocument();
  expect(settings.queryByLabelText("Other Profile")).not.toBeInTheDocument();
  expect(settings.queryByLabelText("Date")).not.toBeInTheDocument();
  expect(settings.queryByLabelText("Time")).not.toBeInTheDocument();
});
