import { within } from "@testing-library/react";
import { expect, test } from "vitest";
import { getBirthProfiles, mainBirthProfile, manyBirthProfiles } from "../mocks";
import { renderChartPage, widget, wheel } from "./charts";
import { capture, hold } from "./requests";

// Chart Settings: the profile selectors, on Charts and Synastry. The date and time
// fields are covered with the pages that have them (Moment and Transits).

const LONG_NAME = "Great-grandmother Wilhelmina Bartholomew-Featherstonehaugh";

const optionsOf = (select: HTMLElement) =>
  within(select)
    .getAllByRole("option")
    .map((option) => option.textContent);

// The sign shown for the Sun in the placements table.
const sunRow = () =>
  within(widget("Placements").getByRole("button", { name: "Sun" }).closest("tr")!);

const lastBody = (sent: { body: unknown }[]) => sent[sent.length - 1].body;

test("the user's own profile is listed first and selected, followed by their other profiles", async () => {
  await renderChartPage("charts");

  const profile = widget("Chart Settings").getByLabelText("Profile");

  expect(optionsOf(profile)).toEqual(["My Profile", "Mum", "Sam", LONG_NAME]);
  expect(profile).toHaveDisplayValue("My Profile");
});

test("choosing a profile requests that profile's chart and updates every widget", async () => {
  const sent = capture("post", "/charts/natal");
  const { user } = await renderChartPage("charts");
  expect(lastBody(sent)).toEqual({ birthProfileId: mainBirthProfile.id });

  await user.selectOptions(widget("Chart Settings").getByLabelText("Profile"), "Mum");

  // Mum's chart: Mercury is direct, the Sun squares Saturn, and the Sun is in Scorpio.
  const chart = await wheel();
  expect(await chart.findByRole("button", { name: "Mercury" })).toBeInTheDocument();
  expect(lastBody(sent)).toEqual({ birthProfileId: 2 });
  expect(
    widget("Aspect Matrix").getByRole("button", { name: "Saturn Square Sun" }),
  ).toBeInTheDocument();
  expect(sunRow().getByRole("button", { name: "Scorpio" })).toBeInTheDocument();
});

test("a profile with an unknown birth time can be chosen like any other", async () => {
  const sent = capture("post", "/charts/natal");
  const { user } = await renderChartPage("charts");

  await user.selectOptions(widget("Chart Settings").getByLabelText("Profile"), "Sam");

  expect(await (await wheel()).findByRole("button", { name: "Mercury" })).toBeInTheDocument();
  expect(lastBody(sent)).toEqual({ birthProfileId: 3 });
});

test("when two choices are made quickly, the chart for the last one stays on screen", async () => {
  const { user } = await renderChartPage("charts");
  const profile = widget("Chart Settings").getByLabelText("Profile");
  // The request for Mum's chart is answered late, after the one that follows it.
  const mumsChart = hold("post", "/charts/natal", { once: true });

  await user.selectOptions(profile, "Mum");
  await user.selectOptions(profile, "My Profile");
  mumsChart.release();
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(profile).toHaveDisplayValue("My Profile");
  expect((await wheel()).getByRole("button", { name: "Mercury, retrograde" })).toBeInTheDocument();
  expect(sunRow().getByRole("button", { name: "Taurus" })).toBeInTheDocument();
});

test("a long list of profiles is offered in full", async () => {
  await renderChartPage("charts", {
    handlers: [getBirthProfiles([mainBirthProfile, ...manyBirthProfiles])],
  });

  const options = optionsOf(widget("Chart Settings").getByLabelText("Profile"));

  expect(options).toEqual(["My Profile", ...manyBirthProfiles.map(({ name }) => name)]);
});

test("on Synastry, a profile chosen on one side is not offered on the other", async () => {
  await renderChartPage("synastry");
  const settings = widget("Chart Settings");

  expect(settings.getByLabelText("Profile")).toHaveDisplayValue("My Profile");
  expect(settings.getByLabelText("Other Profile")).toHaveDisplayValue("Mum");
  expect(optionsOf(settings.getByLabelText("Profile"))).toEqual(["My Profile", "Sam", LONG_NAME]);
  expect(optionsOf(settings.getByLabelText("Other Profile"))).toEqual(["Mum", "Sam", LONG_NAME]);
});

test("on Synastry, choosing another profile requests the comparison for the new pair", async () => {
  const sent = capture("post", "/charts/synastry");
  const { user } = await renderChartPage("synastry");
  const settings = widget("Chart Settings");

  await user.selectOptions(settings.getByLabelText("Other Profile"), "Sam");
  await wheel();
  expect(lastBody(sent)).toEqual({ mainBirthProfileId: 1, otherBirthProfileId: 3 });
  expect(optionsOf(settings.getByLabelText("Profile"))).toEqual(["My Profile", "Mum", LONG_NAME]);

  await user.selectOptions(settings.getByLabelText("Profile"), "Mum");
  await wheel();
  expect(lastBody(sent)).toEqual({ mainBirthProfileId: 2, otherBirthProfileId: 3 });
});
