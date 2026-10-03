import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { customBirthProfiles, getBirthProfiles, mainBirthProfile } from "../mocks";
import { drawer, renderChartPage, widget, wheel } from "./charts";
import { capture } from "./requests";

// The Synastry page: the user's chart compared with another profile's.

const lastBody = (sent: { body: unknown }[]) => sent[sent.length - 1].body;

test("shows its four widgets", async () => {
  await renderChartPage("synastry");

  for (const name of ["Synastry", "Chart Settings", "Synastry Aspects", "Placements"]) {
    expect(screen.getByRole("region", { name })).toBeInTheDocument();
  }
  expect(screen.getAllByRole("region")).toHaveLength(4);
});

test("compares the user's own profile with their first other profile", async () => {
  const sent = capture("post", "/charts/synastry");
  await renderChartPage("synastry");

  expect(lastBody(sent)).toEqual({ mainBirthProfileId: 1, otherBirthProfileId: 2 });
});

test("the user's own profile is the first one compared, wherever it comes in the list", async () => {
  const sent = capture("post", "/charts/synastry");
  await renderChartPage("synastry", {
    handlers: [getBirthProfiles([...customBirthProfiles, mainBirthProfile])],
  });

  expect(lastBody(sent)).toEqual({ mainBirthProfileId: 1, otherBirthProfileId: 2 });
});

test("after changing a profile, the matrix, placements and drawer use the new name", async () => {
  const { user } = await renderChartPage("synastry");

  await user.selectOptions(widget("Chart Settings").getByLabelText("Other Profile"), "Sam");
  const chart = await wheel();

  expect(await chart.findByRole("button", { name: "Sun, Sam" })).toBeInTheDocument();
  expect(widget("Synastry Aspects").getByText("Sam Chart Points")).toBeInTheDocument();
  expect(widget("Placements").getByRole("group", { name: "Sam" })).toBeInTheDocument();

  await user.click(
    widget("Synastry Aspects").getByRole("button", { name: "Sam Moon Trine My Profile Sun" }),
  );
  expect(drawer.get().getByText("Sam's")).toBeInTheDocument();
});

test("with only their own profile, the user is told a second profile is needed", async () => {
  const sent = capture("post", "/charts/synastry");
  const { user } = await renderChartPage("synastry", { scenario: "withProfile", wait: false });

  expect(
    await screen.findByText("Synastry compares two birth profiles. Add a second profile to use it."),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Synastry" })).toBeInTheDocument();
  expect(sent).toHaveLength(0);

  await user.click(screen.getByRole("link", { name: "Go to Profile" }));
  expect(await screen.findByText("profile screen")).toBeInTheDocument();
});
