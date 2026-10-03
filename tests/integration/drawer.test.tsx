import { screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { describeContext } from "../mocks";
import { drawer, renderChartPage, widget, wheel } from "./charts";
import { capture, hold, reject } from "./requests";

// The drawer on a one-chart page. The Charts page stands in for all of them: the
// drawer and the things that open it are the same components everywhere.

const NOT_LOADED = "Could not load this description.";

const sunInTaurus = { chart: "NATAL", point: { name: "SUN" }, sign: "TAURUS", house: 2 };

const openSun = async (user: Awaited<ReturnType<typeof renderChartPage>>["user"]) =>
  user.click((await wheel()).getByRole("button", { name: "Sun" }));

test("a planet opens with its name, its general description and its place in this chart", async () => {
  const sent = capture("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  await openSun(user);

  expect(drawer.title()).toBe("Sun");
  const panel = drawer.get();
  expect(panel.getByRole("button", { name: "Overview" })).toHaveAttribute("aria-expanded", "true");
  expect(panel.getAllByRole("button", { name: "Taurus" }).length).toBeGreaterThan(0);
  expect(panel.getAllByRole("button", { name: "2nd House" }).length).toBeGreaterThan(0);
  expect(
    await panel.findByText(describeContext({ type: "placement", subject: sunInTaurus })),
  ).toBeInTheDocument();
  // Sign alone, house alone, and the two combined.
  expect(
    sent.map(({ body }) => (body as { context: { subject: object } }).context.subject),
  ).toMatchObject([{ ...sunInTaurus, house: null }, { ...sunInTaurus, sign: null }, sunInTaurus]);
});

test("a retrograde planet also gets a description of its retrograde", async () => {
  const sent = capture("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  await user.click((await wheel()).getByRole("button", { name: "Mercury, retrograde" }));

  expect(drawer.title()).toBe("Mercury");
  expect(await drawer.get().findByRole("button", { name: /Retrograde/ })).toBeInTheDocument();
  expect(sent).toHaveLength(4);
});

test("a description that is collapsed is shown when its heading is selected", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);
  const signOnly = describeContext({
    type: "placement",
    subject: { ...sunInTaurus, house: null },
  });
  const signHeading = await drawer.get().findByRole("button", { name: "Sign" });

  expect(drawer.get().queryByText(signOnly)).not.toBeInTheDocument();
  await user.click(signHeading);

  expect(drawer.get().getByText(signOnly)).toBeInTheDocument();
});

test("a sign opens with the planets and houses it holds in this chart", async () => {
  const { user } = await renderChartPage("charts");

  await user.click((await wheel()).getByRole("button", { name: "Capricorn" }));

  expect(drawer.title()).toBe("Capricorn");
  const panel = drawer.get();
  await panel.findByRole("button", { name: "Planets in this Sign" });
  for (const planet of ["Saturn", "Uranus", "Neptune"]) {
    expect(panel.getAllByRole("button", { name: planet }).length).toBeGreaterThan(0);
  }
  expect(panel.getByRole("button", { name: "Houses in this Sign" })).toBeInTheDocument();
});

test("a house opens with the planets and signs in it", async () => {
  const { user } = await renderChartPage("charts");

  await user.click((await wheel()).getByRole("button", { name: "2nd House" }));

  expect(drawer.title()).toBe("2nd House");
  const panel = drawer.get();
  await panel.findByRole("button", { name: "Planets in this House" });
  expect(panel.getByRole("button", { name: "Sun" })).toBeInTheDocument();
  expect(panel.getByRole("button", { name: "Signs in this House" })).toBeInTheDocument();
});

test("a key angle opens with its sign in this chart", async () => {
  const { user } = await renderChartPage("charts");

  await user.click((await wheel()).getByRole("button", { name: "Ascendant" }));

  expect(drawer.title()).toBe("ASC");
  expect(await drawer.get().findByRole("button", { name: "Aries" })).toBeInTheDocument();
  expect(
    await drawer.get().findByText(
      describeContext({
        type: "placement",
        subject: { chart: "NATAL", point: { name: "ASC" }, sign: "ARIES" },
      }),
    ),
  ).toBeInTheDocument();
});

test("an aspect opens with both points, their signs and the orb", async () => {
  const sent = capture("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  await user.click(widget("Aspect Matrix").getByRole("button", { name: "Saturn Trine Sun" }));

  const panel = drawer.get();
  expect(drawer.title()).toMatch(/Sun.*Saturn/);
  expect(panel.getByText("Trine")).toBeInTheDocument();
  expect(panel.getByText(/0\.50°/)).toBeInTheDocument();
  expect(panel.getByText("Separating")).toBeInTheDocument();
  for (const name of ["Sun", "Saturn", "Taurus", "Capricorn"]) {
    expect(panel.getByRole("button", { name })).toBeInTheDocument();
  }
  await panel.findByText(/^Description for aspect SUN TAURUS house 2 NATAL TRINE SATURN/);
  expect(sent).toHaveLength(1);
});

test("an aspect within a quarter of a degree is described as exact", async () => {
  const { user } = await renderChartPage("charts");

  await user.click(widget("Aspect Matrix").getByRole("button", { name: "Venus Sextile Moon" }));

  expect(drawer.get().getByText("Exact")).toBeInTheDocument();
});

test("general information is readable while the description for this chart is loading", async () => {
  const held = hold("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  await openSun(user);

  const panel = drawer.get();
  expect(drawer.title()).toBe("Sun");
  expect(panel.getByRole("button", { name: "Overview" })).toBeInTheDocument();
  expect(panel.getByRole("status", { name: "Loading" })).toBeInTheDocument();

  held.release();

  expect(
    await panel.findByText(describeContext({ type: "placement", subject: sunInTaurus })),
  ).toBeInTheDocument();
  expect(panel.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
});

test("selecting a related item inside the drawer shows that item", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);

  await user.click((await drawer.get().findAllByRole("button", { name: "Taurus" }))[0]);

  expect(drawer.title()).toBe("Taurus");
});

test("back returns through the items one at a time, then closes the drawer", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);
  await user.click((await drawer.get().findAllByRole("button", { name: "Taurus" }))[0]);
  await user.click(await drawer.get().findByRole("button", { name: "Mercury" }));
  expect(drawer.title()).toBe("Mercury");

  await drawer.back(user);
  expect(drawer.title()).toBe("Taurus");
  await drawer.back(user);
  expect(drawer.title()).toBe("Sun");
  await drawer.back(user);

  expect(drawer.isOpen()).toBe(false);
});

