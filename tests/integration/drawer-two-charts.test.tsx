import { expect, test } from "vitest";
import { drawer, renderChartPage, widget, wheel } from "./charts";
import { capture } from "./requests";

// The drawer on a two-chart page (Synastry): every item belongs to one of the two
// charts, and the drawer has to show the right one. "My Profile" is the user's own
// chart and "Mum" is the profile it is compared with.

const subjects = (sent: { body: unknown }[]) =>
  sent.map(({ body }) => (body as { context: { subject: { chart: string } } }).context.subject);

test("a planet opens with the details from the chart it belongs to", async () => {
  const { user } = await renderChartPage("synastry");
  const sent = capture("post", "/descriptions");

  await user.click((await wheel()).getByRole("button", { name: "Sun, My Profile" }));
  expect(drawer.title()).toBe("Sun");
  expect(drawer.get().getAllByRole("button", { name: "Taurus" }).length).toBeGreaterThan(0);
  await drawer.close(user);

  await user.click((await wheel()).getByRole("button", { name: "Sun, Mum" }));
  expect(drawer.title()).toBe("Sun");
  expect(drawer.get().getAllByRole("button", { name: "Scorpio" }).length).toBeGreaterThan(0);
  expect(drawer.get().queryByRole("button", { name: "Taurus" })).not.toBeInTheDocument();

  await drawer.get().findByText(/^Description for placement SUN SCORPIO house 2 SECONDARY_NATAL/);
  const charts = subjects(sent).map(({ chart }) => chart);
  expect(charts.slice(0, 3)).toEqual(["PRIMARY_NATAL", "PRIMARY_NATAL", "PRIMARY_NATAL"]);
  expect(charts.slice(3)).toEqual(["SECONDARY_NATAL", "SECONDARY_NATAL", "SECONDARY_NATAL"]);
});

test("a key angle opens with the sign from the chart it belongs to", async () => {
  const { user } = await renderChartPage("synastry");

  await user.click((await wheel()).getByRole("button", { name: "Ascendant, My Profile" }));
  expect(drawer.title()).toBe("ASC");
  expect(await drawer.get().findByRole("button", { name: "Aries" })).toBeInTheDocument();
  await drawer.close(user);

  await user.click((await wheel()).getByRole("button", { name: "Ascendant, Mum" }));
  expect(await drawer.get().findByRole("button", { name: "Libra" })).toBeInTheDocument();
});

test("a sign lists its planets in two groups, one for each chart", async () => {
  const { user } = await renderChartPage("synastry");

  await user.click((await wheel()).getByRole("button", { name: "Scorpio" }));

  const panel = drawer.get();
  await panel.findByText("Your planets");
  expect(panel.getByText("Mum Planets")).toBeInTheDocument();
  // My Profile has Pluto in Scorpio; Mum has the Sun and Mercury there.
  expect(panel.getAllByRole("button", { name: "Pluto" }).length).toBeGreaterThan(0);
  expect(panel.getByRole("button", { name: "Mercury" })).toBeInTheDocument();
  expect(panel.getByText("Your Houses")).toBeInTheDocument();
  expect(panel.getByText("Mum Houses")).toBeInTheDocument();
});

test("a house lists its planets in two groups, one for each chart", async () => {
  const { user } = await renderChartPage("synastry");

  await user.click((await wheel()).getByRole("button", { name: "2nd House, My Profile" }));

  const panel = drawer.get();
  expect(drawer.title()).toBe("2nd House");
  await panel.findByText("Your planets");
  expect(panel.getByText("Mum Planets")).toBeInTheDocument();
  expect(panel.getByRole("button", { name: "Sun" })).toBeInTheDocument();
});

test("an aspect labels each point with the chart it belongs to", async () => {
  const { user } = await renderChartPage("synastry");

  await user.click(
    widget("Synastry Aspects").getByRole("button", { name: "Mum Moon Trine My Profile Sun" }),
  );

  const panel = drawer.get();
  expect(drawer.title()).toMatch(/Sun.*Moon/);
  expect(panel.getByText("Your's")).toBeInTheDocument();
  expect(panel.getByText("Mum's")).toBeInTheDocument();
  await panel.findByText(
    /^Description for aspect SUN TAURUS house 2 PRIMARY_NATAL TRINE MOON GEMINI house \d+ SECONDARY_NATAL SYNASTRY/,
  );
});

test("changing the other profile closes the drawer and clears its trail", async () => {
  const { user } = await renderChartPage("synastry");
  await user.click((await wheel()).getByRole("button", { name: "Sun, My Profile" }));
  await user.click(drawer.get().getAllByRole("button", { name: "Taurus" })[0]);

  await user.selectOptions(widget("Chart Settings").getByLabelText("Other Profile"), "Sam");

  expect(drawer.isOpen()).toBe(false);
  await user.click((await wheel()).getByRole("button", { name: "Moon, My Profile" }));
  await drawer.back(user);
  expect(drawer.isOpen()).toBe(false);
});
