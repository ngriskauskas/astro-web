import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { renderChartPage, widget } from "./charts";
import { capture } from "./requests";

test("shows its widgets", async () => {
  await renderChartPage("charts");

  for (const name of [
    "Natal Chart",
    "Chart Settings",
    "Summary",
    "Chart ruler",
    "Dignities",
    "Aspect Matrix",
    "Houses",
    "Hemispheres and quadrants",
    "Aspect patterns",
    "Placements",
  ]) {
    expect(screen.getByRole("region", { name })).toBeInTheDocument();
  }
  // The natal summary holds three sections of its own: elements, modalities and tightest aspects.
  expect(screen.getAllByRole("region")).toHaveLength(13);
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