test("selecting another item on the page replaces the one shown, and back returns to it", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);

  await user.click(widget("Placements").getByRole("button", { name: "Moon" }));
  expect(drawer.title()).toBe("Moon");
  await drawer.back(user);

  expect(drawer.title()).toBe("Sun");
});

test("the same item opened twice is on the trail twice", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);
  await openSun(user);

  await drawer.back(user);
  expect(drawer.title()).toBe("Sun");
  await drawer.back(user);

  expect(drawer.isOpen()).toBe(false);
});

test("close removes the drawer and leaves the page usable", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);

  await drawer.close(user);

  expect(drawer.isOpen()).toBe(false);
  await user.click(widget("Placements").getByRole("button", { name: "Moon" }));
  expect(drawer.title()).toBe("Moon");
});

test("closing clears the trail: back in a reopened drawer does not return to earlier items", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);
  await user.click((await drawer.get().findAllByRole("button", { name: "Taurus" }))[0]);
  await drawer.close(user);

  await user.click((await wheel()).getByRole("button", { name: "Moon" }));
  await drawer.back(user);

  expect(drawer.isOpen()).toBe(false);
});

test("only the close and back buttons close the drawer", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);

  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("heading", { name: "Natal Chart" }));

  expect(drawer.title()).toBe("Sun");
});

test("navigating to another page closes the drawer", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);

  await user.click(screen.getByRole("link", { name: "Moment" }));

  expect(await screen.findByRole("region", { name: "Moment Chart" })).toBeInTheDocument();
  expect(drawer.isOpen()).toBe(false);
});

test("a wheel item can be opened from the keyboard", async () => {
  const { user } = await renderChartPage("charts");
  (await wheel()).getByRole("button", { name: "Sun" }).focus();

  await user.keyboard("{Enter}");

  expect(drawer.title()).toBe("Sun");
});

test("when the description cannot be loaded, the drawer says so and still works", async () => {
  reject("post", "/descriptions");
  const { user } = await renderChartPage("charts");

  await openSun(user);

  const panel = drawer.get();
  expect(await panel.findByRole("alert")).toHaveTextContent(NOT_LOADED);
  expect(panel.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  expect(panel.getByRole("button", { name: "Overview" })).toBeInTheDocument();
  await user.click(panel.getAllByRole("button", { name: "Taurus" })[0]);
  expect(drawer.title()).toBe("Taurus");
  await drawer.back(user);
  expect(drawer.title()).toBe("Sun");
  await drawer.close(user);
  expect(drawer.isOpen()).toBe(false);
});

test("changing the profile closes the drawer and clears its trail", async () => {
  const { user } = await renderChartPage("charts");
  await openSun(user);
  await user.click((await drawer.get().findAllByRole("button", { name: "Taurus" }))[0]);

  await user.selectOptions(widget("Chart Settings").getByLabelText("Profile"), "Mum");

  expect(drawer.isOpen()).toBe(false);
  await user.click(await widget("Placements").findByRole("button", { name: "Moon" }));
  await drawer.back(user);
  expect(drawer.isOpen()).toBe(false);
});
